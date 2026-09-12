from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, Family, UserRole, Wallet
from core.security import (
    hash_password,
    verify_password,
    hash_pin,
    verify_pin,
    create_access_token,
)
from core.deps import get_current_user, require_parent
from core.limiter import limiter
from core.audit import log_action
from core import mfa
from schemas.auth import (
    ParentRegister,
    ParentLogin,
    ParentLoginResult,
    ChildCreate,
    ChildLoginLookup,
    ChildLogin,
    TokenResponse,
    UserResponse,
    FamilyChildrenResponse,
    MfaStatus,
    MfaSetupResponse,
    MfaEnableRequest,
    MfaDisableRequest,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ---------------------------------------------------------------------------
# Parent: register & login
# ---------------------------------------------------------------------------

@router.post("/register", response_model=TokenResponse)
@limiter.limit("5/hour")
def register_parent(request: Request, payload: ParentRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # كل أب بيبدأ عيلة جديدة بيه؛ الكود ده هو اللي هيديه لابنه وقت ما يضيفه
    family = Family(name=payload.family_name)
    db.add(family)
    db.flush()  # عشان ناخد family.id قبل الـ commit

    parent = User(
        family_id=family.id,
        role=UserRole.parent,
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(parent)
    db.commit()
    db.refresh(parent)

    log_action(
        db, request=request, action="parent_registered",
        actor_id=parent.id, actor_role="parent", family_id=family.id,
        target_type="family", target_id=family.id,
    )
    db.commit()

    token = create_access_token(user_id=parent.id, family_id=family.id, role="parent")
    return TokenResponse(access_token=token, user=UserResponse.model_validate(parent))


@router.post("/login", response_model=ParentLoginResult)
@limiter.limit("5/minute")
def login_parent(request: Request, payload: ParentLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.role == UserRole.parent).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        # رسالة واحدة عامة لإيميل غلط أو باسورد غلط — عشان محدش يعرف يستنتج إن الإيميل ده مسجل أصلاً
        log_action(
            db, request=request, action="login_failed",
            detail={"email": payload.email, "role": "parent"},
        )
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # الباسورد صح. لو الأب مفعّل MFA، الخطوة دي مش كفاية لوحدها.
    if user.mfa_enabled:
        if not payload.otp_code:
            # مش خطأ — ده رد طبيعي بيقول للفرونت "اطلب الكود دلوقتي" من غير ما نرفض الطلب أو نديله token
            return ParentLoginResult(mfa_required=True)

        if not mfa.verify_totp(user.mfa_secret, payload.otp_code):
            log_action(
                db, request=request, action="mfa_failed",
                actor_id=user.id, actor_role="parent", family_id=user.family_id,
            )
            db.commit()
            raise HTTPException(status_code=401, detail="Invalid authentication code")

    log_action(
        db, request=request, action="login_success",
        actor_id=user.id, actor_role="parent", family_id=user.family_id,
        detail={"mfa_used": user.mfa_enabled},
    )
    db.commit()

    token = create_access_token(user_id=user.id, family_id=user.family_id, role="parent")
    return ParentLoginResult(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


# ---------------------------------------------------------------------------
# Parent: manage children
# ---------------------------------------------------------------------------

@router.post("/children", response_model=UserResponse)
def create_child(
    request: Request,
    payload: ChildCreate,
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent),
):
    child = User(
        family_id=parent.family_id,
        role=UserRole.child,
        full_name=payload.full_name,
        pin_hash=hash_pin(payload.pin),
    )
    db.add(child)
    db.flush()  # عشان ناخد child.id قبل ما نعمل الـ Wallet بتاعته

    wallet = Wallet(owner_id=child.id)
    db.add(wallet)

    db.commit()
    db.refresh(child)

    log_action(
        db, request=request, action="child_created",
        actor_id=parent.id, actor_role="parent", family_id=parent.family_id,
        target_type="user", target_id=child.id,
        detail={"child_name": child.full_name},
    )
    db.commit()

    return child


@router.get("/family/code")
def get_family_code(parent: User = Depends(require_parent), db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.id == parent.family_id).first()
    return {"family_code": family.family_code, "family_name": family.name}


@router.get("/family/children", response_model=FamilyChildrenResponse)
def list_my_children(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # مفتوح للأب والطفل الاتنين — الاستعلام أصلاً محصور بـ family_id بتاع اللي بيطلب،
    # يعني الطفل بيشوف بس إخواته في نفس عيلته، مش أي عيلة تانية.
    family = db.query(Family).filter(Family.id == user.family_id).first()
    children = db.query(User).filter(User.family_id == family.id, User.role == UserRole.child).all()
    return FamilyChildrenResponse(family_name=family.name, children=children)


# ---------------------------------------------------------------------------
# Child: lookup family by code, then log in with PIN
# ---------------------------------------------------------------------------

@router.post("/children/lookup", response_model=FamilyChildrenResponse)
@limiter.limit("20/minute")
def lookup_family_children(request: Request, payload: ChildLoginLookup, db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.family_code == payload.family_code.upper()).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family code not found")

    children = db.query(User).filter(User.family_id == family.id, User.role == UserRole.child).all()
    return FamilyChildrenResponse(family_name=family.name, children=children)


@router.post("/child-login", response_model=TokenResponse)
@limiter.limit("10/minute")
def child_login(request: Request, payload: ChildLogin, db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.family_code == payload.family_code.upper()).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family code not found")

    child = (
        db.query(User)
        .filter(User.id == payload.child_id, User.family_id == family.id, User.role == UserRole.child)
        .first()
    )
    if not child or not child.pin_hash or not verify_pin(payload.pin, child.pin_hash):
        log_action(
            db, request=request, action="login_failed",
            family_id=family.id,
            detail={"role": "child", "child_id": payload.child_id},
        )
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid PIN")

    log_action(
        db, request=request, action="login_success",
        actor_id=child.id, actor_role="child", family_id=family.id,
    )
    db.commit()

    token = create_access_token(user_id=child.id, family_id=family.id, role="child")
    return TokenResponse(access_token=token, user=UserResponse.model_validate(child))


# ---------------------------------------------------------------------------
# Parent: MFA (TOTP — Google/Microsoft Authenticator)
# ---------------------------------------------------------------------------

@router.get("/mfa/status", response_model=MfaStatus)
def mfa_status(parent: User = Depends(require_parent)):
    return MfaStatus(enabled=parent.mfa_enabled)


@router.post("/mfa/setup", response_model=MfaSetupResponse)
def mfa_setup(
    request: Request,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    """
    بيولّد سيكريت جديد و QR code يتمسح بتطبيق الـ Authenticator.
    السيكريت بيتخزن كـ "pending" بس — مش هيتفعّل غير لما الأب يأكّد بكود
    صحيح عن طريق /mfa/enable، عشان محدش يقفل نفسه برة حسابه بغلط.
    """
    if parent.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA is already enabled. Disable it first to re-setup.")

    secret = mfa.generate_secret()
    parent.mfa_pending_secret = secret
    db.commit()

    uri = mfa.provisioning_uri(secret, parent.email)
    return MfaSetupResponse(
        secret=secret,
        otpauth_url=uri,
        qr_code_data_uri=mfa.generate_qr_data_uri(uri),
    )


@router.post("/mfa/enable", response_model=MfaStatus)
@limiter.limit("10/minute")
def mfa_enable(
    request: Request,
    payload: MfaEnableRequest,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    if not parent.mfa_pending_secret:
        raise HTTPException(status_code=400, detail="No MFA setup in progress. Call /mfa/setup first.")

    if not mfa.verify_totp(parent.mfa_pending_secret, payload.code):
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")

    parent.mfa_secret = parent.mfa_pending_secret
    parent.mfa_pending_secret = None
    parent.mfa_enabled = True

    log_action(
        db, request=request, action="mfa_enabled",
        actor_id=parent.id, actor_role="parent", family_id=parent.family_id,
    )
    db.commit()

    return MfaStatus(enabled=True)


@router.post("/mfa/disable", response_model=MfaStatus)
def mfa_disable(
    request: Request,
    payload: MfaDisableRequest,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    # تأكيد بالباسورد الحالي — عشان لو حد سرق جلسة الأب (token) مايقدرش يقفل MFA بسهولة
    if not verify_password(payload.password, parent.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    parent.mfa_enabled = False
    parent.mfa_secret = None
    parent.mfa_pending_secret = None

    log_action(
        db, request=request, action="mfa_disabled",
        actor_id=parent.id, actor_role="parent", family_id=parent.family_id,
    )
    db.commit()

    return MfaStatus(enabled=False)


# ---------------------------------------------------------------------------
# Shared: who am I
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user