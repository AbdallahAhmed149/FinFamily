import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Snowflake, PowerOff, CreditCard, RotateCw, Check, Wifi } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill } from "@/components/fin/ui";
import { familyMembers, cardThemes, fmtEGP } from "@/lib/finData";

const themeMap = Object.fromEntries(cardThemes.map((t) => [t.id, t.gradient]));

export default function FamilyCards() {
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState(familyMembers.map((m) => ({ ...m })));
  const [activeId, setActiveId] = useState(location.state?.member || familyMembers[0].id);
  const [toast, setToast] = useState("");

  const active = members.find((m) => m.id === activeId);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };
  const setCardStatus = (id, status) => { setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, cardStatus: status } : m))); flash(`Card ${status === "frozen" ? "frozen" : status === "active" ? "unfrozen" : "deactivated"} for ${members.find((m) => m.id === id).name}`); };
  const replaceCard = (id) => { setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, cardNumber: `5061 •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`, cardStatus: "active" } : m))); flash("New card claimed — old one voided"); };

  const statusMeta = {
    active: { label: "Active", color: "#00B894", icon: Wifi, desc: "Card works normally" },
    frozen: { label: "Frozen", color: "#3b82f6", icon: Snowflake, desc: "All payments blocked" },
    deactivated: { label: "Deactivated", color: "#94a3b8", icon: PowerOff, desc: "Permanently off" },
  };

  return (
    <div className="px-4 pt-12 pb-6">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Family Cards</h1>
      </FadeIn>

      <FadeIn delay={40} className="flex gap-2 overflow-x-auto no-scrollbar">
        {members.map((m) => (
          <button key={m.id} onClick={() => setActiveId(m.id)} className={`px-4 h-10 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 ${activeId === m.id ? "grad-navy text-white" : "glass"}`}>
            {m.avatar} {m.name}
          </button>
        ))}
      </FadeIn>

      {/* live card preview */}
      <FadeIn delay={80} className="mt-4">
        <div className="rounded-3xl p-5 text-white shadow-premium relative overflow-hidden h-52" style={{ background: themeMap[active.cardTheme] || themeMap.blue, filter: active.cardStatus === "frozen" ? "saturate(0.5) brightness(0.8)" : active.cardStatus === "deactivated" ? "grayscale(1) brightness(0.6)" : "none" }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-white/70">Meeza Card</div>
              <div className="font-bold">{active.name}</div>
            </div>
            {active.cardStatus !== "active" && (
              <Pill className="bg-white/20 text-white">{statusMeta[active.cardStatus].label}</Pill>
            )}
          </div>
          <div className="absolute bottom-5 left-5 right-5">
            <div className="font-mono text-lg tracking-widest">{active.cardNumber}</div>
            <div className="flex items-center justify-between mt-2 text-xs text-white/70">
              <span>VIRTUAL · MEEZA</span>
              <span>EXP 09/29</span>
            </div>
          </div>
          {active.cardStatus === "frozen" && <div className="absolute inset-0 flex items-center justify-center"><Snowflake className="w-16 h-16 text-white/40" /></div>}
        </div>
      </FadeIn>

      {/* status banner */}
      <FadeIn delay={120} className="mt-3">
        <div className="glass rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: `inset 0 0 0 2px ${statusMeta[active.cardStatus].color}40` }}>
          {React.createElement(statusMeta[active.cardStatus].icon, { className: "w-6 h-6", style: { color: statusMeta[active.cardStatus].color } })}
          <div className="flex-1">
            <div className="font-bold text-sm">{statusMeta[active.cardStatus].label}</div>
            <div className="text-xs text-muted-foreground">{statusMeta[active.cardStatus].desc}</div>
          </div>
          <Pill color={statusMeta[active.cardStatus].color}>●</Pill>
        </div>
      </FadeIn>

      {/* card lifecycle controls */}
      <FadeIn delay={160} className="mt-4">
        <SectionTitle>Card Controls</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {active.cardStatus === "active" ? (
            <button onClick={() => setCardStatus(active.id, "frozen")} className="glass rounded-2xl p-4 text-left active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "#3b82f618", color: "#3b82f6" }}><Snowflake className="w-5 h-5" /></div>
              <div className="font-bold text-sm">Freeze Card</div>
              <div className="text-[10px] text-muted-foreground">Block all payments instantly</div>
            </button>
          ) : (
            <button onClick={() => setCardStatus(active.id, "active")} className="glass rounded-2xl p-4 text-left active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "#00B89418", color: "#00B894" }}><Wifi className="w-5 h-5" /></div>
              <div className="font-bold text-sm">Unfreeze</div>
              <div className="text-[10px] text-muted-foreground">Reactivate the card</div>
            </button>
          )}
          <button onClick={() => replaceCard(active.id)} className="glass rounded-2xl p-4 text-left active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "#FFC85718", color: "#b8860b" }}><RotateCw className="w-5 h-5" /></div>
            <div className="font-bold text-sm">Claim New Card</div>
            <div className="text-[10px] text-muted-foreground">Replace lost/stolen card</div>
          </button>
          {active.cardStatus !== "deactivated" ? (
            <button onClick={() => setCardStatus(active.id, "deactivated")} className="glass rounded-2xl p-4 text-left active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "#ef444418", color: "#ef4444" }}><PowerOff className="w-5 h-5" /></div>
              <div className="font-bold text-sm">Deactivate</div>
              <div className="text-[10px] text-muted-foreground">Permanently disable</div>
            </button>
          ) : (
            <button onClick={() => setCardStatus(active.id, "active")} className="glass rounded-2xl p-4 text-left active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "#00B89418", color: "#00B894" }}><Check className="w-5 h-5" /></div>
              <div className="font-bold text-sm">Reactivate</div>
              <div className="text-[10px] text-muted-foreground">Turn card back on</div>
            </button>
          )}
        </div>
      </FadeIn>

      {/* all cards overview */}
      <FadeIn delay={200} className="mt-5">
        <SectionTitle>All Family Cards</SectionTitle>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="glass rounded-2xl p-3 flex items-center gap-3">
              <div className="w-11 h-8 rounded-lg flex items-center justify-center" style={{ background: themeMap[m.cardTheme] }}><CreditCard className="w-4 h-4 text-white" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{m.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{m.cardNumber}</div>
              </div>
              <Pill color={statusMeta[m.cardStatus].color} className="text-[10px] py-0">{statusMeta[m.cardStatus].label}</Pill>
            </div>
          ))}
        </div>
      </FadeIn>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-5 py-3 text-sm font-bold shadow-premium animate-pop flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" /> {toast}
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}