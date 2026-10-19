from typing import List

from pydantic import BaseModel


class QuestOut(BaseModel):
    key: str
    icon: str
    target: int
    progress: int       # بحد أقصى target
    xp: int
    completed: bool     # التقدم وصل للهدف
    claimed: bool       # الطفل استلم مكافأتها


class ChestOut(BaseModel):
    xp: int
    ready: bool         # كل المهام اتستلمت (الصندوق اتفتح)
    claimed: bool


class QuestsTodayOut(BaseModel):
    date: str           # اليوم بتوقيت القاهرة (YYYY-MM-DD)
    quests: List[QuestOut]
    chest: ChestOut


class QuestClaimOut(BaseModel):
    key: str
    xp_awarded: int
    chest_xp_awarded: int = 0   # > 0 لو دي كانت آخر مهمة وفتحت الصندوق
    leveled_up: bool
    new_xp: int
    new_level: int