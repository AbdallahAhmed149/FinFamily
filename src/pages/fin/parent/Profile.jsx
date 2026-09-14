import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Shield, Moon, Globe, HelpCircle, 
  FileText, LogOut, Users, CreditCard, Bell
} from "lucide-react";
import { Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
// 1. ADDED PARENT_IMAGE HERE
import { LOGO_IMAGE, PARENT_IMAGE } from "@/lib/finData"; 
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/useTheme";
import { Image } from "@/components/ui/image";

export default function ParentProfile() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  
  // 2. DESTRUCTURED getFamilyChildren HERE
  const { user, logout, getFamilyChildren } = useAuth(); 

  // 3. ADDED STATE FOR CHILDREN COUNT
  const [childrenCount, setChildrenCount] = useState("...");

  // 4. ADDED EFFECT TO FETCH MEMBERS JUST LIKE THE DASHBOARD
  useEffect(() => {
    let cancelled = false;
    async function loadMembers() {
      try {
        const { children } = await getFamilyChildren();
        if (!cancelled) setChildrenCount(children.length);
      } catch (err) {
        if (!cancelled) setChildrenCount("-");
      }
    }
    loadMembers();
    return () => { cancelled = true; };
  }, [getFamilyChildren]);

  const settings = [
    { icon: Users, label: "Manage Family", color: "#3b82f6", on: () => navigate("/parent/members") },
    { icon: CreditCard, label: "Billing & Cards", color: "#10b981", on: () => navigate("/parent/cards") },
    { icon: Shield, label: "Security & MFA", color: "#00B894", on: () => navigate("/parent/security") },
    { icon: Bell, label: "Notifications", color: "#FFC857" },
    { icon: Moon, label: "Dark Mode", color: "#0F2D52", toggle: true, value: dark, on: toggle },
    { icon: Globe, label: "Language · English", color: "#8b5cf6" },
    { icon: HelpCircle, label: "Help Center", color: "#f97316" },
    { icon: FileText, label: "Terms & Privacy", color: "#64748b" },
    { icon: LogOut, label: "Sign Out", color: "#ef4444", on: logout },
  ];

  return (
    <div className="px-4 pt-12 pb-24">
      {/* Header */}
      <FadeIn className="flex items-center gap-3 mb-5">
        <h1 className="text-xl font-extrabold font-heading text-navy">Profile</h1>
        <Image src={LOGO_IMAGE} alt="FinFamily" fittingType="fit" className="w-9 h-9 object-contain ml-auto" />
      </FadeIn>

      {/* Profile Header Card */}
      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-5 text-white shadow-premium text-center relative overflow-hidden mb-6">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          
          {/* 5. REPLACED THE INITIAL WITH THE ACTUAL PARENT_IMAGE */}
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 overflow-hidden border-2 border-white/50 shadow-inner">
            <Image src={PARENT_IMAGE} alt={user?.full_name || "Parent"} className="w-full h-full object-cover" fittingType="fill" />
          </div>
          
          <h2 className="text-xl font-extrabold font-heading">{user?.full_name || "Parent User"}</h2>
          <div className="text-sm text-white/70 mb-3">{user?.email || "parent@family.com"}</div>
          
          <div className="flex justify-center gap-2 mt-3">
            <Pill className="bg-white/15 text-white">Family Admin</Pill>
            <Pill className="bg-white/15 text-white">Verified 🛡️</Pill>
          </div>
        </div>
      </FadeIn>

      {/* Family Overview */}
      <FadeIn delay={120}>
        <SectionTitle>Family Overview</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass rounded-2xl p-4 text-center shadow-premium flex flex-col items-center justify-center">
            <Users className="w-6 h-6 text-blue-500 mb-1" />
            {/* 6. REPLACED "Active" WITH {childrenCount} */}
            <div className="text-xl font-extrabold font-heading text-navy">{childrenCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Members</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center shadow-premium flex flex-col items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-500 mb-1" />
            <div className="text-xl font-extrabold font-heading text-navy">Secured</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Account Status</div>
          </div>
        </div>
      </FadeIn>

      {/* Settings List */}
      <FadeIn delay={160}>
        <SectionTitle>Settings</SectionTitle>
        <div className="glass rounded-2xl shadow-premium divide-y divide-black/5">
          {settings.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.label} onClick={s.on} className="w-full flex items-center gap-3 p-3.5 active:bg-black/5 transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left text-sm font-semibold text-navy">{s.label}</span>
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