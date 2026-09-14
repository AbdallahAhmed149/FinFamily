import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, Check, Palette, Zap, Loader2 } from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { cardThemes, blockableCategories, fmtEGP } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { getMyWallet, getMyCardPurchases, makeCardPurchase, updateMyCardTheme } from "@/lib/finApi";

const statusMeta = {
  completed: { label: null, color: "#0F2D52" },
  pending: { label: "Pending", color: "#FFC857" },
  rejected: { label: "Declined", color: "#ef4444" },
};

export default function MeezaCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuy, setShowBuy] = useState(false);
  const [form, setForm] = useState({ merchant: "", category: blockableCategories[0].name, amount: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // {status, decline_reason}

  const load = async () => {
    setLoading(true);
    try {
      const [w, p] = await Promise.all([getMyWallet(), getMyCardPurchases()]);
      setWallet(w);
      setPurchases(p);
    } catch (err) {
      console.error("Failed to load card data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const theme = cardThemes.find((t) => t.id === wallet?.card_theme) || cardThemes[0];
  const frozen = wallet?.card_status === "frozen";
  const deactivated = wallet?.card_status === "deactivated";

  const pickTheme = async (t) => {
    if (!wallet || wallet.card_theme === t.id) return;
    setWallet({ ...wallet, card_theme: t.id }); // optimistic
    try {
      await updateMyCardTheme(t.id);
    } catch (err) {
      console.error("Failed to save theme:", err);
      load(); // ترجع الحقيقي لو فشل الحفظ
    }
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const purchase = await makeCardPurchase({
        merchant: form.merchant,
        category: form.category,
        amount: Number(form.amount),
        location: form.location || undefined,
      });
      setResult(purchase);
      setForm({ merchant: "", category: blockableCategories[0].name, amount: "", location: "" });
      await load(); // نجيب الرصيد وقائمة المدفوعات المحدّثة
    } catch (err) {
      setResult({ status: "rejected", decline_reason: err.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Meeza Card</h1>
        <Pill color={deactivated ? "#94a3b8" : frozen ? "#3b82f6" : "#00B894"} className="ml-auto">
          {loading ? "···" : deactivated ? "Deactivated" : frozen ? "Frozen" : "Active"}
        </Pill>
      </FadeIn>

      {/* 3D card */}
      <FadeIn delay={60} className="[perspective:1200px] mb-3">
        <div
          className="relative w-full h-52 transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          onClick={() => setFlipped((f) => !f)}
        >
          <div
            className="absolute inset-0 rounded-3xl p-5 text-white shadow-premium [backface-visibility:hidden] flex flex-col justify-between cursor-pointer"
            style={{ background: theme.gradient, filter: frozen || deactivated ? "grayscale(0.7) brightness(0.8)" : "none" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-white/70">FinFamily Meeza</div>
                <div className="text-lg font-bold font-heading">{user?.full_name}</div>
              </div>
              <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-300 to-amber-500" />
            </div>
            <div className="text-xl font-mono tracking-widest">{loading ? "•••• •••• •••• ····" : wallet?.card_number}</div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] text-white/60">STATUS</div>
                <div className="text-sm font-semibold">{deactivated ? "Deactivated" : frozen ? "Frozen" : "Active"}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/60">BALANCE</div>
                <div className="text-sm font-bold">{loading ? "···" : fmtEGP(wallet?.balance ?? 0)}</div>
              </div>
              <div className="text-2xl">🌳</div>
            </div>
          </div>
          <div
            className="absolute inset-0 rounded-3xl p-5 text-white shadow-premium [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between"
            style={{ background: theme.gradient }}
          >
            <div className="w-full h-9 bg-black/80 rounded" />
            <div className="text-center text-xs text-white/70">This is a simulated card — not linked to a real bank.</div>
            <div className="flex justify-between text-[10px] text-white/70">
              <span>Tap to flip back</span>
              <span>Meeza · FinFamily</span>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">Tap card to flip</p>
      </FadeIn>

      {(frozen || deactivated) && (
        <FadeIn className="mb-5">
          <div className="glass rounded-2xl p-3 text-center text-xs text-muted-foreground">
            {deactivated ? "Your card is deactivated — ask a parent to claim a new one." : "Your card is frozen — ask a parent to unfreeze it from Family Cards."}
          </div>
        </FadeIn>
      )}

      {/* simulate a purchase */}
      <FadeIn delay={120} className="mb-6">
        <button
          onClick={() => { setShowBuy(true); setResult(null); }}
          disabled={frozen || deactivated}
          className="w-full h-14 rounded-2xl text-white font-extrabold font-heading flex items-center justify-center gap-2 grad-navy shadow-premium active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Zap className="w-5 h-5" /> Simulate a Purchase
        </button>
      </FadeIn>

      {/* theme customization */}
      <FadeIn delay={180}>
        <SectionTitle><Palette className="inline w-4 h-4 mr-1" />Theme</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          {cardThemes.map((t) => (
            <button key={t.id} onClick={() => pickTheme(t)} className="flex flex-col items-center gap-1.5 active:scale-95 transition-all">
              <div className="w-full h-12 rounded-xl shadow-premium flex items-center justify-center" style={{ background: t.gradient }}>
                {theme.id === t.id && <Check className="w-4 h-4 text-white" />}
              </div>
              <span className="text-[9px] font-semibold text-center leading-tight">{t.name}</span>
            </button>
          ))}
        </div>
      </FadeIn>

      {/* recent payments */}
      <FadeIn delay={240} className="mt-5">
        <SectionTitle>Recent Payments</SectionTitle>
        {!loading && purchases.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-6">No purchases yet — try simulating one above.</div>
        )}
        <div className="space-y-2">
          {purchases.slice(0, 8).map((p) => (
            <div key={p.id} className="glass rounded-2xl p-3 flex items-center gap-3 shadow-premium">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#0F2D5218", color: "#0F2D52" }}>
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{p.merchant}</div>
                <div className="text-xs text-muted-foreground truncate">{p.category}{p.status === "rejected" && p.decline_reason ? ` · ${p.decline_reason}` : ""}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={"font-bold text-sm " + (p.status === "rejected" ? "line-through text-muted-foreground" : "")}>{fmtEGP(p.amount)}</div>
                {statusMeta[p.status].label && (
                  <div className="text-[10px] font-semibold" style={{ color: statusMeta[p.status].color }}>{statusMeta[p.status].label}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
      <div className="h-4" />

      {/* simulate purchase modal */}
      {showBuy && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center p-4" onClick={() => !submitting && setShowBuy(false)}>
          <div className="glass rounded-3xl p-5 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {!result ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-extrabold font-heading">Simulate a Purchase</h3>
                  <button onClick={() => setShowBuy(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">✕</button>
                </div>
                <form onSubmit={handleBuy} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Merchant</label>
                    <input
                      value={form.merchant}
                      onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                      placeholder="e.g. GameZone"
                      required
                      className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Category</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {blockableCategories.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => setForm({ ...form, category: c.name })}
                          className={"h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 " + (form.category === c.name ? "grad-navy text-white" : "bg-black/5")}
                        >
                          <span className="text-lg">{c.icon}</span>
                          <span className="text-[9px] font-semibold leading-tight">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Amount (EGP)</label>
                    <input
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^\d.]/g, "") })}
                      placeholder="50"
                      inputMode="decimal"
                      required
                      className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Location (optional)</label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. City Mall"
                      className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-2xl text-white font-bold grad-navy shadow-premium active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />} {submitting ? "Processing..." : "Pay Now"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">
                  {result.status === "completed" ? "✅" : result.status === "pending" ? "⏳" : "❌"}
                </div>
                <div className="font-extrabold font-heading text-lg">
                  {result.status === "completed" ? "Payment Approved!" : result.status === "pending" ? "Waiting for Parent Approval" : "Payment Declined"}
                </div>
                {result.decline_reason && <div className="text-sm text-muted-foreground mt-1">{result.decline_reason}</div>}
                {result.status === "pending" && <div className="text-sm text-muted-foreground mt-1">You went over a spending limit — your parent will review it.</div>}
                <button onClick={() => setShowBuy(false)} className="mt-5 w-full h-12 rounded-2xl font-bold grad-navy text-white active:scale-95 transition-all">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}