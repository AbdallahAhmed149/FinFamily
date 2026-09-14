from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, ChatMessage
from core.deps import get_current_user
from services.ai_coach import ChatMessage as ChatMessageIn, HistoryTurn, get_ai_response
from services.ai_context import build_child_context, build_family_context
from schemas.coach import ChatMessageOut, CoachHistoryResponse

# قديماً كان فيه هنا CRUD مفتوح بالكامل على /api/entities/User (أي حد يقدر
# ينشئ/يمسح يوزرز من غير أي صلاحية). اتشال بالكامل واتستبدل بمسارات الـ Auth
# المحمية في auth_routes.py (register / login / children / me).

functions_router = APIRouter(prefix="/api/functions", tags=["Backend Functions"])

# كام رسالة (يوزر + موديل) نرجّعها للفرونت وقت فتح الصفحة — أكتر من كده مش
# مفيد فعليًا في محادثة Coach، وبيبقى فيه سكرول كتير من غير داعي.
DISPLAY_HISTORY_LIMIT = 50


@functions_router.get("/aiCoach/history", response_model=CoachHistoryResponse)
def get_coach_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mode = "parent" if user.role == "parent" else "child"
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id, ChatMessage.mode == mode)
        .order_by(ChatMessage.created_date.desc())
        .limit(DISPLAY_HISTORY_LIMIT)
        .all()
    )
    rows.reverse()  # كانوا معكوسين (الأحدث الأول) عشان الـ LIMIT ياخد آخر رسايل صح، نرجعهم للترتيب الطبيعي
    return CoachHistoryResponse(messages=[ChatMessageOut.model_validate(r, from_attributes=True) for r in rows])


@functions_router.post("/aiCoach/reset")
def reset_coach_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mode = "parent" if user.role == "parent" else "child"
    db.query(ChatMessage).filter(ChatMessage.user_id == user.id, ChatMessage.mode == mode).delete()
    db.commit()
    return {"ok": True}


@functions_router.post("/aiCoach")
def invoke_ai_coach(
    chat: ChatMessageIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if len(chat.message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long")

    # الـ mode بيتحدد من دور اليوزر نفسه في التوكن، مش من حاجة الفرونت بيبعتها
    # (كده طفل مايقدرش يبعت mode=parent ويستني رد Coach Nour).
    chat.mode = "parent" if user.role == "parent" else "child"

    # البيانات الحقيقية بتتجاب من الداتابيز هنا، مش هاردكودد جوه الـ prompt خالص
    if chat.mode == "parent":
        context = build_family_context(db, user)
    else:
        context = build_child_context(db, user)

    # آخر جزء من المحادثة الحقيقية بتاعة اليوزر ده — ده اللي بيخلي الموديل
    # "فاكر" وميرجعش يسلّم من الأول في كل رسالة. بنجيب آخر 20 رسالة بس (desc)
    # وبنرجعهم بالترتيب الطبيعي، عشان مانحمّلش رسايل قديمة أوي من غير داعي.
    history_rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id, ChatMessage.mode == chat.mode)
        .order_by(ChatMessage.created_date.desc())
        .limit(20)
        .all()
    )
    history = [HistoryTurn(role=r.role, content=r.content) for r in reversed(history_rows)]

    reply = get_ai_response(chat, context, history=history, child_name=user.full_name)

    # نخزّن السؤال والرد الاتنين مع بعض عشان المرة الجاية تكون جزء من نفس المحادثة
    db.add(ChatMessage(user_id=user.id, mode=chat.mode, role="user", content=chat.message))
    db.add(ChatMessage(user_id=user.id, mode=chat.mode, role="assistant", content=reply))
    db.commit()

    return {"reply": reply}