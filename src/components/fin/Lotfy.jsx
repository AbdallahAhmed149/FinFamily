import React from "react";
import { LOFTY_IMAGE } from "@/lib/finData";
import { cn } from "@/lib/utils";

const BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.BASE_URL) || "/";

// صور لطفي بتعبيرات (شفافة، WebP) في public/lotfy/. بنستخدمها كـ "ردود فعل" مش ديكور:
//   happy = إجابة صح / نجاح،  think = بيفكّر / إجابة غلط (تشجيع مش عقاب)،  sad = لما الطفل ماعداش درس (بلطف)
export const LOTFY_MOODS = {
  happy: `${BASE}lotfy/happy.webp`,
  think: `${BASE}lotfy/think.webp`,
  sad: `${BASE}lotfy/sad.webp`,
};

/**
 * بدون mood: الصورة الدايرية القديمة (أفاتار).
 * مع mood: لطفي بالتعبير ده (من غير قص دايري) — لشاشات الدروس والمكافآت.
 */
export default function Lotfy({ size = 120, className, speech, mood }) {
  if (mood && LOTFY_MOODS[mood]) {
    return (
      <div className={cn("relative inline-flex flex-col items-center", className)} data-mood={mood}>
        <div className="absolute bottom-2 w-3/5 h-4 rounded-full bg-black/20 blur-md" />
        <img
          key={mood}
          src={LOTFY_MOODS[mood]}
          alt={`Lotfy ${mood}`}
          className="relative object-contain drop-shadow-xl animate-pop"
          style={{ height: size, width: size }}
          draggable={false}
        />
        {speech && (
          <div className="absolute -top-2 -end-6 max-w-[180px] glass rounded-2xl px-3 py-2 text-xs font-medium shadow-premium animate-pop">
            {speech}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl scale-110" />
        <img
          src={LOFTY_IMAGE}
          alt="Lotfy"
          className="relative rounded-full object-cover shadow-glow-emerald border-4 border-white"
          style={{ width: size, height: size }}
        />
      </div>
      {speech && (
        <div className="absolute -top-2 -end-6 max-w-[180px] glass rounded-2xl px-3 py-2 text-xs font-medium shadow-premium animate-pop">
          {speech}
        </div>
      )}
    </div>
  );
}