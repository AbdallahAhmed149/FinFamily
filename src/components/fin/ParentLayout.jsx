import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, Sparkles, Bell, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useTranslation } from "react-i18next";

export default function ParentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const nav = [
    { to: "/parent", label: t("nav.dashboard"), icon: LayoutDashboard, exact: true },
    { to: "/parent/allowance", label: t("nav.allowance"), icon: Wallet },
    { to: "/parent/insights", label: t("nav.insights"), icon: Sparkles },
    { to: "/parent/approvals", label: t("nav.approvals"), icon: Bell },
    { to: "/parent/child-missions", label: t("nav.child_missions"), icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* زر تحويل اللغة أعالي الشاشة */}
      <div className="max-w-md mx-auto flex justify-end gap-2 px-4 pt-3">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="max-w-md mx-auto">
        <Outlet />
      </div>

      {/* الشريط السفلي للتنقل */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md">
        <div className="max-w-md mx-auto flex justify-around p-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={cn(
                  "flex flex-col items-center py-2 px-3 rounded-2xl transition-all text-xs font-medium gap-1",
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}