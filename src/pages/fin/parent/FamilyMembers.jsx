import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, UserPlus, Wallet, CreditCard, Sliders, Check, Copy, CopyCheck, Plus, Landmark } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill, ProgressRing } from "@/components/fin/ui";
import { fmtEGP } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { getChildWallet } from "@/lib/finApi";
import { base44 } from "@/api/base44Client";

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

  // ─── Co-Partner state ───────────────────────────────────────────────────
  const [partners, setPartners] = useState([]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null); // null = add new
  const [partnerForm, setPartnerForm] = useState({ full_name: "", email: "", password: "" });
  const [partnerMsg, setPartnerMsg] = useState("");
  const [partnerErr, setPartnerErr] = useState("");
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);

  const loadPartners = useCallback(async () => {
    try { setPartners(await base44.get("/auth/partners")); } catch { /* silent */ }
  }, []);

  const openAddPartner = () => {
    setEditingPartner(null);
    setPartnerForm({ full_name: "", email: "", password: "" });
    setPartnerMsg(""); setPartnerErr("");
    setShowPartnerModal(true);
  };

  const openEditPartner = (p) => {
    setEditingPartner(p);
    setPartnerForm({ full_name: p.full_name, email: p.email || "", password: "" });
    setPartnerMsg(""); setPartnerErr("");
    setShowPartnerModal(true);
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    setPartnerMsg(""); setPartnerErr("");
    setPartnerSubmitting(true);
    try {
      if (editingPartner) {
        const body = { full_name: partnerForm.full_name, email: partnerForm.email };
        if (partnerForm.password) body.password = partnerForm.password;
        await base44.patch(`/auth/partners/${editingPartner.id}`, body);
        setPartnerMsg("✅ Partner updated!");
      } else {
        const res = await base44.post("/auth/partners/invite", partnerForm);
        setPartnerMsg(`✅ ${res.full_name} added as Co-Partner!`);
      }
      setPartnerForm({ full_name: "", email: "", password: "" });
      setShowPartnerModal(false);
      loadPartners();
    } catch (err) {
      setPartnerErr(err.message || "Failed.");
    } finally {
      setPartnerSubmitting(false);
    }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm("Remove this partner from the family?")) return;
    try {
      await base44.delete(`/auth/partners/${id}`);
    } catch (err) {
      setPartnerErr(err.message || "Failed to remove partner.");
      return;
    }
    loadPartners();
  };


  // ─── Funding Sources state ───────────────────────────────────────────────
  const [sources, setSources] = useState([]);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [sourceForm, setSourceForm] = useState({ bank_name: "", account_last4: "", is_primary: false });
  const [sourceSubmitting, setSourceSubmitting] = useState(false);
  const [sourceErr, setSourceErr] = useState("");

  const loadSources = useCallback(async () => {
    try {
      const data = await base44.get("/funding-sources");
      setSources(data);
    } catch { /* silent — user might not have any yet */ }
  }, []);

  const handleAddSource = async (e) => {
    e.preventDefault();
    setSourceErr("");
    if (sourceForm.account_last4.length !== 4) { setSourceErr("Last 4 digits must be exactly 4 numbers."); return; }
    setSourceSubmitting(true);
    try {
      await base44.post("/funding-sources", sourceForm);
      setSourceForm({ bank_name: "", account_last4: "", is_primary: false });
      setShowSourceModal(false);
      loadSources();
    } catch (err) {
      setSourceErr(err.message || "Failed to add card.");
    } finally {
      setSourceSubmitting(false);
    }
  };

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

  useEffect(() => { loadSources(); loadPartners(); }, [loadSources, loadPartners]);

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

                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  <button onClick={() => navigate("/parent/limits", { state: { member: m.id } })} className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1" style={{ background: "#3b82f618", color: "#3b82f6" }}>
                    <Sliders className="w-3.5 h-3.5" /> Limits
                  </button>
                  <button onClick={() => navigate("/parent/cards", { state: { member: m.id } })} className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1" style={{ background: "#0F2D5218", color: "#0F2D52" }}>
                    <CreditCard className="w-3.5 h-3.5" /> Card
                  </button>
                  <button onClick={() => navigate("/parent/chores", { state: { member: m.id } })} className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1" style={{ background: "#FFC85718", color: "#b8860b" }}>
                    <Wallet className="w-3.5 h-3.5" /> Chores
                  </button>
                  <button
                    onClick={async () => {
                      const pin = window.prompt(`New 6-digit PIN for ${m.name}:`);
                      if (!pin || !/^\d{6}$/.test(pin)) { alert("PIN must be exactly 6 digits."); return; }
                      try { await base44.patch(`/auth/children/${m.id}/pin`, { new_pin: pin }); alert("PIN reset successfully!"); }
                      catch (err) { alert(err.message || "Failed to reset PIN"); }
                    }}
                    className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1" style={{ background: "#ef444418", color: "#ef4444" }}
                  >
                    🔑 PIN
                  </button>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      {/* ── Co-Partner Section ─────────────────────────────────────── */}
      <FadeIn delay={160} className="mt-6">
        <SectionTitle>Family Co-Partners ({partners.length}/3)</SectionTitle>
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] text-muted-foreground">Max 3 parents per family workspace</div>
            <button
              onClick={openAddPartner}
              className="h-9 px-4 rounded-2xl text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Partner
            </button>
          </div>
          <div className="space-y-2">
            {partners.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl px-3 py-2" style={{ background: "#8b5cf608" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: "#8b5cf618" }}>👤</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{p.full_name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{p.email}</div>
                </div>
                <button onClick={() => openEditPartner(p)} className="w-8 h-8 rounded-xl flex items-center justify-center text-xs" style={{ background: "#3b82f618", color: "#3b82f6" }} title="Edit">✏️</button>
                <button onClick={() => handleDeletePartner(p.id)} className="w-8 h-8 rounded-xl flex items-center justify-center text-xs" style={{ background: "#ef444418", color: "#ef4444" }} title="Remove">🗑️</button>
              </div>
            ))}
            {partners.length === 0 && <div className="text-center text-xs text-muted-foreground py-3">No partners yet.</div>}
          </div>
        </GlassCard>
      </FadeIn>

      {/* ── Funding Sources Section ────────────────────────────────── */}
      <FadeIn delay={200} className="mt-4">
        <SectionTitle>Bank Cards / Funding Sources</SectionTitle>
        <GlassCard>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: "#0F2D5218" }}>
              <Landmark className="w-5 h-5" style={{ color: "#0F2D52" }} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">Linked Bank Accounts</div>
              <div className="text-[11px] text-muted-foreground">Primary funding source for allowances</div>
            </div>
            <button
              onClick={() => { setShowSourceModal(true); setSourceErr(""); }}
              className="h-9 px-4 rounded-2xl text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg,#0F2D52,#1e3a6e)" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Card
            </button>
          </div>

          {sources.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-3">No funding sources yet — add your first bank card above.</div>
          ) : (
            <div className="space-y-2 mt-1">
              {sources.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-2xl px-3 py-2" style={{ background: "#0F2D520A" }}>
                  <CreditCard className="w-4 h-4 opacity-50" />
                  <div className="flex-1">
                    <div className="text-sm font-bold">{s.bank_name}</div>
                    <div className="text-[11px] text-muted-foreground">•••• {s.account_last4}</div>
                  </div>
                  {s.is_primary && <Pill color="#00B894" className="text-[10px] py-0">Primary</Pill>}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </FadeIn>

      {/* ── Add Child Modal ────────────────────────────────────────── */}
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
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Salma Hassan" className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">PIN (6 digits) — the child uses this to log in</label>
                <input value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="123456" inputMode="numeric" className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold tracking-[0.3em]" />
              </div>
              {addError && <p className="text-xs text-red-600 font-semibold">{addError}</p>}
              <button onClick={handleAddChild} disabled={submitting} className="w-full h-12 rounded-2xl text-white font-bold grad-emerald shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                <Check className="w-5 h-5" /> {submitting ? "Creating..." : "Create Member Account"}
              </button>
              <p className="text-center text-[11px] text-muted-foreground">Spending limits, cards, and balances will be set up once wallets are wired in — for now this creates their login.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Co-Partner Modal ─────────────────────────────── */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center p-4" onClick={() => !partnerSubmitting && setShowPartnerModal(false)}>
          <div className="glass rounded-3xl p-5 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold font-heading">{editingPartner ? "Edit Partner" : "Add Co-Partner"}</h3>
              <button onClick={() => setShowPartnerModal(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">✕</button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {editingPartner ? "Update name, email or password. Leave password blank to keep it unchanged." : "The co-partner will get their own login. Max 3 partners per family."}
            </p>
            <form onSubmit={handleAddPartner} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <input required value={partnerForm.full_name} onChange={(e) => setPartnerForm({ ...partnerForm, full_name: e.target.value })} placeholder="e.g. Nour Hassan" className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email</label>
                <input required={!editingPartner} type="email" value={partnerForm.email} onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })} placeholder="partner@email.com" className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  {editingPartner ? "New Password (leave blank to keep current)" : "Password (min 8 chars)"}
                </label>
                <input required={!editingPartner} type="password" minLength={editingPartner ? 0 : 8} value={partnerForm.password} onChange={(e) => setPartnerForm({ ...partnerForm, password: e.target.value })} placeholder="••••••••" className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold" />
              </div>
              {partnerErr && <p className="text-xs text-red-600 font-semibold">{partnerErr}</p>}
              {partnerMsg && <p className="text-xs text-emerald-600 font-semibold">{partnerMsg}</p>}
              <button type="submit" disabled={partnerSubmitting} className="w-full h-12 rounded-2xl text-white font-bold active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}>
                <Check className="w-5 h-5" /> {partnerSubmitting ? (editingPartner ? "Saving..." : "Adding...") : (editingPartner ? "Save Changes" : "Add Co-Partner")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Funding Source Modal ───────────────────────────────── */}
      {showSourceModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center p-4" onClick={() => !sourceSubmitting && setShowSourceModal(false)}>
          <div className="glass rounded-3xl p-5 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold font-heading">Link Bank Card</h3>
              <button onClick={() => setShowSourceModal(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">✕</button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Add the bank or card details used to fund children's wallets. You can add multiple cards.</p>
            <form onSubmit={handleAddSource} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Bank / Card Name</label>
                <input required value={sourceForm.bank_name} onChange={(e) => setSourceForm({ ...sourceForm, bank_name: e.target.value })} placeholder="e.g. CIB, NBE, Vodafone Cash" className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Last 4 Digits</label>
                <input required value={sourceForm.account_last4} onChange={(e) => setSourceForm({ ...sourceForm, account_last4: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="1234" inputMode="numeric" maxLength={4} className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold tracking-[0.3em]" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPrimary" checked={sourceForm.is_primary} onChange={(e) => setSourceForm({ ...sourceForm, is_primary: e.target.checked })} className="w-4 h-4 rounded" />
                <label htmlFor="isPrimary" className="text-xs font-semibold text-muted-foreground">Set as primary funding source</label>
              </div>
              {sourceErr && <p className="text-xs text-red-600 font-semibold">{sourceErr}</p>}
              <button type="submit" disabled={sourceSubmitting} className="w-full h-12 rounded-2xl text-white font-bold active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "linear-gradient(135deg,#0F2D52,#1e3a6e)" }}>
                <CreditCard className="w-5 h-5" /> {sourceSubmitting ? "Linking..." : "Link Card"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}