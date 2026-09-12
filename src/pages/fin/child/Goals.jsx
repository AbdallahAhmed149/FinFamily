import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";
import { GlassCard, ProgressRing, FadeIn } from "@/components/fin/ui";
import { fmtEGP } from "@/lib/finData";
import { getMyWallet, createSavingsGoal, depositToGoal } from "@/lib/finApi";
import { useTranslation } from "react-i18next";

const COLORS = ["#00B894", "#3b82f6", "#FFC857", "#8b5cf6", "#f97316"];

export default function Goals() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [burst, setBurst] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", target: 100, icon: "🎯" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setWallet(await getMyWallet());
    } catch (err) {
      setError(err.message || t("child_goals.load_error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addFunds = async (goalId, amt) => {
    setError(null);
    if ((wallet?.balance || 0) < amt) {
      setError(t("child_goals.insufficient_funds"));
      return;
    }
    setBusyId(goalId);
    try {
      await depositToGoal(goalId, amt);
      setBurst(goalId);
      setTimeout(() => setBurst(null), 1500);
      await load();
    } catch (err) {
      setError(err.message || t("child_goals.action_error"));
    } finally {
      setBusyId(null);
    }
  };

  const addGoal = async () => {
    if (!form.name.trim() || !form.target || form.target <= 0) return;
    try {
      await createSavingsGoal({ name: form.name.trim(), target: Number(form.target), icon: form.icon });
      setForm({ name: "", target: 100, icon: "🎯" });
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(err.message || t("child_goals.add_error"));
    }
  };

  const goals = wallet?.savings_goals || [];

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">{t("child_goals.title")}</h1>
        <button onClick={() => setShowAdd(true)} className="ml-auto w-10 h-10 rounded-full grad-navy flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </FadeIn>

      {!loading && wallet && (
        <FadeIn delay={20} className="mb-4">
          <div className="glass rounded-2xl p-3 text-center text-sm font-semibold text-muted-foreground">
            {t("child_goals.wallet_balance")} <span className="text-foreground font-bold">{fmtEGP(wallet.balance)}</span>{t("child_goals.use_balance")}
          </div>
        </FadeIn>
      )}

      {error && (
        <FadeIn className="mb-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        </FadeIn>
      )}

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-8">{t("child_goals.loading")}</div>
      ) : goals.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-10">{t("child_goals.no_goals")}</div>
      ) : (
        <div className="space-y-4">
          {goals.map((g, idx) => {
            const color = COLORS[idx % COLORS.length];
            const complete = g.current >= g.target;
            return (
              <FadeIn key={g.id} delay={idx * 50} className="relative">
                {burst === g.id && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="absolute text-xl animate-float" style={{ left: `${30 + i * 10}%`, top: "40%", ["--tx"]: `${(i % 2 ? 1 : -1) * 40}px`, animationDelay: `${i * 0.05}s` }}>🪙</span>
                    ))}
                  </div>
                )}
                <GlassCard className="relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full" style={{ background: `${color}11` }} />
                  <div className="flex items-center gap-4 relative">
                    <ProgressRing value={Math.min(100, (g.current / g.target) * 100)} color={color} size={72}>
                      <span className="text-2xl">{g.icon}</span>
                    </ProgressRing>
                    <div className="flex-1">
                      <div className="font-bold">{g.name}</div>
                      <div className="text-sm text-muted-foreground">{fmtEGP(g.current)} / {fmtEGP(g.target)}</div>
                      {complete && <div className="text-xs font-bold mt-1" style={{ color }}>{t("child_goals.goal_reached")}</div>}
                    </div>
                  </div>
                  {!complete && (
                    <div className="flex gap-2 mt-3">
                      <button disabled={busyId === g.id} onClick={() => addFunds(g.id, 10)} className="flex-1 h-9 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: color }}>{t("child_goals.save_10")}</button>
                      <button disabled={busyId === g.id} onClick={() => addFunds(g.id, 25)} className="flex-1 h-9 rounded-xl text-sm font-bold disabled:opacity-50" style={{ background: `${color}18`, color }}>{t("child_goals.save_25")}</button>
                    </div>
                  )}
                </GlassCard>
              </FadeIn>
            );
          })}
        </div>
      )}
      <div className="h-4" />

      {showAdd && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="glass rounded-3xl p-5 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold font-heading">{t("child_goals.new_goal")}</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{t("child_goals.goal_name")}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("child_goals.goal_name_ph")} className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{t("child_goals.goal_target")}</label>
                <input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold" />
              </div>
              <div className="flex gap-2 text-2xl">
                {["🎯", "🚲", "🎮", "📱", "⚽", "🎨"].map((ic) => (
                  <button key={ic} onClick={() => setForm({ ...form, icon: ic })} className={`w-11 h-11 rounded-xl flex items-center justify-center ${form.icon === ic ? "bg-emerald-100 ring-2 ring-emerald-400" : "bg-black/5"}`}>{ic}</button>
                ))}
              </div>
              <button onClick={addGoal} className="w-full h-12 rounded-2xl text-white font-bold grad-navy active:scale-95 transition-all flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> {t("child_goals.create_btn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}