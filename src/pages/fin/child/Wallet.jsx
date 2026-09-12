import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Wallet, Target, ArrowDownLeft, ArrowUpRight, Clock, CreditCard,
  Coins, Gift, ArrowLeftRight, Sparkles,
} from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { fmtEGP, timeAgo } from "@/lib/finData";
import { getMyWallet, getMyTransactions } from "@/lib/finApi";
import { useTranslation } from "react-i18next";

export default function WalletPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const typeMeta = {
    mission_reward: { icon: Coins, label: t("child_wallet.type_mission") },
    redemption: { icon: Gift, label: t("child_wallet.type_redemption") },
    allowance: { icon: Wallet, label: t("child_wallet.type_allowance") },
    savings_transfer: { icon: Target, label: t("child_wallet.type_savings") },
    adjustment: { icon: ArrowLeftRight, label: t("child_wallet.type_adjustment") },
  };
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, t] = await Promise.all([getMyWallet(), getMyTransactions()]);
      setWallet(w);
      setTxns(t);
    } catch (err) {
      setError(err.message || t("child_wallet.load_error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const todaySpending = txns
    .filter((t) => t.direction === "debit" && new Date(t.created_date).toDateString() === new Date().toDateString())
    .reduce((s, t) => s + t.amount, 0);

  const totalEarned = txns.filter((t) => t.direction === "credit").reduce((s, t) => s + t.amount, 0);

  const stats = wallet
    ? [
        { label: t("child_wallet.savings"), value: fmtEGP(wallet.savings_balance), icon: Target, color: "#00B894" },
        { label: t("child_wallet.today_spend"), value: fmtEGP(todaySpending), icon: ArrowUpRight, color: "#ef4444" },
        { label: t("child_wallet.total_earned"), value: fmtEGP(totalEarned), icon: ArrowDownLeft, color: "#FFC857" },
      ]
    : [];

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">{t("child_wallet.title")}</h1>
      </FadeIn>

      {error && (
        <FadeIn className="mb-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        </FadeIn>
      )}

      {/* balance card */}
      <FadeIn delay={60}>
        <div className="grad-emerald rounded-3xl p-5 text-white shadow-premium relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="text-sm text-white/80">{t("child_wallet.balance")}</div>
          <div className="text-3xl font-extrabold font-heading mt-1">{loading ? "···" : fmtEGP(wallet?.balance || 0)}</div>
          <button onClick={() => navigate("/child/card")} className="mt-4 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 text-sm font-semibold">
            <CreditCard className="w-4 h-4" /> {t("child_wallet.view_card")}
          </button>
        </div>
      </FadeIn>

      {/* mini stats */}
      {!loading && (
        <FadeIn delay={120} className="grid grid-cols-3 gap-3 mt-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass rounded-2xl p-3 text-center shadow-premium">
                <div className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center mb-1" style={{ background: `${s.color}22`, color: s.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold">{s.value}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
              </div>
            );
          })}
        </FadeIn>
      )}

      {/* card status */}
      {wallet && (
        <FadeIn delay={180}>
          <GlassCard className="flex items-center gap-3 mt-4">
            <div className={`w-2.5 h-2.5 rounded-full ${wallet.card_status === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            <span className="text-sm font-semibold">{wallet.card_status === "active" ? t("child_wallet.card_active") : t("child_wallet.card_frozen")}</span>
            <span className="text-xs text-muted-foreground ml-auto">{t("child_wallet.all_safe")}</span>
          </GlassCard>
        </FadeIn>
      )}

      {/* savings goals */}
      {wallet?.savings_goals?.length > 0 && (
        <FadeIn delay={200} className="mt-4">
          <SectionTitle>{t("child_wallet.goals")}</SectionTitle>
          <div className="space-y-2.5">
            {wallet.savings_goals.map((g) => (
              <GlassCard key={g.id} className="flex items-center gap-3">
                <div className="text-2xl">{g.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{g.name}</div>
                  <div className="h-1.5 rounded-full bg-black/5 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (g.current / g.target) * 100)}%`, background: g.color }} />
                  </div>
                </div>
                <div className="text-xs font-bold text-right shrink-0">{fmtEGP(g.current)} / {fmtEGP(g.target)}</div>
              </GlassCard>
            ))}
          </div>
        </FadeIn>
      )}

      {/* transactions */}
      <FadeIn delay={240} className="mt-4">
        <SectionTitle>{t("child_wallet.transactions")}</SectionTitle>
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-8">{t("child_wallet.loading")}</div>
        ) : txns.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">{t("child_wallet.no_txns")}</div>
        ) : (
          <div className="space-y-2.5">
            {txns.map((tx, idx) => {
              const meta = typeMeta[tx.type] || { icon: Sparkles, label: tx.type };
              const Icon = meta.icon;
              const open = expanded === tx.id;
              const income = tx.direction === "credit";
              return (
                <div key={tx.id} className="animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                  <button
                    onClick={() => setExpanded(open ? null : tx.id)}
                    className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 shadow-premium active:scale-[0.99] transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: income ? "#00B89422" : "#0F2D5218", color: income ? "#00B894" : "#0F2D52" }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-semibold text-sm truncate">{tx.description}</div>
                      <div className="text-xs text-muted-foreground">{timeAgo(tx.created_date)}</div>
                    </div>
                    <div className={"font-bold text-sm " + (income ? "text-emerald-600" : "text-foreground")}>
                      {income ? "+" : "-"}{fmtEGP(tx.amount)}
                    </div>
                  </button>
                  {open && (
                    <div className="glass rounded-2xl mt-1.5 p-4 animate-pop space-y-2.5">
                      <Row icon={Clock} label={t("child_wallet.datetime")} value={new Date(tx.created_date).toLocaleString("en-EG", { dateStyle: "medium", timeStyle: "short" })} />
                      <div className="flex items-center gap-2.5">
                        <Pill color="#0F2D52">{meta.label}</Pill>
                        <Pill color={income ? "#00B894" : "#64748b"}>{tx.direction}</Pill>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </FadeIn>
      <div className="h-4" />
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold ml-auto">{value}</span>
    </div>
  );
}