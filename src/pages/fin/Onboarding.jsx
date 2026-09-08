import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Gamepad2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const pages = [
  {
    icon: ShieldCheck,
    title: "Parents Stay in Control",
    desc: "Set allowances, approve purchases, and monitor spending — all from one secure dashboard.",
    color: "#0F2D52",
    art: "👨‍👩‍👧‍👦",
  },
  {
    icon: Gamepad2,
    title: "Children Learn by Doing",
    desc: "Lotfy saves, budgets, and plays educational games that build real financial habits.",
    color: "#00B894",
    art: "🦁",
  },
  {
    icon: Sparkles,
    title: "AI Builds Healthy Habits",
    desc: "A personal AI coach guides every decision, celebrates wins, and recommends the next step.",
    color: "#FFC857",
    art: "🤖",
  },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const page = pages[i];
  const Icon = page.icon;
  const last = i === pages.length - 1;

  const next = () => (last ? navigate("/role-select") : setI((p) => p + 1));

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="flex justify-end p-5">
        {!last && (
          <button onClick={() => navigate("/role-select")} className="text-sm font-semibold text-muted-foreground">
            Skip
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          key={i}
          className="w-44 h-44 rounded-[2.5rem] flex items-center justify-center text-7xl mb-8 animate-pop shadow-premium"
          style={{ background: `linear-gradient(135deg, ${page.color}22, ${page.color}11)` }}
        >
          <span>{page.art}</span>
        </div>
        <div
          key={`icon-${i}`}
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 animate-pop text-white"
          style={{ background: `linear-gradient(135deg, ${page.color}, ${page.color}dd)`, boxShadow: `0 8px 30px -6px ${page.color}88` }}
        >
          <Icon className="w-7 h-7" />
        </div>
        <h2 key={`t-${i}`} className="text-2xl font-extrabold font-heading animate-slide-up">{page.title}</h2>
        <p key={`d-${i}`} className="mt-3 text-muted-foreground leading-relaxed max-w-xs animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {page.desc}
        </p>
      </div>

      <div className="px-8 pb-10">
        <div className="flex justify-center gap-2 mb-6">
          {pages.map((_, idx) => (
            <span
              key={idx}
              className={cn("h-2 rounded-full transition-all", idx === i ? "w-7 bg-emerald-500" : "w-2 bg-black/10")}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="w-full h-14 rounded-2xl text-white font-bold font-heading shadow-premium active:scale-[0.98] transition-all"
          style={{ background: last ? "linear-gradient(135deg,#00B894,#0F2D52)" : "linear-gradient(135deg,#0F2D52,#1a4571)" }}
        >
          {last ? "Start Journey" : "Next"}
        </button>
      </div>
    </div>
  );
}