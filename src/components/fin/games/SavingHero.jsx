import React, { useState } from "react";
import { PiggyBank, ArrowRight, Sparkles } from "lucide-react";
import { savingHeroGoal, fmtEGP } from "@/lib/finData";
import { useTranslation } from "react-i18next";

export default function SavingHero({ onFinish }) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(savingHeroGoal.current);
  const [weekly, setWeekly] = useState(savingHeroGoal.weeklyOptions[1]);
  const [burst, setBurst] = useState(false);
  const target = savingHeroGoal.target;
  const remaining = Math.max(0, target - current);
  const pct = Math.min(100, (current / target) * 100);
  const weeks = Math.ceil(remaining / weekly);
  const complete = current >= target;

  const save = () => {
    if (complete) return;
    const next = Math.min(target, current + weekly);
    setCurrent(next);
    setBurst(true);
    setTimeout(() => setBurst(false), 1400);
    if (next >= target) setTimeout(() => onFinish(1, 1), 1200);
  };

  return (
    <div className="px-4 pt-8 pb-8 max-w-md mx-auto relative">
      {burst && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="absolute text-2xl animate-float" style={{ left: `${30 + i * 8}%`, top: "30%", ["--tx"]: `${(i % 2 ? 1 : -1) * 40}px`, animationDelay: `${i * 0.05}s` }}>🪙</span>
          ))}
        </div>
      )}

      <div className="text-center mb-5">
        <div className="text-5xl mb-2">{savingHeroGoal.icon}</div>
        <h2 className="text-xl font-extrabold font-heading">{t("game_saving_hero.title")}</h2>
        <p className="text-xs text-muted-foreground">{t("game_saving_hero.goal", { name: savingHeroGoal.name, target: fmtEGP(target) })}</p>
      </div>

      {/* progress ring */}
      <div className="glass rounded-3xl p-5 shadow-premium text-center mb-4">
        <div className="relative w-40 h-40 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
            <circle cx="50" cy="50" r="44" fill="none" stroke={savingHeroGoal.color} strokeWidth="8" strokeLinecap="round" strokeDasharray="276" strokeDashoffset={276 - (276 * pct) / 100} className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <PiggyBank className="w-7 h-7 mb-1" style={{ color: savingHeroGoal.color }} />
            <div className="text-2xl font-extrabold font-heading">{Math.round(pct)}%</div>
            <div className="text-xs text-muted-foreground">{fmtEGP(current)} / {fmtEGP(target)}</div>
          </div>
        </div>
        {!complete && <div className="text-xs text-muted-foreground mt-2">{t("game_saving_hero.remaining", { amount: fmtEGP(remaining), weeks })}</div>}
      </div>

      {complete ? (
        <div className="rounded-2xl p-5 text-center animate-pop" style={{ background: "#00B89415" }}>
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold">{t("game_saving_hero.complete")}</div>
          <div className="text-xs text-muted-foreground mt-1">{t("game_saving_hero.complete_desc")}</div>
        </div>
      ) : (
        <>
          <div className="text-sm font-semibold mb-2">{t("game_saving_hero.choose_weekly")}</div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {savingHeroGoal.weeklyOptions.map((w) => (
              <button key={w} onClick={() => setWeekly(w)} className={"h-14 rounded-2xl font-bold text-sm shadow-premium border-2 transition-all active:scale-95 " + (weekly === w ? "text-white border-transparent" : "glass border-transparent text-foreground")} style={weekly === w ? { background: savingHeroGoal.color } : {}}>
                {fmtEGP(w)}
              </button>
            ))}
          </div>

          <button onClick={save} className="w-full h-13 py-3.5 rounded-2xl text-white font-bold font-heading flex items-center justify-center gap-2 shadow-premium active:scale-[0.98] transition-all" style={{ background: savingHeroGoal.color }}>
            <Sparkles className="w-4 h-4" /> {t("game_saving_hero.save_now", { amount: fmtEGP(weekly) })}
          </button>
          <p className="text-[11px] text-muted-foreground text-center mt-3">{t("game_saving_hero.tip")}</p>
        </>
      )}
    </div>
  );
}