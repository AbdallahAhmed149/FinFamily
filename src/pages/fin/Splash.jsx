import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LOGO_IMAGE } from "@/lib/finData";
import { Image } from "@/components/ui/image";

export default function Splash() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const t = setTimeout(() => navigate("/onboarding"), 4200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="fixed inset-0 grad-hero animate-gradient flex flex-col items-center justify-center overflow-hidden text-white">
      {/* floating coins */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-glow-gold animate-float"
          style={{
            width: 14,
            height: 14,
            left: `${15 + i * 10}%`,
            bottom: "30%",
            animationDelay: `${i * 0.3}s`,
            ["--tx"]: `${(i % 2 ? 1 : -1) * 30}px`,
          }}
        />
      ))}

      {/* logo */}
      <div className="relative flex flex-col items-center z-10">
        <div className="animate-pop" style={{ animationDelay: "0.4s" }}>
          <Image
            src={LOGO_IMAGE}
            alt="FinFamily"
            fittingType="fit"
            className="w-56 h-56 object-contain drop-shadow-2xl"
          />
        </div>
        <p className="mt-4 text-sm text-white/70 font-medium animate-slide-up" style={{ animationDelay: "1.4s" }}>
          {t('splash.subtitle')}
        </p>
      </div>

      <div className="absolute bottom-12 flex gap-1 animate-slide-up" style={{ animationDelay: "3s" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/60" style={{ animation: `pulse-ring 1.2s ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}