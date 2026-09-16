import React from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Gamepad2 } from "lucide-react";
import { LOGO_IMAGE } from "@/lib/finData";
import { Image } from "@/components/ui/image";

export default function RoleSelect() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="text-center mb-8 animate-slide-up">
        <div className="relative w-28 h-28 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0F2D52] to-[#00B894] blur-xl animate-logo-glow" />
          <div className="relative w-full h-full rounded-full bg-white shadow-premium flex items-center justify-center overflow-hidden animate-logo-float">
            <Image src={LOGO_IMAGE} alt="FinFamily" fittingType="fit" className="w-20 h-20 object-contain" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Who's using the app right now?</p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <button
          onClick={() => navigate("/login")}
          className="group grad-navy rounded-3xl p-6 text-left text-white shadow-premium active:scale-[0.97] transition-all relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-2 text-5xl opacity-80">👨‍💼</div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-heading">I'm a Parent</h3>
          <p className="text-sm text-white/70 mt-1 max-w-[70%]">Log in for the full banking dashboard & controls.</p>
        </button>

        <button
          onClick={() => navigate("/child-login")}
          className="group rounded-3xl p-6 text-left text-white shadow-premium active:scale-[0.97] transition-all relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#00B894,#0F2D52)" }}
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-2 text-5xl opacity-80">🦁</div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-heading">I'm a Kid</h3>
          <p className="text-sm text-white/70 mt-1 max-w-[75%]">Enter your Family Code and PIN to jump in with Lotfy.</p>
        </button>
      </div>
    </div>
  );
}