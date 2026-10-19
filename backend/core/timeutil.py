"""
أدوات الوقت بتوقيت القاهرة.

الداتا بيز بتخزّن كل التواريخ كـ UTC naive (datetime.utcnow())، لكن "اليوم" عند
الطفل بيبدأ من نص الليل بتوقيت مصر — مش UTC. من غير التحويل ده كان الـ streak
والمكافأة اليومية بيتصفّروا الساعة 2/3 الفجر بدل 12 بالليل.
"""
from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

CAIRO = ZoneInfo("Africa/Cairo")


def cairo_date(dt_utc_naive: datetime) -> date:
    """تاريخ اليوم بتوقيت القاهرة لـ datetime مخزّن كـ UTC naive."""
    return dt_utc_naive.replace(tzinfo=timezone.utc).astimezone(CAIRO).date()


def cairo_today() -> date:
    return datetime.now(CAIRO).date()


def cairo_today_start_utc() -> datetime:
    """بداية اليوم الحالي بتوقيت القاهرة، معبّر عنها كـ UTC naive (جاهزة للمقارنة مع أعمدة الداتا بيز)."""
    now_cairo = datetime.now(CAIRO)
    midnight = now_cairo.replace(hour=0, minute=0, second=0, microsecond=0)
    return midnight.astimezone(timezone.utc).replace(tzinfo=None)