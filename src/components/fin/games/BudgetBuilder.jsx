import React, { useState } from "react";
import { Check, AlertTriangle } from "lucide-react";
import { budgetItems, BUDGET_LIMIT, fmtEGP } from "@/lib/finData";
import { useTranslation } from "react-i18next";

export default function BudgetBuilder({ onFinish }) {
  const { t } = useTranslation();
  const [cart, setCart] = useState([]);
  const [result, setResult] = useState(null);

  const inCart = (name) => cart.includes(name);
  const toggle = (name) => {
    if (result) return;
    setCart((c) => (c.includes(name) ? c.filter((x) => x !== name) : [...c, name]));
  };

  const total = cart.reduce((s, name) => s + budgetItems.find((b) => b.name === name).price, 0);
  const needs = budgetItems.filter((b) => b.need);
  const allNeeds = needs.every((n) => cart.includes(n.name));
  const remaining = BUDGET_LIMIT - total;
  const over = total > BUDGET_LIMIT;

  const submit = () => {
    const ok = !over && allNeeds;
    setResult(ok ? "win" : "lose");
    setTimeout(() => onFinish(ok ? remaining : 0, BUDGET_LIMIT), 1600);
  };

  return (
    <div className="px-4 pt-8 pb-8 max-w-md mx-auto">
      <div className="text-center mb-5">
        <div className="text-5xl mb-2">🛒</div>
        <h2 className="text-xl font-extrabold font-heading">{t("game_budget.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("game_budget.desc", { budget: fmtEGP(BUDGET_LIMIT) })}</p>
      </div>

      {/* budget bar */}
      <div className={"glass rounded-2xl p-4 shadow-premium mb-4 " + (over ? "ring-2 ring-red-400" : "")}>
        <div className="flex justify-between text-sm font-bold mb-2">
          <span>{t("game_budget.budget")}</span>
          <span className={over ? "text-red-500" : "text-emerald-600"}>{fmtEGP(total)} / {fmtEGP(BUDGET_LIMIT)}</span>
        </div>
        <div className="h-3 rounded-full bg-black/5 overflow-hidden">
          <div className={"h-full rounded-full transition-all " + (over ? "bg-red-500" : "grad-emerald")} style={{ width: `${Math.min(100, (total / BUDGET_LIMIT) * 100)}%` }} />
        </div>
        <div className="text-xs text-muted-foreground mt-1.5">{over ? t("game_budget.over_budget") : t("game_budget.remaining", { amount: fmtEGP(Math.max(0, remaining)) })}</div>
      </div>

      {/* items */}
      <div className="grid grid-cols-2 gap-3">
        {budgetItems.map((b) => {
          const selected = inCart(b.name);
          return (
            <button
              key={b.name}
              onClick={() => toggle(b.name)}
              className={"glass rounded-2xl p-4 text-center shadow-premium border-2 transition-all active:scale-95 " + (selected ? "border-emerald-400 bg-emerald-50" : "border-transparent")}
            >
              <div className="text-3xl mb-1">{b.emoji}</div>
              <div className="font-semibold text-sm flex items-center justify-center gap-1">
                {b.need && <Check className="w-3 h-3 text-emerald-600" />} {b.name}
              </div>
              <div className="text-xs text-muted-foreground">{fmtEGP(b.price)}</div>
            </button>
          );
        })}
      </div>

      {result && (
        <div className="mt-4 rounded-2xl p-4 text-center animate-pop" style={{ background: result === "win" ? "#00B89415" : "#ef444415" }}>
          <div className="text-3xl mb-1">{result === "win" ? "🏆" : <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />}</div>
          <div className="font-bold">{result === "win" ? t("game_budget.win") : allNeeds ? t("game_budget.lose_over") : t("game_budget.lose_needs")}</div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={result !== null || cart.length === 0}
        className="w-full h-13 py-3.5 mt-4 rounded-2xl text-white font-bold font-heading grad-navy shadow-premium active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {t("game_budget.check")}
      </button>
    </div>
  );
}