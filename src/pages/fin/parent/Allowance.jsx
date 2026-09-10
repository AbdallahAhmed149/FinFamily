import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Send, Check } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle } from "@/components/fin/ui";
import { useAuth } from "@/lib/AuthContext";
import { getChildWallet, sendAllowance } from "@/lib/finApi";
import { allowanceTypes, fmtEGP } from "@/lib/finData";

const AVATARS = ["🦁", "🦊", "🐻", "🐱", "🐯", "🐰"];

export default function Allowance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getFamilyChildren } = useAuth();

  const [children, setChildren] = useState([]);
  const [activeId, setActiveId] = useState(location.state?.member || null);
  const [balances, setBalances] = useState({}); // { [childId]: balance }
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(0);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sent, setSent] = useState(false);

  const loadFamily = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { children: kids } = await getFamilyChildren();
      setChildren(kids);
      if (kids.length > 0) {
        const initialId = kids.some((k) => k.id === activeId) ? activeId : kids[0].id;
        setActiveId(initialId);
      }
      const wallets = await Promise.all(kids.map((k) => getChildWallet(k.id).catch(() => null)));
      const balanceMap = {};
      kids.forEach((k, i) => { balanceMap[k.id] = wallets[i]?.balance ?? 0; });
      setBalances(balanceMap);
    } catch (err) {
      setLoadError(err.message || "تعذر تحميل بيانات العيلة");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFamilyChildren]);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  const activeChild = children.find((c) => c.id === activeId);
  const activeBalance = activeId != null ? balances[activeId] ?? 0 : 0;

  const send = async () => {
    if (!activeId || !selected || amount <= 0) return;
    setSendError(null);
    setSending(true);
    try {
      const wallet = await sendAllowance(activeId, amount, selected.label);
      setBalances((b) => ({ ...b, [activeId]: wallet.balance }));
      setSent(true);
      setTimeout(() => { setSent(false); setSelected(null); setAmount(0); }, 2200);
    } catch (err) {
      setSendError(err.message || "حصل خطأ وإحنا بنبعت المصروف");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Allowance</h1>
      </FadeIn>

      {loadError && (
        <FadeIn className="mb-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{loadError}</div>
        </FadeIn>
      )}

      {!loading && children.length === 0 && !loadError && (
        <div className="text-center text-sm text-muted-foreground py-8">
          مفيش أطفال متضافين لسه — ضيف طفل الأول من صفحة Family Members.
        </div>
      )}

      {/* child tabs — زي ما هو موجود في SpendingLimits عشان نختار مين هياخد المصروف */}
      {children.length > 1 && (
        <FadeIn delay={20} className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {children.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`px-4 h-10 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 ${activeId === c.id ? "grad-navy text-white" : "glass"}`}
            >
              {AVATARS[i % AVATARS.length]} {c.full_name}
            </button>
          ))}
        </FadeIn>
      )}

      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-5 text-white shadow-premium flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-3xl shrink-0">
            {activeChild ? AVATARS[children.findIndex((c) => c.id === activeId) % AVATARS.length] : "👤"}
          </div>
          <div>
            <div className="text-sm text-white/70">Send to</div>
            <div className="text-lg font-bold">{loading ? "..." : activeChild?.full_name || "—"}</div>
            <div className="text-xs text-white/60">Balance: {loading ? "…" : fmtEGP(activeBalance)}</div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={120}>
        <SectionTitle>Allowance Type</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {allowanceTypes.map((a) => (
            <button
              key={a.id}
              onClick={() => { setSelected(a); setAmount(a.amount); }}
              className="glass rounded-2xl p-4 text-left shadow-premium transition-all active:scale-95"
              style={{ boxShadow: selected?.id === a.id ? `0 0 0 2px ${a.color}` : undefined }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: `${a.color}18`, color: a.color }}>
                <Send className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm">{a.label}</div>
              {a.amount > 0 && <div className="text-xs text-muted-foreground">{fmtEGP(a.amount)}</div>}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          مصروف يدوي فوري دلوقتي — الجدولة الدورية (يومي/أسبوعي تلقائي) لسه مش متاحة.
        </p>
      </FadeIn>

      {selected && (
        <FadeIn className="mt-4">
          <GlassCard>
            <div className="text-sm text-muted-foreground mb-2">Amount (EGP)</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 text-3xl font-extrabold font-heading bg-transparent outline-none"
              />
              <span className="text-sm font-semibold text-muted-foreground">EGP</span>
            </div>
            <div className="flex gap-2 mt-3">
              {[25, 50, 100].map((v) => (
                <button key={v} onClick={() => setAmount(v)} className="px-3 py-1.5 rounded-full bg-black/5 text-xs font-bold">+{v}</button>
              ))}
            </div>
          </GlassCard>
        </FadeIn>
      )}

      {sendError && (
        <FadeIn className="mt-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{sendError}</div>
        </FadeIn>
      )}

      {selected && (
        <FadeIn className="mt-4">
          <button
            onClick={send}
            disabled={sending || !activeId}
            className="w-full h-14 rounded-2xl text-white font-bold font-heading shadow-premium active:scale-[0.98] transition-all grad-emerald flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {sent ? (
              <><Check className="w-5 h-5" /> Sent to {activeChild?.full_name}! 🎉</>
            ) : (
              <><Send className="w-5 h-5" /> {sending ? "Sending..." : `Send ${amount > 0 ? fmtEGP(amount) : ""} to ${activeChild?.full_name || ""}`}</>
            )}
          </button>
        </FadeIn>
      )}

      {sent && (
        <FadeIn className="text-center mt-6">
          <div className="relative h-32 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="absolute text-2xl animate-float" style={{ left: `${30+i*5}%`, top: "20%", ["--tx"]: `${(i%2?1:-1)*30}px`, animationDelay: `${i*0.08}s` }}>🪙</span>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">Coins flying toward {activeChild?.full_name}... Balance updated!</div>
        </FadeIn>
      )}
      <div className="h-4" />
    </div>
  );
}