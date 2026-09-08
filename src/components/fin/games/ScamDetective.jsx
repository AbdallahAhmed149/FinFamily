import React, { useState } from "react";
import { Check, X, ShieldCheck, ArrowRight } from "lucide-react";
import { scamDetectiveScenarios } from "@/lib/finData";

export default function ScamDetective({ onFinish }) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const sc = scamDetectiveScenarios[round];
  const opt = scamDetectiveScenarios[round].options.find((o) => o.id === picked);

  const pick = (id) => {
    if (picked) return;
    setPicked(id);
    const o = sc.options.find((x) => x.id === id);
    if (o.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (round + 1 >= scamDetectiveScenarios.length) {
      setDone(true);
      setTimeout(() => onFinish(score, scamDetectiveScenarios.length), 1500);
    } else {
      setRound((r) => r + 1);
      setPicked(null);
    }
  };

  if (done) {
    return (
      <div className="px-6 py-12 text-center animate-pop">
        <div className="text-5xl mb-3">🕵️</div>
        <h2 className="text-xl font-extrabold font-heading">Scam Detective Complete!</h2>
        <p className="text-sm text-muted-foreground mt-1">You spotted {score} of {scamDetectiveScenarios.length} scams</p>
        <div className="mt-4 inline-flex items-center gap-2 grad-emerald rounded-full px-4 py-2 text-white text-sm font-bold shadow-glow-emerald">
          <ShieldCheck className="w-4 h-4" /> Badge Unlocked: Scam Detective
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 pb-8 max-w-md mx-auto">
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">🕵️</div>
        <h2 className="text-xl font-extrabold font-heading">Scam Detective</h2>
        <p className="text-xs text-muted-foreground">Case {round + 1} of {scamDetectiveScenarios.length} · Spot the danger</p>
      </div>

      <div className="flex gap-1.5 mb-4">
        {scamDetectiveScenarios.map((_, i) => (
          <div key={i} className={"h-1.5 flex-1 rounded-full " + (i <= round ? "bg-red-500" : "bg-black/10")} />
        ))}
      </div>

      <div className="glass rounded-2xl p-4 shadow-premium mb-4 border-l-4 border-red-400">
        <p className="text-sm font-semibold">{sc.prompt}</p>
      </div>

      <div className="space-y-2.5">
        {sc.options.map((o) => {
          const selected = picked === o.id;
          const show = picked !== null;
          return (
            <button
              key={o.id}
              onClick={() => pick(o.id)}
              disabled={picked !== null}
              className={"w-full glass rounded-2xl p-3.5 text-left shadow-premium border-2 transition-all active:scale-[0.99] flex items-center gap-3 " + (show && o.correct ? "border-emerald-400 bg-emerald-50" : show && selected ? "border-red-400 bg-red-50" : "border-transparent")}
            >
              <span className="flex-1 text-sm font-semibold">{o.label}</span>
              {show && o.correct && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              {show && selected && !o.correct && <X className="w-4 h-4 text-red-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-4 rounded-2xl p-4 animate-pop" style={{ background: opt?.correct ? "#00B89415" : "#ef444415" }}>
          <div className="font-bold text-sm mb-1">{opt?.correct ? "✅ Correct!" : "⚠️ Not the safest move"}</div>
          <p className="text-xs text-muted-foreground leading-relaxed">{opt?.explain}</p>
          <button onClick={next} className="w-full h-11 mt-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 grad-navy active:scale-[0.98] transition-all">
            {round + 1 >= scamDetectiveScenarios.length ? "Finish" : "Next Case"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}