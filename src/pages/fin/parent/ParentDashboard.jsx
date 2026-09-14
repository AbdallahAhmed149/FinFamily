import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, TrendingDown, TrendingUp, Target, Wallet, Bell, Download, Search, Repeat2,
  Users, ListChecks, SlidersHorizontal, CreditCard, Gift, Bot, AlertTriangle, ShieldAlert
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { scoreHistory, PARENT_IMAGE, parent, LOGO_IMAGE, familyMembers } from "@/lib/finData";
import { fmtEGP, timeAgo } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { getChildWallet, getChildTransactions, getFamilyMissions, getFamilyInsights, getFamilyActivity } from "@/lib/finApi";
import { Image } from "@/components/ui/image";

const iconEmoji = { utensils: "🍽️", "piggy-bank": "🐷", "trending-down": "📉", "shield-alert": "🚨", wallet: "👛", sparkles: "✨", "trending-up": "📈" };
const sevColor = { alert: "#ef4444", warn: "#FFC857", good: "#00B894", info: "#3b82f6" };
const CATEGORY_COLORS = ["#FFC857", "#00B894", "#0F2D52", "#3b82f6", "#8b5cf6", "#ef4444", "#f97316", "#ec4899", "#64748b"];
const WEEKDAY_LABELS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]; // الأسبوع بيبدأ السبت (زي SpendingLimits.jsx)

