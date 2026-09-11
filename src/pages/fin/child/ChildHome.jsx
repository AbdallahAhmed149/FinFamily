import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame, Zap, Sparkles, ChevronRight, Map, Target, Trophy, Bot, Lock, Play, Star, Wallet
} from "lucide-react";
import Lotfy from "@/components/fin/Lotfy";
import { GlassCard, ProgressBar, Pill, SectionTitle, FadeIn } from "@/components/fin/ui";
import GameLauncher from "@/components/fin/GameLauncher";
import MissionComplete from "@/components/fin/MissionComplete";
import { child, todayMissions, playLearnCards, levels, fmtEGP } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { getMyWallet } from "@/lib/finApi";

const diffColor = { Easy: "#00B894", Medium: "#FFC857", Hard: "#ef4444" };

export default function ChildHome() {
  const navigate = useNavigate();
  const { user } = useAuth(); // اليوزر الحقيقي بتاع الطفل الداخل دلوقتي
  const [greet, setGreet] = useState("Good Morning");
  const [activeGame, setActiveGame] = useState(null);
  const [missionDone, setMissionDone] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

  useEffect(() => {
    const h = new Date().getHours();
    setGreet(h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening");
  }, []);

  // الكوينز/الرصيد المتاح جاي من الـ Wallet الحقيقية (wallet.balance)
  useEffect(() => {
    getMyWallet()
      .then(setWallet)
      .catch((err) => console.error("Failed to load wallet:", err))
      .finally(() => setWalletLoading(false));
  }, []);

  // xp/level/streak جايين من /auth/me الحقيقي (مش من finData الوهمي)
  const userXp = user?.xp || 0;
  const userLevel = user?.level || 1;
  const userStreak = user?.streak || 0;
  const coins = wallet?.balance ?? 0;

  const level = levels.find((l) => l.level === userLevel) || levels[0];
  const nextLevel = levels.find((l) => l.level === userLevel + 1);
  const xpInLevel = userXp - level.minXp;
  const xpSpan = nextLevel ? nextLevel.minXp - level.minXp : 1; // مفيش تقسيم على صفر لو وصل لأعلى مستوى
  const progressPct = nextLevel ? Math.min(100, Math.max(0, (xpInLevel / xpSpan) * 100)) : 100;

  // "Today's Mission" و"Play & Learn" لسه محتوى تعليمي ثابت من finData (اتفقنا نأجل ربطها بالـ missions الحقيقية)
  const mission = todayMissions[0];
  const launchGame = (gameId) => {
    const card = playLearnCards.find((c) => c.game === gameId) || { id: gameId, title: mission.title, icon: mission.icon, color: mission.color, xp: mission.xp };
    setActiveGame({ id: gameId, title: card.title, icon: card.icon, color: card.color, xp: card.xp });
  };

  const onGameClose = (completed) => {
    // GameLauncher بيعرض الشاشة الحقيقية (RewardScreen) بالمكافأة الفعلية من الباك اند
    // قبل ما يقفل — مفيش داعي نكرر احتفال تاني هنا بأرقام وهمية زي ما كان بيحصل قبل كده.
    setActiveGame(null);
  };

  return (
    <div className="px-4 pt-12 relative">
      {/* header */}
      <FadeIn className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-muted-foreground">{greet},</div>
          <h1 className="text-2xl font-extrabold font-heading">{user?.full_name || child.name} 👋</h1>
        </div>
        <Lotfy size={64} />
      </FadeIn>

      {/* hero: Financial Hero status */}
      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-5 text-white shadow-premium relative overflow-hidden animate-gradient">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-4 bottom-2 text-4xl opacity-20">🦸</div>
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/70 font-medium">Financial Hero Status</span>
              <Pill className="bg-white/15 text-white"><Flame className="w-3 h-3" /> {userStreak}-day streak</Pill>
            </div>
            <div className="text-lg font-extrabold font-heading">Level {userLevel} · {level.name}</div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/70">{userXp} XP</span>
                <span className="text-white/70">{nextLevel ? `${nextLevel.minXp} XP` : "MAX"}</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
                <div className="h-full rounded-full grad-gold transition-all duration-700" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="text-[11px] text-white/60 mt-1">{nextLevel ? `${nextLevel.minXp - userXp} XP to ${nextLevel.name}` : "You reached the top level! 👑"}</div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* quick stats */}
      <FadeIn delay={100} className="grid grid-cols-3 gap-3 mt-4">
        <div className="glass rounded-2xl p-3 text-center shadow-premium">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <div className="text-lg font-extrabold font-heading">{userXp}</div>
          <div className="text-[10px] text-muted-foreground">Total XP</div>
        </div>
        <div className="glass rounded-2xl p-3 text-center shadow-premium">
          <Flame className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <div className="text-lg font-extrabold font-heading">{userStreak}</div>
          <div className="text-[10px] text-muted-foreground">Day Streak</div>
        </div>
        <div className="glass rounded-2xl p-3 text-center shadow-premium">
          <Trophy className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <div className="text-lg font-extrabold font-heading">{walletLoading ? "…" : Math.round(coins)}</div>
          <div className="text-[10px] text-muted-foreground">Coins 🪙</div>
        </div>
      </FadeIn>

      {/* today's mission */}
      <FadeIn delay={140}>
        <SectionTitle>Today's Mission</SectionTitle>
        <div className="rounded-3xl p-5 shadow-premium relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${mission.color}, ${mission.color}cc)` }}>
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/15" />
          <div className="relative text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">{mission.icon}</div>
              <div className="flex-1">
                <div className="font-extrabold font-heading">{mission.title}</div>
                <div className="text-xs text-white/85">{mission.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] bg-white/20 rounded-full px-2 py-0.5 font-semibold">{mission.difficulty}</span>
              <span className="text-[11px] bg-white/20 rounded-full px-2 py-0.5 font-semibold">+{mission.xp} XP</span>
            </div>
            <button onClick={() => launchGame(mission.game)} className="w-full h-12 rounded-2xl bg-white text-sm font-extrabold font-heading flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{ color: mission.color }}>
              <Play className="w-4 h-4" /> START MISSION
            </button>
          </div>
        </div>
      </FadeIn>

      {/* play & learn */}
      <FadeIn delay={180}>
        <SectionTitle action={<button onClick={() => navigate("/child/adventure")} className="text-xs font-bold text-emerald-600 flex items-center gap-1">Adventure Map <ChevronRight className="w-3 h-3" /></button>}>Play & Learn</SectionTitle>
        <div className="space-y-3">
          {playLearnCards.map((c) => (
            <button key={c.id} onClick={() => c.locked ? null : launchGame(c.game)} disabled={c.locked} className={"w-full glass rounded-2xl p-4 flex items-center gap-3 shadow-premium transition-all " + (c.locked ? "opacity-60" : "active:scale-[0.99]")}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${c.color}18` }}>{c.locked ? <Lock className="w-5 h-5 text-muted-foreground" /> : c.icon}</div>
              <div className="flex-1 text-left">
                <div className="font-bold text-sm">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.desc}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] rounded-full px-2 py-0.5 font-semibold" style={{ background: `${diffColor[c.difficulty]}18`, color: diffColor[c.difficulty] }}>{c.difficulty}</span>
                  <span className="text-[10px] font-bold text-amber-600">+{c.xp} XP</span>
                  {!c.locked && c.progress > 0 && <span className="text-[10px] text-muted-foreground">{c.progress}% done</span>}
                </div>
              </div>
              {!c.locked && <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* adventure shortcuts */}
      <FadeIn delay={220}>
        <SectionTitle>Continue Your Adventure</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/child/adventure")} className="glass rounded-2xl p-4 text-left shadow-premium active:scale-95 transition-all">
            <Map className="w-6 h-6 text-indigo-500 mb-2" />
            <div className="font-bold text-sm">Adventure Map</div>
            <div className="text-xs text-muted-foreground">7 worlds to explore</div>
          </button>
          <button onClick={() => navigate("/child/missions")} className="glass rounded-2xl p-4 text-left shadow-premium active:scale-95 transition-all">
            <Target className="w-6 h-6 text-emerald-600 mb-2" />
            <div className="font-bold text-sm">Real-Life Missions</div>
            <div className="text-xs text-muted-foreground">Practice & earn XP</div>
          </button>
          <button onClick={() => navigate("/child/coach")} className="glass rounded-2xl p-4 text-left shadow-premium active:scale-95 transition-all">
            <Bot className="w-6 h-6 text-blue-500 mb-2" />
            <div className="font-bold text-sm">FinBuddy 🤖</div>
            <div className="text-xs text-muted-foreground">Your AI money buddy</div>
          </button>
          <button onClick={() => navigate("/child/leaderboard")} className="glass rounded-2xl p-4 text-left shadow-premium active:scale-95 transition-all">
            <Trophy className="w-6 h-6 text-amber-500 mb-2" />
            <div className="font-bold text-sm">Leaderboard</div>
            <div className="text-xs text-muted-foreground">Climb the ranks</div>
          </button>
          <button onClick={() => navigate("/child/wallet")} className="glass rounded-2xl p-4 text-left shadow-premium active:scale-95 transition-all">
            <Wallet className="w-6 h-6 text-emerald-600 mb-2" />
            <div className="font-bold text-sm">Wallet</div>
            <div className="text-xs text-muted-foreground">Balance & spending</div>
          </button>
          <button onClick={() => navigate("/child/goals")} className="glass rounded-2xl p-4 text-left shadow-premium active:scale-95 transition-all">
            <Target className="w-6 h-6 text-blue-500 mb-2" />
            <div className="font-bold text-sm">Savings Goals</div>
            <div className="text-xs text-muted-foreground">Track your dreams</div>
          </button>
        </div>
      </FadeIn>

      <div className="h-4" />

      {activeGame && <GameLauncher game={activeGame} onClose={onGameClose} />}
      {missionDone && (
        <div className="fixed inset-0 z-[70] bg-background overflow-y-auto">
          <MissionComplete xp={missionDone.xp} badge={missionDone.badge} streak={userStreak + 1} nextMission={missionDone.nextMission} onClose={() => setMissionDone(null)} />
        </div>
      )}
    </div>
  );
}