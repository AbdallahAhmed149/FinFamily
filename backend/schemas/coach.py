from datetime import datetime

from pydantic import BaseModel


class ChatMessageOut(BaseModel):
    role: str  # "user" / "assistant"
    content: str
    created_date: datetime


class CoachHistoryResponse(BaseModel):
    messages: list[ChatMessageOut]