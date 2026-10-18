import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Check, Clock, Send, Award } from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import MissionComplete from "@/components/fin/MissionComplete";
import { fmtEGP } from "@/lib/finData";
import { getMyMissions, submitMission } from "@/lib/finApi";

const statusIcon = {
  pending: Clock,
  submitted: Send,
  approved: Check,
  rejected: Award,
};
const statusColor = {
  pending: "#3b82f6",
  submitted: "#f97316",
  approved: "#00B894",
  rejected: "#ef4444",
};

export default function Missions() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      setError(err.message || t("child.missions.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (m) => {
    setBusyId(m.id);
    try {
      await submitMission(m.id);
      setDone({
        xp: m.reward,
        badge: { name: t("child.missions.submittedBadge.name"), icon: "🎯", desc: t("child.missions.submittedBadge.desc"), color: "#FFC857" },
        nextMission: t("child.missions.waitForApproval"),
      });
      await load();
    } catch (err) {
      setError(err.message || t("child.missions.submitFailed"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold font-heading">{t("child.missions.title")}</h1>
          <div className="text-xs text-muted-foreground">{t("child.missions.subtitle")}</div>
        </div>
      </FadeIn>

      {error && (
        <FadeIn className="mb-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        </FadeIn>
      )}

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-8">{t("child.missions.loading")}</div>
      ) : missions.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">{t("child.missions.empty")}</div>
      ) : (
        <div className="space-y-3">
          {missions.map((m, idx) => {
            const Icon = statusIcon[m.status];
            const label = t(`child.missions.status.${m.status}`);
            const color = statusColor[m.status];
            return (
              <FadeIn key={m.id} delay={idx * 50}>
                <GlassCard>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: "#00B89418" }}>{m.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{m.title}</div>
                      <div className="text-xs text-muted-foreground">{m.category}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Pill color={color}><Icon className="w-3 h-3" /> {label}</Pill>
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
                      <Send className="w-4 h-4" /> {t("child.missions.markDone")}
                    </button>
                  )}
                  {m.status === "submitted" && (
                    <div className="w-full h-10 mt-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: "#f9731615", color: "#f97316" }}>
                      <Clock className="w-4 h-4" /> {t("child.missions.waitingApproval")}
                    </div>
                  )}
                  {m.status === "approved" && (
                    <div className="w-full h-10 mt-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: "#00B89415", color: "#00B894" }}>
                      <Check className="w-4 h-4" /> {t("child.missions.approvedLine", { amount: fmtEGP(m.reward) })}
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