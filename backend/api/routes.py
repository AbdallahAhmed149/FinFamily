import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, ChatMessage
from core.deps import get_current_user
from core.limiter import limiter, user_or_ip_key
from services.ai_coach import (
    ChatMessage as ChatMessageIn,
    HistoryTurn,
    HISTORY_WINDOW,
    get_ai_response,
    check_child_message,
    check_child_reply,
    AICoachError,
)
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


logger = logging.getLogger("finfamily.aicoach")


@functions_router.post("/aiCoach")
# حماية تكلفة OpenAI: حد في الدقيقة وحد يومي لكل يوزر (مش لكل IP — الـ IP ممكن يبقى مشترك)
@limiter.limit("20/minute;300/day", key_func=user_or_ip_key)
def invoke_ai_coach(
    request: Request,
    chat: ChatMessageIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    message = (chat.message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is empty")
    if len(message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long")
    chat.message = message

    # الـ mode بيتحدد من دور اليوزر نفسه في التوكن، مش من حاجة الفرونت بيبعتها
    # (كده طفل مايقدرش يبعت mode=parent ويستني رد Coach Nour).
    chat.mode = "parent" if user.role == "parent" else "child"

    # حاجز أمان لرسايل الطفل: بنفحص المحتوى قبل ما يوصل لـ FinBuddy خالص. لو اتعلّم بنرجع رد
    # آمن بلغة الطفل، وبنسجّل الحدث في اللوج (من غير نص الرسالة). الرسالة دي *مش* بتتخزن في
    # الـ history خالص — لو اتخزنت كانت هتتبعت للموديل الرئيسي مع الرسالة اللي بعدها.
    if chat.mode == "child":
        safe = check_child_message(message, chat.lang)
        if safe:
            logger.warning("[aiCoach] flagged child message user=%s", user.id)
            return {"reply": safe}

    # البيانات الحقيقية بتتجاب من الداتابيز هنا، مش هاردكودد جوه الـ prompt خالص
    if chat.mode == "parent":
        context = build_family_context(db, user)
    else:
        context = build_child_context(db, user)

    # آخر جزء من المحادثة الحقيقية بتاعة اليوزر ده — ده اللي بيخلي الموديل "فاكر".
    # بنفس رقم الـ HISTORY_WINDOW اللي الـ service بيستخدمه (كانت 20 هنا و12 هناك).
    history_rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id, ChatMessage.mode == chat.mode)
        .order_by(ChatMessage.created_date.desc())
        .limit(HISTORY_WINDOW)
        .all()
    )
    history = [HistoryTurn(role=r.role, content=r.content) for r in reversed(history_rows)]

    try:
        reply = get_ai_response(chat, context, history=history)
    except AICoachError as e:
        # بنسجّلها في اللوج، ومنخزنش حاجة في المحادثة خالص (ولا رسالة اليوزر)،
        # عشان لو اليوزر جرب تاني تكون المحادثة سليمة من غير فجوة.
        logger.error("[aiCoach] OpenAI call failed user=%s mode=%s: %s", user.id, chat.mode, e)
        raise HTTPException(
            status_code=503,
            detail="The AI coach is temporarily unavailable. Please try again in a moment.",
        )

    # حاجز تاني على رد الـ AI نفسه قبل ما يوصل لطفل (ومايتخزنش لو اتعلّم)
    if chat.mode == "child":
        safe_reply = check_child_reply(reply, message, chat.lang)
        if safe_reply:
            logger.warning("[aiCoach] flagged AI reply user=%s", user.id)
            return {"reply": safe_reply}

    # نخزّن السؤال والرد الاتنين مع بعض عشان المرة الجاية تكون جزء من نفس المحادثة
    db.add(ChatMessage(user_id=user.id, mode=chat.mode, role="user", content=message))
    db.add(ChatMessage(user_id=user.id, mode=chat.mode, role="assistant", content=reply))
    db.commit()

    return {"reply": reply}