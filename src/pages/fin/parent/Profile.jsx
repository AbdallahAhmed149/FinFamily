import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft, Shield, Moon, Globe, HelpCircle,
  FileText, LogOut, Users, CreditCard, Bell
} from "lucide-react";
import { Pill, FadeIn, SectionTitle } from "@/components/fin/ui";
import { LOGO_IMAGE, PARENT_IMAGE } from "@/lib/finData";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/useTheme";
import { useLanguage } from "@/lib/LanguageContext";
import { Image } from "@/components/ui/image";
import { AvatarUpload } from "@/components/fin/AvatarUpload";

export default function ParentProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dark, toggle } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  const { user, logout, getFamilyChildren, updateAvatar } = useAuth();

  const [childrenCount, setChildrenCount] = useState("...");

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
    { icon: Users, label: t("parent.profile.settings.manageFamily"), color: "#3b82f6", on: () => navigate("/parent/members") },
    { icon: CreditCard, label: t("parent.profile.settings.billingCards"), color: "#10b981", on: () => navigate("/parent/cards") },
    { icon: Shield, label: t("parent.profile.settings.securityMfa"), color: "#00B894", on: () => navigate("/parent/security") },
    { icon: Bell, label: t("parent.profile.settings.notifications"), color: "#FFC857" },
    { icon: Moon, label: t("parent.profile.settings.darkMode"), color: "#0F2D52", toggle: true, value: dark, on: toggle },
    { icon: Globe, label: t("parent.profile.settings.language", { lang: language === "ar" ? "العربية" : "English" }), color: "#8b5cf6", on: toggleLanguage },
    { icon: HelpCircle, label: t("parent.profile.settings.helpCenter"), color: "#f97316" },
    { icon: FileText, label: t("parent.profile.settings.termsPrivacy"), color: "#64748b" },
    { icon: LogOut, label: t("parent.profile.settings.signOut"), color: "#ef4444", on: logout },
  ];

  return (
    <div className="px-4 pt-12 pb-24">
      {/* Header */}
      <FadeIn className="flex items-center gap-3 mb-5">
        <h1 className="text-xl font-extrabold font-heading text-navy">{t("parent.profile.title")}</h1>
        <Image src={LOGO_IMAGE} alt="FinFamily" fittingType="fit" className="w-9 h-9 object-contain ms-auto" />
      </FadeIn>

      {/* Profile Header Card */}
      <FadeIn delay={60}>
        <div className="grad-navy rounded-3xl p-5 text-white shadow-premium text-center relative overflow-hidden mb-6">
          <div className="absolute -end-6 -top-6 w-28 h-28 rounded-full bg-white/10" />

          <AvatarUpload
            src={user?.avatar_url || PARENT_IMAGE}
            alt={user?.full_name || "Parent"}
            onUpload={updateAvatar}
            size="w-20 h-20"
            className="mx-auto mb-3 rounded-full border-2 border-white/50 shadow-inner bg-white/20"
          />

          <h2 className="text-xl font-extrabold font-heading">{user?.full_name || t("parent.profile.defaultName")}</h2>
          <div className="text-sm text-white/70 mb-3">{user?.email || t("parent.profile.defaultEmail")}</div>

          <div className="flex justify-center gap-2 mt-3">
            <Pill className="bg-white/15 text-white">{t("parent.profile.familyAdmin")}</Pill>
            <Pill className="bg-white/15 text-white">{t("parent.profile.verified")}</Pill>
          </div>
        </div>
      </FadeIn>

      {/* Family Overview */}
      <FadeIn delay={120}>
        <SectionTitle>{t("parent.profile.familyOverview")}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass rounded-2xl p-4 text-center shadow-premium flex flex-col items-center justify-center">
            <Users className="w-6 h-6 text-blue-500 mb-1" />
            <div className="text-xl font-extrabold font-heading text-navy">{childrenCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t("parent.profile.members")}</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center shadow-premium flex flex-col items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-500 mb-1" />
            <div className="text-xl font-extrabold font-heading text-navy">{t("parent.profile.secured")}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t("parent.profile.accountStatus")}</div>
          </div>
        </div>
      </FadeIn>

      {/* Settings List */}
      <FadeIn delay={160}>
        <SectionTitle>{t("parent.profile.settingsTitle")}</SectionTitle>
        <div className="glass rounded-2xl shadow-premium divide-y divide-black/5">
          {settings.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.label} onClick={s.on} className="w-full flex items-center gap-3 p-3.5 active:bg-black/5 transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-start text-sm font-semibold text-navy">{s.label}</span>
                {s.toggle ? (
                  <div className={"w-11 h-6 rounded-full p-0.5 transition-all " + (s.value ? "bg-emerald-500" : "bg-black/10")}>
                    <div className={"w-5 h-5 rounded-full bg-white transition-all " + (s.value ? "translate-x-5 rtl:-translate-x-5" : "")} />
                  </div>
                ) : (
                  <ChevronLeft className="w-4 h-4 text-muted-foreground ltr:rotate-180" />
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