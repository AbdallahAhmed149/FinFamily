from fastapi import APIRouter, Depends, HTTPException

from db.models import User
from core.deps import get_current_user
from services.ai_coach import ChatMessage, get_ai_response

# قديماً كان فيه هنا CRUD مفتوح بالكامل على /api/entities/User (أي حد يقدر
# ينشئ/يمسح يوزرز من غير أي صلاحية). اتشال بالكامل واتستبدل بمسارات الـ Auth
# المحمية في auth_routes.py (register / login / children / me).

functions_router = APIRouter(prefix="/api/functions", tags=["Backend Functions"])


@functions_router.post("/aiCoach")
def invoke_ai_coach(
    chat: ChatMessage,
    user: User = Depends(get_current_user),
):
    if len(chat.message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long")

    # الـ mode بيتحدد من دور اليوزر نفسه في التوكن، مش من حاجة الفرونت بيبعتها
    # (كده طفل مايقدرش يبعت mode=parent ويستني رد Coach Nour).
    chat.mode = "parent" if user.role == "parent" else "child"

    reply = get_ai_response(chat)
    return {"reply": reply}