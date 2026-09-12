import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock, Check, Award, Play, Gamepad2, GraduationCap } from "lucide-react";
import { GlassCard, ProgressBar, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { lessons, games, child } from "@/lib/finData";
import QuizPlayer from "@/components/fin/QuizPlayer";
import GameOverlay from "@/components/fin/GameOverlay";
import RewardScreen from "@/components/fin/RewardScreen";
import GuessPrice from "@/components/fin/games/GuessPrice";
import NeedsVsWants from "@/components/fin/games/NeedsVsWants";
import CoinCatcher from "@/components/fin/games/CoinCatcher";
import BudgetBuilder from "@/components/fin/games/BudgetBuilder";
import ChangeMaker from "@/components/fin/games/ChangeMaker";
import SmartShopper from "@/components/fin/games/SmartShopper";
import ScamDetective from "@/components/fin/games/ScamDetective";
import FutureInvestor from "@/components/fin/games/FutureInvestor";
import SavingHero from "@/components/fin/games/SavingHero";
import { useTranslation } from "react-i18next";

const iconEmoji = { coins: "🪙", scale: "⚖️", "pie-chart": "📊", "piggy-bank": "🐷", smartphone: "📱", "credit-card": "💳", shield: "🛡️", "alert-triangle": "⚠️", landmark: "🏦", "trending-up": "📈" };

const gameComponents = {
  gm1: BudgetBuilder,
  gm2: BudgetBuilder,
  gm3: NeedsVsWants,
  gm4: GuessPrice,
  gm5: CoinCatcher,
  gm6: NeedsVsWants,
  gm7: ChangeMaker,
  gm8: SmartShopper,
  gm9: ScamDetective,
  gm10: FutureInvestor,
  gm11: SavingHero,
};

export default function Learn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("lessons");
  const [openLesson, setOpenLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [reward, setReward] = useState(null);

  const handleGameFinish = (score, total) => {
    setReward({ score, total, coins: Math.round(score * 6), xp: score * 12 });
  };

  const closeGame = () => { setActiveGame(null); setReward(null); };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">{t("child_learn.title")}</h1>
      </FadeIn>

      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-4 text-white shadow-premium flex items-center gap-4">
          <div className="text-3xl">🎓</div>
          <div className="flex-1">
            <div className="text-sm text-white/70">{t("child_learn.path")}</div>
            <div className="font-bold">{t("child_learn.level", { xp: child.xp, level: child.level })}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold">{t("child_learn.lessons_count", { done: 3 })}</div>
            <div className="text-xs text-white/60">{t("child_learn.lessons_label")}</div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={120} className="flex gap-2 mt-5 mb-4">
        {["lessons", "games"].map((tabKey) => {
          const Icon = tabKey === "lessons" ? GraduationCap : Gamepad2;
          return (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={"flex-1 h-11 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 " + (tab === tabKey ? "grad-navy text-white shadow-premium" : "glass text-muted-foreground")}
            >
              <Icon className="w-4 h-4" /> {tabKey === "lessons" ? t("child_learn.tab_lessons") : t("child_learn.tab_games")}
            </button>
          );
        })}
      </FadeIn>

      {tab === "lessons" ? (
        <div className="space-y-3">
          {lessons.map((l, idx) => {
            const locked = l.status === "locked";
            const done = l.status === "completed";
            return (
              <FadeIn key={l.id} delay={idx * 40}>
                <button
                  disabled={locked}
                  onClick={() => setOpenLesson(openLesson === l.id ? null : l.id)}
                  className={"w-full glass rounded-2xl p-4 flex items-center gap-3 shadow-premium transition-all " + (locked ? "opacity-50" : "active:scale-[0.99]")}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${l.color}22` }}>
                    {iconEmoji[l.icon] || "📘"}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">{l.title}</div>
                    <div className="text-xs text-muted-foreground">{l.desc}</div>
                    {(l.status === "in-progress" || done) && <div className="mt-1.5"><ProgressBar value={l.progress} color={l.color} /></div>}
                  </div>
                  <div className="shrink-0">
                    {locked ? <Lock className="w-5 h-5 text-muted-foreground" /> : done ? <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div> : <Play className="w-5 h-5 text-emerald-600" />}
                  </div>
                </button>
                {openLesson === l.id && (
                  <FadeIn className="glass rounded-2xl p-4 mt-1.5 animate-pop">
                    <div className="text-sm font-semibold mb-2">{l.title}{t("child_learn.story")}</div>
                    <div className="rounded-xl p-4 mb-3 text-sm leading-relaxed" style={{ background: `${l.color}12` }}>
                      {t("child_learn.story_desc")}
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Pill color={l.color}>{t("child_learn.pts", { xp: l.xp })}</Pill>
                      <Pill color="#FFC857">{t("child_learn.coins")}</Pill>
                      <Pill color="#8b5cf6">{t("child_learn.certificate")}</Pill>
                    </div>
                    <button onClick={() => setQuiz(l)} disabled={locked} className="w-full h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2" style={{ background: l.color }}>
                      <Play className="w-4 h-4" /> {t("child_learn.start_quiz")}
                    </button>
                  </FadeIn>
                )}
              </FadeIn>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {games.map((g, idx) => (
            <FadeIn key={g.id} delay={idx * 40}>
              <button onClick={() => setActiveGame(g)} className="w-full glass rounded-2xl p-4 text-center shadow-premium active:scale-95 transition-all">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-2" style={{ background: `${g.color}18` }}>{g.icon}</div>
                <div className="font-bold text-sm">{g.title}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <Award className="w-3 h-3" /> {g.reward}
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
      )}
      <div className="h-4" />

      {/* Quiz overlay */}
      {quiz && (
        <div className="fixed inset-0 z-[60] bg-background overflow-y-auto">
          <QuizPlayer title={quiz.title} onClose={() => setQuiz(null)} />
        </div>
      )}

      {/* Game overlay */}
      {activeGame && (
        <GameOverlay title={activeGame.title} icon={activeGame.icon} onClose={closeGame}>
          {reward ? (
            <RewardScreen title={t("child_learn.game_completed")} score={reward.score} total={reward.total} coins={reward.coins} xp={reward.xp} onClose={closeGame} />
          ) : (() => {
            const G = gameComponents[activeGame.id] || GuessPrice;
            return <G onFinish={handleGameFinish} />;
          })()}
        </GameOverlay>
      )}
    </div>
  );
}