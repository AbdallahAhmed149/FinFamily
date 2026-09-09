import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum
import enum
# بنستدعي الـ Base اللي عملناه في ملف database.py
from .database import Base

# تعريف الأدوار المتاحة زي ما الـ Spec طالب بالظبط
class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"

class User(Base):
    __tablename__ = "users"

    # استخدام UUID كـ String عشان يطابق نوع البيانات في Base44
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    
    # الحقول الأساسية
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.user)
    
    # حقول التتبع الزمنية
    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(String, nullable=True)