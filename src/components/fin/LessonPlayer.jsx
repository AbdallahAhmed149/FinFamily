import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import Lotfy from "@/components/fin/Lotfy";
import RewardScreen from "@/components/fin/RewardScreen";
import SoundToggle from "@/components/fin/SoundToggle";
import { buildQuiz, pick, PASS_RATIO, QUIZ_SIZE } from "@/content/lessons";
import { completeLesson } from "@/lib/finApi";
import { useAuth } from "@/lib/AuthContext";
import { useCelebrationHold } from "@/lib/CelebrationContext";
import { play } from "@/lib/sounds";

/**
 * مشغّل الدرس: كروت القصة (لطفي بتعبيرات) ← كويز 5 أسئلة عشوائية من بنك الدرس ← نتيجة.
 * النتيجة بتتبعت للسيرفر (POST /api/lessons/:id/complete) — هو اللي بيقرر النجاح (60%) والمكافأة (مرة واحدة)
 * وفتح الدرس اللي بعده. الأخطاء بتتشرح (why) مش بس "غلط"، ولطفي بيفكّر (مش بيزعل) لما الإجابة غلط.
 */
export default function LessonPlayer({ lesson, onClose, onDone }) {
  const { t, i18n } = useTranslation();
  const { refreshUser } = useAuth();
  const lang = i18n.language;
  useCelebrationHold(true); // شاشة Level-Up العامة تستنى لحد ما الدرس يتقفل

  const [phase, setPhase] = useState("story"); // story | quiz | saving | result | error
  const [cardIdx, setCardIdx] = useState(0);
  const [quiz, setQuiz] = useState(() => buildQuiz(lesson));
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);

  const total = quiz.length;
  const card = lesson.cards[cardIdx];
  const needed = Math.ceil(PASS_RATIO * QUIZ_SIZE);

  const close = () => { play("back"); onClose(result); };

  const submit = async (finalScore) => {
    setPhase("saving");
    try {
      const res = await completeLesson(lesson.id, finalScore, total);
      setResult(res);
      setPhase("result");
      refreshUser?.().catch?.(() => {});
    } catch {
      setPhase("error");
    }
  };

  const answer = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    const right = idx === quiz[qIdx].answer;
    if (right) setScore((s) => s + 1);
    play(right ? "correct" : "wrong");
  };

  const next = () => {
    play("tap");
    if (qIdx + 1 < total) { setQIdx(qIdx + 1); setPicked(null); } else { submit(score); }
  };

  const retry = () => {
    play("tap");
    setQuiz(buildQuiz(lesson)); setQIdx(0); setPicked(null); setScore(0); setResult(null);
    setPhase("quiz");
  };

  // ---------- result ----------
  if (phase === "result" && result) {
    if (result.passed) {
      return (
        <div className="fixed inset-0 z-[60] bg-background overflow-y-auto" data-testid="lesson-player">
          <RewardScreen
            title={t("lesson.passTitle")}
            score={score}
            total={total}
            gems={result.first_pass ? result.gems_awarded : undefined}
            xp={result.first_pass ? result.xp_awarded : undefined}
            note={result.first_pass ? undefined : t("lesson.alreadyDone")}
            streak={{ freezeUsed: result.streak_freeze_used || 0, freezeEarned: !!result.streak_freeze_earned, lost: result.streak_lost || 0 }}
            onClose={() => { onClose(result); }}
          />
        </div>
      );
    }
    return (
      <div className="fixed inset-0 z-[60] bg-background overflow-y-auto" data-testid="lesson-player">
        <div className="flex flex-col items-center text-center px-6 pt-16 pb-10 max-w-md mx-auto" data-testid="lesson-fail">
          <Lotfy mood="sad" size={170} />
          <h2 className="text-2xl font-extrabold font-heading mt-3">{t("lesson.failTitle")}</h2>
          <p className="text-sm text-muted-foreground mt-2">{t("lesson.failBody", { need: needed, total, score })}</p>
          <div className="w-full mt-8 space-y-3">
            <button onClick={retry} className="w-full h-12 rounded-2xl text-white font-bold grad-emerald shadow-glow-emerald active:scale-95 transition-all">{t("lesson.retry")}</button>
            <button onClick={() => { play("tap"); setCardIdx(0); setPhase("story"); }} className="w-full h-12 rounded-2xl glass font-semibold">{t("lesson.readAgain")}</button>
            <button onClick={close} className="w-full h-10 text-sm text-muted-foreground">{t("lesson.close")}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto" data-testid="lesson-player">
      <div className="max-w-md mx-auto px-4 pt-6 pb-10 min-h-full flex flex-col">
        {/* top bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 min-w-0">
            <div className="font-extrabold font-heading truncate">{pick(lesson.title, lang)}</div>
            <div className="text-[11px] text-muted-foreground">{phase === "story" ? t("lesson.cardOf", { current: cardIdx + 1, total: lesson.cards.length }) : t("lesson.questionOf", { current: Math.min(qIdx + 1, total), total })}</div>
          </div>
          <SoundToggle />
          <button onClick={close} aria-label={t("lesson.close")} className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        {/* ---------- story ---------- */}
        {phase === "story" && (
          <div className="flex-1 flex flex-col items-center" data-testid="lesson-story">
            <div className="flex gap-1.5 mb-4">
              {lesson.cards.map((_, i) => (
                <span key={i} className={"h-1.5 rounded-full transition-all " + (i === cardIdx ? "w-8" : "w-3 opacity-40")} style={{ background: lesson.color }} />
              ))}
            </div>
            <Lotfy mood={card.mood} size={170} />
            <div className="glass rounded-3xl p-5 mt-3 w-full shadow-premium animate-pop" key={cardIdx} data-testid="lesson-card">
              <div className="text-3xl mb-2">{card.emoji}</div>
              <p className="text-[15px] leading-relaxed font-medium">{pick(card.text, lang)}</p>
            </div>
            <div className="flex gap-3 w-full mt-auto pt-6">
              <button
                onClick={() => { play("tap"); setCardIdx(Math.max(0, cardIdx - 1)); }}
                disabled={cardIdx === 0}
                aria-label={t("lesson.back")}
                className="h-12 w-14 rounded-2xl glass flex items-center justify-center disabled:opacity-30"
              ><ChevronLeft className="w-5 h-5 rtl:rotate-180" /></button>
              {cardIdx < lesson.cards.length - 1 ? (
                <button onClick={() => { play("tap"); setCardIdx(cardIdx + 1); }} className="flex-1 h-12 rounded-2xl text-white font-bold flex items-center justify-center gap-1 active:scale-95 transition-all" style={{ background: lesson.color }}>
                  {t("lesson.next")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              ) : (
                <button onClick={() => { play("tap"); setPhase("quiz"); }} className="flex-1 h-12 rounded-2xl text-white font-bold grad-emerald shadow-glow-emerald active:scale-95 transition-all" data-testid="start-quiz">
                  {t("lesson.startQuiz")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ---------- quiz ---------- */}
        {phase === "quiz" && (
          <div className="flex-1 flex flex-col" data-testid="lesson-quiz">
            <div className="h-2 rounded-full bg-black/5 overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(qIdx / total) * 100}%`, background: lesson.color }} />
            </div>
            <div className="flex justify-center -mb-2">
              <Lotfy mood={picked === null ? "think" : picked === quiz[qIdx].answer ? "happy" : "think"} size={110} />
            </div>
            <div className="glass rounded-3xl p-5 shadow-premium" key={qIdx}>
              <h3 className="font-bold text-lg leading-snug" data-testid="quiz-question">{pick(quiz[qIdx].q, lang)}</h3>
              <div className="space-y-2.5 mt-4">
                {quiz[qIdx].options.map((opt, i) => {
                  const isRight = i === quiz[qIdx].answer;
                  const isPicked = picked === i;
                  let style = "bg-black/[0.04]";
                  if (picked !== null) style = isRight ? "bg-emerald-500 text-white" : isPicked ? "bg-red-500 text-white" : "bg-black/[0.04] opacity-50";
                  return (
                    <button
                      key={i}
                      data-testid={`quiz-option-${i}`}
                      onClick={() => answer(i)}
                      disabled={picked !== null}
                      className={"w-full min-h-12 rounded-2xl px-4 py-2.5 text-start font-semibold text-sm flex items-center gap-2 transition-all active:scale-[0.99] " + style}
                    >
                      <span className="flex-1">{pick(opt, lang)}</span>
                      {picked !== null && isRight && <Check className="w-5 h-5 shrink-0" />}
                      {picked !== null && isPicked && !isRight && <X className="w-5 h-5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <div className={"mt-4 rounded-2xl p-3 text-sm animate-pop " + (picked === quiz[qIdx].answer ? "bg-emerald-500/10 text-emerald-800" : "bg-amber-500/10 text-amber-800")} data-testid="quiz-why">
                  <div className="font-bold mb-0.5">{picked === quiz[qIdx].answer ? t("lesson.correct") : t("lesson.wrong")}</div>
                  {pick(quiz[qIdx].why, lang)}
                </div>
              )}
            </div>
            {picked !== null && (
              <button onClick={next} data-testid="quiz-next" className="mt-5 w-full h-12 rounded-2xl text-white font-bold grad-navy shadow-premium active:scale-95 transition-all">
                {qIdx + 1 < total ? t("lesson.next") : t("lesson.finish")}
              </button>
            )}
          </div>
        )}

        {/* ---------- saving / error ---------- */}
        {phase === "saving" && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground" aria-busy="true">
            <Lotfy mood="think" size={130} />
            <div className="mt-3 text-sm">{t("lesson.saving")}</div>
          </div>
        )}
        {phase === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4" role="alert" data-testid="lesson-error">
            <Lotfy mood="think" size={130} />
            <p className="mt-3 text-sm">{t("lesson.saveFailed")}</p>
            <button onClick={() => submit(score)} className="mt-4 h-12 px-8 rounded-2xl text-white font-bold grad-navy">{t("lesson.tryAgain")}</button>
          </div>
        )}
      </div>
    </div>
  );
}