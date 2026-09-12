import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Wallet, GraduationCap, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

export default function ChildLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const nav = [
    { to: "/child", label: t("nav.home"), icon: Home, exact: true },
    { to: "/child/wallet", label: t("nav.wallet"), icon: Wallet },
    { to: "/child/learn", label: t("nav.learn"), icon: GraduationCap },
    { to: "/child/rewards", label: t("nav.rewards"), icon: Gift },
    { to: "/child/profile", label: t("nav.profile"), icon: User },
  ];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Language Toggle for Child */}
      <div className="max-w-md mx-auto flex justify-end gap-2 px-4 pt-3">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <div className="max-w-md mx-auto">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pb-4">
        <div className="glass-dark rounded-3xl flex items-center justify-around p-2 shadow-premium">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all"
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
                    active ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-glow-emerald scale-105" : "bg-white/5"
                  )}
                >
                  <Icon className={cn("w-5 h-5", active ? "text-white" : "text-white/60")} />
                </div>
                <span className={cn("text-[10px] font-semibold", active ? "text-white" : "text-white/50")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}