import React from "react";
import { LOFTY_IMAGE } from "@/lib/finData";
import { cn } from "@/lib/utils";

export default function Lotfy({ size = 120, className, speech }) {
  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl scale-110" />
        <img
          src={LOFTY_IMAGE}
          alt="Lotfy"
          className="relative rounded-full object-cover shadow-glow-emerald border-4 border-white"
          style={{ width: size, height: size }}
        />
      </div>
      {speech && (
        <div className="absolute -top-2 -right-6 max-w-[180px] glass rounded-2xl px-3 py-2 text-xs font-medium shadow-premium animate-pop">
          {speech}
        </div>
      )}
    </div>
  );
}