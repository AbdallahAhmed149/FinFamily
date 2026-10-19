"""
المهام اليومية (Daily Quests).

- 3 مهام لكل طفل في اليوم، بتتولّد أول مرة الطفل يفتحها وبتتخزّن (DailyQuestSet).
- التقدم بيتحسب لايف من الداتا الحقيقية (مفيش حاجة بتتبعتلنا من الفرونت = مفيش غش).
- المكافأة XP بس (مش كوينز) — الكوينز حاليًا هي نفس فلوس المحفظة، فمش هنطبع فلوس من المهام.
- فتح كل المهام الـ 3 بيفتح صندوق XP إضافي.
"""
import random
from datetime import date, datetime
from typing import Dict, List

from sqlalchemy.orm import Session

from db.models import (
    User, Wallet, SavingsGoal, GameCompletion, Transaction, TransactionType,
    TransactionDirection, Mission, MissionKind, MissionStatus, ChatMessage,
)
from core.timeutil import cairo_today, cairo_today_start_utc

CHEST_XP = 50
HIGH_SCORE_RATIO = 0.8
MIN_BALANCE_FOR_SAVE_QUEST = 5  # مينفعش نطلب "حوّش" من طفل رصيده صفر

# key -> (icon, target, xp)
QUEST_DEFS: Dict[str, dict] = {
    "games_2":    {"icon": "🎮", "target": 2, "xp": 30},
    "games_3":    {"icon": "🎮", "target": 3, "xp": 45},
    "high_score": {"icon": "⭐", "target": 1, "xp": 40},
    "save_money": {"icon": "🐷", "target": 1, "xp": 40},
    "chore":      {"icon": "🧹", "target": 1, "xp": 40},
    "ask_lotfy":  {"icon": "💬", "target": 1, "xp": 25},
}


def _wallet(db: Session, child: User) -> Wallet | None:
    return db.query(Wallet).filter(Wallet.owner_id == child.id).first()


def generate_quests(db: Session, child: User, day: date) -> List[dict]:
    """بتختار 3 مهام ممكن الطفل يخلّصها فعلًا النهارده. الاختيار ثابت لنفس (طفل، يوم) بفضل الـ seed."""
    rng = random.Random(f"{child.id}:{day.isoformat()}")
    wallet = _wallet(db, child)

    has_goal = bool(wallet and db.query(SavingsGoal).filter(SavingsGoal.wallet_id == wallet.id).first())
    can_save = has_goal and (wallet.balance or 0) >= MIN_BALANCE_FOR_SAVE_QUEST
    has_chore = db.query(Mission).filter(
        Mission.assigned_to_id == child.id, Mission.kind == MissionKind.chore,
        Mission.status == MissionStatus.pending,
    ).first() is not None

    slot1 = rng.choice(["games_2", "games_3"])

    real_life = [k for k, ok in (("save_money", can_save), ("chore", has_chore)) if ok]
    slot2 = rng.choice(real_life) if real_life else "high_score"

    pool3 = [k for k in ("ask_lotfy", "high_score") if k != slot2]
    slot3 = rng.choice(pool3)

    return [{"key": k, "target": QUEST_DEFS[k]["target"], "xp": QUEST_DEFS[k]["xp"]} for k in (slot1, slot2, slot3)]


def quest_progress(db: Session, child: User, key: str) -> int:
    """التقدم الحقيقي للمهمة النهارده (من بداية اليوم بتوقيت القاهرة)."""
    start = cairo_today_start_utc()

    if key in ("games_2", "games_3"):
        # لعبات "مختلفة" — إعادة نفس اللعبة مش بتتحسب (منع الـ farming)
        rows = db.query(GameCompletion.game_id).filter(
            GameCompletion.child_id == child.id, GameCompletion.created_date >= start
        ).distinct().all()
        return len(rows)

    if key == "high_score":
        rows = db.query(GameCompletion.score, GameCompletion.total).filter(
            GameCompletion.child_id == child.id, GameCompletion.created_date >= start
        ).all()
        return 1 if any(t and s / t >= HIGH_SCORE_RATIO for s, t in rows) else 0

    if key == "save_money":
        wallet = _wallet(db, child)
        if not wallet:
            return 0
        return db.query(Transaction).filter(
            Transaction.wallet_id == wallet.id, Transaction.type == TransactionType.savings_transfer,
            Transaction.direction == TransactionDirection.debit, Transaction.created_date >= start,
        ).count()

    if key == "chore":
        return db.query(Mission).filter(
            Mission.assigned_to_id == child.id, Mission.kind == MissionKind.chore,
            Mission.status.in_([MissionStatus.submitted, MissionStatus.approved]),
            Mission.updated_date >= start,
        ).count()

    if key == "ask_lotfy":
        return db.query(ChatMessage).filter(
            ChatMessage.user_id == child.id, ChatMessage.role == "user",
            ChatMessage.mode == "child", ChatMessage.created_date >= start,
        ).count()

    return 0


def today() -> date:
    return cairo_today()