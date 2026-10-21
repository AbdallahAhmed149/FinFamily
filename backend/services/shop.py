"""
متجر الجواهر 💎 — عناصر تجميلية بس (مفيش حاجة بتأثر على الفلوس أو الـ XP أو الأمان).

kinds:
  card_theme — ثيم كارت ميزة (بيتفعّل على wallet.card_theme)
  frame      — إطار صورة الطفل (users.equipped_frame)
  title      — لقب جنب اسم الطفل (users.equipped_title)

الأسماء والأوصاف والشكل (CSS) في الفرونت (src/lib/cosmetics.js) بنفس الـ ids. السيرفر مسؤول بس عن
السعر والملكية. لو ضفت عنصر هنا لازم تضيفه هناك كمان (فيه اختبار بيتأكد إنهم متطابقين).
"""
from typing import Dict

# الثيمات المجانية الموجودة أصلًا في صفحة كارت ميزة (finData.cardThemes)
FREE_CARD_THEMES = {"blue", "dark", "kids", "gold"}

SHOP_ITEMS: Dict[str, dict] = {
    # ثيمات كارت
    "galaxy":    {"kind": "card_theme", "price": 250},
    "sunset":    {"kind": "card_theme", "price": 250},
    "candy":     {"kind": "card_theme", "price": 200},
    "emerald":   {"kind": "card_theme", "price": 300},
    # إطارات صورة
    "frame_gold":    {"kind": "frame", "price": 150},
    "frame_emerald": {"kind": "frame", "price": 150},
    "frame_fire":    {"kind": "frame", "price": 300},
    "frame_rainbow": {"kind": "frame", "price": 400},
    # ألقاب
    "title_saver":     {"kind": "title", "price": 100},
    "title_cookie":    {"kind": "title", "price": 100},
    "title_ninja":     {"kind": "title", "price": 150},
    "title_detective": {"kind": "title", "price": 200},
    "title_boss":      {"kind": "title", "price": 250},
}