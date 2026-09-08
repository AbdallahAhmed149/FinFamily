import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, Sparkles, Bell, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/parent", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/parent/allowance", label: "Allowance", icon: Wallet },
  { to: "/parent/insights", label: "AI Insights", icon: Sparkles },
  { to: "/parent/approvals", label: "Approvals", icon: Bell },
  { to: "/parent/child-missions", label: "Missions", icon: Target },
];

export default function ParentLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-md mx-auto">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pb-4">
        <div className="glass rounded-3xl flex items-center justify-around p-2 shadow-premium">
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
                    active ? "grad-navy shadow-premium scale-105" : "bg-black/5"
                  )}
                >
                  <Icon className={cn("w-5 h-5", active ? "text-white" : "text-navy/50")} style={{ color: active ? "white" : "hsl(var(--muted-foreground))" }} />
                </div>
                <span className={cn("text-[10px] font-semibold", active ? "text-navy" : "text-muted-foreground")} style={{ color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
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