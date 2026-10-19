import React from "react";
import { useTranslation } from "react-i18next";

// تنبيه لطيف تحت الـ hero لو الـ streak محتاج نشاط النهارده.
// الحالات جاية من السيرفر (user.streak_status) — مش بنحسبها في الفرونت عشان ماتتلخبطش مع التوقيت.
export default function StreakBanner({ status, streak }) {
  const { t } = useTranslation();
  const map = {
    at_risk: { icon: "🔥", text: t("streakBanner.atRisk", { count: streak }), tone: "bg-orange-500/10 text-orange-700" },
    covered: { icon: "❄️", text: t("streakBanner.covered", { count: streak }), tone: "bg-sky-500/10 text-sky-700" },
    broken:  { icon: "💪", text: t("streakBanner.broken"), tone: "bg-amber-500/10 text-amber-700" },
  };
  const cfg = map[status];
  if (!cfg) return null;
  return (
    <div role="status" data-testid="streak-banner" className={`mt-3 rounded-2xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2 ${cfg.tone}`}>
      <span className="text-base">{cfg.icon}</span> {cfg.text}
    </div>
  );
}