import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Check } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle } from "@/components/fin/ui";
import Lotfy from "@/components/fin/Lotfy";
import { allowanceTypes, fmtEGP } from "@/lib/finData";

export default function Allowance() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(0);
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!selected || amount <= 0) return;
    setSent(true);
    setTimeout(() => { setSent(false); setSelected(null); setAmount(0); }, 2200);
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Allowance</h1>
      </FadeIn>

      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-5 text-white shadow-premium flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <Lotfy size={64} />
          <div>
            <div className="text-sm text-white/70">Send to</div>
            <div className="text-lg font-bold">Lotfy Junior</div>
            <div className="text-xs text-white/60">Balance: {fmtEGP(320.5)}</div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={120}>
        <SectionTitle>Allowance Type</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {allowanceTypes.map((a) => (
            <button
              key={a.id}
              onClick={() => { setSelected(a); setAmount(a.amount); }}
              className="glass rounded-2xl p-4 text-left shadow-premium transition-all active:scale-95"
              style={{ boxShadow: selected?.id === a.id ? `0 0 0 2px ${a.color}` : undefined }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: `${a.color}18`, color: a.color }}>
                <Send className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm">{a.label}</div>
              {a.amount > 0 && <div className="text-xs text-muted-foreground">{fmtEGP(a.amount)}</div>}
            </button>
          ))}
        </div>
      </FadeIn>

      {selected && (
        <FadeIn className="mt-4">
          <GlassCard>
            <div className="text-sm text-muted-foreground mb-2">Amount (EGP)</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 text-3xl font-extrabold font-heading bg-transparent outline-none"
              />
              <span className="text-sm font-semibold text-muted-foreground">EGP</span>
            </div>
            <div className="flex gap-2 mt-3">
              {[25, 50, 100].map((v) => (
                <button key={v} onClick={() => setAmount(v)} className="px-3 py-1.5 rounded-full bg-black/5 text-xs font-bold">+{v}</button>
              ))}
            </div>
          </GlassCard>
        </FadeIn>
      )}

      {selected && (
        <FadeIn className="mt-4">
          <button onClick={send} className="w-full h-14 rounded-2xl text-white font-bold font-heading shadow-premium active:scale-[0.98] transition-all grad-emerald flex items-center justify-center gap-2">
            {sent ? <><Check className="w-5 h-5" /> Sent to Lotfy! 🎉</> : <><Send className="w-5 h-5" /> Send {amount > 0 ? fmtEGP(amount) : ""} to Lotfy</>}
          </button>
        </FadeIn>
      )}

      {sent && (
        <FadeIn className="text-center mt-6">
          <div className="relative h-32 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="absolute text-2xl animate-float" style={{ left: `${30+i*5}%`, top: "20%", ["--tx"]: `${(i%2?1:-1)*30}px`, animationDelay: `${i*0.08}s` }}>🪙</span>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">Coins flying toward Lotfy... Balance updated!</div>
        </FadeIn>
      )}
      <div className="h-4" />
    </div>
  );
}