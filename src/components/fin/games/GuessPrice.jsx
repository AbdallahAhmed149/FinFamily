import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { priceGuessItems } from "@/lib/finData";
import { fmtEGP } from "@/lib/finData";
import { useTranslation } from "react-i18next";

export default function GuessPrice({ onFinish }) {
  const { t } = useTranslation();
  const rounds = priceGuessItems.slice(0, 5);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const item = rounds[i];

  const pick = (opt) => {
    if (picked !== null) return;
    setPicked(opt);
    const correct = opt === item.price;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      const next = i + 1;
      if (next < rounds.length) { setI(next); setPicked(null); }
      else onFinish(score + (correct ? 1 : 0), rounds.length);
    }, 1100);
  };

  return (
    <div className="px-4 pt-8 pb-8 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-bold text-muted-foreground">{t("game_guess_price.round", { current: i + 1, total: rounds.length })}</span>
        <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
          <div className="h-full grad-emerald rounded-full transition-all" style={{ width: `${(i / rounds.length) * 100}%` }} />
        </div>
        <span className="text-xs font-bold text-emerald-600">✓ {score}</span>
      </div>

      <div className="text-center mb-6">
        <div className="text-7xl mb-3">{item.emoji}</div>
        <div className="text-lg font-extrabold font-heading">{item.name}</div>
        <div className="text-sm text-muted-foreground">{t("game_guess_price.guess")}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {item.options.map((opt) => {
          const isAnswer = opt === item.price;
          const isPicked = opt === picked;
          const reveal = picked !== null;
          const cls = !reveal ? "glass"
            : isAnswer ? "bg-emerald-100 border-emerald-400"
            : isPicked ? "bg-red-100 border-red-400"
            : "opacity-50 glass";
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={reveal}
              className={"p-5 rounded-2xl font-bold text-lg border-2 border-transparent transition-all active:scale-95 flex items-center justify-center gap-1 " + cls}
            >
              {fmtEGP(opt)}
              {reveal && isAnswer && <Check className="w-4 h-4 text-emerald-600" />}
              {reveal && isPicked && !isAnswer && <X className="w-4 h-4 text-red-500" />}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-4 text-center text-sm animate-pop">
          <span className="font-bold">{picked === item.price ? t("game_guess_price.win") : t("game_guess_price.real_price", { price: fmtEGP(item.price) })}</span>
        </div>
      )}
    </div>
  );
}