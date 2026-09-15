from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, ChatMessage
from core.deps import get_current_user
from core.limiter import limiter
from services.ai_coach import (
    ChatMessage as ChatMessageIn,
    HistoryTurn,
    get_ai_response,
    is_flagged_content,
    AICoachError,
    CHILD_SAFE_REDIRECT,
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


@functions_router.post("/aiCoach")
@limiter.limit("20/minute")  # حماية من استهلاك تكلفة OpenAI لو حصل spam/loop من الفرونت أو استخدام مقصود سيء
def invoke_ai_coach(
    request: Request,
    chat: ChatMessageIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if len(chat.message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long")

    # الـ mode بيتحدد من دور اليوزر نفسه في التوكن، مش من حاجة الفرونت بيبعتها
    # (كده طفل مايقدرش يبعت mode=parent ويستني رد Coach Nour).
    chat.mode = "parent" if user.role == "parent" else "child"

    # حاجز أمان: بس لرسايل الطفل، بنفحص المحتوى قبل ما يوصل لـ FinBuddy خالص.
    # لو اتصنف كمحتوى غير مناسب، بنرجع رد ثابت آمن وميتبعتش حاجة للموديل
    # الرئيسي (يوفر تكلفة، وبيقفل الباب قدام أي محاولة jailbreak).
    if chat.mode == "child" and is_flagged_content(chat.message):
        db.add(ChatMessage(user_id=user.id, mode=chat.mode, role="user", content=chat.message))
        db.add(ChatMessage(user_id=user.id, mode=chat.mode, role="assistant", content=CHILD_SAFE_REDIRECT))
        db.commit()
        return {"reply": CHILD_SAFE_REDIRECT}

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

    try:
        reply = get_ai_response(chat, context, history=history, child_name=user.full_name)
    except AICoachError as e:
        # قبل كده كان بيرجع رسالة الخطأ التقنية نفسها كـ رد "assistant" حقيقي
        # وتتخزن في الـ history. دلوقتي: بنسجلها في اللوج للمتابعة، ومنخزنش
        # حاجة في المحادثة خالص (نفس اليوزر message كمان)، عشان لو اليوزر
        # عاد جرب تاني تكون المحادثة سليمة من غير فجوة أو رسالة غريبة فيها.
        print(f"[aiCoach] OpenAI call failed for user {user.id} (mode={chat.mode}): {e}")
        raise HTTPException(
            status_code=503,
            detail="The AI coach is temporarily unavailable. Please try again in a moment.",
        )

    # نخزّن السؤال والرد الاتنين مع بعض عشان المرة الجاية تكون جزء من نفس المحادثة
    db.add(ChatMessage(user_id=user.id, mode=chat.mode, role="user", content=chat.message))
    db.add(ChatMessage(user_id=user.id, mode=chat.mode, role="assistant", content=reply))
    db.commit()

    return {"reply": reply}