import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Check, X, Coins, Gift } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill } from "@/components/fin/ui";
import { useAuth } from "@/lib/AuthContext";
import { getFamilyMissions, reviewMission, getChildWallet } from "@/lib/finApi";

export default function RewardApprovals() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFamilyChildren } = useAuth();

  const [items, setItems] = useState([]);
  const [childrenById, setChildrenById] = useState({});
  const [balances, setBalances] = useState({}); // childId -> balance
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [childrenRes, missions] = await Promise.all([getFamilyChildren(), getFamilyMissions()]);
      const byId = Object.fromEntries(childrenRes.children.map((c) => [c.id, c.full_name]));
      setChildrenById(byId);

      const redemptions = missions.filter((m) => m.kind === "redemption");
      setItems(redemptions);

      const uniqueChildIds = [...new Set(redemptions.map((r) => r.assigned_to_id))];
      const wallets = await Promise.all(uniqueChildIds.map((id) => getChildWallet(id).catch(() => null)));
      setBalances(Object.fromEntries(uniqueChildIds.map((id, i) => [id, wallets[i]?.balance ?? 0])));
    } catch (err) {
      setError(err.message || t("parent.rewardApprovals.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [getFamilyChildren, t]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (id, decision) => {
    setBusyId(id);
    try {
      await reviewMission(id, decision);
      await load();
    } catch (err) {
      setError(err.message || t("parent.rewardApprovals.decideFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const pending = items.filter((r) => r.status === "submitted");
  const history = items.filter((r) => r.status !== "submitted");

  return (
    <div className="px-4 pt-12 pb-6">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">{t("parent.rewardApprovals.title")}</h1>
        <Pill color="#FFC857" className="ms-auto"><Gift className="w-3 h-3" /> {t("parent.rewardApprovals.pending", { count: pending.length })}</Pill>
      </FadeIn>

      {error && (
        <FadeIn className="mb-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        </FadeIn>
      )}

      <FadeIn delay={40}>
        <div className="grad-gold rounded-3xl p-4 text-white shadow-glow-gold flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <div className="font-bold text-sm">{t("parent.rewardApprovals.bannerTitle")}</div>
            <div className="text-xs text-white/80">{t("parent.rewardApprovals.bannerDesc")}</div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={120} className="mt-4">
        <SectionTitle>{t("parent.rewardApprovals.pendingRequests")}</SectionTitle>
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-8">{t("parent.rewardApprovals.loading")}</div>
        ) : (
          <div className="space-y-3">
            {pending.map((r, i) => (
              <FadeIn key={r.id} delay={i * 50}>
                <GlassCard>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "#FFC85718" }}>{r.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{t("parent.rewardApprovals.requestedBy")} <span className="font-semibold text-foreground">{childrenById[r.assigned_to_id] || "—"}</span></div>
                    </div>
                    <div className="text-end">
                      <div className="font-extrabold font-heading text-amber-600 flex items-center gap-1 justify-end"><Coins className="w-3.5 h-3.5" /> {r.reward}</div>
                      <div className="text-[10px] text-muted-foreground">{t("parent.rewardApprovals.ofCoins", { balance: balances[r.assigned_to_id] ?? "…" })}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button disabled={busyId === r.id} onClick={() => decide(r.id, "reject")} className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50" style={{ background: "#ef444318", color: "#ef4444" }}>
                      <X className="w-4 h-4" /> {t("parent.rewardApprovals.reject")}
                    </button>
                    <button disabled={busyId === r.id} onClick={() => decide(r.id, "approve")} className="flex-1 h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-1 grad-emerald active:scale-95 transition-all disabled:opacity-50">
                      <Check className="w-4 h-4" /> {t("parent.rewardApprovals.approveFulfill")}
                    </button>
                  </div>
                </GlassCard>
              </FadeIn>
            ))}
            {pending.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">{t("parent.rewardApprovals.noPending")}</div>}
          </div>
        )}
      </FadeIn>

      {!loading && (
        <FadeIn delay={160} className="mt-5">
          <SectionTitle>{t("parent.rewardApprovals.history")}</SectionTitle>
          <div className="space-y-2">
            {history.map((r) => (
              <GlassCard key={r.id} className="flex items-center gap-3 py-3 opacity-80">
                <div className="text-xl">{r.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{r.title} · {childrenById[r.assigned_to_id] || "—"}</div>
                </div>
                <Pill color={r.status === "approved" ? "#00B894" : "#ef4444"} className="text-[10px] py-0">{r.status}</Pill>
              </GlassCard>
            ))}
            {history.length === 0 && <div className="text-center text-sm text-muted-foreground py-4">{t("parent.rewardApprovals.noHistory")}</div>}
          </div>
        </FadeIn>
      )}
      <div className="h-4" />
    </div>
  );
}