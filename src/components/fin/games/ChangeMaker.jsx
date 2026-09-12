import React, { useState } from "react";
import { Check, X, Coins } from "lucide-react";
import { changeMakerRounds } from "@/lib/finData";
import { fmtEGP } from "@/lib/finData";
import GameOverlay from "@/components/fin/GameOverlay";
import RewardScreen from "@/components/fin/RewardScreen";
import { useTranslation } from "react-i18next";

export default function ChangeMaker({ onFinish }) {
  const { t } = useTranslation();
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const current = changeMakerRounds[round];

  const pick = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === current.answer;
    if (correct) setScore((s) => s + 1);
    setFeedback(correct ? "correct" : "wrong");
    setTimeout(() => {
      if (round + 1 < changeMakerRounds.length) {
        setRound((r) => r + 1);
        setSelected(null);
        setFeedback(null);
      } else {
        setDone(true);
        onFinish && onFinish(correct ? score + 1 : score, changeMakerRounds.length);
      }
    }, 1100);
  };

  if (!started) {
    return (
      <GameOverlay title="Change Maker" icon="💰" onClose={onFinish ? () => onFinish(0, changeMakerRounds.length) : undefined}>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="text-7xl mb-4 animate-pop">💰</div>
          <h2 className="text-2xl font-extrabold font-heading mb-2">{t("game_change_maker.title")}</h2>
          <p className="text-muted-foreground mb-2">{t("game_change_maker.desc")}</p>
          <div className="glass rounded-2xl p-4 my-4 text-left w-full max-w-sm">
            <div className="text-sm font-semibold mb-1">{t("game_change_maker.how_to_play")}</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>{t("game_change_maker.rule1")}</li>
              <li>{t("game_change_maker.rule2")}</li>
              <li>{t("game_change_maker.rule3")}</li>
            </ul>
          </div>
          <button onClick={() => setStarted(true)} className="px-8 h-12 rounded-2xl text-white font-bold grad-emerald shadow-glow-emerald active:scale-95 transition-all">
            {t("game_change_maker.start")}
          </button>
        </div>
      </GameOverlay>
    );
  }

  if (done) {
    return (
      <RewardScreen
        score={score}
        total={changeMakerRounds.length}
        coins={score * 12}
        xp={score * 20}
        onClose={() => onFinish && onFinish(score, changeMakerRounds.length)}
      />
    );
  }

  return (
    <GameOverlay title="Change Maker" icon="💰" onClose={onFinish ? () => onFinish(score, changeMakerRounds.length) : undefined}>
      <div className="flex-1 px-4">
        <div className="flex items-center justify-between mt-2 mb-4">
          <span className="text-xs font-semibold text-muted-foreground">{t("game_change_maker.round", { current: round + 1, total: changeMakerRounds.length })}</span>
          <span className="text-xs font-bold flex items-center gap-1 text-amber-500"><Coins className="w-3.5 h-3.5" /> {t("game_change_maker.correct_count", { score })}</span>
        </div>
        <div className="h-2 rounded-full bg-black/5 mb-6 overflow-hidden">
          <div className="h-full grad-emerald rounded-full transition-all duration-500" style={{ width: `${((round) / changeMakerRounds.length) * 100}%` }} />
        </div>

        <div className="grad-navy rounded-3xl p-6 text-white text-center shadow-premium mb-5 animate-pop">
          <div className="text-xs text-white/60 mb-1">{t("game_change_maker.price")}</div>
          <div className="text-3xl font-extrabold font-heading">{fmtEGP(current.price)}</div>
          <div className="my-3 text-white/40">{t("game_change_maker.paid_with")}</div>
          <div className="text-xs text-white/60 mb-1">{t("game_change_maker.paid")}</div>
          <div className="text-3xl font-extrabold font-heading text-amber-300">{fmtEGP(current.paid)}</div>
          <div className="mt-4 text-sm font-semibold text-emerald-300">{t("game_change_maker.how_much_change")}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {current.options.map((opt, i) => {
            const isCorrect = i === current.answer;
            const isPicked = selected === i;
            let style = "glass";
            if (selected !== null) {
              if (isCorrect) style = "bg-emerald-500 text-white";
              else if (isPicked) style = "bg-red-500 text-white";
              else style = "glass opacity-50";
            }
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={selected !== null}
                className={`h-20 rounded-2xl font-extrabold font-heading text-xl shadow-premium active:scale-95 transition-all flex items-center justify-center gap-2 ${style}`}
              >
                {selected !== null && isCorrect && <Check className="w-5 h-5" />}
                {selected !== null && isPicked && !isCorrect && <X className="w-5 h-5" />}
                {fmtEGP(opt)}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className={`mt-4 text-center font-bold animate-pop ${feedback === "correct" ? "text-emerald-600" : "text-red-500"}`}>
            {feedback === "correct" ? t("game_change_maker.correct") : t("game_change_maker.wrong", { change: fmtEGP(current.options[current.answer]) })}
          </div>
        )}
      </div>
    </GameOverlay>
  );
}