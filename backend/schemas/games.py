from datetime import datetime

from pydantic import BaseModel, Field


class GameCompleteRequest(BaseModel):
    game_id: str
    score: float = Field(ge=0)
    total: float = Field(gt=0)


class GameCompleteResponse(BaseModel):
    game_title: str
    xp_awarded: int
    coins_awarded: float
    already_rewarded_today: bool
    leveled_up: bool
    new_xp: int
    new_level: int
    new_balance: float