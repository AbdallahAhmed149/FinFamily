import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, UserPlus, Wallet, CreditCard, Sliders, Check, Copy, CopyCheck } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill, ProgressRing } from "@/components/fin/ui";
import { fmtEGP } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { getChildWallet } from "@/lib/finApi";

const AVATARS = ["🦁", "🦊", "🐻", "🐱", "🐯", "🐰"];

export default function FamilyMembers() {
  const navigate = useNavigate();
  const { getFamilyCode, getFamilyChildren, createChild } = useAuth();

  const [familyCode, setFamilyCode] = useState(null);
  const [familyName, setFamilyName] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", pin: "" });
  const [addError, setAddError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // xp/level/streak بقوا حقيقيين من /auth/family/children (ChildSummary بترجعهم دلوقتي).
  // الرصيد/الادخار/حالة الكارت حقيقيين من الـ Wallet.
  // financialScore بقى حقيقي دلوقتي — بيتحسب Live في الباك اند (services/scoring.py)
  // من: نسبة الادخار + انضباط تنفيذ المهام + streak + الالتزام بحدود الصرف.
  const decorate = (child, index, wallet) => ({
    id: child.id,
    name: child.full_name,
    avatar: AVATARS[index % AVATARS.length],
    balance: wallet?.balance ?? 0,
    savings: wallet?.savings_balance ?? 0,
    financialScore: wallet?.financial_score ?? 50,
    cardStatus: wallet?.card_status ?? "active",
    streak: child.streak ?? 0,
    level: child.level ?? 1,
  });

  const loadFamily = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [codeRes, childrenRes] = await Promise.all([getFamilyCode(), getFamilyChildren()]);
      setFamilyCode(codeRes.family_code);
      setFamilyName(codeRes.family_name);

      const wallets = await Promise.all(
        childrenRes.children.map((c) => getChildWallet(c.id).catch(() => null))
      );
      setMembers(childrenRes.children.map((c, i) => decorate(c, i, wallets[i])));
    } catch (err) {
      setLoadError(err.message || "تعذر تحميل بيانات العيلة");
    } finally {
      setLoading(false);
    }
  }, [getFamilyCode, getFamilyChildren]);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  const copyCode = async () => {
    if (!familyCode) return;
    try {
      await navigator.clipboard.writeText(familyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API ممكن ترفض (متصفح قديم/http) — مش حاجة نوقف عليها
    }
  };

  const handleAddChild = async () => {
    setAddError(null);
    if (!form.name.trim()) {
      setAddError("اكتب اسم الطفل");
      return;
    }
    if (!/^\d{6}$/.test(form.pin)) {
      setAddError("الـ PIN لازم يكون 6 أرقام بالظبط");
      return;
    }
    setSubmitting(true);
    try {
      await createChild(form.name.trim(), form.pin);
      setForm({ name: "", pin: "" });
      setShowAdd(false);
      await loadFamily(); // نجيب القايمة المحدّثة من السيرفر بدل ما نضيفه محلي بس
    } catch (err) {
      setAddError(err.message || "حصل خطأ وإحنا بنضيف الطفل");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = { active: "#00B894", frozen: "#3b82f6", deactivated: "#94a3b8" };
  const statusLabel = { active: "Active", frozen: "Frozen", deactivated: "Deactivated" };

  return (
    <div className="px-4 pt-12 pb-6">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Family Members</h1>
        <button onClick={() => setShowAdd(true)} className="ml-auto w-10 h-10 rounded-full grad-emerald text-white flex items-center justify-center shadow-glow-emerald active:scale-95 transition-all">
          <UserPlus className="w-5 h-5" />
        </button>
      </FadeIn>

      {/* كود العيلة — ده اللي الطفل هيستخدمه في صفحة Child Login */}
      <FadeIn delay={20}>
        <div className="grad-navy rounded-3xl p-4 text-white shadow-premium">
          <div className="text-xs text-white/70 mb-1">Family Code — Share with your kids</div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold tracking-[0.3em] font-heading flex-1">
              {loading ? "······" : familyCode || "—"}
            </div>
            <button
              onClick={copyCode}
              disabled={!familyCode}
              className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
            >
              {copied ? <CopyCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          {familyName && <div className="text-xs text-white/60 mt-1">{familyName}</div>}
        </div>
      </FadeIn>

      {loadError && (
        <FadeIn delay={40} className="mt-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{loadError}</div>
        </FadeIn>
      )}

      <FadeIn delay={40} className="mt-4">
        <div className="grad-emerald/10 rounded-3xl p-4 flex items-center gap-3" style={{ background: "#00B89414" }}>
          <div className="text-2xl">👨‍👩‍👧‍👦</div>
          <div className="flex-1">
            <div className="text-lg font-bold">{members.length} {members.length === 1 ? "Child" : "Children"}</div>
            <div className="text-xs text-muted-foreground">Add a child, then share the code above so they can log in.</div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={120} className="mt-4">
        <SectionTitle>Manage Each Member</SectionTitle>

        {!loading && members.length === 0 && !loadError && (
          <div className="text-center text-sm text-muted-foreground py-8">
            مفيش أطفال متضافين لسه — دوس على <UserPlus className="w-3.5 h-3.5 inline" /> فوق عشان تضيف أول واحد.
          </div>
        )}

        <div className="space-y-3">
          {members.map((m, i) => (
            <FadeIn key={m.id} delay={i * 50}>
              <GlassCard>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "#0F2D5214" }}>{m.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold flex items-center gap-2">{m.name} <Pill color={statusColor[m.cardStatus]} className="text-[10px] py-0">{statusLabel[m.cardStatus]}</Pill></div>
                    <div className="text-xs text-muted-foreground">Level {m.level}</div>
                  </div>
                  <ProgressRing value={m.financialScore} size={44} stroke={5} color={m.financialScore >= 75 ? "#00B894" : "#FFC857"}>
                    <span className="text-[11px] font-bold">{m.financialScore}</span>
                  </ProgressRing>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="rounded-xl bg-black/5 py-2">
                    <div className="text-sm font-bold">{fmtEGP(m.balance)}</div>
                    <div className="text-[10px] text-muted-foreground">Wallet</div>
                  </div>
                  <div className="rounded-xl bg-black/5 py-2">
                    <div className="text-sm font-bold">{fmtEGP(m.savings)}</div>
                    <div className="text-[10px] text-muted-foreground">Savings</div>
                  </div>
                  <div className="rounded-xl bg-black/5 py-2">
                    <div className="text-sm font-bold">{m.streak}🔥</div>
                    <div className="text-[10px] text-muted-foreground">Streak</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button onClick={() => navigate("/parent/limits", { state: { member: m.id } })} className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1" style={{ background: "#3b82f618", color: "#3b82f6" }}>
                    <Sliders className="w-3.5 h-3.5" /> Limits
                  </button>
                  <button onClick={() => navigate("/parent/cards", { state: { member: m.id } })} className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1" style={{ background: "#0F2D5218", color: "#0F2D52" }}>
                    <CreditCard className="w-3.5 h-3.5" /> Card
                  </button>
                  <button onClick={() => navigate("/parent/chores", { state: { member: m.id } })} className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1" style={{ background: "#FFC85718", color: "#b8860b" }}>
                    <Wallet className="w-3.5 h-3.5" /> Chores
                  </button>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      {/* add child modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center p-4" onClick={() => !submitting && setShowAdd(false)}>
          <div className="glass rounded-3xl p-5 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold font-heading">Add a Child</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Salma Hassan"
                  className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">PIN (6 digits) — the child uses this to log in</label>
                <input
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  placeholder="123456"
                  inputMode="numeric"
                  className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold tracking-[0.3em]"
                />
              </div>

              {addError && <p className="text-xs text-red-600 font-semibold">{addError}</p>}

              <button
                onClick={handleAddChild}
                disabled={submitting}
                className="w-full h-12 rounded-2xl text-white font-bold grad-emerald shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Check className="w-5 h-5" /> {submitting ? "Creating..." : "Create Member Account"}
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                Spending limits, cards, and balances will be set up once wallets are wired in — for now this creates their login.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}