import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Lock, Check, MapPin, BookOpen, Gamepad2, Star } from "lucide-react";
import { ProgressBar, FadeIn } from "@/components/fin/ui";
import GameLauncher from "@/components/fin/GameLauncher";
import { adventureWorlds, child, levels } from "@/lib/finData";
import { lessonById, pick } from "@/content/lessons";
import { getAdventure } from "@/lib/finApi";
import { useAuth } from "@/lib/AuthContext";
import { useContentTranslation } from "@/lib/useContentTranslation";
import { play } from "@/lib/sounds";

const Stars = ({ n }) => (
  <span className="inline-flex" aria-label={`${n}/3`} data-testid="world-stars">
    {[1, 2, 3].map((i) => <Star key={i} className={"w-3.5 h-3.5 " + (i <= n ? "text-amber-400 fill-amber-400" : "text-black/20")} />)}
  </span>
);

/**
 * الخريطة بقت حقيقية: العالم بيتفتح بالـ level الفعلي، والتقدم من الدروس اللي الطفل عدّاها واللعبة اللي لعبها
 * ونجومه فيها (GET /api/adventure). قبل كده الحالة والنسب كانت أرقام ثابتة في finData ومابتتغيرش أبدًا.
 */
export default function AdventureMap() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const tc = useContentTranslation();
  const lang = i18n.language;
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [activeGame, setActiveGame] = useState(null);

  const myLevel = user?.level ?? child.level;
  const myXp = user?.xp ?? child.xp;
  const level = levels.find((l) => l.level === myLevel) || levels[0];

  const load = useCallback(() => (
    getAdventure().then((d) => { setData(d); setFailed(false); }).catch(() => setFailed(true))
  ), []);
  useEffect(() => { load(); }, [load]);

  const serverById = Object.fromEntries((data?.worlds || []).map((w) => [w.id, w]));

  const launchGame = (w, srv) => {
    play("open");
    setActiveGame({ id: srv.game.id, title: tc(w.name), icon: w.icon, color: w.color, xp: 50 });
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold font-heading">{t("child.adventureMap.title")}</h1>
          <div className="text-xs text-muted-foreground">{t("child.adventureMap.levelLine", { level: myLevel, name: tc(level.name), xp: myXp })}</div>
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-4 text-white shadow-premium text-center relative overflow-hidden">
          <div className="absolute -end-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative text-sm">{t("child.adventureMap.heroLine")}</div>
          <div className="text-xs text-white/70 mt-1">{t("child.adventureMap.unlockHint")}</div>
        </div>
      </FadeIn>

      {failed && !data && (
        <div role="alert" className="mt-4 rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3 flex items-center justify-between gap-3">
          <span>{t("child.adventureMap.loadFailed")}</span>
          <button onClick={load} className="font-bold underline shrink-0">{t("lesson.tryAgain")}</button>
        </div>
      )}

      <div className="relative mt-6">
        <div className="absolute start-7 top-4 bottom-4 w-1 bg-black/5 rounded-full" />
        <div className="space-y-4">
          {adventureWorlds.map((w, idx) => {
            const srv = serverById[w.id];
            if (!srv) return data || failed ? null : <div key={w.id} className="ps-16"><div className="glass rounded-2xl h-24 animate-pulse" aria-busy="true" /></div>;
            const locked = !srv.unlocked;
            const done = srv.completed;
            const nextLesson = srv.lessons.find((l) => l.status !== "completed");
            const lessonLocked = nextLesson?.status === "locked";
            const lessonInfo = nextLesson ? lessonById(nextLesson.id) : null;
            return (
              <FadeIn key={w.id} delay={idx * 60}>
                <div className="relative ps-16" data-testid={`world-${w.id}`} data-unlocked={srv.unlocked ? "1" : "0"}>
                  <div className="absolute start-0 top-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-premium z-10" style={{ background: locked ? "#0001" : `linear-gradient(135deg, ${w.color}, ${w.color}cc)`, color: locked ? "#999" : "#fff" }}>
                    {locked ? <Lock className="w-5 h-5" /> : w.icon}
                  </div>
                  <div className={"glass rounded-2xl p-4 text-start shadow-premium " + (locked ? "opacity-60" : "")}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground">{t("child.adventureMap.world", { num: idx + 1 })}</div>
                        <div className="font-extrabold font-heading">{tc(w.name)}</div>
                      </div>
                      {done ? <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div> : locked ? <Lock className="w-4 h-4 text-muted-foreground" /> : null}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {w.topics.map((topic) => (
                        <span key={topic} className="text-[10px] rounded-full px-2 py-0.5" style={{ background: `${w.color}12`, color: w.color }}>{tc(topic)}</span>
                      ))}
                    </div>

                    {!locked && (
                      <>
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>{t("child.adventureMap.progress")}</span><span data-testid="world-progress">{srv.progress}%</span></div>
                          <ProgressBar value={srv.progress} color={w.color} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {nextLesson ? (
                            <button
                              data-testid={`world-lesson-${w.id}`}
                              disabled={lessonLocked}
                              onClick={() => { play("tap"); navigate(`/child/learn?lesson=${nextLesson.id}`); }}
                              className={"h-11 rounded-xl text-xs font-bold px-2 flex items-center justify-center gap-1.5 transition-all " + (lessonLocked ? "bg-black/5 text-muted-foreground" : "text-white active:scale-95")}
                              style={lessonLocked ? undefined : { background: w.color }}
                            >
                              <BookOpen className="w-4 h-4 shrink-0" />
                              <span className="truncate">{lessonLocked ? t("child.adventureMap.lessonLocked") : t("child.adventureMap.nextLesson", { title: lessonInfo ? pick(lessonInfo.title, lang) : "" })}</span>
                            </button>
                          ) : (
                            <div className="h-11 rounded-xl bg-emerald-500/10 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> {t("child.adventureMap.lessonsDone")}</div>
                          )}
                          <button
                            data-testid={`world-game-${w.id}`}
                            onClick={() => launchGame(w, srv)}
                            className="h-11 rounded-xl glass text-xs font-bold px-2 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          >
                            <Gamepad2 className="w-4 h-4 shrink-0" style={{ color: w.color }} /> {t("child.adventureMap.playGame")} <Stars n={srv.game.best_stars} />
                          </button>
                        </div>
                      </>
                    )}
                    {locked && <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t("child.adventureMap.unlocksAt", { level: srv.unlock_level })}</div>}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
      <div className="h-4" />

      {activeGame && <GameLauncher game={activeGame} onClose={() => { setActiveGame(null); load(); }} />}
    </div>
  );
}