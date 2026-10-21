"""
عوالم الـ Adventure Map. الاسم والأيقونة والـ topics في الفرونت (finData.adventureWorlds) بنفس الـ ids.
السيرفر بيحدد: الليفل المطلوب، الدروس، واللعبة، وبيحسب التقدم الحقيقي.

العالم بيتفتح بالـ level (الـ XP الحقيقي). كل الـ 10 دروس موزعين على العوالم عشان مفيش درس ملهوش مكان.
تقدم العالم = 50% الدروس (مقسومة بالتساوي) + 25% لو لعب لعبته + 25% لو جابها 3 نجوم.
"""
from typing import List

WORLDS: List[dict] = [
    {"id": "w1", "unlock_level": 1, "lessons": ["l1"],        "game": "gm3"},
    {"id": "w2", "unlock_level": 2, "lessons": ["l2"],        "game": "gm8"},
    {"id": "w3", "unlock_level": 3, "lessons": ["l3"],        "game": "gm2"},
    {"id": "w4", "unlock_level": 4, "lessons": ["l4"],        "game": "gm11"},
    {"id": "w5", "unlock_level": 5, "lessons": ["l5", "l6"],  "game": "gm5"},
    {"id": "w6", "unlock_level": 6, "lessons": ["l7", "l8"],  "game": "gm9"},
    {"id": "w7", "unlock_level": 7, "lessons": ["l9", "l10"], "game": "gm10"},
]


def stars_for_ratio(ratio: float) -> int:
    """نفس عتبات شاشة المكافأة: 80%+ = 3 نجوم، 50%+ = 2، أي نتيجة = 1."""
    if ratio >= 0.8:
        return 3
    if ratio >= 0.5:
        return 2
    return 1 if ratio > 0 else 0


def world_progress(lessons_passed: int, lessons_total: int, game_stars: int) -> int:
    lesson_part = 50 * (lessons_passed / lessons_total) if lessons_total else 0
    game_part = (25 if game_stars >= 1 else 0) + (25 if game_stars >= 3 else 0)
    return int(round(lesson_part + game_part))