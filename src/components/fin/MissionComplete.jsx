import React, { useEffect, useState } from "react";
import { Star, X, Flame, ArrowRight } from "lucide-react";

export default function MissionComplete({ xp = 50, badge, streak = 5, nextMission, onClose }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 200); return () => clearTimeout(t); }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10 animate-pop relative min-h-[80vh]">
      <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
        <X className="w-4 h-4" />
      </button>

      <div className="relative h-24 mb-4 w-full max-w-xs">
        {[...Array(12)].map((_, i) => (
          <span key={i} className="absolute text-2xl animate-float" style={{ left: `${8 + i * 7}%`, top: "10%", ["--tx"]: `${(i % 2 ? 1 : -1) * 30}px`, animationDelay: `${i * 0.07}s` }}>🎉</span>
        ))}
      </div>

      <div className="text-6xl mb-2">🏆</div>
      <h2 className="text-2xl font-extrabold font-heading">Mission Complete!</h2>
      <p className="text-sm text-muted-foreground mt-1">You're becoming a Financial Hero!</p>

      <div className="grad-emerald rounded-2xl px-6 py-3 text-white shadow-glow-emerald mt-4">
        <div className="text-3xl font-extrabold">+{xp}</div>
        <div className="text-xs">XP earned ⭐</div>
      </div>

      {badge && show && (
        <div className="mt-4 rounded-2xl p-4 animate-pop w-full max-w-xs" style={{ background: `${badge.color}15` }}>
          <div className="text-xs font-semibold text-muted-foreground">🏆 Badge Unlocked</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-premium" style={{ background: `linear-gradient(135deg, ${badge.color}, ${badge.color}cc)` }}>{badge.icon}</div>
            <div className="text-left">
              <div className="font-bold">{badge.name}</div>
              <div className="text-[11px] text-muted-foreground">{badge.desc}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 text-sm font-semibold text-orange-500">
        <Flame className="w-4 h-4" /> {streak}-day streak — keep it going!
      </div>

      {nextMission && (
        <div className="mt-5 glass rounded-2xl p-4 w-full max-w-xs text-left">
          <div className="text-xs text-muted-foreground">Next Mission</div>
          <div className="font-bold text-sm">{nextMission}</div>
        </div>
      )}

      <button onClick={onClose} className="w-full max-w-xs h-13 py-3.5 mt-5 rounded-2xl text-white font-bold font-heading grad-navy shadow-premium active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        Continue Adventure <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}