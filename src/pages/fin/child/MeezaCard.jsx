import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Snowflake, Lock, Unlock, Eye, EyeOff, CreditCard, Check, Palette } from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { cardThemes, transactions, fmtEGP } from "@/lib/finData";

export default function MeezaCard() {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [theme, setTheme] = useState(cardThemes[0]);

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Meeza Card</h1>
        <Pill color={frozen ? "#3b82f6" : "#00B894"} className="ml-auto">{frozen ? "Frozen" : "Active"}</Pill>
      </FadeIn>

      {/* 3D card */}
      <FadeIn delay={60} className="[perspective:1200px] mb-6">
        <div
          className="relative w-full h-52 transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* front */}
          <div
            className="absolute inset-0 rounded-3xl p-5 text-white shadow-premium [backface-visibility:hidden] flex flex-col justify-between cursor-pointer"
            style={{ background: theme.gradient, filter: frozen ? "grayscale(0.7) brightness(0.8)" : "none" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-white/70">FinFamily Meeza</div>
                <div className="text-lg font-bold font-heading">Lotfy Junior</div>
              </div>
              <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-300 to-amber-500" />
            </div>
            <div className="text-xl font-mono tracking-widest">•••• •••• •••• 4921</div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] text-white/60">VALID THRU</div>
                <div className="text-sm font-semibold">11/29</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/60">BALANCE</div>
                <div className="text-sm font-bold">{fmtEGP(320.5)}</div>
              </div>
              <div className="text-2xl">🌳</div>
            </div>
          </div>
          {/* back */}
          <div
            className="absolute inset-0 rounded-3xl p-5 text-white shadow-premium [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between"
            style={{ background: theme.gradient }}
          >
            <div className="w-full h-9 bg-black/80 rounded" />
            <div className="bg-white/90 rounded h-9 flex items-center px-3">
              <div className="flex-1 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
              <span className="text-black font-mono text-sm ml-2">729</span>
            </div>
            <div className="flex justify-between text-[10px] text-white/70">
              <span>Tap to flip back</span>
              <span>Meeza ·埃及银行</span>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">Tap card to flip</p>
      </FadeIn>

      {/* controls */}
      <FadeIn delay={120} className="grid grid-cols-4 gap-3 mb-5">
        <CtrlBtn icon={frozen ? Unlock : Snowflake} label={frozen ? "Unfreeze" : "Freeze"} color={frozen ? "#00B894" : "#3b82f6"} onClick={() => setFrozen((f) => !f)} active={frozen} />
        <CtrlBtn icon={Lock} label="Lock" color="#ef4444" />
        <CtrlBtn icon={showPin ? EyeOff : Eye} label="Show PIN" color="#FFC857" onClick={() => setShowPin((s) => !s)} />
        <CtrlBtn icon={CreditCard} label="Details" color="#0F2D52" />
      </FadeIn>

      {showPin && (
        <FadeIn className="glass rounded-2xl p-4 mb-5 text-center animate-pop">
          <div className="text-xs text-muted-foreground mb-1">Your PIN</div>
          <div className="text-2xl font-mono tracking-[0.4em] font-bold">{showPin ? "4 9 2 1" : "• • • •"}</div>
        </FadeIn>
      )}

      {/* theme customization */}
      <FadeIn delay={180}>
        <SectionTitle><Palette className="inline w-4 h-4 mr-1" />Theme</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          {cardThemes.map((t) => (
            <button key={t.id} onClick={() => setTheme(t)} className="flex flex-col items-center gap-1.5 active:scale-95 transition-all">
              <div className="w-full h-12 rounded-xl shadow-premium flex items-center justify-center" style={{ background: t.gradient }}>
                {theme.id === t.id && <Check className="w-4 h-4 text-white" />}
              </div>
              <span className="text-[9px] font-semibold text-center leading-tight">{t.name}</span>
            </button>
          ))}
        </div>
      </FadeIn>

      {/* recent payments */}
      <FadeIn delay={240} className="mt-5">
        <SectionTitle>Recent Payments</SectionTitle>
        <div className="space-y-2">
          {transactions.filter((t) => t.type === "card").slice(0, 5).map((t) => (
            <div key={t.id} className="glass rounded-2xl p-3 flex items-center gap-3 shadow-premium">
              <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center text-navy" style={{ background: "#0F2D5218", color: "#0F2D52" }}>
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{t.merchant}</div>
                <div className="text-xs text-muted-foreground">{t.category}</div>
              </div>
              <div className="font-bold text-sm">{fmtEGP(Math.abs(t.amount))}</div>
            </div>
          ))}
        </div>
      </FadeIn>
      <div className="h-4" />
    </div>
  );
}

function CtrlBtn({ icon: Icon, label, color, onClick, active }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 active:scale-95 transition-all">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-premium transition-all"
        style={{ background: active ? color : `${color}18`, color: active ? "white" : color }}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}