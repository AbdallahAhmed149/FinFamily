import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingBag, Check } from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { rewardsStore, child } from "@/lib/finData";

export default function Rewards() {
  const navigate = useNavigate();
  const [redeemed, setRedeemed] = useState([]);
  const [coins, setCoins] = useState(child.coins);

  const redeem = (r) => {
    if (coins < r.cost || redeemed.includes(r.id)) return;
    setCoins((c) => c - r.cost);
    setRedeemed((p) => [...p, r.id]);
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Rewards Store</h1>
      </FadeIn>

      {/* coins balance */}
      <FadeIn delay={60}>
        <div className="grad-gold rounded-3xl p-5 text-center shadow-glow-gold text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-6xl opacity-20">🪙</div>
          <div className="text-sm text-white/80 font-medium">Your Coins</div>
          <div className="text-4xl font-extrabold font-heading mt-1">{coins}</div>
          <div className="text-xs text-white/80 mt-1">Earn more by completing challenges & lessons</div>
        </div>
      </FadeIn>

      {/* featured treasure box */}
      <FadeIn delay={120}>
        <SectionTitle action={<button className="text-xs font-semibold text-emerald-600">See all</button>}>Featured</SectionTitle>
        <GlassCard className="flex items-center gap-4">
          <div className="text-4xl">🎁</div>
          <div className="flex-1">
            <div className="font-bold">Mystery Treasure Box</div>
            <div className="text-xs text-muted-foreground">Could contain a rare badge, coins, or a card skin!</div>
          </div>
          <button onClick={() => redeem(rewardsStore.find((r) => r.id === "r9"))} disabled={coins < 500 || redeemed.includes("r9")}
            className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-40 grad-navy">
            500 🪙
          </button>
        </GlassCard>
      </FadeIn>

      {/* store grid */}
      <FadeIn delay={180}>
        <SectionTitle>Redeem Coins</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {rewardsStore.filter((r) => r.id !== "r9").map((r, idx) => {
            const done = redeemed.includes(r.id);
            const afford = coins >= r.cost;
            return (
              <FadeIn key={r.id} delay={idx * 30}>
                <div className="glass rounded-2xl p-4 text-center shadow-premium relative">
                  <div className="text-4xl mb-2">{r.icon}</div>
                  <div className="font-bold text-sm">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground">{r.category}</div>
                  <button
                    onClick={() => redeem(r)}
                    disabled={!afford || done}
                    className={"mt-3 w-full h-9 rounded-xl text-sm font-bold transition-all " + (done ? "bg-emerald-500 text-white" : afford ? "grad-navy text-white" : "bg-black/5 text-muted-foreground")}
                  >
                    {done ? <Check className="w-4 h-4 mx-auto" /> : `${r.cost} 🪙`}
                  </button>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </FadeIn>

      {redeemed.length > 0 && (
        <FadeIn className="mt-5">
          <div className="glass rounded-2xl p-4 text-center animate-pop">
            <div className="text-2xl mb-1">🎉</div>
            <div className="font-bold text-sm">Redeemed {redeemed.length} item(s)!</div>
            <div className="text-xs text-muted-foreground">Ask a parent to claim your rewards.</div>
          </div>
        </FadeIn>
      )}
      <div className="h-4" />
    </div>
  );
}