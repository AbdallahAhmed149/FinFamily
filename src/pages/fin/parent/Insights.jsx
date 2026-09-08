import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Download, FileText } from "lucide-react";
import { GlassCard, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { aiInsights, parentSummary, child } from "@/lib/finData";
import { fmtEGP } from "@/lib/finData";

const iconEmoji = { utensils: "🍽️", "piggy-bank": "🐷", "trending-up": "📈", "shield-check": "🛡️", wallet: "👛", target: "🎯", sparkles: "✨" };

export default function Insights() {
  const navigate = useNavigate();
  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">AI Insights</h1>
        <div className="ml-auto flex gap-2">
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center"><Download className="w-4 h-4" /></button>
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center"><FileText className="w-4 h-4" /></button>
        </div>
      </FadeIn>

      {/* report card */}
      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-5 text-white shadow-premium relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🤖</span>
            <span className="text-sm font-semibold text-white/80">Weekly AI Report · Lotfy</span>
          </div>
          <div className="text-3xl font-extrabold font-heading">Financial Score {child.financialScore}/100</div>
          <div className="flex gap-2 mt-3">
            <Pill className="bg-emerald-400/20 text-emerald-200">Saving +{parentSummary.savingImprovement}%</Pill>
            <Pill className="bg-amber-400/20 text-amber-200">Impulse -{parentSummary.impulseDrop}%</Pill>
          </div>
        </div>
      </FadeIn>

      {/* insight cards */}
      <FadeIn delay={120}>
        <SectionTitle>Key Findings</SectionTitle>
        <div className="space-y-3">
          {aiInsights.map((ins, i) => (
            <FadeIn key={ins.id} delay={i * 50}>
              <GlassCard className="flex gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{ background: `${ins.color}18` }}>
                  {iconEmoji[ins.icon] || "💡"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{ins.text}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{ins.detail}</div>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      {/* recommendation */}
      <FadeIn delay={240} className="mt-4">
        <GlassCard className="text-center" >
          <div className="text-3xl mb-2">🎯</div>
          <div className="font-bold">Suggested Challenge</div>
          <div className="text-sm text-muted-foreground mt-1">Save 30 EGP this week to complete the bicycle goal 2 weeks early.</div>
          <button className="mt-3 px-5 h-10 rounded-xl text-white font-bold text-sm grad-emerald">Assign to Lotfy</button>
        </GlassCard>
      </FadeIn>

      {/* allowance recommendation */}
      <FadeIn delay={300} className="mt-4">
        <GlassCard className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Recommended Allowance</div>
            <div className="text-2xl font-extrabold font-heading">{fmtEGP(parentSummary.recommendedAllowance)}</div>
            <div className="text-xs text-muted-foreground">Based on spending + goals</div>
          </div>
          <Pill color="#00B894">AI suggested</Pill>
        </GlassCard>
      </FadeIn>
      <div className="h-4" />
    </div>
  );
}