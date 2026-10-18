import React from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * سويتش بسيط EN / عربي. الدايفولت (variant="light") لخلفيات فاتحة،
 * و variant="dark" لخلفيات غامقة أو ملوّنة (زي شاشات الأطفال).
 */
export default function LanguageToggle({ variant = "light", className }) {
  const { language, toggleLanguage } = useLanguage();
  const isDark = variant === "dark";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
        isDark
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-muted text-foreground hover:bg-muted/70",
        className
      )}
      aria-label="Toggle language"
    >
      <Languages className="w-3.5 h-3.5" />
      {language === "ar" ? "English" : "العربية"}
    </button>
  );
}