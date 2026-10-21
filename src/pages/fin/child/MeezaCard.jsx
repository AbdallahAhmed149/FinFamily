import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContentTranslation } from "@/lib/useContentTranslation";
import { ChevronLeft, CreditCard, Check, Palette, Zap, Loader2 } from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { cardThemes, blockableCategories, fmtEGP } from "@/lib/finData";
import { PREMIUM_CARD_THEMES } from "@/lib/cosmetics";
import { useAuth } from "@/lib/AuthContext";
import { getMyWallet, getMyCardPurchases, makeCardPurchase, updateMyCardTheme } from "@/lib/finApi";

const statusColor = {
  completed: "#0F2D52",
  pending: "#FFC857",
  rejected: "#ef4444",
};

export default function MeezaCard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tc = useContentTranslation();
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

  // الثيمات المدفوعة (من متجر الجواهر) بتتعرض لو متفعّلة. منتقي الثيمات تحت بيعرض المجانية بس —
  // المدفوعة بتتفعّل من متجر الجواهر، والسيرفر بيرفض أي ثيم مدفوع الطفل مش مالكه.
  const theme = [...cardThemes, ...PREMIUM_CARD_THEMES].find((th) => th.id === wallet?.card_theme) || cardThemes[0];
  const frozen = wallet?.card_status === "frozen";
  const deactivated = wallet?.card_status === "deactivated";
  const statusKey = deactivated ? "deactivated" : frozen ? "frozen" : "active";

  const pickTheme = async (th) => {
    if (!wallet || wallet.card_theme === th.id) return;
    setWallet({ ...wallet, card_theme: th.id }); // optimistic
    try {
      await updateMyCardTheme(th.id);
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
      setResult({ status: "rejected", decline_reason: err.message || t("child.meezaCard.genericError") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">{t("child.meezaCard.title")}</h1>
        <Pill color={deactivated ? "#94a3b8" : frozen ? "#3b82f6" : "#00B894"} className="ms-auto">
          {loading ? "···" : t(`child.meezaCard.status.${statusKey}`)}
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
            <div className="text-xl font-mono tracking-widest force-ltr text-end">{loading ? "•••• •••• •••• ····" : wallet?.card_number}</div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] text-white/60">{t("child.meezaCard.statusLabel")}</div>
                <div className="text-sm font-semibold">{t(`child.meezaCard.status.${statusKey}`)}</div>
              </div>
              <div className="text-end">
                <div className="text-[10px] text-white/60">{t("child.meezaCard.balanceLabel")}</div>
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
            <div className="text-center text-xs text-white/70">{t("child.meezaCard.simulatedNotice")}</div>
            <div className="flex justify-between text-[10px] text-white/70">
              <span>{t("child.meezaCard.tapToFlipBack")}</span>
              <span>Meeza · FinFamily</span>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">{t("child.meezaCard.tapToFlip")}</p>
      </FadeIn>

      {(frozen || deactivated) && (
        <FadeIn className="mb-5">
          <div className="glass rounded-2xl p-3 text-center text-xs text-muted-foreground">
            {deactivated ? t("child.meezaCard.deactivatedNotice") : t("child.meezaCard.frozenNotice")}
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
          <Zap className="w-5 h-5" /> {t("child.meezaCard.simulatePurchase")}
        </button>
      </FadeIn>

      {/* theme customization */}
      <FadeIn delay={180}>
        <SectionTitle><Palette className="inline w-4 h-4 me-1" />{t("child.meezaCard.theme")}</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          {cardThemes.map((th) => (
            <button key={th.id} onClick={() => pickTheme(th)} className="flex flex-col items-center gap-1.5 active:scale-95 transition-all">
              <div className="w-full h-12 rounded-xl shadow-premium flex items-center justify-center" style={{ background: th.gradient }}>
                {theme.id === th.id && <Check className="w-4 h-4 text-white" />}
              </div>
              <span className="text-[9px] font-semibold text-center leading-tight">{tc(th.name)}</span>
            </button>
          ))}
        </div>
      </FadeIn>

      {/* recent payments */}
      <FadeIn delay={240} className="mt-5">
        <SectionTitle>{t("child.meezaCard.recentPayments")}</SectionTitle>
        {!loading && purchases.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-6">{t("child.meezaCard.noPurchases")}</div>
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
              <div className="text-end shrink-0">
                <div className={"font-bold text-sm " + (p.status === "rejected" ? "line-through text-muted-foreground" : "")}>{fmtEGP(p.amount)}</div>
                {p.status !== "completed" && (
                  <div className="text-[10px] font-semibold" style={{ color: statusColor[p.status] }}>{t(`child.meezaCard.status.${p.status === "rejected" ? "declined" : "pending"}`)}</div>
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
                  <h3 className="text-lg font-extrabold font-heading">{t("child.meezaCard.simulatePurchase")}</h3>
                  <button onClick={() => setShowBuy(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">✕</button>
                </div>
                <form onSubmit={handleBuy} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">{t("child.meezaCard.merchant")}</label>
                    <input
                      value={form.merchant}
                      onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                      placeholder={t("child.meezaCard.merchantPlaceholder")}
                      required
                      className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">{t("child.meezaCard.category")}</label>
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
                    <label className="text-xs font-semibold text-muted-foreground">{t("child.meezaCard.amount")}</label>
                    <input
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^\d.]/g, "") })}
                      placeholder="50"
                      inputMode="decimal"
                      required
                      className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold force-ltr text-start"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">{t("child.meezaCard.location")}</label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder={t("child.meezaCard.locationPlaceholder")}
                      className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-2xl text-white font-bold grad-navy shadow-premium active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />} {submitting ? t("child.meezaCard.processing") : t("child.meezaCard.payNow")}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">
                  {result.status === "completed" ? "✅" : result.status === "pending" ? "⏳" : "❌"}
                </div>
                <div className="font-extrabold font-heading text-lg">
                  {result.status === "completed" ? t("child.meezaCard.paymentApproved") : result.status === "pending" ? t("child.meezaCard.waitingParentApproval") : t("child.meezaCard.paymentDeclined")}
                </div>
                {result.decline_reason && <div className="text-sm text-muted-foreground mt-1">{result.decline_reason}</div>}
                {result.status === "pending" && <div className="text-sm text-muted-foreground mt-1">{t("child.meezaCard.overLimitNote")}</div>}
                <button onClick={() => setShowBuy(false)} className="mt-5 w-full h-12 rounded-2xl font-bold grad-navy text-white active:scale-95 transition-all">{t("child.meezaCard.done")}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}