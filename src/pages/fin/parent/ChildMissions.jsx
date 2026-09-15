import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, RotateCcw, Clock, Award, Coins } from "lucide-react";
import { GlassCard, Pill, FadeIn } from "@/components/fin/ui";
import { PARENT_IMAGE, fmtEGP } from "@/lib/finData";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import { getFamilyMissions, reviewMission } from "@/lib/finApi";

const statusMeta = {
  pending: { label: "Assigned", color: "#3b82f6" },
  submitted: { label: "Needs Approval", color: "#f97316" },
  approved: { label: "Approved", color: "#00B894" },
  rejected: { label: "Rejected", color: "#ef4444" },
};

export default function ChildMissions() {
  const navigate = useNavigate();
  const { user, getFamilyChildren } = useAuth();

  const [children, setChildren] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [childrenRes, allMissions] = await Promise.all([getFamilyChildren(), getFamilyMissions()]);
      setChildren(childrenRes.children);
      setMissions(allMissions);
    } catch (err) {
      setError(err.message || "تعذر تحميل المهام");
    } finally {
      setLoading(false);
    }
  }, [getFamilyChildren]);

  useEffect(() => {
    load();
  }, [load]);

  const nameById = (id) => children.find((c) => c.id === id)?.full_name || "—";

  const decide = async (missionId, decision) => {
    setBusyId(missionId);
    try {
      await reviewMission(missionId, decision);
      await load();
    } catch (err) {
      setError(err.message || "حصل خطأ في الموافقة");
    } finally {
      setBusyId(null);
    }
  };

  const pending = missions.filter((m) => m.status === "submitted").length;

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold font-heading">Missions</h1>
          <div className="text-xs text-muted-foreground">Chores & reward requests across the family</div>
        </div>
        <Image src={user?.avatar_url || PARENT_IMAGE} alt={user?.full_name || "Parent"} fittingType="fit" className="w-9 h-9 rounded-full object-cover ml-auto" />
      </FadeIn>

      {error && (
        <FadeIn className="mb-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        </FadeIn>
      )}

      {pending > 0 && (
        <FadeIn delay={60} className="grad-gold rounded-2xl p-4 text-white shadow-glow-gold mb-4 flex items-center gap-3">
          <Clock className="w-6 h-6" />
          <div className="text-sm font-semibold">{pending} mission{pending !== 1 ? "s" : ""} waiting for your approval</div>
        </FadeIn>
      )}

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-8">...بنحمّل</div>
      ) : missions.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-10">مفيش مهام لسه — روح Chores & Tasks وسند أول مهمة.</div>
      ) : (
        <div className="space-y-3">
          {missions.map((m, idx) => {
            const meta = statusMeta[m.status];
            return (
              <FadeIn key={m.id} delay={idx * 50}>
                <GlassCard>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: "#00B89418" }}>{m.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-sm">{m.title}</div>
                        <Pill color={meta.color}>{meta.label}</Pill>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {nameById(m.assigned_to_id)} · {m.category} · {m.kind === "redemption" ? "Reward request" : "Chore"}
                      </div>
                      {m.review_note && (
                        <div className="text-[11px] text-muted-foreground mt-2 rounded-lg p-2 bg-black/5">📝 {m.review_note}</div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Pill color="#FFC857"><Coins className="w-3 h-3" /> {fmtEGP(m.reward)}</Pill>
                        {m.status === "approved" && <Pill color="#00B894"><Award className="w-3 h-3" /> Paid</Pill>}
                      </div>
                    </div>
                  </div>
                  {m.status === "submitted" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        disabled={busyId === m.id}
                        onClick={() => decide(m.id, "approve")}
                        className="flex-1 h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 grad-emerald active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        disabled={busyId === m.id}
                        onClick={() => decide(m.id, "reject")}
                        className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                        style={{ background: "#ef444415", color: "#ef4444" }}
                      >
                        <RotateCcw className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </GlassCard>
              </FadeIn>
            );
          })}
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}