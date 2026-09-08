import React, { useState } from "react";
import { TrendingUp, Shield, AlertTriangle, ArrowRight, Lock } from "lucide-react";
import { futureInvestorChoices, child, fmtEGP } from "@/lib/finData";

const VIRTUAL = 1000;

export default function FutureInvestor({ onFinish }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);

  // Age gate: only 12+
  if (child.age < 12) {
    return (
      <div className="px-6 py-14 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-extrabold font-heading">Coming Soon!</h2>
        <p className="text-sm text-muted-foreground mt-2">Future Investor unlocks at age 12. For now, keep mastering saving & budgeting! 🚀</p>
        <button onClick={() => onFinish(0, 1)} className="mt-6 h-11 px-6 rounded-xl grad-navy text-white font-bold text-sm">Back to Adventure</button>
      </div>
    );
  }

  const reveal = (id) => {
    if (picked) return;
    setPicked(id);
    setTimeout(() => setRevealed(true), 600);
  };

  const choice = futureInvestorChoices.find((c) => c.id === picked);

  return (
    <div className="px-4 pt-8 pb-8 max-w-md mx-auto">
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">🚀</div>
        <h2 className="text-xl font-extrabold font-heading">Future Investor</h2>
        <p className="text-xs text-muted-foreground">Educational simulator · Virtual money only — no real trading</p>
      </div>

      <div className="grad-navy rounded-2xl p-4 text-white text-center shadow-premium mb-4">
        <div className="text-xs text-white/70">Your virtual money</div>
        <div className="text-3xl font-extrabold font-heading">{fmtEGP(VIRTUAL)}</div>
        <div className="text-[11px] text-white/60 mt-1">Imagine you have this for 1 year. What would you do?</div>
      </div>

      <div className="space-y-3">
        {futureInvestorChoices.map((c) => {
          const selected = picked === c.id;
          return (
            <button
              key={c.id}
              onClick={() => reveal(c.id)}
              disabled={picked !== null}
              className={"w-full glass rounded-2xl p-4 text-left shadow-premium border-2 transition-all active:scale-[0.99] " + (selected ? "border-emerald-400" : "border-transparent")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{c.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c.color}18`, color: c.color }}>
                  {c.risk === "Very Low" ? <Shield className="w-4 h-4" /> : c.risk === "High" ? <AlertTriangle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                </div>
              </div>
              <div className="flex gap-3 text-[11px] text-muted-foreground">
                <span>Risk: <b style={{ color: c.color }}>{c.risk}</b></span>
                <span>Return: <b style={{ color: c.color }}>{c.return}</b></span>
                <span>Time: {c.horizon}</span>
              </div>
            </button>
          );
        })}
      </div>

      {revealed && choice && (
        <div className="mt-4 rounded-2xl p-4 animate-pop" style={{ background: `${choice.color}12` }}>
          <div className="text-center mb-3">
            <div className="text-xs text-muted-foreground">After 1 year your virtual money becomes</div>
            <div className="text-3xl font-extrabold font-heading" style={{ color: choice.color }}>{fmtEGP(choice.outcome)}</div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed text-center">{choice.note}</p>
          <button onClick={() => onFinish(1, 1)} className="w-full h-11 mt-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 grad-navy active:scale-[0.98] transition-all">
            Complete Lesson <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}