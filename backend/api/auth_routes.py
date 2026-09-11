from fastapi import APIRouter, Depends, HTTPException, status
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
from schemas.auth import (
    ParentRegister,
    ParentLogin,
    ChildCreate,
    ChildLoginLookup,
    ChildLogin,
    TokenResponse,
    UserResponse,
    FamilyChildrenResponse,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ---------------------------------------------------------------------------
# Parent: register & login
# ---------------------------------------------------------------------------

@router.post("/register", response_model=TokenResponse)
def register_parent(payload: ParentRegister, db: Session = Depends(get_db)):
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

    token = create_access_token(user_id=parent.id, family_id=family.id, role="parent")
    return TokenResponse(access_token=token, user=UserResponse.model_validate(parent))


@router.post("/login", response_model=TokenResponse)
def login_parent(payload: ParentLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.role == UserRole.parent).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        # رسالة واحدة عامة لإيميل غلط أو باسورد غلط — عشان محدش يعرف يستنتج إن الإيميل ده مسجل أصلاً
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user_id=user.id, family_id=user.family_id, role="parent")
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


# ---------------------------------------------------------------------------
# Parent: manage children
# ---------------------------------------------------------------------------

@router.post("/children", response_model=UserResponse)
def create_child(
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
def lookup_family_children(payload: ChildLoginLookup, db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.family_code == payload.family_code.upper()).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family code not found")

    children = db.query(User).filter(User.family_id == family.id, User.role == UserRole.child).all()
    return FamilyChildrenResponse(family_name=family.name, children=children)


@router.post("/child-login", response_model=TokenResponse)
def child_login(payload: ChildLogin, db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.family_code == payload.family_code.upper()).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family code not found")

    child = (
        db.query(User)
        .filter(User.id == payload.child_id, User.family_id == family.id, User.role == UserRole.child)
        .first()
    )
    if not child or not child.pin_hash or not verify_pin(payload.pin, child.pin_hash):
        raise HTTPException(status_code=401, detail="Invalid PIN")

    token = create_access_token(user_id=child.id, family_id=family.id, role="child")
    return TokenResponse(access_token=token, user=UserResponse.model_validate(child))


# ---------------------------------------------------------------------------
# Shared: who am I
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user