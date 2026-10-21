import React from "react";
import { FRAMES } from "@/lib/cosmetics";
import { cn } from "@/lib/utils";

// بيلف أي أفاتار (children) بإطار الطفل المفعّل من متجر الجواهر. من غير إطار بيرجع children زي ما هي.
export default function AvatarFrame({ frame, children, className }) {
  const f = frame ? FRAMES[frame] : null;
  if (!f) return <>{children}</>;
  return (
    <div
      data-frame={frame}
      className={cn("rounded-full inline-block", className)}
      style={{ background: f.color, padding: 4, boxShadow: `0 0 18px ${f.glow}` }}
    >
      {children}
    </div>
  );
}