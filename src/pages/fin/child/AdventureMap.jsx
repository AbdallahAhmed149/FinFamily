import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock, Check, Play, MapPin } from "lucide-react";
import { GlassCard, ProgressBar, FadeIn, SectionTitle } from "@/components/fin/ui";
import GameLauncher from "@/components/fin/GameLauncher";
import { adventureWorlds, child, levels, fmtEGP } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";

export default function AdventureMap() {
  const navigate = useNavigate();
  const { user } = useAuth(); // level/xp الحقيقيين بدل الموك
  const [activeGame, setActiveGame] = useState(null);

  const myLevel = user?.level ?? child.level;
  const myXp = user?.xp ?? child.xp;
  const level = levels.find((l) => l.level === myLevel) || levels[0];

  const launch = (w) => {
    if (w.status !== "unlocked") return;
    setActiveGame({ id: w.game, title: w.name, icon: w.icon, color: w.color, xp: 50 });
  };

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold font-heading">Financial Adventure</h1>
          <div className="text-xs text-muted-foreground">Level {myLevel} · {level.name} · {myXp} XP</div>
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-4 text-white shadow-premium text-center relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative text-sm">Your journey to becoming a Financial Hero 🦸</div>
          <div className="text-xs text-white/70 mt-1">Complete each world to unlock the next</div>
        </div>
      </FadeIn>

      {/* vertical journey */}
      <div className="relative mt-6">
        <div className="absolute left-7 top-4 bottom-4 w-1 bg-black/5 rounded-full" />
        <div className="space-y-4">
          {adventureWorlds.map((w, idx) => {
            const locked = w.status === "locked";
            const done = w.progress >= 100;
            return (
              <FadeIn key={w.id} delay={idx * 60}>
                <div className="relative pl-16">
                  <div className="absolute left-0 top-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-premium z-10" style={{ background: locked ? "#0001" : `linear-gradient(135deg, ${w.color}, ${w.color}cc)`, color: locked ? "#999" : "#fff" }}>
                    {locked ? <Lock className="w-5 h-5" /> : w.icon}
                  </div>
                  <button onClick={() => launch(w)} disabled={locked} className={"w-full glass rounded-2xl p-4 text-left shadow-premium transition-all " + (locked ? "opacity-60" : "active:scale-[0.99]")}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground">WORLD {idx + 1}</div>
                        <div className="font-extrabold font-heading">{w.name}</div>
                      </div>
                      {done ? <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div> : locked ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Play className="w-5 h-5" style={{ color: w.color }} />}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {w.topics.map((t) => (
                        <span key={t} className="text-[10px] rounded-full px-2 py-0.5" style={{ background: `${w.color}12`, color: w.color }}>{t}</span>
                      ))}
                    </div>
                    {!locked && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Progress</span><span>{w.progress}%</span></div>
                        <ProgressBar value={w.progress} color={w.color} />
                      </div>
                    )}
                    {locked && <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Unlocks at Level {w.unlockLevel}</div>}
                  </button>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
      <div className="h-4" />

      {activeGame && <GameLauncher game={activeGame} onClose={() => setActiveGame(null)} />}
    </div>
  );
}