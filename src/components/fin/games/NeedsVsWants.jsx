import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { needsWantsItems } from "@/lib/finData";

export default function NeedsVsWants({ onFinish }) {
  const items = needsWantsItems;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const item = items[i];

  const choose = (need) => {
    if (picked !== null) return;
    setPicked(need);
    const correct = need === item.need;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      const next = i + 1;
      if (next < items.length) { setI(next); setPicked(null); }
      else onFinish(score + (correct ? 1 : 0), items.length);
    }, 900);
  };

  return (
    <div className="px-4 pt-8 pb-8 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-bold text-muted-foreground">Item {i + 1}/{items.length}</span>
        <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
          <div className="h-full grad-gold rounded-full transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
        </div>
        <span className="text-xs font-bold text-emerald-600">✓ {score}</span>
      </div>

      <div className="text-center mb-6">
        <div className="text-7xl mb-3">{item.emoji}</div>
        <div className="text-lg font-extrabold font-heading">{item.name}</div>
        <div className="text-sm text-muted-foreground">Is this a Need or a Want?</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => choose(true)}
          disabled={picked !== null}
          className={"p-6 rounded-3xl font-bold text-lg border-2 border-transparent transition-all active:scale-95 " + (picked === null ? "glass" : picked && item.need ? "bg-emerald-100 border-emerald-400" : picked === true ? "bg-red-100 border-red-400" : !item.need ? "opacity-40" : "")}
        >
          <div className="text-3xl mb-1">✅</div>
          Need
        </button>
        <button
          onClick={() => choose(false)}
          disabled={picked !== null}
          className={"p-6 rounded-3xl font-bold text-lg border-2 border-transparent transition-all active:scale-95 " + (picked === null ? "glass" : !picked && !item.need ? "bg-emerald-100 border-emerald-400" : picked === false && item.need ? "bg-red-100 border-red-400" : item.need ? "opacity-40" : "")}
        >
          <div className="text-3xl mb-1">🎮</div>
          Want
        </button>
      </div>

      {picked !== null && (
        <div className="mt-4 rounded-2xl p-3 text-sm text-center animate-pop" style={{ background: picked === item.need ? "#00B89415" : "#ef444415" }}>
          <span className="font-bold">{picked === item.need ? "✅ Correct! " : "❌ Nope. "}</span>
          <span className="text-muted-foreground">{item.name} is a {item.need ? "need — essential for life" : "want — nice to have"}.</span>
        </div>
      )}
    </div>
  );
}