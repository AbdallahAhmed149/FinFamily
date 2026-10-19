from dataclasses import dataclass
from datetime import datetime

from db.models import User
from core.timeutil import cairo_date, cairo_today

FREEZE_EARN_EVERY = 7   # Freeze جديد كل 7 أيام streak متتالية
MAX_FREEZES = 2         # أقصى عدد Freezes ممكن الطفل يشيلها


@dataclass
class StreakResult:
    """نتيجة touch_streak. بتتقيّم كـ True لو النهارده اتحسب يوم جديد (توافق مع الكود القديم)."""
    changed: bool = False
    freezes_used: int = 0       # كام يوم فوّته الطفل واتحمى بـ Freeze
    freeze_earned: bool = False  # كسب Freeze جديد في اليوم ده
    lost_streak: int = 0        # لو الـ streak اتكسر: كان كام (0 لو ماتكسرش أو كان قصير)

    def __bool__(self) -> bool:
        return self.changed


def touch_streak(child: User) -> StreakResult:
    """
    بتتحسب مرة واحدة لكل يوم (بتوقيت القاهرة) — أول نشاط حقيقي (لعبة / تسليم مهمة / ...).

      - أول يوم أو بعد يوم نشاط (إمبارح)  → +1
      - فوّت N يوم و عنده N Freezes أو أكتر → بيتستهلك N Freeze والـ streak بيكمّل +1
      - فوّت أيام أكتر من الـ Freezes       → يرجع 1 (والـ Freezes بتفضل زي ما هي)
      - نفس اليوم                            → مفيش تغيير

    بنكسب Freeze جديد كل مرة الـ streak يوصل لمضاعفات 7 (لحد MAX_FREEZES).
    """
    today = cairo_today()
    last = cairo_date(child.last_active_date) if child.last_active_date else None
    result = StreakResult()

    if last is not None and last >= today:  # >= عشان لو الساعة اتغيّرت للوراء مانعدّش اليوم مرتين
        return result

    previous = child.streak or 0
    missed = (today - last).days - 1 if last is not None else 0
    freezes = child.streak_freezes or 0

    if last is None:
        child.streak = 1
    elif missed == 0:
        child.streak = previous + 1
    elif freezes >= missed:
        child.streak_freezes = freezes - missed
        result.freezes_used = missed
        child.streak = previous + 1
    else:
        child.streak = 1
        if previous >= 3:
            result.lost_streak = previous

    if child.streak % FREEZE_EARN_EVERY == 0 and (child.streak_freezes or 0) < MAX_FREEZES:
        child.streak_freezes = (child.streak_freezes or 0) + 1
        result.freeze_earned = True

    child.last_active_date = datetime.utcnow()
    result.changed = True
    return result