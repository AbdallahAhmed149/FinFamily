import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Shield, Lock, Check, AlertTriangle } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill, ProgressBar } from "@/components/fin/ui";
import { familyMembers, blockableCategories, fmtEGP } from "@/lib/finData";

export default function SpendingLimits() {
  const navigate = useNavigate();
  const location = useLocation();
  const initial = location.state?.member || familyMembers[0].id;
  const [activeId, setActiveId] = useState(initial);
  const [members, setMembers] = useState(familyMembers.map((m) => ({ ...m, limits: { ...m.limits }, blockedCategories: [...m.blockedCategories] })));
  const [saved, setSaved] = useState(false);

  const active = members.find((m) => m.id === activeId);

  const setLimit = (key, val) => {
    setMembers((ms) => ms.map((m) => (m.id === activeId ? { ...m, limits: { ...m.limits, [key]: Math.max(0, val) } } : m)));
  };
  const toggleBlock = (catName) => {
    setMembers((ms) => ms.map((m) => (m.id === activeId ? { ...m, blockedCategories: m.blockedCategories.includes(catName) ? m.blockedCategories.filter((c) => c !== catName) : [...m.blockedCategories, catName] } : m)));
  };
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  const periods = [
    { key: "daily", label: "Daily", icon: "☀️", spent: active.spent.daily, color: "#FFC857" },
    { key: "weekly", label: "Weekly", icon: "📅", spent: active.spent.weekly, color: "#00B894" },
    { key: "monthly", label: "Monthly", icon: "🗓️", spent: active.spent.monthly, color: "#0F2D52" },
  ];

  return (
    <div className="px-4 pt-12 pb-6">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Spending Limits</h1>
      </FadeIn>

      {/* member tabs */}
      <FadeIn delay={40} className="flex gap-2 overflow-x-auto no-scrollbar">
        {members.map((m) => (
          <button key={m.id} onClick={() => setActiveId(m.id)} className={`px-4 h-10 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 ${activeId === m.id ? "grad-navy text-white" : "glass"}`}>
            {m.avatar} {m.name}
          </button>
        ))}
      </FadeIn>

      {/* limit sliders */}
      <FadeIn delay={80} className="mt-4">
        <SectionTitle>Auto Spending Limits · {active.name}</SectionTitle>
        <div className="space-y-3">
          {periods.map((p) => {
            const limit = active.limits[p.key];
            const pct = limit > 0 ? Math.min(100, (p.spent / limit) * 100) : 0;
            const over = p.spent > limit;
            return (
              <GlassCard key={p.key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.icon}</span>
                    <span className="font-bold text-sm">{p.label} Limit</span>
                  </div>
                  {over && <Pill color="#ef4444" className="text-[10px] py-0"><AlertTriangle className="w-3 h-3" /> Exceeded</Pill>}
                </div>
                <div className="flex items-center gap-3">
                  <input type="range" min="0" max={p.key === "monthly" ? 3000 : p.key === "weekly" ? 800 : 200} step="5" value={limit} onChange={(e) => setLimit(p.key, Number(e.target.value))} className="flex-1 accent-emerald-500" />
                  <div className="text-right min-w-[90px]">
                    <div className="font-extrabold font-heading">{fmtEGP(limit)}</div>
                    <div className="text-[10px] text-muted-foreground">spent {fmtEGP(p.spent)}</div>
                  </div>
                </div>
                <ProgressBar value={p.spent} max={limit || 1} color={over ? "#ef4444" : p.color} className="mt-2" />
                <div className="text-[11px] text-muted-foreground mt-1">Card auto-freezes if {p.label.toLowerCase()} limit is exceeded.</div>
              </GlassCard>
            );
          })}
        </div>
      </FadeIn>

      {/* category blocking */}
      <FadeIn delay={120} className="mt-5">
        <SectionTitle>Blocked Categories</SectionTitle>
        <div className="glass rounded-2xl p-3 mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-4 h-4 text-red-500" /> Block categories so {active.name} can't spend on them at all.
        </div>
        <div className="grid grid-cols-2 gap-3">
          {blockableCategories.map((c) => {
            const blocked = active.blockedCategories.includes(c.name);
            return (
              <button key={c.id} onClick={() => toggleBlock(c.name)} className={`rounded-2xl p-4 text-left transition-all active:scale-95 ${blocked ? "ring-2 ring-red-400" : "glass"}`} style={{ background: blocked ? "#ef44440d" : undefined }}>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${c.color}18` }}>{c.icon}</div>
                  {blocked ? <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center"><Lock className="w-3.5 h-3.5" /></div> : <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-500" /></div>}
                </div>
                <div className="font-bold text-sm mt-2">{c.name}</div>
                <div className="text-[10px] text-muted-foreground">{blocked ? "Blocked" : "Allowed"}</div>
              </button>
            );
          })}
        </div>
      </FadeIn>

      <FadeIn delay={160} className="mt-5">
        <button onClick={save} className="w-full h-13 py-3.5 rounded-2xl text-white font-bold grad-navy shadow-premium active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          {saved ? <><Check className="w-5 h-5" /> Limits Saved for {active.name}</> : <><Shield className="w-5 h-5" /> Save Limits & Blocks</>}
        </button>
      </FadeIn>
      <div className="h-4" />
    </div>
  );
}