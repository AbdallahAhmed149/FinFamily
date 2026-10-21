// العناصر التجميلية اللي بتتباع بالجواهر 💎 في متجر الجواهر.
// السيرفر (backend/services/shop.py) مسؤول عن السعر والملكية بنفس الـ ids — هنا الاسم والشكل بس.
// لو ضفت عنصر هنا لازم تضيفه هناك (فيه اختبار بيتأكد إنهم متطابقين).

export const FRAMES = {
  frame_gold:    { emoji: "🥇", color: "#FFC857", glow: "#FFC85799", name: { en: "Golden Ring", ar: "إطار ذهبي" } },
  frame_emerald: { emoji: "💚", color: "#10b981", glow: "#10b98199", name: { en: "Emerald Glow", ar: "إطار زمردي" } },
  frame_fire:    { emoji: "🔥", color: "linear-gradient(135deg,#f97316,#ef4444)", glow: "#ef4444aa", name: { en: "Fire Ring", ar: "إطار النار" } },
  frame_rainbow: { emoji: "🌈", color: "conic-gradient(#ef4444,#f59e0b,#22c55e,#3b82f6,#8b5cf6,#ef4444)", glow: "#8b5cf699", name: { en: "Rainbow Ring", ar: "إطار قوس قزح" } },
};

export const TITLES = {
  title_saver:     { emoji: "🐷", name: { en: "Super Saver", ar: "موفّر ممتاز" } },
  title_cookie:    { emoji: "🍪", name: { en: "Smart Cookie", ar: "شاطر قوي" } },
  title_ninja:     { emoji: "🥷", name: { en: "Money Ninja", ar: "نينجا الفلوس" } },
  title_detective: { emoji: "🕵️", name: { en: "Scam Buster", ar: "كاشف النصب" } },
  title_boss:      { emoji: "👑", name: { en: "Budget Boss", ar: "زعيم الميزانية" } },
};

// ثيمات كارت ميزة المدفوعة (المجانية في finData.cardThemes). الـ ids من غير بادئة (زي الباك اند).
export const PREMIUM_CARD_THEMES = [
  { id: "galaxy",  name: { en: "Galaxy", ar: "المجرّة" },   gradient: "linear-gradient(135deg,#1e1b4b,#7c3aed,#db2777)" },
  { id: "sunset",  name: { en: "Sunset", ar: "الغروب" },    gradient: "linear-gradient(135deg,#f97316,#ec4899)" },
  { id: "candy",   name: { en: "Candy", ar: "حلاوة" },      gradient: "linear-gradient(135deg,#f472b6,#a78bfa,#60a5fa)" },
  { id: "emerald", name: { en: "Emerald Night", ar: "ليلة زمردية" }, gradient: "linear-gradient(135deg,#065f46,#10b981)" },
];

export const KIND_ORDER = ["frame", "title", "card_theme"];

export const nameOf = (obj, lang) => (obj ? obj[lang === "ar" ? "ar" : "en"] ?? obj.en : "");

/** الاسم + الشكل لأي عنصر في المتجر بالـ id بتاعه (أو null لو id مش معروف). */
export function cosmeticMeta(id) {
  if (FRAMES[id]) return { kind: "frame", ...FRAMES[id] };
  if (TITLES[id]) return { kind: "title", ...TITLES[id] };
  const th = PREMIUM_CARD_THEMES.find((x) => x.id === id);
  return th ? { kind: "card_theme", emoji: "💳", ...th } : null;
}

export const ALL_COSMETIC_IDS = [...Object.keys(FRAMES), ...Object.keys(TITLES), ...PREMIUM_CARD_THEMES.map((t) => t.id)];