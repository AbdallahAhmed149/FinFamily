import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Sparkles, Target } from "lucide-react";
import { GlassCard, ProgressRing, FadeIn, SectionTitle } from "@/components/fin/ui";
import { savingsGoals, fmtEGP } from "@/lib/finData";

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState(savingsGoals);
  const [burst, setBurst] = useState(null);

  const addFunds = (id, amt) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current: Math.min(g.target, g.current + amt) } : g)));
    setBurst(id);
    setTimeout(() => setBurst(null), 1500);
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Savings Goals</h1>
        <button className="ml-auto w-10 h-10 rounded-full grad-navy flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </FadeIn>

      <div className="space-y-4">
        {goals.map((g, idx) => (
          <FadeIn key={g.id} delay={idx * 50} className="relative">
            {burst === g.id && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="absolute text-xl animate-float" style={{ left: `${30 + i*10}%`, top: "40%", ["--tx"]: `${(i%2?1:-1)*40}px`, animationDelay: `${i*0.05}s` }}>🪙</span>
                ))}
              </div>
            )}
            <GlassCard className="relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full" style={{ background: `${g.color}11` }} />
              <div className="flex items-center gap-4 relative">
                <ProgressRing value={(g.current / g.target) * 100} color={g.color} size={72}>
                  <span className="text-2xl">{g.icon}</span>
                </ProgressRing>
                <div className="flex-1">
                  <div className="font-bold">{g.name}</div>
                  <div className="text-sm text-muted-foreground">{fmtEGP(g.current)} / {fmtEGP(g.target)}</div>
                  <div className="text-xs font-semibold mt-1" style={{ color: g.color }}>ETA: {g.eta}</div>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-xl p-3" style={{ background: `${g.color}10` }}>
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: g.color }} />
                <span className="text-xs text-muted-foreground">{g.aiNote}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => addFunds(g.id, 10)} className="flex-1 h-9 rounded-xl text-sm font-bold text-white" style={{ background: g.color }}>+ Save 10 EGP</button>
                <button onClick={() => addFunds(g.id, 25)} className="flex-1 h-9 rounded-xl text-sm font-bold" style={{ background: `${g.color}18`, color: g.color }}>+ 25 EGP</button>
              </div>
            </GlassCard>
          </FadeIn>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}