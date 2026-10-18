import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Gamepad2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const slideMeta = [
  { key: "parents", icon: ShieldCheck, color: "#0F2D52", art: "👨‍👩‍👧‍👦" },
  { key: "children", icon: Gamepad2, color: "#00B894", art: "🦁" },
  { key: "ai", icon: Sparkles, color: "#FFC857", art: "🤖" },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const pages = slideMeta.map((s) => ({
    ...s,
    title: t(`onboarding.slides.${s.key}.title`),
    desc: t(`onboarding.slides.${s.key}.desc`),
  }));
  const page = pages[i];
  const Icon = page.icon;
  const last = i === pages.length - 1;

  const next = () => (last ? navigate("/role-select") : setI((p) => p + 1));

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="flex justify-end p-5">
        {!last && (
          <button onClick={() => navigate("/role-select")} className="text-sm font-semibold text-muted-foreground">
            {t("onboarding.skip")}
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
          {last ? t("onboarding.start") : t("onboarding.next")}
        </button>
      </div>
    </div>
  );
}