from datetime import datetime, timedelta
import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status, UploadFile, File
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, Family, UserRole, Wallet, PasswordResetToken, MfaRecoveryCode
from core.security import (
    hash_password,
    verify_password,
    hash_pin,
    verify_pin,
    create_access_token,
    generate_reset_token,
    hash_reset_token,
)
from core.deps import get_current_user, require_parent
from core.limiter import limiter
from core.audit import log_action
from core import mfa
from services.email import send_password_reset_email
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
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    RecoveryCodesResponse,
    RecoveryCodesStatus,
    PartnerInvite,
    PartnerOut,
    PartnerUpdate,
    ChildPinReset,
    AvatarUpdate,
    ParentPasswordChange,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

RESET_TOKEN_EXPIRE_MINUTES = 30
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# ---------------------------------------------------------------------------
# Parent: register & login
# ---------------------------------------------------------------------------

@router.post("/register", response_model=TokenResponse)
@limiter.limit("5/hour")
def register_parent(request: Request, payload: ParentRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    family = Family(name=payload.family_name)
    db.add(family)
    db.flush()

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

# ---------------------------------------------------------------------------
# Partners: invite / list / edit / delete
# ---------------------------------------------------------------------------

@router.post("/partners/invite", response_model=UserResponse)
def invite_partner(
    request: Request,
    payload: PartnerInvite,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db)
):
    # Only count ADDITIONAL co-partners (excluding the primary parent owner)
    co_partner_count = db.query(User).filter(
        User.family_id == parent.family_id,
        User.role == UserRole.parent,
        User.id != parent.id  # <-- THIS PREVENTS COUNTING THE OWNER
    ).count()

    if co_partner_count >= 3:
        raise HTTPException(
            status_code=400, 
            detail="Family workspace has reached the maximum limit of 3 partners."
        )

    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    co_partner = User(
        family_id=parent.family_id,
        role=UserRole.parent,
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(co_partner)
    db.commit()
    db.refresh(co_partner)

    log_action(
        db, request=request, action="partner_invited",
        actor_id=parent.id, actor_role="parent", family_id=parent.family_id,
        target_type="user", target_id=co_partner.id,
        detail={"partner_email": co_partner.email}
    )
    db.commit()
    return co_partner
@router.get("/partners", response_model=List[PartnerOut])
def list_partners(parent: User = Depends(require_parent), db: Session = Depends(get_db)):
    return db.query(User).filter(User.family_id == parent.family_id, User.role == UserRole.parent).all()


@router.patch("/partners/{partner_id}", response_model=PartnerOut)
def update_partner(
    partner_id: str,
    payload: PartnerUpdate,
    request: Request,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    partner = db.query(User).filter(
        User.id == partner_id,
        User.family_id == parent.family_id,
        User.role == UserRole.parent,
    ).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found in your family")

    if payload.full_name is not None:
        partner.full_name = payload.full_name
    if payload.email is not None:
        conflict = db.query(User).filter(User.email == payload.email, User.id != partner_id).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Email already in use")
        partner.email = payload.email
    if payload.password is not None:
        partner.password_hash = hash_password(payload.password)

    log_action(db, request=request, action="partner_updated",
               actor_id=parent.id, actor_role="parent", family_id=parent.family_id,
               target_type="user", target_id=partner_id)
    db.commit()
    db.refresh(partner)
    return partner


@router.delete("/partners/{partner_id}")
def delete_partner(
    partner_id: str,
    request: Request,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    if partner_id == parent.id:
        raise HTTPException(status_code=400, detail="You cannot remove yourself")
    partner = db.query(User).filter(
        User.id == partner_id,
        User.family_id == parent.family_id,
        User.role == UserRole.parent,
    ).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    db.delete(partner)
    log_action(db, request=request, action="partner_removed",
               actor_id=parent.id, actor_role="parent", family_id=parent.family_id,
               target_type="user", target_id=partner_id)
    db.commit()
    return {"detail": "Partner removed"}


# ---------------------------------------------------------------------------
# Parent: change own password
# ---------------------------------------------------------------------------

@router.patch("/me/password")
def change_my_password(
    request: Request,
    payload: ParentPasswordChange,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, parent.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    parent.password_hash = hash_password(payload.new_password)
    log_action(db, request=request, action="password_changed",
               actor_id=parent.id, actor_role="parent", family_id=parent.family_id)
    db.commit()
    return {"detail": "Password updated"}


# ---------------------------------------------------------------------------
# Parent: reset a child's PIN
# ---------------------------------------------------------------------------

@router.patch("/children/{child_id}/pin", response_model=UserResponse)
def reset_child_pin(
    child_id: str,
    payload: ChildPinReset,
    request: Request,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    child = db.query(User).filter(
        User.id == child_id,
        User.family_id == parent.family_id,
        User.role == UserRole.child,
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found in your family")
    child.pin_hash = hash_pin(payload.new_pin)
    child.failed_pin_attempts = 0
    child.pin_locked_until = None
    log_action(db, request=request, action="child_pin_reset",
               actor_id=parent.id, actor_role="parent", family_id=parent.family_id,
               target_type="user", target_id=child_id)
    db.commit()
    db.refresh(child)
    return child


# ---------------------------------------------------------------------------
# Avatar: any user (Child or Parent) can set/clear their own profile photo
# ---------------------------------------------------------------------------

@router.patch("/me/avatar", response_model=UserResponse)
def update_avatar_json(
    payload: AvatarUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/avatar", response_model=UserResponse)
async def update_avatar_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save file or set relative path
    avatar_url = f"/uploads/{file.filename}"
    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me/avatar", response_model=UserResponse)
def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.avatar_url = None
    db.commit()
    db.refresh(current_user)
    return current_user


# ---------------------------------------------------------------------------
# Login / MFA / Recovery / Password Reset
# ---------------------------------------------------------------------------

@router.post("/login", response_model=ParentLoginResult)
@limiter.limit("5/minute")
def login_parent(request: Request, payload: ParentLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.role == UserRole.parent).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        log_action(
            db, request=request, action="login_failed",
            detail={"email": payload.email, "role": "parent"},
        )
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    used_recovery_code = False

    if user.mfa_enabled:
        if payload.recovery_code:
            normalized = mfa.normalize_recovery_code(payload.recovery_code)
            candidates = db.query(MfaRecoveryCode).filter(MfaRecoveryCode.user_id == user.id, MfaRecoveryCode.used == False).all()
            match = next((c for c in candidates if verify_password(normalized, c.code_hash)), None)
            if not match:
                log_action(
                    db, request=request, action="mfa_recovery_failed",
                    actor_id=user.id, actor_role="parent", family_id=user.family_id,
                )
                db.commit()
                raise HTTPException(status_code=401, detail="Invalid or already-used recovery code")

            match.used = True
            match.used_date = datetime.utcnow()
            used_recovery_code = True
            log_action(
                db, request=request, action="mfa_recovery_used",
                actor_id=user.id, actor_role="parent", family_id=user.family_id,
            )

        elif not payload.otp_code:
            return ParentLoginResult(mfa_required=True)

        elif not mfa.verify_totp(user.mfa_secret, payload.otp_code):
            log_action(
                db, request=request, action="mfa_failed",
                actor_id=user.id, actor_role="parent", family_id=user.family_id,
            )
            db.commit()
            raise HTTPException(status_code=401, detail="Invalid authentication code")

    log_action(
        db, request=request, action="login_success",
        actor_id=user.id, actor_role="parent", family_id=user.family_id,
        detail={"mfa_used": user.mfa_enabled, "used_recovery_code": used_recovery_code},
    )
    db.commit()

    token = create_access_token(user_id=user.id, family_id=user.family_id, role="parent")
    return ParentLoginResult(access_token=token, token_type="bearer", user=UserResponse.model_validate(user), used_recovery_code=used_recovery_code)


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
    db.flush()

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
    family = db.query(Family).filter(Family.id == user.family_id).first()
    children = db.query(User).filter(User.family_id == family.id, User.role == UserRole.child).all()
    return FamilyChildrenResponse(family_name=family.name, children=children)


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

    if child and child.pin_locked_until and child.pin_locked_until > datetime.utcnow():
        remaining = int((child.pin_locked_until - datetime.utcnow()).total_seconds() / 60) + 1
        raise HTTPException(status_code=429, detail=f"Too many attempts. Try again in {remaining} minute(s).")

    if not child or not child.pin_hash or not verify_pin(payload.pin, child.pin_hash):
        if child:
            child.failed_pin_attempts = (child.failed_pin_attempts or 0) + 1
            if child.failed_pin_attempts >= 5:
                child.pin_locked_until = datetime.utcnow() + timedelta(minutes=15)
        log_action(
            db, request=request, action="login_failed",
            family_id=family.id,
            detail={"role": "child", "child_id": payload.child_id},
        )
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid PIN")

    child.failed_pin_attempts = 0
    child.pin_locked_until = None

    log_action(
        db, request=request, action="login_success",
        actor_id=child.id, actor_role="child", family_id=family.id,
    )
    db.commit()

    token = create_access_token(user_id=child.id, family_id=family.id, role="child")
    return TokenResponse(access_token=token, user=UserResponse.model_validate(child))


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
@limiter.limit("3/hour")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    generic_response = ForgotPasswordResponse()

    user = db.query(User).filter(User.email == payload.email, User.role == UserRole.parent).first()
    if not user:
        return generic_response

    raw_token = generate_reset_token()
    reset = PasswordResetToken(
        user_id=user.id,
        token_hash=hash_reset_token(raw_token),
        expires_at=datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
    )
    db.add(reset)

    log_action(
        db, request=request, action="password_reset_requested",
        actor_id=user.id, actor_role="parent", family_id=user.family_id,
    )
    db.commit()

    reset_url = f"{FRONTEND_URL}/reset-password?token={raw_token}"
    try:
        send_password_reset_email(user.email, reset_url)
    except Exception:
        pass

    return generic_response


@router.post("/reset-password", response_model=ForgotPasswordResponse)
@limiter.limit("10/hour")
def reset_password(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = hash_reset_token(payload.token)
    reset = db.query(PasswordResetToken).filter(PasswordResetToken.token_hash == token_hash).first()

    if not reset or reset.used or reset.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")

    user = db.query(User).filter(User.id == reset.user_id, User.role == UserRole.parent).first()
    if not user:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")

    user.password_hash = hash_password(payload.new_password)
    reset.used = True

    other_tokens = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.user_id == user.id, PasswordResetToken.used == False)
        .all()
    )
    for t in other_tokens:
        t.used = True

    log_action(
        db, request=request, action="password_reset_completed",
        actor_id=user.id, actor_role="parent", family_id=user.family_id,
    )
    db.commit()

    return ForgotPasswordResponse(message="Your password has been reset. You can log in now.")


def _issue_recovery_codes(db: Session, parent: User) -> list:
    db.query(MfaRecoveryCode).filter(MfaRecoveryCode.user_id == parent.id).delete()
    codes = mfa.generate_recovery_codes()
    for code in codes:
        normalized = mfa.normalize_recovery_code(code)
        db.add(MfaRecoveryCode(user_id=parent.id, code_hash=hash_password(normalized)))
    return codes


@router.get("/mfa/status", response_model=MfaStatus)
def mfa_status(parent: User = Depends(require_parent)):
    return MfaStatus(enabled=parent.mfa_enabled)


@router.post("/mfa/setup", response_model=MfaSetupResponse)
def mfa_setup(
    request: Request,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
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


@router.post("/mfa/enable", response_model=RecoveryCodesResponse)
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

    codes = _issue_recovery_codes(db, parent)

    log_action(
        db, request=request, action="mfa_enabled",
        actor_id=parent.id, actor_role="parent", family_id=parent.family_id,
    )
    db.commit()

    return RecoveryCodesResponse(codes=codes)


@router.post("/mfa/disable", response_model=MfaStatus)
@limiter.limit("5/minute")
def mfa_disable(
    request: Request,
    payload: MfaDisableRequest,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.password, parent.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    parent.mfa_enabled = False
    parent.mfa_secret = None
    parent.mfa_pending_secret = None
    db.query(MfaRecoveryCode).filter(MfaRecoveryCode.user_id == parent.id).delete()

    log_action(
        db, request=request, action="mfa_disabled",
        actor_id=parent.id, actor_role="parent", family_id=parent.family_id,
    )
    db.commit()

    return MfaStatus(enabled=False)


@router.get("/mfa/recovery-codes/status", response_model=RecoveryCodesStatus)
def recovery_codes_status(parent: User = Depends(require_parent), db: Session = Depends(get_db)):
    if not parent.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA is not enabled")
    total = db.query(MfaRecoveryCode).filter(MfaRecoveryCode.user_id == parent.id).count()
    remaining = db.query(MfaRecoveryCode).filter(MfaRecoveryCode.user_id == parent.id, MfaRecoveryCode.used == False).count()
    return RecoveryCodesStatus(total=total, remaining=remaining)


@router.post("/mfa/recovery-codes/regenerate", response_model=RecoveryCodesResponse)
def regenerate_recovery_codes(
    request: Request,
    payload: MfaDisableRequest,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    if not parent.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA is not enabled")
    if not verify_password(payload.password, parent.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    codes = _issue_recovery_codes(db, parent)

    log_action(
        db, request=request, action="mfa_recovery_codes_regenerated",
        actor_id=parent.id, actor_role="parent", family_id=parent.family_id,
    )
    db.commit()

    return RecoveryCodesResponse(codes=codes)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user