import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Wallet, GraduationCap, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/child", label: "Home", icon: Home, exact: true },
  { to: "/child/wallet", label: "Wallet", icon: Wallet },
  { to: "/child/learn", label: "Learn", icon: GraduationCap },
  { to: "/child/rewards", label: "Rewards", icon: Gift },
  { to: "/child/profile", label: "Profile", icon: User },
];

export default function ChildLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-md mx-auto">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pb-4">
        <div className="glass-dark rounded-3xl grid grid-cols-5 items-center p-2 shadow-premium">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all"
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