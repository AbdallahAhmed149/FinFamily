import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Lock, Check, Award, Play, Gamepad2, GraduationCap } from "lucide-react";
import { FadeIn } from "@/components/fin/ui";
import { games, child } from "@/lib/finData";
import { LESSONS, lessonById, pick } from "@/content/lessons";
import { getLessonsProgress } from "@/lib/finApi";
import { useAuth } from "@/lib/AuthContext";
import { useContentTranslation } from "@/lib/useContentTranslation";
import { play } from "@/lib/sounds";
import LessonPlayer from "@/components/fin/LessonPlayer";
import GameLauncher from "@/components/fin/GameLauncher";

const iconEmoji = { coins: "🪙", scale: "⚖️", "pie-chart": "📊", "piggy-bank": "🐷", smartphone: "📱", "credit-card": "💳", shield: "🛡️", "alert-triangle": "⚠️", landmark: "🏦", "trending-up": "📈" };

export default function Learn() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const tc = useContentTranslation();
  const lang = i18n.language;
  const { user, refreshUser } = useAuth(); // XP/Level الحقيقيين
  const [tab, setTab] = useState("lessons");
  const [progress, setProgress] = useState(null);   // [{id,status,best_score,total,...}] من السيرفر
  const [loadFailed, setLoadFailed] = useState(false);
  const [openLesson, setOpenLesson] = useState(null);
  const [hint, setHint] = useState(null);           // رسالة "خلّص الدرس الفلاني الأول"
  const [activeGame, setActiveGame] = useState(null);

  const load = useCallback(() => (
    getLessonsProgress().then((p) => { setProgress(p); setLoadFailed(false); }).catch(() => setLoadFailed(true))
  ), []);
  useEffect(() => { load(); }, [load]);

  const byId = Object.fromEntries((progress || []).map((p) => [p.id, p]));
  const statusOf = (id) => byId[id]?.status || "locked";
  const completedCount = (progress || []).filter((p) => p.status === "completed").length;

  // رابط مباشر من الـ Adventure Map: /child/learn?lesson=l3
  useEffect(() => {
    const wanted = params.get("lesson");
    if (!wanted || !progress) return;
    if (lessonById(wanted) && statusOf(wanted) !== "locked") setOpenLesson(wanted);
    setParams({}, { replace: true });
  }, [params, progress]); // eslint-disable-line react-hooks/exhaustive-deps

  const launchGame = (g) => setActiveGame({ id: g.id, title: tc(g.title), icon: g.icon, color: g.color, xp: parseInt(g.reward, 10) || 0 });

  const tapLesson = (l, index) => {
    if (statusOf(l.id) === "locked") {
      play("locked");
      const prev = LESSONS[index - 1];
      setHint({ id: l.id, text: t("lesson.lockedHint", { title: prev ? pick(prev.title, lang) : "" }) });
      return;
    }
    play("open");
    setHint(null);
    setOpenLesson(l.id);
  };

  const closeLesson = () => {
    setOpenLesson(null);
    load();                         // الدرس اللي بعده ممكن يكون اتفتح
    refreshUser?.().catch?.(() => {});
  };

  const lesson = openLesson ? lessonById(openLesson) : null;

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
            <div className="text-2xl font-extrabold" data-testid="lessons-counter">{completedCount}/{LESSONS.length}</div>
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
        <div className="space-y-3" data-testid="lessons-list">
          {loadFailed && !progress && (
            <div role="alert" className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3 flex items-center justify-between gap-3">
              <span>{t("lesson.loadFailed")}</span>
              <button onClick={load} className="font-bold underline shrink-0">{t("lesson.tryAgain")}</button>
            </div>
          )}
          {!progress && !loadFailed && [0, 1, 2].map((i) => <div key={i} className="glass rounded-2xl h-20 animate-pulse" aria-busy="true" />)}

          {progress && LESSONS.map((l, idx) => {
            const status = statusOf(l.id);
            const locked = status === "locked";
            const done = status === "completed";
            const p = byId[l.id];
            return (
              <FadeIn key={l.id} delay={idx * 40}>
                <button
                  data-testid={`lesson-${l.id}`}
                  data-status={status}
                  onClick={() => tapLesson(l, idx)}
                  className={"w-full glass rounded-2xl p-4 flex items-center gap-3 shadow-premium transition-all " + (locked ? "opacity-50" : "active:scale-[0.99]")}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${l.color}22` }}>
                    {iconEmoji[l.icon] || "📘"}
                  </div>
                  <div className="flex-1 text-start min-w-0">
                    <div className="font-semibold text-sm">{pick(l.title, lang)}</div>
                    <div className="text-xs text-muted-foreground">{pick(l.desc, lang)}</div>
                    {done && <div className="mt-1 text-[11px] font-bold text-emerald-600">{t("lesson.best", { score: p.best_score, total: p.total })}</div>}
                    {status === "available" && <div className="mt-1 text-[11px] font-bold text-amber-600">+{p.xp} XP · 💎 {p.gems}</div>}
                  </div>
                  <div className="shrink-0">
                    {locked ? <Lock className="w-5 h-5 text-muted-foreground" /> : done ? <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div> : <Play className="w-5 h-5 text-emerald-600 rtl:-scale-x-100" />}
                  </div>
                </button>
                {hint?.id === l.id && <div role="status" className="mt-1.5 rounded-xl bg-amber-500/10 text-amber-700 text-xs font-semibold px-3 py-2 animate-pop">🔒 {hint.text}</div>}
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

      {lesson && <LessonPlayer lesson={lesson} onClose={closeLesson} />}

      {/* Game (مكافأة حقيقية من الباك اند) */}
      {activeGame && <GameLauncher game={activeGame} onClose={() => setActiveGame(null)} />}
    </div>
  );
}