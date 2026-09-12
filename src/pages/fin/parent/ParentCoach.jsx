import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Sparkles, AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";
import { Pill, FadeIn } from "@/components/fin/ui";
import { familyMembers } from "@/lib/finData";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "react-i18next";



export default function ParentCoach() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const SUGGESTIONS = t("parent_coach.suggestions", { returnObjects: true });

  const [messages, setMessages] = useState([
    { role: "ai", text: t("parent_coach.welcome"), icon: "🤖" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      // التعديل هنا: استخدام دالة post اللي عملناها، وتوجيهها للـ Route بتاعنا
      const res = await base44.post("/functions/aiCoach", { message: msg, mode: "parent" });
      
      // التعديل هنا: الـ Backend بتاعنا بيرجع { reply: "..." } مباشرة
      setMessages((m) => [...m, { role: "ai", text: res?.reply || t("parent_coach.fallback_reply"), icon: "🤖" }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((m) => [...m, { role: "ai", text: t("parent_coach.error_reply"), icon: "🤖" }]);
    }
    setLoading(false);
  };

  return (
    <div className="px-4 pt-12 pb-6 flex flex-col" style={{ minHeight: "calc(100vh - 7rem)" }}>
      <FadeIn className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading">{t("parent_coach.title")}</h1>
        <Pill color="#00B894" className="ml-auto"><Sparkles className="w-3 h-3" /> {t("parent_coach.pro")}</Pill>
      </FadeIn>

      {/* family snapshot */}
      <FadeIn delay={40} className="grid grid-cols-3 gap-2 mb-4">
        {familyMembers.map((m) => (
          <div key={m.id} className="glass rounded-2xl p-2.5 text-center">
            <div className="text-lg">{m.avatar}</div>
            <div className="text-[10px] font-bold">{m.name}</div>
            <div className="text-[10px] font-semibold" style={{ color: m.financialScore >= 75 ? "#00B894" : "#FFC857" }}>{t("parent_coach.score", { score: m.financialScore })}</div>
          </div>
        ))}
      </FadeIn>

      {/* messages */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-3">
        {messages.map((m, i) => (
          <FadeIn key={i} delay={30}>
            <div className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "ai" && <div className="w-8 h-8 rounded-full grad-navy text-white flex items-center justify-center text-sm shrink-0">{m.icon}</div>}
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "grad-emerald text-white rounded-br-sm" : "glass rounded-bl-sm"}`}>
                {m.text}
              </div>
            </div>
          </FadeIn>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full grad-navy text-white flex items-center justify-center text-sm">🤖</div>
            <div className="glass rounded-2xl px-4 py-3 flex gap-1">
              {[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* suggestions */}
      <FadeIn className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)} className="whitespace-nowrap px-3 h-9 rounded-full glass text-xs font-semibold text-muted-foreground active:scale-95 transition-all">
            {s}
          </button>
        ))}
      </FadeIn>

      {/* input */}
      <div className="glass rounded-2xl p-2 flex items-center gap-2 shadow-premium">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={t("parent_coach.input_placeholder")} className="flex-1 bg-transparent outline-none px-3 text-sm font-medium" />
        <button onClick={() => send()} disabled={loading} className="w-10 h-10 rounded-xl grad-emerald text-white flex items-center justify-center active:scale-95 transition-all disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}