import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Shield, Lock, Check, AlertTriangle } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill, ProgressBar } from "@/components/fin/ui";
import { useAuth } from "@/lib/AuthContext";
import { getChildWallet, getChildTransactions, updateChildLimits } from "@/lib/finApi";
import { blockableCategories, fmtEGP } from "@/lib/finData";

const AVATARS = ["🦁", "🦊", "🐻", "🐱", "🐯", "🐰"];

// بداية اليوم/الأسبوع (السبت)/الشهر الحالي — بنستخدمهم عشان نحسب الـ "spent" الحقيقي
function periodStart(period) {
  const now = new Date();
  if (period === "daily") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "weekly") {
    // الأسبوع بيبدأ السبت (زي أول يوم في الأسبوع المصري)
    const day = (now.getDay() + 1) % 7; // السبت = 0
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    return start;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1); // monthly
}

// المصروف الحقيقي = الكوينز اللي اتصرفت فعليًا (redemption debit) داخل الفترة
function computeSpent(transactions) {
  const result = { daily: 0, weekly: 0, monthly: 0 };
  const bounds = { daily: periodStart("daily"), weekly: periodStart("weekly"), monthly: periodStart("monthly") };
  for (const txn of transactions) {
    if (txn.type !== "redemption" || txn.direction !== "debit") continue;
    const txnDate = new Date(txn.created_date);
    if (txnDate >= bounds.daily) result.daily += txn.amount;
    if (txnDate >= bounds.weekly) result.weekly += txn.amount;
    if (txnDate >= bounds.monthly) result.monthly += txn.amount;
  }
  return result;
}

