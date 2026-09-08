import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Plus, Check, Clock, Coins } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill } from "@/components/fin/ui";
import { chores, choreTemplates, familyMembers, fmtEGP } from "@/lib/finData";

export default function Chores() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselect = location.state?.member;
  const [list, setList] = useState(chores);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState(preselect || "all");
  const [form, setForm] = useState({ title: "", assignee: familyMembers[0].name, reward: 10, icon: "🧹", category: "Home" });

  const filtered = filter === "all" ? list : list.filter((c) => c.assignee === filter);

  const addChore = () => {
    if (!form.title) return;
    setList((l) => [{ id: `ch${Date.now()}`, ...form, status: "pending", due: "Today" }, ...l]);
    setForm({ title: "", assignee: familyMembers[0].name, reward: 10, icon: "🧹", category: "Home" });
    setShowAdd(false);
  };

  const setStatus = (id, status) => setList((l) => l.map((c) => (c.id === id ? { ...c, status, approved: status === "completed" } : c)));

  const catColor = { Home: "#3b82f6", School: "#8b5cf6", Learning: "#00B894" };

  return (
    <div className="px-4 pt-12 pb-6">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Chores & Tasks</h1>
        <button onClick={() => setShowAdd(true)} className="ml-auto w-10 h-10 rounded-full grad-emerald text-white flex items-center justify-center shadow-glow-emerald active:scale-95">
          <Plus className="w-5 h-5" />
        </button>
      </FadeIn>

      <FadeIn delay={40}>
        <div className="grad-navy rounded-3xl p-4 text-white shadow-premium flex items-center gap-3">
          <div className="text-2xl">📋</div>
          <div className="flex-1">
            <div className="font-bold">Earn by doing</div>
            <div className="text-xs text-white/70">{list.filter((c) => c.status === "pending").length} pending · {fmtEGP(list.filter((c) => c.status === "pending").reduce((s, c) => s + c.reward, 0))} to reward</div>
          </div>
        </div>
      </FadeIn>

      {/* filter by child */}
      <FadeIn delay={80} className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setFilter("all")} className={`px-4 h-9 rounded-full text-xs font-bold whitespace-nowrap ${filter === "all" ? "grad-navy text-white" : "glass"}`}>All</button>
        {familyMembers.map((m) => (
          <button key={m.id} onClick={() => setFilter(m.name)} className={`px-4 h-9 rounded-full text-xs font-bold whitespace-nowrap ${filter === m.name ? "grad-navy text-white" : "glass"}`}>
            {m.avatar} {m.name}
          </button>
        ))}
      </FadeIn>

      <FadeIn delay={120} className="mt-4">
        <SectionTitle>Task Board</SectionTitle>
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <FadeIn key={c.id} delay={i * 40}>
              <GlassCard className={c.status === "completed" ? "opacity-70" : ""}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${catColor[c.category]}18` }}>{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{c.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>👤 {c.assignee}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.due}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold font-heading text-amber-600 flex items-center gap-1 justify-end"><Coins className="w-3.5 h-3.5" /> {c.reward}</div>
                    <Pill color={c.status === "completed" ? "#00B894" : "#FFC857"} className="text-[10px] py-0 mt-0.5">{c.status}</Pill>
                  </div>
                </div>
                {c.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setStatus(c.id, "completed")} className="flex-1 h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-1 text-white grad-emerald active:scale-95 transition-all">
                      <Check className="w-4 h-4" /> Mark Done & Pay
                    </button>
                  </div>
                )}
                {c.status === "completed" && <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Reward paid to {c.assignee}</div>}
              </GlassCard>
            </FadeIn>
          ))}
          {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No tasks yet. Tap + to assign one.</div>}
        </div>
      </FadeIn>

      {/* templates */}
      <FadeIn delay={160} className="mt-5">
        <SectionTitle>Quick Templates</SectionTitle>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {choreTemplates.map((t) => (
            <button key={t.title} onClick={() => { setForm({ ...form, title: t.title, reward: t.reward, icon: t.icon, category: t.category }); setShowAdd(true); }} className="glass rounded-2xl p-3 min-w-[120px] text-left active:scale-95 transition-all">
              <div className="text-2xl">{t.icon}</div>
              <div className="text-xs font-bold mt-1 leading-tight">{t.title}</div>
              <div className="text-[10px] text-amber-600 font-semibold mt-0.5">+{t.reward} coins</div>
            </button>
          ))}
        </div>
      </FadeIn>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="glass rounded-3xl p-5 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold font-heading">Assign a Chore</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Task Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Clean the kitchen" className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Assign To</label>
                <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold">
                  {familyMembers.map((m) => <option key={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Reward (coins)</label>
                  <input type="number" value={form.reward} onChange={(e) => setForm({ ...form, reward: Number(e.target.value) })} className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold">
                    <option>Home</option><option>School</option><option>Learning</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 text-2xl">
                {["🧹", "📚", "🍽️", "🌱", "🚗", "🐕"].map((ic) => (
                  <button key={ic} onClick={() => setForm({ ...form, icon: ic })} className={`w-11 h-11 rounded-xl flex items-center justify-center ${form.icon === ic ? "bg-emerald-100 ring-2 ring-emerald-400" : "bg-black/5"}`}>{ic}</button>
                ))}
              </div>
              <button onClick={addChore} className="w-full h-12 rounded-2xl text-white font-bold grad-emerald shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Assign Chore
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}