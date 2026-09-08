import React from "react";
import { Star, X } from "lucide-react";

export default function RewardScreen({ title = "Great job!", score, total, coins, xp, onClose }) {
  const pct = total ? Math.round((score / total) * 100) : 100;
  const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10 animate-pop">
      <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
        <X className="w-4 h-4" />
      </button>

      <div className="relative h-28 mb-4 w-full max-w-xs">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="absolute text-2xl animate-float"
            style={{ left: `${10 + i * 8}%`, top: "10%", ["--tx"]: `${(i % 2 ? 1 : -1) * 30}px`, animationDelay: `${i * 0.08}s` }}
          >🪙</span>
        ))}
      </div>

      <div className="text-5xl mb-2">{stars === 3 ? "🏆" : stars === 2 ? "🎉" : "💪"}</div>
      <h2 className="text-2xl font-extrabold font-heading">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">You scored {score} out of {total}</p>

      <div className="flex gap-1 my-4">
        {[1, 2, 3].map((s) => (
          <Star key={s} className={"w-9 h-9 " + (s <= stars ? "text-amber-400 fill-amber-400" : "text-black/15")} />
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <div className="grad-gold rounded-2xl px-5 py-3 text-white shadow-glow-gold">
          <div className="text-2xl font-extrabold">+{coins}</div>
          <div className="text-xs">Coins 🪙</div>
        </div>
        <div className="grad-emerald rounded-2xl px-5 py-3 text-white shadow-glow-emerald">
          <div className="text-2xl font-extrabold">+{xp}</div>
          <div className="text-xs">XP ⭐</div>
        </div>
      </div>

      <button onClick={onClose} className="w-full max-w-xs h-13 py-3.5 rounded-2xl text-white font-bold font-heading grad-navy shadow-premium active:scale-[0.98] transition-all">
        Claim Reward
      </button>
    </div>
  );
}