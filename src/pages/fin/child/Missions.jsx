import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Check, Clock, Send, Award } from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import MissionComplete from "@/components/fin/MissionComplete";
import { realLifeMissions, child } from "@/lib/finData";

const statusMeta = {
  available: { label: "Available", color: "#3b82f6", icon: Plus },
  "in-progress": { label: "In Progress", color: "#FFC857", icon: Clock },
  "waiting-approval": { label: "Waiting for Parent", color: "#f97316", icon: Send },
  approved: { label: "Approved", color: "#00B894", icon: Check },
  completed: { label: "Completed", color: "#00B894", icon: Award },
  rewarded: { label: "Rewarded", color: "#00B894", icon: Award },
};

export default function Missions() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState(realLifeMissions);
  const [showCreate, setShowCreate] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [done, setDone] = useState(null);

  const startMission = (id) => {
    setMissions((m) => m.map((x) => (x.id === id ? { ...x, status: "in-progress", submission: x.submission || "Started!" } : x)));
  };

  const submitMission = (id) => {
    setMissions((m) => m.map((x) => (x.id === id ? { ...x, status: "waiting-approval", submission: newDesc || x.submission || "I did it!" } : x)));
    setNewDesc("");
    setDone({ xp: 100, badge: { name: "Goal Getter", icon: "🎯", desc: "Submitted a real-life mission", color: "#FFC857" }, nextMission: "Wait for parent approval" });
  };

  const createMission = () => {
    if (!newDesc.trim()) return;
    const m = { id: `rlm${Date.now()}`, title: "Custom Saving Mission", child: "Lotfy", world: "Saving Hero", desc: newDesc, xp: 100, status: "in-progress", icon: "🐷", color: "#00B894", date: "Today", submission: "Just started" };
    setMissions((prev) => [m, ...prev]);
    setNewDesc("");
    setShowCreate(false);
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold font-heading">Real-Life Missions</h1>
          <div className="text-xs text-muted-foreground">Practice what you learn · Earn XP with parent approval</div>
        </div>
        <button onClick={() => setShowCreate((s) => !s)} className="ml-auto w-10 h-10 rounded-full grad-navy flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </FadeIn>

      {showCreate && (
        <FadeIn className="glass rounded-2xl p-4 shadow-premium mb-4 animate-pop">
          <div className="text-sm font-semibold mb-2">Create a Saving Mission</div>
          <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="e.g. Save 20 EGP from my allowance this week" className="w-full rounded-xl p-3 text-sm bg-black/5 outline-none min-h-[80px]" />
          <button onClick={createMission} className="w-full h-11 mt-2 rounded-xl text-white font-bold text-sm grad-emerald">Create Mission</button>
        </FadeIn>
      )}

      <div className="space-y-3">
        {missions.map((m, idx) => {
          const meta = statusMeta[m.status];
          const Icon = meta.icon;
          return (
            <FadeIn key={m.id} delay={idx * 50}>
              <GlassCard>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${m.color}18` }}>{m.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Pill color={meta.color}><Icon className="w-3 h-3" /> {meta.label}</Pill>
                      <Pill color="#FFC857">+{m.xp} XP</Pill>
                    </div>
                    {m.submission && m.status !== "available" && (
                      <div className="text-[11px] text-muted-foreground mt-2 rounded-lg p-2 bg-black/5">📝 {m.submission}</div>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  {m.status === "available" && (
                    <button onClick={() => startMission(m.id)} className="w-full h-10 rounded-xl text-white font-bold text-sm" style={{ background: m.color }}>Start Mission</button>
                  )}
                  {m.status === "in-progress" && (
                    <button onClick={() => submitMission(m.id)} className="w-full h-10 rounded-xl text-white font-bold text-sm grad-navy flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Submit for Parent Approval</button>
                  )}
                  {m.status === "waiting-approval" && (
                    <div className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: "#f9731615", color: "#f97316" }}><Clock className="w-4 h-4" /> Waiting for parent to approve</div>
                  )}
                  {m.status === "approved" && (
                    <div className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: "#00B89415", color: "#00B894" }}><Check className="w-4 h-4" /> Approved by {m.approvedBy || "Parent"} · +{m.xp} XP!</div>
                  )}
                </div>
              </GlassCard>
            </FadeIn>
          );
        })}
      </div>
      <div className="h-4" />

      {done && (
        <div className="fixed inset-0 z-[70] bg-background overflow-y-auto">
          <MissionComplete xp={done.xp} badge={done.badge} streak={child.streak + 1} nextMission={done.nextMission} onClose={() => setDone(null)} />
        </div>
      )}
    </div>
  );
}