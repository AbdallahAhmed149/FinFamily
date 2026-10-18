import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Snowflake, PowerOff, CreditCard, RotateCw, Check, Wifi, Loader2 } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill } from "@/components/fin/ui";
import { cardThemes, fmtEGP } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { getChildWallet, updateCardStatus, replaceCard as replaceCardApi } from "@/lib/finApi";

const AVATARS = ["🦁", "🦊", "🐻", "🐱", "🐯", "🐰"];
const themeMap = Object.fromEntries(cardThemes.map((th) => [th.id, th.gradient]));
const statusIcon = { active: Wifi, frozen: Snowflake, deactivated: PowerOff };

export default function FamilyCards() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { getFamilyChildren } = useAuth();

  const [members, setMembers] = useState([]);
  const [activeId, setActiveId] = useState(location.state?.member || null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { children } = await getFamilyChildren();
      const wallets = await Promise.all(children.map((c) => getChildWallet(c.id)));
      const decorated = children.map((c, i) => ({
        id: c.id,
        name: c.full_name,
        avatar: AVATARS[i % AVATARS.length],
        wallet: wallets[i],
      }));
      setMembers(decorated);
      setActiveId((prev) => prev || decorated[0]?.id || null);
    } catch (err) {
      console.error("Failed to load family cards:", err);
    } finally {
      setLoading(false);
    }
  }, [getFamilyChildren]);

  useEffect(() => {
    load();
  }, [load]);

  const active = members.find((m) => m.id === activeId);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const setStatus = async (id, status) => {
    setBusy(true);
    try {
      const wallet = await updateCardStatus(id, status);
      setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, wallet } : m)));
      const name = members.find((m) => m.id === id)?.name;
      const key = status === "frozen" ? "flashFrozen" : status === "active" ? "flashActivated" : "flashDeactivated";
      flash(t(`parent.familyCards.${key}`, { name }));
    } catch (err) {
      flash(err.message || t("parent.familyCards.flashError"));
    } finally {
      setBusy(false);
    }
  };

  const claimNewCard = async (id) => {
    setBusy(true);
    try {
      const wallet = await replaceCardApi(id);
      setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, wallet } : m)));
      flash(t("parent.familyCards.flashNewCard"));
    } catch (err) {
      flash(err.message || t("parent.familyCards.flashError"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 pt-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!active) {
    return (
      <div className="px-4 pt-12">
        <FadeIn className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <h1 className="text-xl font-extrabold font-heading">{t("parent.familyCards.title")}</h1>
        </FadeIn>
        <div className="text-center text-sm text-muted-foreground py-8">{t("parent.familyCards.noKids")}</div>
      </div>
    );
  }

  const cardStatus = active.wallet.card_status;
  const statusColor = { active: "#00B894", frozen: "#3b82f6", deactivated: "#94a3b8" }[cardStatus];
  const StatusIcon = statusIcon[cardStatus];
  const statusLabel = t(`parent.familyCards.status.${cardStatus}.label`);
  const statusDesc = t(`parent.familyCards.status.${cardStatus}.desc`);

  return (
    <div className="px-4 pt-12 pb-6">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">{t("parent.familyCards.title")}</h1>
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
        <div className="rounded-3xl p-5 text-white shadow-premium relative overflow-hidden h-52" style={{ background: themeMap[active.wallet.card_theme] || themeMap.blue, filter: cardStatus === "frozen" ? "saturate(0.5) brightness(0.8)" : cardStatus === "deactivated" ? "grayscale(1) brightness(0.6)" : "none" }}>
          <div className="absolute -end-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-white/70">Meeza Card</div>
              <div className="font-bold">{active.name}</div>
            </div>
            {cardStatus !== "active" && <Pill className="bg-white/20 text-white">{statusLabel}</Pill>}
          </div>
          <div className="absolute bottom-5 start-5 end-5">
            <div className="font-mono text-lg tracking-widest force-ltr text-end">{active.wallet.card_number}</div>
            <div className="flex items-center justify-between mt-2 text-xs text-white/70">
              <span>VIRTUAL · MEEZA</span>
              <span>{fmtEGP(active.wallet.balance)}</span>
            </div>
          </div>
          {cardStatus === "frozen" && <div className="absolute inset-0 flex items-center justify-center"><Snowflake className="w-16 h-16 text-white/40" /></div>}
        </div>
      </FadeIn>

      {/* status banner */}
      <FadeIn delay={120} className="mt-3">
        <div className="glass rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: `inset 0 0 0 2px ${statusColor}40` }}>
          <StatusIcon className="w-6 h-6" style={{ color: statusColor }} />
          <div className="flex-1">
            <div className="font-bold text-sm">{statusLabel}</div>
            <div className="text-xs text-muted-foreground">{statusDesc}</div>
          </div>
          <Pill color={statusColor}>●</Pill>
        </div>
      </FadeIn>

      {/* card lifecycle controls */}
      <FadeIn delay={160} className="mt-4">
        <SectionTitle>{t("parent.familyCards.cardControls")}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {cardStatus === "active" ? (
            <button disabled={busy} onClick={() => setStatus(active.id, "frozen")} className="glass rounded-2xl p-4 text-start active:scale-95 transition-all disabled:opacity-50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "#3b82f618", color: "#3b82f6" }}><Snowflake className="w-5 h-5" /></div>
              <div className="font-bold text-sm">{t("parent.familyCards.freeze.title")}</div>
              <div className="text-[10px] text-muted-foreground">{t("parent.familyCards.freeze.desc")}</div>
            </button>
          ) : cardStatus === "frozen" ? (
            <button disabled={busy} onClick={() => setStatus(active.id, "active")} className="glass rounded-2xl p-4 text-start active:scale-95 transition-all disabled:opacity-50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "#00B89418", color: "#00B894" }}><Wifi className="w-5 h-5" /></div>
              <div className="font-bold text-sm">{t("parent.familyCards.unfreeze.title")}</div>
              <div className="text-[10px] text-muted-foreground">{t("parent.familyCards.unfreeze.desc")}</div>
            </button>
          ) : null}
          <button disabled={busy} onClick={() => claimNewCard(active.id)} className="glass rounded-2xl p-4 text-start active:scale-95 transition-all disabled:opacity-50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "#FFC85718", color: "#b8860b" }}><RotateCw className="w-5 h-5" /></div>
            <div className="font-bold text-sm">{t("parent.familyCards.claimNew.title")}</div>
            <div className="text-[10px] text-muted-foreground">{t("parent.familyCards.claimNew.desc")}</div>
          </button>
          {cardStatus !== "deactivated" ? (
            <button disabled={busy} onClick={() => setStatus(active.id, "deactivated")} className="glass rounded-2xl p-4 text-start active:scale-95 transition-all disabled:opacity-50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "#ef444418", color: "#ef4444" }}><PowerOff className="w-5 h-5" /></div>
              <div className="font-bold text-sm">{t("parent.familyCards.deactivate.title")}</div>
              <div className="text-[10px] text-muted-foreground">{t("parent.familyCards.deactivate.desc")}</div>
            </button>
          ) : (
            <button disabled={busy} onClick={() => setStatus(active.id, "active")} className="glass rounded-2xl p-4 text-start active:scale-95 transition-all disabled:opacity-50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "#00B89418", color: "#00B894" }}><Check className="w-5 h-5" /></div>
              <div className="font-bold text-sm">{t("parent.familyCards.reactivate.title")}</div>
              <div className="text-[10px] text-muted-foreground">{t("parent.familyCards.reactivate.desc")}</div>
            </button>
          )}
        </div>
      </FadeIn>

      {/* all cards overview */}
      <FadeIn delay={200} className="mt-5">
        <SectionTitle>{t("parent.familyCards.allCards")}</SectionTitle>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="glass rounded-2xl p-3 flex items-center gap-3">
              <div className="w-11 h-8 rounded-lg flex items-center justify-center" style={{ background: themeMap[m.wallet.card_theme] || themeMap.blue }}><CreditCard className="w-4 h-4 text-white" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{m.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground force-ltr text-start">{m.wallet.card_number}</div>
              </div>
              <Pill color={{ active: "#00B894", frozen: "#3b82f6", deactivated: "#94a3b8" }[m.wallet.card_status]} className="text-[10px] py-0">{t(`parent.familyCards.status.${m.wallet.card_status}.label`)}</Pill>
            </div>
          ))}
        </div>
      </FadeIn>

      {toast && (
        <div className="fixed bottom-24 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-50 glass rounded-full px-5 py-3 text-sm font-bold shadow-premium animate-pop flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" /> {toast}
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}