import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { quizQuestions } from "@/lib/finData";
import RewardScreen from "@/components/fin/RewardScreen";
import { useTranslation } from "react-i18next";

export default function QuizPlayer({ title, onClose }) {
  const { t } = useTranslation();
  const questions = quizQuestions.slice(0, 6);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState("quiz");

  const q = questions[i];

  const choose = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 < questions.length) { setI(i + 1); setPicked(null); }
      else setPhase("result");
    }, 1300);
  };

  if (phase === "result") {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <RewardScreen title={t("shared.quiz.finish")} score={score} total={questions.length} coins={score * 15} xp={score * 20} onClose={onClose} />
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 pb-8 max-w-md mx-auto">
      {/* progress */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs font-bold text-muted-foreground">{t("shared.quiz.question")} {i + 1}/{questions.length}</span>
        <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
          <div className="h-full grad-emerald rounded-full transition-all" style={{ width: `${((i) / questions.length) * 100}%` }} />
        </div>
        <span className="text-xs font-bold text-emerald-600">🪙 {score * 15}</span>
      </div>

      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🦁</div>
        <h2 className="text-xl font-extrabold font-heading">{title}</h2>
        <p className="text-sm text-muted-foreground">اختر الإجابة الصحيحة</p>
      </div>

      <div className="glass rounded-3xl p-5 shadow-premium mb-5">
        <div className="text-base font-bold mb-4">{q.q}</div>
        <div className="space-y-2.5">
          {q.options.map((opt, idx) => {
            const isAnswer = idx === q.answer;
            const isPicked = idx === picked;
            const reveal = picked !== null;
            const style = !reveal ? "glass"
              : isAnswer ? "bg-emerald-100 border-emerald-400"
              : isPicked ? "bg-red-100 border-red-400"
              : "opacity-50 glass";
            return (
              <button
                key={idx}
                onClick={() => choose(idx)}
                disabled={reveal}
                className={"w-full p-4 rounded-2xl text-left font-semibold text-sm border-2 border-transparent transition-all active:scale-[0.99] flex items-center justify-between " + style}
              >
                {opt}
                {reveal && isAnswer && <Check className="w-5 h-5 text-emerald-600" />}
                {reveal && isPicked && !isAnswer && <X className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="mt-4 rounded-2xl p-3 text-sm animate-pop" style={{ background: picked === q.answer ? "#00B89415" : "#ef444415" }}>
            <span className="font-bold">{picked === q.answer ? `✅ ${t("shared.quiz.correct")} ` : `❌ ${t("shared.quiz.wrong")} `}</span>
            <span className="text-muted-foreground">{q.explain}</span>
          </div>
        )}
      </div>
    </div>
  );
}