import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Crown, Flame, Users, Medal, TrendingUp } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill } from "@/components/fin/ui";
import { leaderboardFriends, leaderboardFamilies, child } from "@/lib/finData";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("friends");
  const myRank = leaderboardFriends.find((r) => r.isMe)?.rank || 1;

  const podium = leaderboardFriends.slice(0, 3);
  const podiumOrder = [podium[1], podium[0], podium[2]];

  return (
    <div className="px-4 pt-12 pb-6">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Leaderboard</h1>
        <Pill color="#FFC857" className="ml-auto"><Flame className="w-3 h-3" /> Rank #{myRank}</Pill>
      </FadeIn>

      {/* my rank banner */}
      <FadeIn delay={40}>
        <div className="grad-gold rounded-3xl p-4 text-white shadow-glow-gold flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20" />
          <div className="text-4xl">{child.badges ? "🦁" : "🦁"}</div>
          <div className="flex-1">
            <div className="text-xs text-white/80">Your position</div>
            <div className="text-2xl font-extrabold font-heading">#{myRank} of {leaderboardFriends.length}</div>
            <div className="text-xs text-white/80">{child.xp} XP · Level {child.level}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold">{child.coins}</div>
            <div className="text-xs text-white/80 flex items-center gap-1 justify-end"><TrendingUp className="w-3 h-3" /> coins</div>
          </div>
        </div>
      </FadeIn>

      {/* tabs */}
      <FadeIn delay={80} className="mt-4">
        <div className="glass rounded-2xl p-1.5 flex">
          {[
            { id: "friends", label: "Friends", icon: "🦁" },
            { id: "families", label: "Families", icon: "👨‍👩‍👧" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all ${tab === t.id ? "grad-navy text-white shadow-premium" : "text-muted-foreground"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </FadeIn>

      {tab === "friends" ? (
        <>
          {/* podium */}
          <FadeIn delay={120} className="mt-5">
            <div className="flex items-end justify-center gap-2 mb-2">
              {podiumOrder.map((p, idx) => {
                const isFirst = idx === 1;
                const heights = ["h-20", "h-28", "h-16"];
                const medals = ["🥈", "🥇", "🥉"];
                return (
                  <div key={p.rank} className="flex flex-col items-center" style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className={`relative ${isFirst ? "scale-110" : ""} transition-transform`}>
                      {isFirst && <Crown className="w-5 h-5 text-amber-500 absolute -top-5 left-1/2 -translate-x-1/2" />}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-4 ${isFirst ? "border-amber-400 shadow-glow-gold" : "border-white"}`} style={{ background: isFirst ? "linear-gradient(135deg,#FFC857,#f5a623)" : "#fff" }}>
                        {p.avatar}
                      </div>
                    </div>
                    <div className="text-xs font-bold mt-1 truncate max-w-[64px]">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.score} XP</div>
                    <div className={`mt-1 w-16 ${heights[idx]} rounded-t-xl flex items-start justify-center pt-1 ${isFirst ? "grad-gold" : "glass"}`}>
                      <span className="text-lg">{medals[idx]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>

          {/* ranked list */}
          <FadeIn delay={160} className="mt-3">
            <SectionTitle>Full Ranking</SectionTitle>
            <div className="space-y-2">
              {leaderboardFriends.map((r, i) => (
                <FadeIn key={r.rank} delay={i * 40}>
                  <GlassCard className={`flex items-center gap-3 py-3 ${r.isMe ? "ring-2 ring-amber-400" : ""}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${r.rank <= 3 ? "grad-gold text-white" : "bg-black/5"}`}>
                      {r.rank}
                    </div>
                    <div className="text-2xl">{r.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm flex items-center gap-1">
                        {r.name} {r.isMe && <Pill color="#FFC857" className="text-[10px] py-0">You</Pill>}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{r.family}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm font-heading">{r.score}</div>
                      <div className="text-[10px] text-muted-foreground">XP · Lvl {r.level}</div>
                    </div>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </>
      ) : (
        <FadeIn delay={120} className="mt-5 space-y-3">
          <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Users className="w-4 h-4" /> Family rankings — total XP across all members
          </div>
          {leaderboardFamilies.map((f, i) => (
            <FadeIn key={f.rank} delay={i * 60}>
              <GlassCard className={`flex items-center gap-4 py-4 ${f.isMine ? "ring-2 ring-emerald-400" : ""}`}>
                <div className="text-3xl">{f.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold font-heading flex items-center gap-2">
                    {f.name}
                    {f.isMine && <Pill color="#00B894" className="text-[10px] py-0">Your Family</Pill>}
                  </div>
                  <div className="text-xs text-muted-foreground">{f.members} members · avg score {f.avgScore}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold font-heading text-lg">{f.score.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">total XP</div>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </FadeIn>
      )}
      <div className="h-4" />
    </div>
  );
}