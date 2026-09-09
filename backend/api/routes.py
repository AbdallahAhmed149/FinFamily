from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from db.models import User
from schemas.user import UserCreate, UserResponse
from services.ai_coach import ChatMessage, get_ai_response

# الـ Prefix بيطابق المسار اللي الواجهة بتبعتله الطلبات بالظبط
router = APIRouter(prefix="/api/entities/User", tags=["Entities - User"])

@router.get("", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # جلب المستخدمين مع دعم الـ Pagination
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.post("", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # التأكد إن الإيميل مش متسجل قبل كده
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # إنشاء يوزر جديد في الداتا بيز
    new_user = User(email=user.email, full_name=user.full_name, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# جلب يوزر بالـ ID
@router.get("/{User_id}", response_model=UserResponse)
def get_user(User_id: str = Path(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == User_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# تحديث يوزر
@router.put("/{User_id}", response_model=UserResponse)
def update_user(user_in: UserCreate, User_id: str = Path(...), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == User_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # تحديث البيانات
    db_user.email = user_in.email
    db_user.full_name = user_in.full_name
    db_user.role = user_in.role
    
    db.commit()
    db.refresh(db_user)
    return db_user

# مسح يوزر
@router.delete("/{User_id}")
def delete_user(User_id: str = Path(...), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == User_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    # الـ Spec الأصلي بيرجع success: bool
    return {"success": True}

# المسار الجديد الخاص بالـ AI
# 1. تعريف Router جديد بـ Prefix مختلف للـ Backend Functions
functions_router = APIRouter(prefix="/api/functions", tags=["Backend Functions"])

@functions_router.post("/aiCoach")
def invoke_ai_coach(chat: ChatMessage):
    if len(chat.message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long")
    
    reply = get_ai_response(chat)
    return {"reply": reply}