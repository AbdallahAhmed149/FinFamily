import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, X, Coins, Gift } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill } from "@/components/fin/ui";
import { rewardRequests } from "@/lib/finData";

export default function RewardApprovals() {
  const navigate = useNavigate();
  const [items, setItems] = useState(rewardRequests);

  const decide = (id, status) => setItems((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
  const pending = items.filter((r) => r.status === "pending");

  return (
    <div className="px-4 pt-12 pb-6">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Reward Requests</h1>
        <Pill color="#FFC857" className="ml-auto"><Gift className="w-3 h-3" /> {pending.length} pending</Pill>
      </FadeIn>

      <FadeIn delay={40}>
        <div className="grad-gold rounded-3xl p-4 text-white shadow-glow-gold flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <div className="font-bold text-sm">Children want to redeem coins</div>
            <div className="text-xs text-white/80">Approve or reject their reward requests</div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={120} className="mt-4">
        <SectionTitle>Pending Requests</SectionTitle>
        <div className="space-y-3">
          {pending.map((r, i) => (
            <FadeIn key={r.id} delay={i * 50}>
              <GlassCard>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "#FFC85718" }}>{r.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">{r.item}</div>
                    <div className="text-xs text-muted-foreground">Requested by <span className="font-semibold text-foreground">{r.child}</span> · {r.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold font-heading text-amber-600 flex items-center gap-1 justify-end"><Coins className="w-3.5 h-3.5" /> {r.cost}</div>
                    <div className="text-[10px] text-muted-foreground">of {r.coinsBalance} coins</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => decide(r.id, "rejected")} className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-1" style={{ background: "#ef444318", color: "#ef4444" }}>
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => decide(r.id, "approved")} className="flex-1 h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-1 grad-emerald active:scale-95 transition-all">
                    <Check className="w-4 h-4" /> Approve & Fulfill
                  </button>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
          {pending.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No pending reward requests 🎉</div>}
        </div>
      </FadeIn>

      <FadeIn delay={160} className="mt-5">
        <SectionTitle>History</SectionTitle>
        <div className="space-y-2">
          {items.filter((r) => r.status !== "pending").map((r) => (
            <GlassCard key={r.id} className="flex items-center gap-3 py-3 opacity-80">
              <div className="text-xl">{r.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{r.item} · {r.child}</div>
                <div className="text-[11px] text-muted-foreground">{r.time}</div>
              </div>
              <Pill color={r.status === "approved" ? "#00B894" : "#ef4444"} className="text-[10px] py-0">{r.status}</Pill>
            </GlassCard>
          ))}
        </div>
      </FadeIn>
      <div className="h-4" />
    </div>
  );
}