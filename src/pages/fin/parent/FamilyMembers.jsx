import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, UserPlus, Wallet, CreditCard, Sliders, Trash2, Check } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill, ProgressRing } from "@/components/fin/ui";
import { familyMembers, fmtEGP } from "@/lib/finData";
import { Image } from "@/components/ui/image";

export default function FamilyMembers() {
  const navigate = useNavigate();
  const [members, setMembers] = useState(familyMembers);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", role: "Son", daily: 80 });

  const addChild = () => {
    if (!form.name || !form.age) return;
    const newM = {
      id: `m${Date.now()}`,
      name: form.name,
      age: Number(form.age),
      avatar: ["🦁", "🦊", "🐻", "🐱", "🐯", "🐰"][members.length % 6],
      role: form.role,
      balance: 0, savings: 0, financialScore: 50, scoreTrend: 0,
      cardStatus: "active", cardNumber: "5061 •••• •••• 0000", cardTheme: "blue",
      limits: { daily: Number(form.daily), weekly: Number(form.daily) * 5, monthly: Number(form.daily) * 15 },
      spent: { daily: 0, weekly: 0, monthly: 0 },
      blockedCategories: [],
      streak: 0, level: 1, xp: 0, coins: 0,
      weeklyTrend: [0, 0, 0, 0, 0, 0, 0], status: "online", joined: "Jul 2026",
    };
    setMembers((m) => [...m, newM]);
    setForm({ name: "", age: "", role: "Son", daily: 80 });
    setShowAdd(false);
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

      <FadeIn delay={40}>
        <div className="grad-navy rounded-3xl p-4 text-white shadow-premium flex items-center gap-3">
          <div className="text-2xl">👨‍👩‍👧‍👦</div>
          <div className="flex-1">
            <div className="text-lg font-bold">{members.length} Members</div>
            <div className="text-xs text-white/70">Total balance: {fmtEGP(members.reduce((s, m) => s + m.balance, 0))}</div>
          </div>
          <Pill className="bg-emerald-400/20 text-emerald-200">Avg Score {Math.round(members.reduce((s, m) => s + m.financialScore, 0) / members.length)}</Pill>
        </div>
      </FadeIn>

      <FadeIn delay={120} className="mt-4">
        <SectionTitle>Manage Each Member</SectionTitle>
        <div className="space-y-3">
          {members.map((m, i) => (
            <FadeIn key={m.id} delay={i * 50}>
              <GlassCard>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "#0F2D5214" }}>{m.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold flex items-center gap-2">{m.name} <Pill color={statusColor[m.cardStatus]} className="text-[10px] py-0">{statusLabel[m.cardStatus]}</Pill></div>
                    <div className="text-xs text-muted-foreground">{m.role} · Age {m.age} · Level {m.level}</div>
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center p-4" onClick={() => setShowAdd(false)}>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Age</label>
                  <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="10" className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold">
                    <option>Son</option><option>Daughter</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Daily Spending Limit (EGP)</label>
                <input type="number" value={form.daily} onChange={(e) => setForm({ ...form, daily: e.target.value })} className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold" />
              </div>
              <button onClick={addChild} className="w-full h-12 rounded-2xl text-white font-bold grad-emerald shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2">
                <Check className="w-5 h-5" /> Create Member Account
              </button>
              <p className="text-center text-[11px] text-muted-foreground">A virtual Meeza card will be auto-issued and linked to this account.</p>
            </div>
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}