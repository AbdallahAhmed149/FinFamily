import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Crown, Flame } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle, Pill } from "@/components/fin/ui";
import { fmtEGP } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { getMyWallet } from "@/lib/finApi";

const AVATARS = ["🦁", "🦊", "🐻", "🐱", "🐯", "🐰"];

export default function Leaderboard() {
  const navigate = useNavigate();
  const { getFamilyChildren, user } = useAuth();

  const [siblings, setSiblings] = useState([]); // مرتبة بالـ XP نزولًا
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ children }, wallet] = await Promise.all([getFamilyChildren(), getMyWallet()]);
      setSiblings([...children].sort((a, b) => (b.xp || 0) - (a.xp || 0)));
      setBalance(wallet.balance || 0);
    } catch (err) {
      setError(err.message || "تعذر تحميل الترتيب");
    } finally {
      setLoading(false);
    }
  }, [getFamilyChildren]);

  useEffect(() => {
    load();
  }, [load]);

  const myRank = siblings.findIndex((c) => c.id === user?.id) + 1;
  const podium = siblings.slice(0, 3);
  const podiumOrder = [podium[1], podium[0], podium[2]]; // 2nd - 1st - 3rd للعرض

  return (
    <div className="px-4 pt-12 pb-6">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Family Leaderboard</h1>
        {myRank > 0 && <Pill color="#FFC857" className="ml-auto"><Flame className="w-3 h-3" /> Rank #{myRank}</Pill>}
      </FadeIn>

      {error && (
        <FadeIn className="mb-3">
          <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        </FadeIn>
      )}

      {/* my rank banner */}
      {!loading && myRank > 0 && (
        <FadeIn delay={40}>
          <div className="grad-gold rounded-3xl p-4 text-white shadow-glow-gold flex items-center gap-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20" />
            <div className="text-4xl">🦁</div>
            <div className="flex-1">
              <div className="text-xs text-white/80">Your position</div>
              <div className="text-2xl font-extrabold font-heading">#{myRank} of {siblings.length}</div>
              <div className="text-xs text-white/80">{user?.xp ?? 0} XP · Level {user?.level ?? 1}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold">{fmtEGP(balance)}</div>
              <div className="text-xs text-white/80">wallet</div>
            </div>
          </div>
        </FadeIn>
      )}

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-10">...بنحمّل</div>
      ) : siblings.length <= 1 ? (
        <FadeIn delay={80} className="mt-6">
          <div className="text-center text-sm text-muted-foreground py-10">
            الترتيب بيظهر لما يبقى فيه أكتر من طفل في العيلة — دلوقتي إنت الوحيد المسجل. 🦁
          </div>
        </FadeIn>
      ) : (
        <>
          {/* podium */}
          <FadeIn delay={120} className="mt-5">
            <div className="flex items-end justify-center gap-2 mb-2">
              {podiumOrder.map((p, idx) => {
                if (!p) return <div key={idx} className="w-14" />;
                const isFirst = idx === 1;
                const heights = ["h-20", "h-28", "h-16"];
                const medals = ["🥈", "🥇", "🥉"];
                const avatar = AVATARS[siblings.findIndex((s) => s.id === p.id) % AVATARS.length];
                return (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className={`relative ${isFirst ? "scale-110" : ""} transition-transform`}>
                      {isFirst && <Crown className="w-5 h-5 text-amber-500 absolute -top-5 left-1/2 -translate-x-1/2" />}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-4 ${isFirst ? "border-amber-400 shadow-glow-gold" : "border-white"}`} style={{ background: isFirst ? "linear-gradient(135deg,#FFC857,#f5a623)" : "#fff" }}>
                        {avatar}
                      </div>
                    </div>
                    <div className="text-xs font-bold mt-1 truncate max-w-[64px]">{p.full_name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.xp} XP</div>
                    <div className={`mt-1 w-16 ${heights[idx]} rounded-t-xl flex items-start justify-center pt-1 ${isFirst ? "grad-gold" : "glass"}`}>
                      <span className="text-lg">{medals[idx]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>

          {/* full ranking */}
          <FadeIn delay={160} className="mt-3">
            <SectionTitle>Full Ranking</SectionTitle>
            <div className="space-y-2">
              {siblings.map((s, i) => {
                const isMe = s.id === user?.id;
                const avatar = AVATARS[i % AVATARS.length];
                return (
                  <FadeIn key={s.id} delay={i * 40}>
                    <GlassCard className={`flex items-center gap-3 py-3 ${isMe ? "ring-2 ring-amber-400" : ""}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${i < 3 ? "grad-gold text-white" : "bg-black/5"}`}>
                        {i + 1}
                      </div>
                      <div className="text-2xl">{avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm flex items-center gap-1">
                          {s.full_name} {isMe && <Pill color="#FFC857" className="text-[10px] py-0">You</Pill>}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{s.streak}-day streak</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-sm font-heading">{s.xp}</div>
                        <div className="text-[10px] text-muted-foreground">XP · Lvl {s.level}</div>
                      </div>
                    </GlassCard>
                  </FadeIn>
                );
              })}
            </div>
          </FadeIn>
        </>
      )}
      <div className="h-4" />
    </div>
  );
}