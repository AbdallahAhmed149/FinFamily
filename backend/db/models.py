import uuid
import random
import string
from datetime import datetime
import enum

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base


class UserRole(str, enum.Enum):
    parent = "parent"
    child = "child"


def _generate_family_code():
    # كود قصير سهل إن الأب يقوله لابنه (زي كود دعوة)
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Family(Base):
    __tablename__ = "families"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)

    # الكود ده الطفل بيستخدمه عشان يعرف يدخل على عيلته وقت الـ login
    family_code = Column(String, unique=True, index=True, default=_generate_family_code)

    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = relationship("User", back_populates="family", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)

    # كل يوزر (أب أو طفل) لازم يبقى تابع لعيلة
    family_id = Column(String, ForeignKey("families.id"), nullable=False, index=True)
    family = relationship("Family", back_populates="members")

    role = Column(Enum(UserRole), nullable=False)
    full_name = Column(String, nullable=False)

    # بيانات الأب بس (الطفل معندوش إيميل ولا باسورد أصلاً)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)

    # بيانات الطفل بس
    pin_hash = Column(String, nullable=True)

    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(String, nullable=True)