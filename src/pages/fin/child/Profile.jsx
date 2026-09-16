import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Gauge, Award, Bell, Shield, Moon, Globe, Accessibility,
  HelpCircle, FileText, LogOut, Settings, Star, Briefcase
} from "lucide-react";
import { GlassCard, ProgressBar, Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { LOGO_IMAGE, LOFTY_IMAGE, skills, levels } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { getMyWallet, getMyMissions, getMyBadges } from "@/lib/finApi";
import BadgesGrid from "@/components/fin/BadgesGrid";
import { useTheme } from "@/lib/useTheme";
import { Image } from "@/components/ui/image";
import { AvatarUpload } from "@/components/fin/AvatarUpload";

export default function ChildProfile() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const { user, updateAvatar } = useAuth(); // اليوزر الحقيقي بتاع الطفل الداخل دلوقتي

  const [wallet, setWallet] = useState(null);
  const [missions, setMissions] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [w, m, b] = await Promise.all([getMyWallet(), getMyMissions(), getMyBadges()]);
        if (!cancelled) {
          setWallet(w);
          setMissions(m);
          setBadges(b);
        }
      } catch {
        // فشل التحميل هنا مش critical — الصفحة بتفضل تشتغل بالقيم الافتراضية
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // اسم اللقب مرتبط بالمستوى — ده محتوى تصنيف ثابت (levels)، مش بيانات مستخدم
  const levelTitle = levels.find((l) => l.level === (user?.level || 1))?.name || "Money Explorer";

  const settings = [
    { icon: Bell, label: "Notifications", color: "#FFC857" },
    { icon: Shield, label: "Security", color: "#00B894" },
    { icon: Moon, label: "Dark Mode", color: "#0F2D52", toggle: true, value: dark, on: toggle },
    { icon: Globe, label: "Language · English", color: "#3b82f6" },
    { icon: Accessibility, label: "Accessibility", color: "#8b5cf6" },
    { icon: HelpCircle, label: "Help Center", color: "#f97316" },
    { icon: FileText, label: "Terms & Privacy", color: "#64748b" },
    { icon: LogOut, label: "Switch Role", color: "#ef4444", on: () => navigate("/role-select") },
  ];

  return (
    <div className="px-4 pt-12">
      <FadeIn className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">Profile</h1>
        <Image src={LOGO_IMAGE} alt="FinFamily" fittingType="fit" className="w-9 h-9 object-contain ml-auto" />
      </FadeIn>

      {/* profile header */}
      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-5 text-white shadow-premium text-center relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <AvatarUpload
            src={user?.avatar_url || LOFTY_IMAGE}
            alt={user?.full_name || "Kid"}
            onUpload={updateAvatar}
            size="w-20 h-20"
            className="mx-auto mb-3 rounded-full border-2 border-white/50 shadow-inner bg-white/20"
          />
          <h2 className="text-xl font-extrabold font-heading">{user?.full_name}</h2>
          <div className="text-sm text-white/70">{levelTitle}</div>
          <div className="flex justify-center gap-2 mt-3">
            <Pill className="bg-white/15 text-white">Level {user?.level ?? 1}</Pill>
            <Pill className="bg-white/15 text-white">🪙 {wallet ? Math.round(wallet.balance) : "···"}</Pill>
            <Pill className="bg-white/15 text-white">{user?.xp ?? 0} XP</Pill>
          </div>
        </div>
      </FadeIn>

      {/* financial score gauge */}
      <FadeIn delay={120}>
        <SectionTitle>Financial Score</SectionTitle>
        <GlassCard className="text-center">
          <div className="relative w-40 h-20 mx-auto overflow-hidden">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="8" strokeLinecap="round" />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray="126" strokeDashoffset={126 - (126 * (wallet?.financial_score ?? 50)) / 100} className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFC857" />
                  <stop offset="100%" stopColor="#00B894" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <div className="text-3xl font-extrabold font-heading">{wallet?.financial_score ?? "···"}</div>
              <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><Star className="w-3 h-3" /> Live score</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">Excellent financial discipline! Keep it up. 🌟</div>
        </GlassCard>
      </FadeIn>

      {/* my financial journey — skills */}
      {/* ملحوظة: نسب الإتقان دي لسه مش متتبّعة في الـ backend (محتاجة نظام تقييم مهارات
          مستقل مش مبني لسه) — لسه محتوى ثابت زي أي حاجة تانية في finData.js */}
      <FadeIn delay={160}>
        <SectionTitle>My Financial Journey</SectionTitle>
        <GlassCard>
          <div className="space-y-3">
            {skills.map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold">{s.name}</span>
                  <span className="font-bold" style={{ color: s.color }}>{s.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-black/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.value}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </FadeIn>

      {/* badges — حقيقية دلوقتي من /badges/mine، بشكل hexagon زي Kaggle (اضغط تشوف تفاصيل) */}
      <FadeIn delay={200}>
        <SectionTitle>Badges</SectionTitle>
        <BadgesGrid badges={badges} />
      </FadeIn>

      {/* missions progress — حقيقي دلوقتي، من MissionOut الفعلية (kind=chore بس) */}
      <FadeIn delay={240}>
        <SectionTitle>My Chores</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl p-3 text-center shadow-premium">
            <div className="text-xl font-extrabold font-heading text-emerald-600">{missions.filter((m) => m.kind === "chore" && m.status === "approved").length}</div>
            <div className="text-[10px] text-muted-foreground">Approved</div>
          </div>
          <div className="glass rounded-2xl p-3 text-center shadow-premium">
            <div className="text-xl font-extrabold font-heading text-amber-500">{missions.filter((m) => m.kind === "chore" && m.status === "submitted").length}</div>
            <div className="text-[10px] text-muted-foreground">Waiting</div>
          </div>
          <div className="glass rounded-2xl p-3 text-center shadow-premium">
            <div className="text-xl font-extrabold font-heading text-blue-500">{missions.filter((m) => m.kind === "chore" && m.status === "pending").length}</div>
            <div className="text-[10px] text-muted-foreground">To Do</div>
          </div>
        </div>
      </FadeIn>

      {/* settings list */}
      <FadeIn delay={240}>
        <SectionTitle>Settings</SectionTitle>
        <div className="glass rounded-2xl shadow-premium divide-y divide-black/5">
          {settings.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.label} onClick={s.on} className="w-full flex items-center gap-3 p-3.5 active:bg-black/5 transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left text-sm font-semibold">{s.label}</span>
                {s.toggle ? (
                  <div className={"w-11 h-6 rounded-full p-0.5 transition-all " + (s.value ? "bg-emerald-500" : "bg-black/10")}>
                    <div className={"w-5 h-5 rounded-full bg-white transition-all " + (s.value ? "translate-x-5" : "")} />
                  </div>
                ) : (
                  <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                )}
              </button>
            );
          })}
        </div>
      </FadeIn>
      <div className="h-4" />
    </div>
  );
}