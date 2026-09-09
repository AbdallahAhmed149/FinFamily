from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional
from db.models import UserRole

# 1. الخصائص المشتركة (اللي الواجهة بتبعتها)
class UserBase(BaseModel):
    email: EmailStr  # بيعمل Validation أوتوماتيك إن ده إيميل حقيقي
    full_name: str
    role: UserRole   # بيقبل يا admin يا user بس

# 2. الموديل اللي هنستخدمه وقت إنشاء يوزر جديد (POST)
class UserCreate(UserBase):
    pass

# 3. الموديل اللي هيرجع للواجهة (Response)
class UserResponse(UserBase):
    id: str
    created_date: datetime
    updated_date: datetime
    created_by_id: Optional[str] = None

    # الإعداد ده ضروري عشان Pydantic يقدر يقرأ من أوبجيكت SQLAlchemy مباشرة
    model_config = ConfigDict(from_attributes=True)