function startOfWeek() {
  const now = new Date();
  const day = (now.getDay() + 1) % 7; // تحويل الأحد=0 لـ السبت=0
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
}

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user, getFamilyChildren } = useAuth(); // اليوزر الحقيقي بتاع الأب الداخل دلوقتي

  const [childrenCount, setChildrenCount] = useState(familyMembers.length); // fallback للموك لحد ما تجيب الحقيقي
  const [familySummary, setFamilySummary] = useState({ totalSpending: 0, totalSavings: 0, goalsCompleted: 0, avgScore: null });
  const [realSpendingCategories, setRealSpendingCategories] = useState([]);
  const [realWeeklySpending, setRealWeeklySpending] = useState([]);
  const [insights, setInsights] = useState([]);
  const [activity, setActivity] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // بنجمع بيانات كل الأطفال في العيلة: رصيد الادخار + المصاريف الحقيقية (كوينز اتصرفت على حاجات)
  useEffect(() => {
    let cancelled = false;

    async function loadFamilySummary() {
      try {
        const [{ children }, familyMissions, realInsights, realActivity] = await Promise.all([
          getFamilyChildren(),
          getFamilyMissions(), // عشان نجيب category كل mission redemption ونربطها بالـ transaction بتاعتها
          getFamilyInsights(),
          getFamilyActivity(),
        ]);
        if (cancelled) return;
        setChildrenCount(children.length);
        setInsights(realInsights);
        setActivity(realActivity);
        setPendingApprovals(familyMissions.filter((m) => m.status === "submitted").length);

        // Transaction مفيهوش category مباشرة، بس فيه related_mission_id — وMission فيه category حقيقي
        const missionCategoryById = {};
        for (const m of familyMissions) missionCategoryById[m.id] = m.category;

        const perChild = await Promise.all(
          children.map(async (c) => {
            const [wallet, transactions] = await Promise.all([
              getChildWallet(c.id),
              getChildTransactions(c.id),
            ]);
            return { wallet, transactions };
          })
        );
        if (cancelled) return;

        let totalSavings = 0;
        let totalSpending = 0;
        let goalsCompleted = 0;
        const categoryTotals = {};
        const weekStart = startOfWeek();
        const weeklyTotals = [0, 0, 0, 0, 0, 0, 0]; // مقابل WEEKDAY_LABELS

        for (const { wallet, transactions } of perChild) {
          totalSavings += wallet.savings_balance || 0;
          for (const goal of wallet.savings_goals || []) {
            if (goal.current >= goal.target) goalsCompleted += 1;
          }
          // "مصاريف" هنا يعني كوينز اتصرفت فعليًا على حاجة (redemption)، مش تحويل لحساب الادخار
          for (const txn of transactions) {
            if (txn.type === "redemption" && txn.direction === "debit") {
              totalSpending += txn.amount;

              const category = missionCategoryById[txn.related_mission_id] || "Other";
              categoryTotals[category] = (categoryTotals[category] || 0) + txn.amount;

              const txnDate = new Date(txn.created_date);
              if (txnDate >= weekStart) {
                const dayIndex = Math.floor((txnDate - weekStart) / 86400000);
                if (dayIndex >= 0 && dayIndex < 7) weeklyTotals[dayIndex] += txn.amount;
              }
            }
          }
        }

        // متوسط الـ Financial Score الحقيقي بتاع كل الأطفال (كل واحد بيتحسب Live في الباك اند)
        const avgScore = perChild.length
          ? Math.round(perChild.reduce((s, { wallet }) => s + (wallet.financial_score ?? 50), 0) / perChild.length)
          : null;

        setFamilySummary({ totalSpending, totalSavings, goalsCompleted, avgScore });
        setRealSpendingCategories(
          Object.entries(categoryTotals).map(([name, value], i) => ({ name, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
        );
        setRealWeeklySpending(WEEKDAY_LABELS.map((day, i) => ({ day, amount: weeklyTotals[i] })));
      } catch (err) {
        console.error("Failed to load family summary:", err);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    }

    loadFamilySummary();
    return () => {
      cancelled = true;
    };
  }, [getFamilyChildren]);

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="shrink-0">
          <Image src={LOGO_IMAGE} alt="FinFamily" fittingType="fit" className="w-10 h-10 object-contain" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-muted-foreground">Welcome back</div>
          <h1 className="text-lg font-extrabold font-heading truncate">{user?.full_name}</h1>
        </div>
        {/* <button onClick={() => navigate("/child")} className="glass rounded-full px-3 h-10 flex items-center gap-1.5 shadow-premium active:scale-95 transition-all">
          <Repeat2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold">Child Mode</span>
        </button> */}
        <button onClick={() => navigate("/parent/approvals")} className="relative w-10 h-10 rounded-full glass flex items-center justify-center shadow-premium shrink-0">
          <Bell className="w-5 h-5" />
          {pendingApprovals > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{pendingApprovals}</span>
          )}
        </button>
      </FadeIn>

      {/* parent profile card */}
      <FadeIn delay={40} className="mb-4">
        <div className="grad-navy rounded-3xl p-4 text-white shadow-premium flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 ring-2 ring-white/30">
            <Image src={user?.avatar_url || PARENT_IMAGE} alt={user?.full_name || "Parent"} className="w-full h-full object-cover" fittingType="fill" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold">{user?.full_name}</div>
            <div className="text-xs text-white/70">{parent.role}</div>
            <div className="text-xs text-white/50 truncate">{parent.phone}</div>
          </div>
          <Pill className="bg-emerald-400/20 text-emerald-200">Verified ✓</Pill>
        </div>
      </FadeIn>

      {/* summary cards */}
      {/* Fin. Score دلوقتي حقيقي (متوسط أطفال العيلة، كل واحد بيتحسب Live في الباك اند) */}
      <FadeIn delay={60} className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Spending"
          value={summaryLoading ? "…" : fmtEGP(familySummary.totalSpending)}
          trend="this month"
          up={false}
          icon={TrendingDown}
          color="#ef4444"
        />
        <StatCard
          label="Total Savings"
          value={summaryLoading ? "…" : fmtEGP(familySummary.totalSavings)}
          trend="across kids"
          up={true}
          icon={TrendingUp}
          color="#00B894"
        />
        <StatCard
          label="Goals Completed"
          value={summaryLoading ? "…" : familySummary.goalsCompleted}
          trend="this month"
          up={true}
          icon={Target}
          color="#FFC857"
        />
        <StatCard
          label="Fin. Score"
          value={summaryLoading || familySummary.avgScore === null ? "…" : `${familySummary.avgScore}/100`}
          trend="family avg"
          up={true}
          icon={Wallet}
          color="#0F2D52"
        />
      </FadeIn>

      {/* score trend — لسه sample data: الدرجة الحقيقية بتتحسب Live بس مش بنخزّن تاريخها
          أسبوع بأسبوع لحد دلوقتي (محتاج snapshot job دوري)، فمينفعش نرسم trend حقيقي. */}
      <FadeIn delay={120} className="mt-4">
        <GlassCard>
          <SectionTitle action={<Pill color="#94a3b8">Sample data</Pill>}>Financial Score Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={scoreHistory.map((v, i) => ({ week: `W${i+1}`, score: v }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0001" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Line type="monotone" dataKey="score" stroke="#00B894" strokeWidth={3} dot={{ r: 3, fill: "#00B894" }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </FadeIn>

      {/* category breakdown */}
      <FadeIn delay={180} className="mt-4">
        <GlassCard>
          <SectionTitle>Spending by Category</SectionTitle>
          {!summaryLoading && realSpendingCategories.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-6">
              لسه مفيش مصاريف حقيقية (redemptions موافق عليها) نقدر نجمّعها حسب الفئة.
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ResponsiveContainer width="50%" height={140}>
                <PieChart>
                  <Pie data={realSpendingCategories} dataKey="value" innerRadius={35} outerRadius={60} paddingAngle={2}>
                    {realSpendingCategories.map((c) => <Cell key={c.name} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmtEGP(v)} contentStyle={{ borderRadius: 12, border: "none" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {realSpendingCategories.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-muted-foreground flex-1">{c.name}</span>
                    <span className="font-bold">{fmtEGP(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </FadeIn>

      {/* weekly spending bar */}
      <FadeIn delay={240} className="mt-4">
        <GlassCard>
          <SectionTitle>Weekly Spending</SectionTitle>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={realWeeklySpending}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmtEGP(v)} contentStyle={{ borderRadius: 12, border: "none" }} cursor={{ fill: "#0001" }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#0F2D52" barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </FadeIn>

      {/* AI alerts — تنبيهات حقيقية مبنية على قواعد (rule-based) من بيانات العيلة الفعلية */}
      <FadeIn delay={260} className="mt-4">
        <SectionTitle action={<button onClick={() => navigate("/parent/coach")} className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Bot className="w-4 h-4" /> Ask Coach</button>}>AI Alerts & Suggestions</SectionTitle>
        <div className="space-y-2">
          {insights.slice(0, 4).map((ins) => (
            <button key={ins.id} onClick={() => navigate("/parent/coach")} className="w-full glass rounded-2xl p-3 flex items-center gap-3 text-left shadow-premium active:scale-[0.99] transition-all">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${sevColor[ins.severity]}18` }}>
                {iconEmoji[ins.icon] || "💡"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{ins.text}</div>
                <div className="text-[11px] text-muted-foreground truncate">{ins.detail}</div>
              </div>
              {ins.severity === "alert" && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* family management hub */}
      <FadeIn delay={300} className="mt-4">
        <SectionTitle>Family Management</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <MgmtTile icon={Users} color="#0F2D52" label="Members" sub={`${childrenCount} kids`} onClick={() => navigate("/parent/members")} />
          <MgmtTile icon={ListChecks} color="#8b5cf6" label="Chores" sub="Assign tasks" onClick={() => navigate("/parent/chores")} />
          <MgmtTile icon={SlidersHorizontal} color="#3b82f6" label="Limits" sub="Spend caps" onClick={() => navigate("/parent/limits")} />
          <MgmtTile icon={CreditCard} color="#00B894" label="Cards" sub="Freeze / replace" onClick={() => navigate("/parent/cards")} />
          <MgmtTile icon={Gift} color="#FFC857" label="Rewards" sub="Approve" onClick={() => navigate("/parent/rewards")} />
          <MgmtTile icon={Bot} color="#ef4444" label="AI Coach" sub="Family analyst" onClick={() => navigate("/parent/coach")} />
          <MgmtTile icon={Target} color="#10b981" label="Missions" sub="Approve tasks" onClick={() => navigate("/parent/child-missions")} />
        </div>
      </FadeIn>

      {/* quick actions */}
      <FadeIn delay={340} className="grid grid-cols-2 gap-3 mt-4">
        <button onClick={() => navigate("/parent/allowance")} className="glass rounded-2xl p-4 text-left shadow-premium active:scale-95 transition-all">
          <Wallet className="w-6 h-6 text-emerald-600 mb-2" />
          <div className="font-bold text-sm">Send Allowance</div>
          <div className="text-xs text-muted-foreground">Schedule or send now</div>
        </button>
        <button onClick={() => navigate("/parent/insights")} className="glass rounded-2xl p-4 text-left shadow-premium active:scale-95 transition-all">
          <TrendingUp className="w-6 h-6 text-blue-500 mb-2" />
          <div className="font-bold text-sm">AI Insights</div>
          <div className="text-xs text-muted-foreground">Weekly report ready</div>
        </button>
      </FadeIn>

      <FadeIn delay={360} className="mt-4">
        <SectionTitle>Recent Activity</SectionTitle>
        <div className="space-y-2">
          {activity.length === 0 && !summaryLoading && (
            <div className="text-center text-sm text-muted-foreground py-4">No activity yet — assign a chore or send an allowance to get started.</div>
          )}
          {activity.slice(0, 5).map((n) => (
            <div key={n.id} className="glass rounded-2xl p-3 flex items-center gap-3 shadow-premium">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${n.color}18`, color: n.color }}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{n.title}</div>
                <div className="text-xs text-muted-foreground truncate">{n.body}</div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{timeAgo(n.created_date)}</span>
            </div>
          ))}
        </div>
      </FadeIn>
      <div className="h-4" />
    </div>
  );
}

function StatCard({ label, value, trend, up, icon: Icon, color }) {
  return (
    <div className="glass rounded-2xl p-4 shadow-premium">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, color }}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={"text-xs font-bold " + (up ? "text-emerald-600" : "text-red-500")}>{trend}</span>
      </div>
      <div className="text-xl font-extrabold font-heading">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function MgmtTile({ icon: Icon, color, label, sub, onClick }) {
  return (
    <button onClick={onClick} className="glass rounded-2xl p-3 text-center shadow-premium active:scale-95 transition-all">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: `${color}18`, color }}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="font-bold text-xs">{label}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </button>
  );
}