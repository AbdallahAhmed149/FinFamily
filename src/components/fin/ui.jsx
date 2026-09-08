import React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({ className, children, dark, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-3xl p-5 shadow-premium transition-all",
        dark ? "glass-dark text-white" : "glass text-foreground",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatTile({ icon: Icon, label, value, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass rounded-2xl p-4 text-left shadow-premium transition-all active:scale-95 w-full"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
        style={{ background: `${accent}22`, color: accent }}
      >
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <div className="text-lg font-bold font-heading">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </button>
  );
}

export function ProgressBar({ value, max = 100, color = "#00B894", className }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn("h-2.5 rounded-full bg-black/5 overflow-hidden", className)}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
      />
    </div>
  );
}

export function ProgressRing({ value, size = 64, stroke = 6, color = "#00B894", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, value) / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function Pill({ children, color = "#00B894", className }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold", className)}
      style={{ background: `${color}1a`, color }}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-1">
      <h2 className="text-base font-bold font-heading">{children}</h2>
      {action}
    </div>
  );
}

export function FadeIn({ children, delay = 0, className }) {
  return (
    <div
      className={cn("animate-slide-up", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}