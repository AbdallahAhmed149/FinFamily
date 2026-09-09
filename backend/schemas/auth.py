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


# ---------- Child management (done by the parent) ----------

class ChildCreate(BaseModel):
    full_name: str = Field(min_length=1)
    pin: str = Field(min_length=4, max_length=6, pattern=r"^\d+$")


class ChildSummary(BaseModel):
    id: str
    full_name: str

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