import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle } from "@/components/fin/ui";
import { fmtEGP } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { getChildWallet, getChildTransactions, getFamilyInsights } from "@/lib/finApi";
import { useTranslation } from "react-i18next";

const iconEmoji = { "shield-alert": "🚨", "trending-down": "📉", "trending-up": "📈", "piggy-bank": "🐷", sparkles: "✨", wallet: "👛" };
const sevColor = { alert: "#ef4444", warn: "#FFC857", info: "#3b82f6", good: "#00B894" };

export default function Insights() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFamilyChildren } = useAuth();

  const [avgScore, setAvgScore] = useState(null);
  const [totals, setTotals] = useState({ spending: 0, savings: 0, goalsCompleted: 0 });
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ children }, realInsights] = await Promise.all([getFamilyChildren(), getFamilyInsights()]);
      setInsights(realInsights);

      const perChild = await Promise.all(
        children.map(async (c) => ({
          wallet: await getChildWallet(c.id),
          transactions: await getChildTransactions(c.id),
        }))
      );

      let spending = 0, savings = 0, goalsCompleted = 0;
      for (const { wallet, transactions } of perChild) {
        savings += wallet.savings_balance || 0;
        for (const g of wallet.savings_goals || []) if (g.current >= g.target) goalsCompleted += 1;
        for (const t of transactions) if (t.type === "redemption" && t.direction === "debit") spending += t.amount;
      }
      const score = perChild.length ? Math.round(perChild.reduce((s, { wallet }) => s + (wallet.financial_score ?? 50), 0) / perChild.length) : null;

      setTotals({ spending, savings, goalsCompleted });
      setAvgScore(score);
    } catch (err) {
      setError(err.message || t("insights.load_error"));
    } finally {
      setLoading(false);
    }
  }, [getFamilyChildren]);

  useEffect(() => {
    load();
  }, [load]);

  // لو فيه هدف ادخار قريب يخلص، نعرضه كـ "تحدي مقترح" — بيانات حقيقية مش مقترح مصمم بخوارزمية
  const closeToGoal = insights.find((i) => i.icon === "sparkles");

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">{t("insights.title")}</h1>
      </FadeIn>

      {error && (
        <FadeIn className="mb-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        </FadeIn>
      )}

      {/* report card */}
      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-5 text-white shadow-premium relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🤖</span>
            <span className="text-sm font-semibold text-white/80">{t("insights.report_title")}</span>
          </div>
          <div className="text-3xl font-extrabold font-heading">
            {loading || avgScore === null ? "···" : t("insights.score", { score: avgScore })}
          </div>
          <div className="flex gap-3 mt-3 text-sm">
            <span className="text-white/80">{t("insights.spending")} <b className="text-white">{fmtEGP(totals.spending)}</b></span>
            <span className="text-white/80">{t("insights.savings")} <b className="text-white">{fmtEGP(totals.savings)}</b></span>
          </div>
        </div>
      </FadeIn>

      {/* insight cards — بيانات حقيقية 100% من /family/insights */}
      <FadeIn delay={120} className="mt-4">
        <SectionTitle>{t("insights.key_findings")}</SectionTitle>
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-8">{t("insights.loading")}</div>
        ) : (
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <FadeIn key={ins.id} delay={i * 50}>
                <GlassCard className="flex gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{ background: `${sevColor[ins.severity]}18` }}>
                    {iconEmoji[ins.icon] || "💡"}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{ins.text}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ins.detail}</div>
                  </div>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        )}
      </FadeIn>

      {/* اقتراح حقيقي بس لو فيه هدف فعلاً قريب يخلص — مفيش خوارزمية توصية مصممة لسه */}
      {closeToGoal && (
        <FadeIn delay={240} className="mt-4">
          <GlassCard className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-bold">{closeToGoal.text}</div>
            <div className="text-sm text-muted-foreground mt-1">{closeToGoal.detail}</div>
          </GlassCard>
        </FadeIn>
      )}
      <div className="h-4" />
    </div>
  );
}