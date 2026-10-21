"""
الدروس. المحتوى نفسه (الكروت والأسئلة) في الفرونت (src/content/lessons.js) — السيرفر مسؤول عن:
الترتيب، فتح الدرس اللي بعده، النجاح، ومكافأة أول نجاح بس (مفيش farming).

لازم يفضلوا متطابقين مع الفرونت: ids + xp + QUESTIONS_PER_QUIZ + PASS_RATIO
(فيه اختبار بيقارن الملفين).
"""
from typing import Dict, List

QUESTIONS_PER_QUIZ = 5
PASS_RATIO = 0.6

# بالترتيب — الدرس n بيتفتح لما n-1 يتعدّى
LESSON_ORDER: List[str] = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10"]

LESSON_XP: Dict[str, int] = {
    "l1": 100, "l2": 120, "l3": 150, "l4": 150, "l5": 130,
    "l6": 140, "l7": 160, "l8": 160, "l9": 170, "l10": 200,
}


def lesson_gems(lesson_id: str) -> int:
    """جواهر أول نجاح = تلت الـ XP تقريبًا."""
    return LESSON_XP[lesson_id] // 3


def is_passing(score: int, total: int) -> bool:
    return total > 0 and (score / total) >= PASS_RATIO


def status_for(index: int, completions: Dict[str, "object"]) -> str:
    """locked | available | completed (completed = نجح مرة على الأقل)."""
    lesson_id = LESSON_ORDER[index]
    done = completions.get(lesson_id)
    if done is not None and done.passed:
        return "completed"
    if index == 0:
        return "available"
    prev = completions.get(LESSON_ORDER[index - 1])
    return "available" if (prev is not None and prev.passed) else "locked"