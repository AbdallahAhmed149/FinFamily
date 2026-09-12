import React, { useState } from "react";
import { Check } from "lucide-react";
import { FadeIn } from "@/components/fin/ui";

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

// لون مميز لكل شارة وقت ما تكون مفتوحة — لو ضفت شارة جديدة في الباك اند (services/badges.py)
// ضيف لونها هنا كمان، وإلا هتاخد اللون الافتراضي الرمادي/الذهبي.
const BADGE_COLORS = {
  first_chore: "#FFC857",
  game_explorer: "#3b82f6",
  perfect_day: "linear-gradient(135deg, #f59e0b, #ec4899)",
  week_streak: "#f97316",
  super_saver: "#ec4899",
  big_earner: "#00B894",
};

function Hex({ badge, onClick }) {
  const bg = badge.unlocked ? BADGE_COLORS[badge.id] || "#FFC857" : "#ffffff10";
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 w-[72px] active:scale-95 transition-transform">
      <div
        className="w-16 h-16 flex items-center justify-center text-2xl relative shadow-premium"
        style={{ clipPath: HEX_CLIP, background: badge.unlocked ? bg : "#94a3b833" }}
      >
        <span className={badge.unlocked ? "" : "opacity-40 grayscale"}>{badge.icon}</span>
        {!badge.unlocked && <div className="absolute inset-0 flex items-center justify-center text-black/30 text-lg">🔒</div>}
      </div>
      <div className={"text-[10px] font-semibold text-center leading-tight " + (badge.unlocked ? "" : "text-muted-foreground")}>
        {badge.name}
      </div>
    </button>
  );
}

export default function BadgesGrid({ badges }) {
  const [selected, setSelected] = useState(null);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        You've earned {unlockedCount} of {badges.length} badges — tap any badge to see how to unlock it.
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-4">
        {badges.map((b) => (
          <Hex key={b.id} badge={b} onClick={() => setSelected(b)} />
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
          <div className="glass rounded-3xl p-6 w-full max-w-sm text-center animate-pop" onClick={(e) => e.stopPropagation()}>
            <div
              className="w-24 h-24 mx-auto flex items-center justify-center text-4xl mb-4 shadow-premium"
              style={{
                clipPath: HEX_CLIP,
                background: selected.unlocked ? BADGE_COLORS[selected.id] || "#FFC857" : "#94a3b833",
              }}
            >
              <span className={selected.unlocked ? "" : "opacity-40 grayscale"}>{selected.icon}</span>
            </div>
            <h3 className="text-lg font-extrabold font-heading">{selected.name}</h3>

            {selected.unlocked ? (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-600">
                <Check className="w-4 h-4" /> Unlocked
                {selected.unlocked_date && (
                  <span className="text-muted-foreground font-normal">
                    · {new Date(selected.unlocked_date).toLocaleDateString("en-EG", { dateStyle: "medium" })}
                  </span>
                )}
              </div>
            ) : (
              <div className="mt-1 text-xs font-bold text-amber-600">🔒 Locked</div>
            )}

            <p className="text-sm text-muted-foreground mt-3">{selected.desc}</p>

            <button
              onClick={() => setSelected(null)}
              className="w-full h-11 mt-5 rounded-2xl font-bold text-white grad-navy active:scale-95 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}