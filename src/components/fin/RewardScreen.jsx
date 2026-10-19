import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, X } from "lucide-react";
import { play } from "@/lib/sounds";
import { burst, bigCelebration } from "@/lib/celebrate";

// عدّاد بيطلع من 0 للقيمة النهائية (بيحسّس الطفل إن المكافأة "بتتجمّع"). بيحترم تقليل الحركة.
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const n = Number(target) || 0;
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!n || reduced) { setValue(n); return undefined; }
    // الأصل الزمني = timestamp أول frame (مش performance.now()): أول rAF ممكن يكون timestamp بتاعه أقدم
    // من لحظة استدعاء الـ effect، فكان الفرق يطلع سالب ويظهر "+-1" لحظة. وكمان بنـ clamp.
    let raf; let t0 = null;
    const tick = (now) => {
      if (t0 === null) t0 = now;
      const p = Math.min(1, Math.max(0, (now - t0) / duration));
      setValue(Math.round(n * (1 - Math.pow(1 - p, 3)))); // ease-out
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function RewardScreen({ title, score, total, coins, xp, note, badges = [], streak, onClose }) {
  const { t } = useTranslation();
  const pct = total ? Math.round((score / total) * 100) : 100;
  const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;
  const hasReward = coins !== undefined || xp !== undefined;
  const shownCoins = useCountUp(coins);
  const shownXp = useCountUp(xp);

  // أصوات + احتفال عند ظهور الشاشة (متسلسلة عشان مايبقوش فوق بعض)
  useEffect(() => {
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    play(stars === 3 ? "win" : stars === 2 ? "finish" : "soft");
    if (stars === 3) burst(); // النتيجة الضعيفة بتتعامل بهدوء — من غير احتفال زيادة
    if (hasReward && ((coins || 0) > 0 || (xp || 0) > 0)) at(500, () => play("coins"));
    if (badges.length) at(1100, () => { play("badge"); bigCelebration(900); });
    if (streak?.freezeUsed || streak?.freezeEarned) at(badges.length ? 1900 : 1100, () => play("freeze"));
    return () => timers.forEach(clearTimeout);
    // مرة واحدة عند الظهور
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const streakLines = [];
  if (streak?.freezeUsed > 0) streakLines.push({ icon: "❄️", text: t("games.rewardScreen.streakFreezeUsed"), tone: "bg-sky-500/10 text-sky-700" });
  if (streak?.freezeEarned) streakLines.push({ icon: "❄️", text: t("games.rewardScreen.streakFreezeEarned"), tone: "bg-sky-500/10 text-sky-700" });
  if (streak?.lost > 0) streakLines.push({ icon: "💪", text: t("games.rewardScreen.streakLost", { count: streak.lost }), tone: "bg-amber-500/10 text-amber-700" });

  const close = () => { play("tap"); onClose(); };

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10 animate-pop">
      <button onClick={close} aria-label="close" className="absolute top-4 end-4 w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
        <X className="w-4 h-4" />
      </button>

      <div className="relative h-28 mb-4 w-full max-w-xs">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="absolute text-2xl animate-float"
            style={{ left: `${10 + i * 8}%`, top: "10%", ["--tx"]: `${(i % 2 ? 1 : -1) * 30}px`, animationDelay: `${i * 0.08}s` }}
          >🪙</span>
        ))}
      </div>

      <div className="text-5xl mb-2">{stars === 3 ? "🏆" : stars === 2 ? "🎉" : "💪"}</div>
      <h2 className="text-2xl font-extrabold font-heading">{title || t("games.rewardScreen.defaultTitle")}</h2>
      <p className="text-sm text-muted-foreground mt-1">{t("games.rewardScreen.scoreLine", { score, total })}</p>

      <div className="flex gap-1 my-4">
        {[1, 2, 3].map((s) => (
          <Star key={s} className={"w-9 h-9 " + (s <= stars ? "text-amber-400 fill-amber-400" : "text-black/15")} />
        ))}
      </div>

      {note && <p className="text-xs text-muted-foreground -mt-2 mb-4 max-w-xs">{note}</p>}

      {badges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4 max-w-xs" data-testid="reward-badges">
          {badges.map((b) => (
            <div key={b.id} className="animate-pop rounded-2xl bg-amber-400/15 border border-amber-400/40 px-3 py-2 text-start">
              <div className="text-sm font-extrabold">{b.icon} {b.name}</div>
              {b.desc && <div className="text-[11px] text-muted-foreground">{b.desc}</div>}
            </div>
          ))}
        </div>
      )}

      {streakLines.length > 0 && (
        <div className="space-y-2 mb-4 max-w-xs" data-testid="reward-streak">
          {streakLines.map((l, i) => (
            <div key={i} className={`rounded-xl px-3 py-2 text-xs font-semibold ${l.tone}`}>{l.icon} {l.text}</div>
          ))}
        </div>
      )}

      {/* بنخفي صناديق المكافأة لو مفيش مكافأة حقيقية تتعرض (زي الكويز لحد ما الدروس تتربط بالباك اند) */}
      {hasReward ? (
        <div className="flex gap-3 mb-6">
          <div className="grad-gold rounded-2xl px-5 py-3 text-white shadow-glow-gold">
            <div className="text-2xl font-extrabold">+{shownCoins}</div>
            <div className="text-xs">{t("games.rewardScreen.coins")}</div>
          </div>
          <div className="grad-emerald rounded-2xl px-5 py-3 text-white shadow-glow-emerald">
            <div className="text-2xl font-extrabold">+{shownXp}</div>
            <div className="text-xs">{t("games.rewardScreen.xp")}</div>
          </div>
        </div>
      ) : (
        <div className="mb-4" />
      )}

      <button onClick={close} className="w-full max-w-xs h-13 py-3.5 rounded-2xl text-white font-bold font-heading grad-navy shadow-premium active:scale-[0.98] transition-all">
        {t("games.rewardScreen.claim")}
      </button>
    </div>
  );
}