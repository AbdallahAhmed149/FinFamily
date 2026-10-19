import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ChevronRight } from "lucide-react";
import { SectionTitle, ProgressBar } from "@/components/fin/ui";
import { getTodayQuests, claimQuest } from "@/lib/finApi";
import { useAuth } from "@/lib/AuthContext";
import { play } from "@/lib/sounds";
import { burst, bigCelebration } from "@/lib/celebrate";

// لو المهمة لسه ما اتعملتش، الضغط عليها بياخد الطفل للمكان اللي يعملها فيه
const QUEST_ROUTE = { save_money: "/child/goals", chore: "/child/missions", ask_lotfy: "/child/coach" };

export default function DailyQuests({ refreshKey = 0 }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [claiming, setClaiming] = useState(null);
  const [gain, setGain] = useState(null); // {xp, chest}

  const load = useCallback(() => (
    getTodayQuests().then((d) => { setData(d); setFailed(false); }).catch(() => setFailed(true))
  ), []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const claim = async (q) => {
    if (claiming) return;
    setClaiming(q.key);
    try {
      const res = await claimQuest(q.key);
      play("questDone");
      burst();
      setGain({ xp: res.xp_awarded, chest: res.chest_xp_awarded });
      setTimeout(() => setGain(null), 2600);
      if (res.chest_xp_awarded > 0) setTimeout(() => { play("win"); bigCelebration(); }, 700);
      await load();
      refreshUser?.().catch?.(() => {}); // XP/level الجديد (ولو level-up، الشاشة العامة هتظهر)
    } catch {
      await load(); // غالبًا اتستلمت قبل كده من تاب تاني — نعرض الحالة الحقيقية
    } finally {
      setClaiming(null);
    }
  };

  // لو الـ endpoint مش متاح (سيرفر قديم / خطأ شبكة) مش بنكسر الصفحة — بنخفي الكارت بس
  if (failed && !data) return null;
  if (!data) {
    return (
      <div>
        <SectionTitle>{t("quests.title")}</SectionTitle>
        <div className="glass rounded-3xl h-48 animate-pulse" aria-busy="true" />
      </div>
    );
  }

  const claimedCount = data.quests.filter((q) => q.claimed).length;

  return (
    <div data-testid="daily-quests">
      <SectionTitle action={<span className="text-xs font-bold text-emerald-600">{t("quests.claimedCount", { done: claimedCount, total: data.quests.length })}</span>}>
        {t("quests.title")}
      </SectionTitle>

      <div className="glass rounded-3xl p-3 shadow-premium space-y-2 relative">
        {gain && (
          <div className="absolute -top-3 end-4 z-10 rounded-full grad-emerald text-white text-sm font-extrabold px-4 py-1 shadow-glow-emerald animate-pop" role="status">
            +{gain.xp + (gain.chest || 0)} XP ⭐
          </div>
        )}

        {data.quests.map((q) => {
          const route = QUEST_ROUTE[q.key];
          const open = !q.completed && route;
          return (
            <div
              key={q.key}
              data-testid={`quest-${q.key}`}
              onClick={open ? () => { play("tap"); navigate(route); } : undefined}
              className={"rounded-2xl p-3 flex items-center gap-3 transition-all " + (q.claimed ? "bg-emerald-500/10" : "bg-black/[0.03]") + (open ? " cursor-pointer active:scale-[0.99]" : "")}
            >
              <div className="w-11 h-11 rounded-2xl bg-white/70 flex items-center justify-center text-2xl shrink-0">{q.icon}</div>
              <div className="flex-1 min-w-0 text-start">
                <div className={"text-sm font-bold " + (q.claimed ? "line-through opacity-60" : "")}>{t(`quests.${q.key}.title`)}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <ProgressBar value={q.progress} max={q.target} color={q.completed ? "#00B894" : "#3b82f6"} className="flex-1 h-2" />
                  <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">{q.progress}/{q.target}</span>
                </div>
              </div>
              {q.claimed ? (
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"><Check className="w-5 h-5" /></div>
              ) : q.completed ? (
                <button
                  onClick={(e) => { e.stopPropagation(); claim(q); }}
                  disabled={claiming !== null}
                  className="shrink-0 h-10 px-4 rounded-xl grad-gold text-white text-sm font-extrabold shadow-glow-gold animate-pulse active:scale-95 transition-all disabled:opacity-60"
                >
                  {t("quests.claim")} +{q.xp}
                </button>
              ) : (
                <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-600">
                  +{q.xp} XP {open && <ChevronRight className="w-4 h-4 rtl:rotate-180 text-muted-foreground" />}
                </div>
              )}
            </div>
          );
        })}

        {/* صندوق إتمام الـ 3 مهام */}
        <div className={"rounded-2xl p-3 flex items-center gap-3 " + (data.chest.claimed ? "bg-amber-400/15" : "bg-black/[0.03]")} data-testid="quest-chest">
          <div className={"w-11 h-11 rounded-2xl bg-white/70 flex items-center justify-center text-2xl shrink-0 " + (data.chest.claimed ? "" : "grayscale opacity-60")}>🎁</div>
          <div className="flex-1 text-start">
            <div className="text-sm font-bold">{data.chest.claimed ? t("quests.chestOpened") : t("quests.chestLocked")}</div>
            <div className="text-[11px] text-muted-foreground">{t("quests.chestReward", { xp: data.chest.xp })}</div>
          </div>
          {data.chest.claimed && <Check className="w-5 h-5 text-amber-600" />}
        </div>
      </div>
    </div>
  );
}