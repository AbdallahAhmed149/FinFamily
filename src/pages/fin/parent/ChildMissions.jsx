import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, X, RotateCcw, Clock, Award } from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { realLifeMissions, PARENT_IMAGE } from "@/lib/finData";
import { Image } from "@/components/ui/image";

const statusMeta = {
  available: { label: "Available", color: "#3b82f6" },
  "in-progress": { label: "In Progress", color: "#FFC857" },
  "waiting-approval": { label: "Needs Approval", color: "#f97316" },
  approved: { label: "Approved", color: "#00B894" },
  completed: { label: "Completed", color: "#00B894" },
  rewarded: { label: "Rewarded", color: "#00B894" },
};

export default function ChildMissions() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState(realLifeMissions);

  const approve = (id) => setMissions((m) => m.map((x) => (x.id === id ? { ...x, status: "approved", approvedBy: "Dad" } : x)));
  const reject = (id) => setMissions((m) => m.map((x) => (x.id === id ? { ...x, status: "in-progress", submission: "Please try again" } : x)));

  const pending = missions.filter((m) => m.status === "waiting-approval").length;

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold font-heading">Child Missions</h1>
          <div className="text-xs text-muted-foreground">Approve real-life missions · Reward XP</div>
        </div>
        <Image src={PARENT_IMAGE} alt="Parent" fittingType="fit" className="w-9 h-9 rounded-full object-cover ml-auto" />
      </FadeIn>

      {pending > 0 && (
        <FadeIn delay={60} className="grad-gold rounded-2xl p-4 text-white shadow-glow-gold mb-4 flex items-center gap-3">
          <Clock className="w-6 h-6" />
          <div className="text-sm font-semibold">{pending} mission{pending !== 1 ? "s" : ""} waiting for your approval</div>
        </FadeIn>
      )}

      <div className="space-y-3">
        {missions.map((m, idx) => {
          const meta = statusMeta[m.status];
          return (
            <FadeIn key={m.id} delay={idx * 50}>
              <GlassCard>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${m.color}18` }}>{m.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm">{m.title}</div>
                      <Pill color={meta.color}>{meta.label}</Pill>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{m.child} · {m.world} · {m.date}</div>
                    <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
                    {m.submission && (
                      <div className="text-[11px] text-muted-foreground mt-2 rounded-lg p-2 bg-black/5">📝 Child submission: {m.submission}</div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Pill color="#FFC857">+{m.xp} XP</Pill>
                      {m.approvedBy && <Pill color="#00B894"><Award className="w-3 h-3" /> {m.approvedBy}</Pill>}
                    </div>
                  </div>
                </div>
                {m.status === "waiting-approval" && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => approve(m.id)} className="flex-1 h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 grad-emerald active:scale-95 transition-all">
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => reject(m.id)} className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all" style={{ background: "#ef444415", color: "#ef4444" }}>
                      <RotateCcw className="w-4 h-4" /> Ask to Retry
                    </button>
                  </div>
                )}
              </GlassCard>
            </FadeIn>
          );
        })}
      </div>
      <div className="h-4" />
    </div>
  );
}