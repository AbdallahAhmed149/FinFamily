import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Sparkles } from "lucide-react";
import Lotfy from "@/components/fin/Lotfy";
import { FadeIn } from "@/components/fin/ui";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "react-i18next";

const fallback = (msg) => {
  const m = msg.toLowerCase();
  if (m.includes("football") || m.includes("goal")) return "Great goal! ⚽ Your football costs 500 EGP and you've saved 300. How much could you save each week — 100, 150, or 200 EGP?";
  if (m.includes("save")) return "Smart thinking! 💡 Saving means keeping some coins for later. Try the 'pay yourself first' rule: when you get allowance, move some to savings first. How much do you get each week?";
  if (m.includes("budget")) return "A budget is a plan for your money! 📊 Try splitting into 3 jars: Needs, Wants, and Savings. Which jar do you think should be the biggest?";
  if (m.includes("scam")) return "Good that you're careful! 🕵️ If a message says you 'won' a prize or asks for your PIN, it's a scam. Never click or share. Show it to a parent — want to try the Scam Detective game?";
  return "I'm FinBuddy 🤖, your money buddy! I help you learn saving, budgeting, and smart spending through questions. What money topic shall we explore? 💚";
};

export default function Coach() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const suggestions = t("child_coach.suggestions", { returnObjects: true });
  const [messages, setMessages] = useState([
    { role: "assistant", text: t("child_coach.welcome") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      // نبعت الـ request للـ Endpoint بتاعنا ونحدد mode: "child"
      const res = await base44.post("/functions/aiCoach", { message: msg, mode: "child" });
      
      setMessages((m) => [...m, { role: "ai", text: res?.reply || t("child_coach.error1"), icon: "🤖" }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((m) => [...m, { role: "ai", text: t("child_coach.error2"), icon: "🤖" }]);
    }
    setLoading(false);
  };

  return (
    <div className="px-4 pt-12 flex flex-col" style={{ minHeight: "calc(100vh - 7rem)" }}>
      <FadeIn className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full grad-emerald flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold font-heading leading-tight">{t("child_coach.title")}</h1>
          <div className="text-xs text-emerald-600 font-semibold">{t("child_coach.subtitle")}</div>
        </div>
      </FadeIn>

      {/* messages */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-4 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={"flex gap-2 " + (m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "assistant" && <Lotfy size={32} />}
            <div
              className={"max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed animate-slide-up " + (m.role === "user" ? "grad-navy text-white rounded-br-sm" : "glass rounded-bl-sm")}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <Lotfy size={32} />
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              {[0,1,2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* suggestions */}
      {messages.length <= 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className="shrink-0 glass rounded-full px-3 py-2 text-xs font-semibold text-emerald-700">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <div className="glass rounded-2xl flex items-center gap-2 p-2 shadow-premium mb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("child_coach.placeholder")}
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} className="w-10 h-10 rounded-xl grad-emerald flex items-center justify-center disabled:opacity-40">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}