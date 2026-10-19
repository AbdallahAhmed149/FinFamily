import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Lock, Check, Award, Play, Gamepad2, GraduationCap } from "lucide-react";
import { GlassCard, ProgressBar, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { lessons, games, child } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { useContentTranslation } from "@/lib/useContentTranslation";
import QuizPlayer from "@/components/fin/QuizPlayer";
import GameLauncher from "@/components/fin/GameLauncher";

const iconEmoji = { coins: "🪙", scale: "⚖️", "pie-chart": "📊", "piggy-bank": "🐷", smartphone: "📱", "credit-card": "💳", shield: "🛡️", "alert-triangle": "⚠️", landmark: "🏦", "trending-up": "📈" };

export default function Learn() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tc = useContentTranslation();
  const { user } = useAuth(); // XP/Level الحقيقيين بدل الموك
  const [tab, setTab] = useState("lessons");
  const [openLesson, setOpenLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [activeGame, setActiveGame] = useState(null);

  // الألعاب بتتفتح من GameLauncher — هو اللي بيكلّم الباك اند ويعرض المكافأة الحقيقية.
  // قبل كده التاب ده كان بيحسب coins/xp محليًا (score*6 / score*12) من غير ما يحفظ حاجة،
  // فنفس اللعبة كانت بتدّي مكافأة حقيقية من الـ Home ووهمية من هنا.
  const launchGame = (g) => setActiveGame({ id: g.id, title: tc(g.title), icon: g.icon, color: g.color, xp: parseInt(g.reward, 10) || 0 });

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">{t("child.learn.title")}</h1>
      </FadeIn>

      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-4 text-white shadow-premium flex items-center gap-4">
          <div className="text-3xl">🎓</div>
          <div className="flex-1">
            <div className="text-sm text-white/70">{t("child.learn.learningPath")}</div>
            <div className="font-bold">{t("child.learn.levelLine", { xp: user?.xp ?? child.xp, level: user?.level ?? child.level })}</div>
          </div>
          <div className="text-end">
            <div className="text-2xl font-extrabold">3/10</div>
            <div className="text-xs text-white/60">{t("child.learn.lessonsCount")}</div>
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
              <Icon className="w-4 h-4" /> {t(`child.learn.tabs.${tabKey}`)}
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
                  <div className="flex-1 text-start">
                    <div className="font-semibold text-sm">{tc(l.title)}</div>
                    <div className="text-xs text-muted-foreground">{tc(l.desc)}</div>
                    {(l.status === "in-progress" || done) && <div className="mt-1.5"><ProgressBar value={l.progress} color={l.color} /></div>}
                  </div>
                  <div className="shrink-0">
                    {locked ? <Lock className="w-5 h-5 text-muted-foreground" /> : done ? <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div> : <Play className="w-5 h-5 text-emerald-600 rtl:-scale-x-100" />}
                  </div>
                </button>
                {openLesson === l.id && (
                  <FadeIn className="glass rounded-2xl p-4 mt-1.5 animate-pop">
                    <div className="text-sm font-semibold mb-2">{tc(l.title)} {t("child.learn.storySuffix")}</div>
                    <div className="rounded-xl p-4 mb-3 text-sm leading-relaxed" style={{ background: `${l.color}12` }}>
                      {t("child.learn.storyText")}
                    </div>
                    <button onClick={() => setQuiz(l)} disabled={locked} className="w-full h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2" style={{ background: l.color }}>
                      <Play className="w-4 h-4 rtl:-scale-x-100" /> {t("child.learn.startQuiz")}
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
              <button onClick={() => launchGame(g)} className="w-full glass rounded-2xl p-4 text-center shadow-premium active:scale-95 transition-all">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-2" style={{ background: `${g.color}18` }}>{g.icon}</div>
                <div className="font-bold text-sm">{tc(g.title)}</div>
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

      {/* Game (مكافأة حقيقية من الباك اند) */}
      {activeGame && <GameLauncher game={activeGame} onClose={() => setActiveGame(null)} />}
    </div>
  );
}