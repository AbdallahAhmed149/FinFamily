import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, X, MapPin, Clock, FileText, Loader2 } from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { fmtEGP, timeAgo } from "@/lib/finData";
import { getFamilyCardPurchases, reviewCardPurchase } from "@/lib/finApi";

const categoryIcon = { Shopping: "🛍️", Entertainment: "🎬", Food: "🍔", Games: "🎮", Other: "🛒" };

export default function Approvals() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getFamilyCardPurchases());
    } catch (err) {
      console.error("Failed to load purchase approvals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (id, decision) => {
    setBusyId(id);
    try {
      const updated = await reviewCardPurchase(id, decision);
      setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error("Failed to review purchase:", err);
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = items.filter((a) => a.status === "pending").length;

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Purchase Approvals</h1>
      </FadeIn>

      <FadeIn delay={60}>
        <div className="grad-gold rounded-3xl p-4 text-white shadow-glow-gold flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <div className="font-bold text-sm">{loading ? "···" : pendingCount} pending request{pendingCount === 1 ? "" : "s"}</div>
            <div className="text-xs text-white/80">Purchases that went over a spending limit</div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={120} className="mt-4">
        <SectionTitle>Requests</SectionTitle>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">No card purchases yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((a, i) => (
              <FadeIn key={a.id} delay={i * 50}>
                <GlassCard className={a.status !== "pending" ? "opacity-70" : ""}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-navy/10 flex items-center justify-center text-2xl" style={{ background: "#0F2D5218" }}>
                      {categoryIcon[a.category] || "🛒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold">{a.merchant}</div>
                      <div className="text-lg font-extrabold font-heading" style={{ color: "#0F2D52" }}>{fmtEGP(a.amount)}</div>
                    </div>
                    {a.status !== "pending" && (
                      <Pill color={a.status === "completed" ? "#00B894" : "#ef4444"}>{a.status === "completed" ? "approved" : "rejected"}</Pill>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {a.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.location}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(a.created_date)}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {a.category}</span>
                  </div>

                  {a.status === "pending" ? (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => decide(a.id, "reject")}
                        disabled={busyId === a.id}
                        className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                        style={{ background: "#ef444318", color: "#ef4444" }}
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => decide(a.id, "approve")}
                        disabled={busyId === a.id}
                        className="flex-1 h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-1 grad-emerald disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                    </div>
                  ) : (
                    <div className={"mt-3 text-xs font-semibold flex items-center gap-1 " + (a.status === "completed" ? "text-emerald-600" : "text-red-500")}>
                      {a.status === "completed" ? "✓ Approved and paid from wallet" : `✕ Declined${a.decline_reason ? ` — ${a.decline_reason}` : ""}`}
                    </div>
                  )}
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        )}
      </FadeIn>
      <div className="h-4" />
    </div>
  );
}