export default function SpendingLimits() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getFamilyChildren } = useAuth();

  const [children, setChildren] = useState([]);
  const [activeId, setActiveId] = useState(location.state?.member || null);
  const [memberData, setMemberData] = useState({}); // { [childId]: { limits, blockedCategories, spent } }
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  const loadFamily = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { children: kids } = await getFamilyChildren();
      setChildren(kids);
      if (kids.length === 0) return;

      const initialId = kids.some((k) => k.id === activeId) ? activeId : kids[0].id;
      setActiveId(initialId);

      const details = await Promise.all(
        kids.map((k) => Promise.all([getChildWallet(k.id), getChildTransactions(k.id)]).catch(() => [null, []]))
      );

      const data = {};
      kids.forEach((k, i) => {
        const [wallet, transactions] = details[i];
        data[k.id] = {
          limits: {
            daily: wallet?.daily_limit ?? 0,
            weekly: wallet?.weekly_limit ?? 0,
            monthly: wallet?.monthly_limit ?? 0,
          },
          blockedCategories: wallet?.blocked_categories ?? [],
          spent: computeSpent(transactions || []),
        };
      });
      setMemberData(data);
    } catch (err) {
      setLoadError(err.message || "تعذر تحميل بيانات العيلة");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFamilyChildren]);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  const active = children.find((c) => c.id === activeId);
  const activeData = activeId != null ? memberData[activeId] : null;

  const setLimit = (key, val) => {
    setMemberData((data) => ({
      ...data,
      [activeId]: { ...data[activeId], limits: { ...data[activeId].limits, [key]: Math.max(0, val) } },
    }));
  };

  const toggleBlock = (catName) => {
    setMemberData((data) => {
      const current = data[activeId].blockedCategories;
      const next = current.includes(catName) ? current.filter((c) => c !== catName) : [...current, catName];
      return { ...data, [activeId]: { ...data[activeId], blockedCategories: next } };
    });
  };

  const save = async () => {
    if (!activeId || !activeData) return;
    setSaveError(null);
    setSaving(true);
    try {
      await updateChildLimits(activeId, {
        daily_limit: activeData.limits.daily,
        weekly_limit: activeData.limits.weekly,
        monthly_limit: activeData.limits.monthly,
        blocked_categories: activeData.blockedCategories,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setSaveError(err.message || "حصل خطأ وإحنا بنحفظ الحدود");
    } finally {
      setSaving(false);
    }
  };

  if (!loading && children.length === 0) {
    return (
      <div className="px-4 pt-12 pb-6">
        <FadeIn className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold font-heading">Spending Limits</h1>
        </FadeIn>
        {loadError ? (
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{loadError}</div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-8">
            مفيش أطفال متضافين لسه — ضيف طفل الأول من صفحة Family Members.
          </div>
        )}
      </div>
    );
  }

  const periods = activeData ? [
    { key: "daily", label: "Daily", icon: "☀️", spent: activeData.spent.daily, color: "#FFC857" },
    { key: "weekly", label: "Weekly", icon: "📅", spent: activeData.spent.weekly, color: "#00B894" },
    { key: "monthly", label: "Monthly", icon: "🗓️", spent: activeData.spent.monthly, color: "#0F2D52" },
  ] : [];

  return (
    <div className="px-4 pt-12 pb-6">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Spending Limits</h1>
      </FadeIn>

      {loadError && (
        <FadeIn className="mb-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{loadError}</div>
        </FadeIn>
      )}

      {/* member tabs */}
      <FadeIn delay={40} className="flex gap-2 overflow-x-auto no-scrollbar">
        {children.map((c, i) => (
          <button key={c.id} onClick={() => setActiveId(c.id)} className={`px-4 h-10 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 ${activeId === c.id ? "grad-navy text-white" : "glass"}`}>
            {AVATARS[i % AVATARS.length]} {c.full_name}
          </button>
        ))}
      </FadeIn>

      {/* limit sliders */}
      {activeData && (
        <FadeIn delay={80} className="mt-4">
          <SectionTitle>Auto Spending Limits · {active?.full_name}</SectionTitle>
          <div className="space-y-3">
            {periods.map((p) => {
              const limit = activeData.limits[p.key];
              const over = limit > 0 && p.spent > limit;
              return (
                <GlassCard key={p.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.icon}</span>
                      <span className="font-bold text-sm">{p.label} Limit</span>
                    </div>
                    {over && <Pill color="#ef4444" className="text-[10px] py-0"><AlertTriangle className="w-3 h-3" /> Exceeded</Pill>}
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max={p.key === "monthly" ? 3000 : p.key === "weekly" ? 800 : 200} step="5" value={limit} onChange={(e) => setLimit(p.key, Number(e.target.value))} className="flex-1 accent-emerald-500" />
                    <div className="text-right min-w-[90px]">
                      <div className="font-extrabold font-heading">{fmtEGP(limit)}</div>
                      <div className="text-[10px] text-muted-foreground">spent {fmtEGP(p.spent)}</div>
                    </div>
                  </div>
                  <ProgressBar value={p.spent} max={limit || 1} color={over ? "#ef4444" : p.color} className="mt-2" />
                  <div className="text-[11px] text-muted-foreground mt-1">Card auto-freezes if {p.label.toLowerCase()} limit is exceeded.</div>
                </GlassCard>
              );
            })}
          </div>
        </FadeIn>
      )}

      {/* category blocking */}
      {activeData && (
        <FadeIn delay={120} className="mt-5">
          <SectionTitle>Blocked Categories</SectionTitle>
          <div className="glass rounded-2xl p-3 mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-4 h-4 text-red-500" /> Block categories so {active?.full_name} can't spend on them at all.
          </div>
          <div className="grid grid-cols-2 gap-3">
            {blockableCategories.map((c) => {
              const blocked = activeData.blockedCategories.includes(c.name);
              return (
                <button key={c.id} onClick={() => toggleBlock(c.name)} className={`rounded-2xl p-4 text-left transition-all active:scale-95 ${blocked ? "ring-2 ring-red-400" : "glass"}`} style={{ background: blocked ? "#ef44440d" : undefined }}>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${c.color}18` }}>{c.icon}</div>
                    {blocked ? <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center"><Lock className="w-3.5 h-3.5" /></div> : <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-500" /></div>}
                  </div>
                  <div className="font-bold text-sm mt-2">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">{blocked ? "Blocked" : "Allowed"}</div>
                </button>
              );
            })}
          </div>
        </FadeIn>
      )}

      {saveError && (
        <FadeIn className="mt-4">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{saveError}</div>
        </FadeIn>
      )}

      {activeData && (
        <FadeIn delay={160} className="mt-5">
          <button onClick={save} disabled={saving} className="w-full h-13 py-3.5 rounded-2xl text-white font-bold grad-navy shadow-premium active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {saved ? <><Check className="w-5 h-5" /> Limits Saved for {active?.full_name}</> : <><Shield className="w-5 h-5" /> {saving ? "Saving..." : "Save Limits & Blocks"}</>}
          </button>
        </FadeIn>
      )}
      <div className="h-4" />
    </div>
  );
}