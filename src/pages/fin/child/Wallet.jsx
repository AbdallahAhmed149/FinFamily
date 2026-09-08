import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ShoppingBag, Utensils, ShoppingCart, Film, Book, Circle, Wallet,
  Target, ArrowDownLeft, ArrowUpRight, MapPin, Receipt, Clock, CreditCard
} from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { child, transactions, fmtEGP, timeAgo } from "@/lib/finData";

const iconMap = {
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  utensils: Utensils,
  film: Film,
  book: Book,
  circle: Circle,
  wallet: Wallet,
  target: Target,
};

export default function WalletPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  const stats = [
    { label: "Pending Allowance", value: fmtEGP(child.pendingAllowance), icon: ArrowDownLeft, color: "#FFC857" },
    { label: "Savings", value: fmtEGP(child.savingsBalance), icon: Target, color: "#00B894" },
    { label: "Today's Spending", value: fmtEGP(child.todaySpending), icon: ArrowUpRight, color: "#ef4444" },
  ];

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Smart Wallet</h1>
      </FadeIn>

      {/* balance card */}
      <FadeIn delay={60}>
        <div className="grad-emerald rounded-3xl p-5 text-white shadow-premium relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="text-sm text-white/80">Current Balance</div>
          <div className="text-3xl font-extrabold font-heading mt-1">{fmtEGP(child.walletBalance)}</div>
          <button onClick={() => navigate("/child/card")} className="mt-4 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 text-sm font-semibold">
            <CreditCard className="w-4 h-4" /> View Meeza Card
          </button>
        </div>
      </FadeIn>

      {/* mini stats */}
      <FadeIn delay={120} className="grid grid-cols-3 gap-3 mt-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass rounded-2xl p-3 text-center shadow-premium">
              <div className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center mb-1" style={{ background: `${s.color}22`, color: s.color }}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
            </div>
          );
        })}
      </FadeIn>

      {/* card status */}
      <FadeIn delay={180}>
        <GlassCard className="flex items-center gap-3 mt-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold">Card Active</span>
          <span className="text-xs text-muted-foreground ml-auto">All systems secure 🔒</span>
        </GlassCard>
      </FadeIn>

      {/* transactions */}
      <FadeIn delay={240}>
        <SectionTitle action={<button className="text-xs font-semibold text-emerald-600">Filter</button>}>Transactions</SectionTitle>
        <div className="space-y-2.5">
          {transactions.map((t, idx) => {
            const Icon = iconMap[t.icon] || Wallet;
            const open = expanded === t.id;
            const income = t.amount > 0;
            return (
              <div key={t.id} className="animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                <button
                  onClick={() => setExpanded(open ? null : t.id)}
                  className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 shadow-premium active:scale-[0.99] transition-all"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: income ? "#00B89422" : "#0F2D5218", color: income ? "#00B894" : "#0F2D52" }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-sm truncate">{t.merchant}</div>
                    <div className="text-xs text-muted-foreground">{timeAgo(t.date)}</div>
                  </div>
                  <div className={"font-bold text-sm " + (income ? "text-emerald-600" : "text-foreground")}>
                    {income ? "+" : ""}{fmtEGP(Math.abs(t.amount))}
                  </div>
                </button>
                {open && (
                  <div className="glass rounded-2xl mt-1.5 p-4 animate-pop space-y-2.5">
                    <Row icon={MapPin} label="Location" value={t.location} />
                    <Row icon={Clock} label="Date & Time" value={new Date(t.date).toLocaleString("en-EG", { dateStyle: "medium", timeStyle: "short" })} />
                    <div className="flex items-center gap-2.5">
                      <Pill color="#0F2D52">{t.category}</Pill>
                      <Pill color={income ? "#00B894" : "#64748b"}>{t.type}</Pill>
                    </div>
                    {t.receipt && <Row icon={Receipt} label="Receipt" value={t.receipt} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FadeIn>
      <div className="h-4" />
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold ml-auto">{value}</span>
    </div>
  );
}