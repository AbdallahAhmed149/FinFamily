import React, { useState } from "react";
import { Check, X, Star, ArrowRight } from "lucide-react";
import { smartShopperScenarios, fmtEGP } from "@/lib/finData";

export default function SmartShopper({ onFinish }) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const sc = smartShopperScenarios[round];
  const isCorrect = picked === sc?.answer;

  const pick = (id) => {
    if (picked) return;
    setPicked(id);
    if (id === sc.answer && !done) setScore((s) => s + 1);
  };

  const next = () => {
    if (round + 1 >= smartShopperScenarios.length) {
      setDone(true);
      setTimeout(() => onFinish(score, smartShopperScenarios.length), 1400);
    } else {
      setRound((r) => r + 1);
      setPicked(null);
    }
  };

  if (done) {
    return (
      <div className="px-6 py-12 text-center animate-pop">
        <div className="text-5xl mb-3">🛒</div>
        <h2 className="text-xl font-extrabold font-heading">Smart Shopper Complete!</h2>
        <p className="text-sm text-muted-foreground mt-1">You made {score} smart choice{score !== 1 ? "s" : ""} out of {smartShopperScenarios.length}</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 pb-8 max-w-md mx-auto">
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">🛒</div>
        <h2 className="text-xl font-extrabold font-heading">Smart Shopper</h2>
        <p className="text-xs text-muted-foreground">Round {round + 1} of {smartShopperScenarios.length} · Compare value, not just price</p>
      </div>

      <div className="flex gap-1.5 mb-4">
        {smartShopperScenarios.map((_, i) => (
          <div key={i} className={"h-1.5 flex-1 rounded-full " + (i <= round ? "bg-emerald-500" : "bg-black/10")} />
        ))}
      </div>

      <div className="glass rounded-2xl p-4 shadow-premium mb-4">
        <p className="text-sm font-semibold">{sc.prompt}</p>
      </div>

      <div className="space-y-3">
        {sc.options.map((o) => {
          const selected = picked === o.id;
          const correct = o.id === sc.answer;
          const show = picked !== null;
          return (
            <button
              key={o.id}
              onClick={() => pick(o.id)}
              disabled={picked !== null}
              className={"w-full glass rounded-2xl p-4 text-left shadow-premium border-2 transition-all active:scale-[0.99] " + (show && correct ? "border-emerald-400 bg-emerald-50" : show && selected ? "border-red-400 bg-red-50" : "border-transparent")}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">{o.label}</span>
                <span className="font-extrabold text-sm">{fmtEGP(o.price)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {o.rating} · {o.quality}
                </span>
                {show && correct && <Check className="w-4 h-4 text-emerald-600" />}
                {show && selected && !correct && <X className="w-4 h-4 text-red-500" />}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{o.note}</div>
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-4 rounded-2xl p-4 animate-pop" style={{ background: isCorrect ? "#00B89415" : "#ef444415" }}>
          <div className="font-bold text-sm mb-1">{isCorrect ? "🎉 Smart choice!" : "💡 Let's learn"}</div>
          <p className="text-xs text-muted-foreground leading-relaxed">{sc.explain}</p>
          {!isCorrect && <p className="text-xs font-semibold text-amber-600 mt-2">Try another option to see the smartest one!</p>}
          <button onClick={next} className="w-full h-11 mt-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 grad-navy active:scale-[0.98] transition-all">
            {round + 1 >= smartShopperScenarios.length ? "Finish" : "Next"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}