import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Plus, Check, X, Clock, Coins } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill } from "@/components/fin/ui";
import { choreTemplates, fmtEGP } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { createMission, getFamilyMissions, reviewMission } from "@/lib/finApi";

const catColor = { Home: "#3b82f6", School: "#8b5cf6", Learning: "#00B894" };

const statusMeta = {
  pending: { label: "Waiting for child", color: "#94a3b8" },
  submitted: { label: "Needs Your Review", color: "#FFC857" },
  approved: { label: "Paid", color: "#00B894" },
  rejected: { label: "Rejected", color: "#ef4444" },
};

export default function Chores() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselect = location.state?.member;
  const { getFamilyChildren } = useAuth();

  const [children, setChildren] = useState([]); // [{id, full_name}]
  const [list, setList] = useState([]); // missions (kind=chore)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", assignedToId: "", reward: 10, icon: "🧹", category: "Home" });
  const [filter, setFilter] = useState(preselect || "all");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [childrenRes, missions] = await Promise.all([
        getFamilyChildren(),
        getFamilyMissions(), // كل الـ missions (chores + redemptions) — بنفلتر chores بس تحت
      ]);
      setChildren(childrenRes.children);
      setList(missions.filter((m) => m.kind === "chore"));
      setForm((f) => ({ ...f, assignedToId: f.assignedToId || childrenRes.children[0]?.id || "" }));
    } catch (err) {
      setError(err.message || "تعذر تحميل المهام");
    } finally {
      setLoading(false);
    }
  }, [getFamilyChildren]);

  useEffect(() => {
    load();
  }, [load]);

  const nameById = (id) => children.find((c) => c.id === id)?.full_name || "—";

  const filtered = filter === "all" ? list : list.filter((c) => c.assigned_to_id === filter);

  const addChore = async () => {
    if (!form.title.trim() || !form.assignedToId) return;
    try {
      await createMission({
        assigned_to_id: form.assignedToId,
        title: form.title.trim(),
        reward: Number(form.reward),
        icon: form.icon,
        category: form.category,
        due_label: "Today",
      });
      setForm({ title: "", assignedToId: children[0]?.id || "", reward: 10, icon: "🧹", category: "Home" });
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(err.message || "حصل خطأ وإحنا بنضيف المهمة");
    }
  };

  const decide = async (missionId, decision) => {
    setBusyId(missionId);
    try {
      await reviewMission(missionId, decision);
      await load();
    } catch (err) {
      setError(err.message || "حصل خطأ في الموافقة");
    } finally {
      setBusyId(null);
    }
  };

  const pendingReward = list.filter((c) => c.status === "pending" || c.status === "submitted").reduce((s, c) => s + c.reward, 0);
  const pendingCount = list.filter((c) => c.status !== "approved" && c.status !== "rejected").length;

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
            <div className="text-xs text-white/70">{pendingCount} pending · {fmtEGP(pendingReward)} to reward</div>
          </div>
        </div>
      </FadeIn>

      {error && (
        <FadeIn delay={60} className="mt-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        </FadeIn>
      )}

      {/* filter by child */}
      <FadeIn delay={80} className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setFilter("all")} className={`px-4 h-9 rounded-full text-xs font-bold whitespace-nowrap ${filter === "all" ? "grad-navy text-white" : "glass"}`}>All</button>
        {children.map((m) => (
          <button key={m.id} onClick={() => setFilter(m.id)} className={`px-4 h-9 rounded-full text-xs font-bold whitespace-nowrap ${filter === m.id ? "grad-navy text-white" : "glass"}`}>
            {m.full_name}
          </button>
        ))}
      </FadeIn>

      <FadeIn delay={120} className="mt-4">
        <SectionTitle>Task Board</SectionTitle>
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-8">...بنحمّل</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c, i) => {
              const meta = statusMeta[c.status];
              return (
                <FadeIn key={c.id} delay={i * 40}>
                  <GlassCard className={c.status === "approved" || c.status === "rejected" ? "opacity-70" : ""}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${catColor[c.category] || "#3b82f6"}18` }}>{c.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">{c.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>👤 {nameById(c.assigned_to_id)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.due_label || "—"}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold font-heading text-amber-600 flex items-center gap-1 justify-end"><Coins className="w-3.5 h-3.5" /> {c.reward}</div>
                        <Pill color={meta.color} className="text-[10px] py-0 mt-0.5">{meta.label}</Pill>
                      </div>
                    </div>

                    {c.status === "submitted" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          disabled={busyId === c.id}
                          onClick={() => decide(c.id, "approve")}
                          className="flex-1 h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-1 text-white grad-emerald active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" /> Approve & Pay
                        </button>
                        <button
                          disabled={busyId === c.id}
                          onClick={() => decide(c.id, "reject")}
                          className="h-10 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-1 bg-red-50 text-red-600 active:scale-95 transition-all disabled:opacity-50"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                    {c.status === "approved" && <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Reward paid to {nameById(c.assigned_to_id)}</div>}
                  </GlassCard>
                </FadeIn>
              );
            })}
            {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No tasks yet. Tap + to assign one.</div>}
          </div>
        )}
      </FadeIn>

      {/* templates */}
      <FadeIn delay={160} className="mt-5">
        <SectionTitle>Quick Templates</SectionTitle>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {choreTemplates.map((t) => (
            <button key={t.title} onClick={() => { setForm((f) => ({ ...f, title: t.title, reward: t.reward, icon: t.icon, category: t.category })); setShowAdd(true); }} className="glass rounded-2xl p-3 min-w-[120px] text-left active:scale-95 transition-all">
              <div className="text-2xl">{t.icon}</div>
              <div className="text-xs font-bold mt-1 leading-tight">{t.title}</div>
              <div className="text-[10px] text-amber-600 font-semibold mt-0.5">+{t.reward} coins</div>
            </button>
          ))}
        </div>
      </FadeIn>

      {showAdd && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="glass rounded-3xl p-5 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold font-heading">Assign a Chore</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Task Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Clean the kitchen" className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Assign To</label>
                <select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} className="w-full h-12 mt-1 px-4 rounded-2xl bg-black/5 outline-none font-semibold">
                  {children.length === 0 && <option value="">No children yet</option>}
                  {children.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
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
              <button onClick={addChore} disabled={!children.length} className="w-full h-12 rounded-2xl text-white font-bold grad-emerald shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <Plus className="w-5 h-5" /> Assign Chore
              </button>
              {!children.length && <p className="text-center text-[11px] text-muted-foreground">Add a child first from Family Members.</p>}
            </div>
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}