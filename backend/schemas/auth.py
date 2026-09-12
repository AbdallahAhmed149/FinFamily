from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, ConfigDict, Field

from db.models import UserRole


# ---------- Shared ----------

class UserResponse(BaseModel):
    id: str
    family_id: str
    role: UserRole
    full_name: str
    email: Optional[EmailStr] = None
    xp: int = 0
    level: int = 1
    streak: int = 0
    created_date: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------- Parent registration / login ----------

class ParentRegister(BaseModel):
    family_name: str = Field(min_length=1)
    full_name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=8)


class ParentLogin(BaseModel):
    email: EmailStr
    password: str
    otp_code: Optional[str] = None  # مطلوب بس لو الأب مفعّل MFA


class ParentLoginResult(BaseModel):
    """
    رد /login: إما mfa_required=True (لسه محتاج الكود، مفيش token)،
    أو access_token+user زي أي login عادي (لو MFA مش مفعّل، أو الكود اتبعت وصح).
    """
    mfa_required: bool = False
    access_token: Optional[str] = None
    token_type: Optional[str] = None
    user: Optional[UserResponse] = None


# ---------- MFA (الأب بس) ----------

class MfaStatus(BaseModel):
    enabled: bool


class MfaSetupResponse(BaseModel):
    secret: str              # للإدخال اليدوي لو الـ QR ماشتغلش
    otpauth_url: str
    qr_code_data_uri: str    # data:image/png;base64,... يتحط مباشرة في <img>


class MfaEnableRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class MfaDisableRequest(BaseModel):
    password: str  # تأكيد بالباسورد الحالي قبل ما نقفل MFA


# ---------- Child management (done by the parent) ----------

class ChildCreate(BaseModel):
    full_name: str = Field(min_length=1)
    pin: str = Field(min_length=4, max_length=6, pattern=r"^\d+$")


class ChildSummary(BaseModel):
    id: str
    full_name: str
    xp: int = 0
    level: int = 1
    streak: int = 0

    model_config = ConfigDict(from_attributes=True)


class FamilyChildrenResponse(BaseModel):
    family_name: str
    children: List[ChildSummary]


# ---------- Child login ----------

class ChildLoginLookup(BaseModel):
    family_code: str = Field(min_length=6, max_length=6)


class ChildLogin(BaseModel):
    family_code: str = Field(min_length=6, max_length=6)
    child_id: str
    pin: str