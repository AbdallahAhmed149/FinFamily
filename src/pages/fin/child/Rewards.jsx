import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, Clock } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle } from "@/components/fin/ui";
import { rewardsStore } from "@/lib/finData";
import { getMyWallet, getMyMissions, requestRedemption } from "@/lib/finApi";
import { useTranslation } from "react-i18next";

export default function Rewards() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [requestedTitles, setRequestedTitles] = useState([]); // عناوين اللي لسه مستنية موافقة الأب
  const [approvedTitles, setApprovedTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [wallet, missions] = await Promise.all([getMyWallet(), getMyMissions()]);
      setBalance(wallet.balance);
      const redemptions = missions.filter((m) => m.kind === "redemption" || rewardsStore.some((r) => r.name === m.title));
      setRequestedTitles(redemptions.filter((m) => m.status === "submitted").map((m) => m.title));
      setApprovedTitles(redemptions.filter((m) => m.status === "approved").map((m) => m.title));
    } catch (err) {
      setError(err.message || t("child_rewards.load_error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const redeem = async (r) => {
    setBusyId(r.id);
    try {
      await requestRedemption({ assigned_to_id: null, title: r.name, reward: r.cost, icon: r.icon, category: r.category || "مكافأة" });
      await load();
    } catch (err) {
      setError(err.message || t("child_rewards.error"));
    } finally {
      setBusyId(null);
    }
  };

  const stateFor = (r) => {
    if (approvedTitles.includes(r.name)) return "approved";
    if (requestedTitles.includes(r.name)) return "pending";
    return "available";
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">{t("child_rewards.title")}</h1>
      </FadeIn>

      {error && (
        <FadeIn className="mb-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        </FadeIn>
      )}

      {/* coins balance */}
      <FadeIn delay={60}>
        <div className="grad-gold rounded-3xl p-5 text-center shadow-glow-gold text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-6xl opacity-20">🪙</div>
          <div className="text-sm text-white/80 font-medium">{t("child_rewards.your_coins")}</div>
          <div className="text-4xl font-extrabold font-heading mt-1">{loading ? "···" : balance}</div>
          <div className="text-xs text-white/80 mt-1">{t("child_rewards.earn_more")}</div>
        </div>
      </FadeIn>

      {/* store grid */}
      <FadeIn delay={180}>
        <SectionTitle>{t("child_rewards.redeem")}</SectionTitle>
        <p className="text-[11px] text-muted-foreground -mt-1 mb-3">{t("child_rewards.redeem_note")}</p>
        <div className="grid grid-cols-2 gap-3">
          {rewardsStore.map((r, idx) => {
            const state = stateFor(r);
            const afford = balance >= r.cost;
            return (
              <FadeIn key={r.id} delay={idx * 30}>
                <div className="glass rounded-2xl p-4 text-center shadow-premium relative">
                  <div className="text-4xl mb-2">{r.icon}</div>
                  <div className="font-bold text-sm">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground">{r.category}</div>
                  <button
                    onClick={() => redeem(r)}
                    disabled={!afford || state !== "available" || busyId === r.id}
                    className={
                      "mt-3 w-full h-9 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1 " +
                      (state === "approved" ? "bg-emerald-500 text-white" : state === "pending" ? "bg-amber-100 text-amber-700" : afford ? "grad-navy text-white" : "bg-black/5 text-muted-foreground")
                    }
                  >
                    {state === "approved" ? <><Check className="w-4 h-4" /> {t("child_rewards.done")}</> : state === "pending" ? <><Clock className="w-4 h-4" /> {t("child_rewards.pending")}</> : `${r.cost} 🪙`}
                  </button>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </FadeIn>

      {requestedTitles.length > 0 && (
        <FadeIn className="mt-5">
          <div className="glass rounded-2xl p-4 text-center animate-pop">
            <div className="text-2xl mb-1">⏳</div>
            <div className="font-bold text-sm">{t("child_rewards.pending_count", { count: requestedTitles.length })}</div>
            <div className="text-xs text-muted-foreground">{t("child_rewards.pending_desc")}</div>
          </div>
        </FadeIn>
      )}
      <div className="h-4" />
    </div>
  );
}