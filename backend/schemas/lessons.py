from typing import List, Optional

from pydantic import BaseModel, Field


class LessonProgressOut(BaseModel):
    id: str
    status: str                 # locked | available | completed
    best_score: int = 0
    total: int = 0
    attempts: int = 0
    xp: int                     # مكافأة أول نجاح
    gems: int


class LessonCompleteRequest(BaseModel):
    score: int = Field(ge=0)
    total: int = Field(ge=1)


class LessonCompleteResponse(BaseModel):
    lesson_id: str
    passed: bool
    first_pass: bool            # أول مرة ينجح → المكافأة اتدّت
    best_score: int
    total: int
    xp_awarded: int
    gems_awarded: int
    leveled_up: bool
    new_xp: int
    new_level: int
    new_gems: int
    next_lesson_id: Optional[str] = None
    streak_freeze_used: int = 0
    streak_freeze_earned: bool = False
    streak_lost: int = 0
    new_streak_freezes: int = 0


class WorldLessonOut(BaseModel):
    id: str
    status: str
    best_score: int = 0
    total: int = 0


class WorldGameOut(BaseModel):
    id: str
    plays: int
    best_stars: int


class WorldOut(BaseModel):
    id: str
    unlock_level: int
    unlocked: bool
    lessons: List[WorldLessonOut]
    game: WorldGameOut
    progress: int               # 0..100
    completed: bool


class AdventureOut(BaseModel):
    level: int
    worlds: List[WorldOut]