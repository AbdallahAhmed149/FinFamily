import React, { useState } from "react";
import { TrendingUp, Shield, AlertTriangle, ArrowRight, Lock } from "lucide-react";
import { futureInvestorChoices, child, fmtEGP } from "@/lib/finData";
import { useTranslation } from "react-i18next";

const VIRTUAL = 1000;

export default function FutureInvestor({ onFinish }) {
  const { t } = useTranslation();
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);

  // Age gate: only 12+
  if (child.age < 12) {
    return (
      <div className="px-6 py-14 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-extrabold font-heading">{t("game_future_investor.coming_soon")}</h2>
        <p className="text-sm text-muted-foreground mt-2">{t("game_future_investor.age_gate")}</p>
        <button onClick={() => onFinish(0, 1)} className="mt-6 h-11 px-6 rounded-xl grad-navy text-white font-bold text-sm">{t("game_future_investor.back")}</button>
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
        <h2 className="text-xl font-extrabold font-heading">{t("game_future_investor.title")}</h2>
        <p className="text-xs text-muted-foreground">{t("game_future_investor.desc")}</p>
      </div>

      <div className="grad-navy rounded-2xl p-4 text-white text-center shadow-premium mb-4">
        <div className="text-xs text-white/70">{t("game_future_investor.virtual_money")}</div>
        <div className="text-3xl font-extrabold font-heading">{fmtEGP(VIRTUAL)}</div>
        <div className="text-[11px] text-white/60 mt-1">{t("game_future_investor.imagine")}</div>
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
                <span>{t("game_future_investor.risk")} <b style={{ color: c.color }}>{c.risk}</b></span>
                <span>{t("game_future_investor.return")} <b style={{ color: c.color }}>{c.return}</b></span>
                <span>{t("game_future_investor.horizon")} {c.horizon}</span>
              </div>
            </button>
          );
        })}
      </div>

      {revealed && choice && (
        <div className="mt-4 rounded-2xl p-4 animate-pop" style={{ background: `${choice.color}12` }}>
          <div className="text-center mb-3">
            <div className="text-xs text-muted-foreground">{t("game_future_investor.after_year")}</div>
            <div className="text-3xl font-extrabold font-heading" style={{ color: choice.color }}>{fmtEGP(choice.outcome)}</div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed text-center">{choice.note}</p>
          <button onClick={() => onFinish(1, 1)} className="w-full h-11 mt-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 grad-navy active:scale-[0.98] transition-all">
            {t("game_future_investor.complete_lesson")} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}