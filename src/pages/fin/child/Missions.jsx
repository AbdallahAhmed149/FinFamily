import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, Clock, Send, Award } from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import MissionComplete from "@/components/fin/MissionComplete";
import { fmtEGP } from "@/lib/finData";
import { getMyMissions, submitMission } from "@/lib/finApi";
import { useTranslation } from "react-i18next";

export default function Missions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const statusMeta = {
    pending: { label: t("child_missions_page.status_pending"), color: "#3b82f6", icon: Clock },
    submitted: { label: t("child_missions_page.status_submitted"), color: "#f97316", icon: Send },
    approved: { label: t("child_missions_page.status_approved"), color: "#00B894", icon: Check },
    rejected: { label: t("child_missions_page.status_rejected"), color: "#ef4444", icon: Award },
  };
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [done, setDone] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMissions(await getMyMissions());
    } catch (err) {
      setError(err.message || t("child_missions_page.load_error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (m) => {
    setBusyId(m.id);
    try {
      await submitMission(m.id);
      setDone({ xp: m.reward, badge: { name: t("child_missions_page.badge_name"), icon: "🎯", desc: t("child_missions_page.badge_desc"), color: "#FFC857" }, nextMission: t("child_missions_page.next_mission") });
      await load();
    } catch (err) {
      setError(err.message || t("child_missions_page.error"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold font-heading">{t("child_missions_page.title")}</h1>
          <div className="text-xs text-muted-foreground">{t("child_missions_page.subtitle")}</div>
        </div>
      </FadeIn>

      {error && (
        <FadeIn className="mb-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        </FadeIn>
      )}

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-8">{t("child_missions_page.loading")}</div>
      ) : missions.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">{t("child_missions_page.no_missions")}</div>
      ) : (
        <div className="space-y-3">
          {missions.map((m, idx) => {
            const meta = statusMeta[m.status];
            const Icon = meta.icon;
            return (
              <FadeIn key={m.id} delay={idx * 50}>
                <GlassCard>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: "#00B89418" }}>{m.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{m.title}</div>
                      <div className="text-xs text-muted-foreground">{m.category}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Pill color={meta.color}><Icon className="w-3 h-3" /> {meta.label}</Pill>
                        <Pill color="#FFC857">+{fmtEGP(m.reward)}</Pill>
                      </div>
                      {m.review_note && (
                        <div className="text-[11px] text-muted-foreground mt-2 rounded-lg p-2 bg-black/5">📝 {m.review_note}</div>
                      )}
                    </div>
                  </div>
                  {m.status === "pending" && (
                    <button
                      disabled={busyId === m.id}
                      onClick={() => handleSubmit(m)}
                      className="w-full h-10 mt-3 rounded-xl text-white font-bold text-sm grad-navy flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" /> {t("child_missions_page.mark_done")}
                    </button>
                  )}
                  {m.status === "submitted" && (
                    <div className="w-full h-10 mt-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: "#f9731615", color: "#f97316" }}>
                      <Clock className="w-4 h-4" /> {t("child_missions_page.awaiting")}
                    </div>
                  )}
                  {m.status === "approved" && (
                    <div className="w-full h-10 mt-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: "#00B89415", color: "#00B894" }}>
                      <Check className="w-4 h-4" /> {t("child_missions_page.approved_msg", { amount: fmtEGP(m.reward) })}
                    </div>
                  )}
                </GlassCard>
              </FadeIn>
            );
          })}
        </div>
      )}
      <div className="h-4" />

      {done && (
        <div className="fixed inset-0 z-[70] bg-background overflow-y-auto">
          <MissionComplete xp={done.xp} badge={done.badge} streak={0} nextMission={done.nextMission} onClose={() => setDone(null)} />
        </div>
      )}
    </div>
  );
}