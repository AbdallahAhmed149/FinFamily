import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Send, Sparkles, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Lotfy from "@/components/fin/Lotfy";
import { FadeIn } from "@/components/fin/ui";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getCoachHistory, resetCoachHistory, getMyWallet, getMyMissions } from "@/lib/finApi";

// بدل ما الاقتراحات تكون نفسها لكل طفل دايمًا، بنبنيها من بيانات الطفل الحقيقية
// (نفس الداتا اللي بتتحقن في الـ AI context بالظبط)، فتكون أقرب لحالته دلوقتي.
function buildSuggestions(t, wallet, missions) {
  const dynamic = [];

  const goal = wallet?.savings_goals?.[0];
  if (goal) {
    const remaining = Math.max(0, (goal.target ?? 0) - (goal.current ?? 0));
    dynamic.push(remaining > 0 ? t("child.coach.goalRemaining", { goal: goal.name }) : t("child.coach.goalDone", { goal: goal.name }));
  }

  if ((missions || []).some((m) => m.status === "submitted")) {
    dynamic.push(t("child.coach.choreApproval"));
  }
  if ((missions || []).some((m) => m.status === "pending")) {
    dynamic.push(t("child.coach.choresToday"));
  }

  // الاقتراح ده تعليمي وثابت دايمًا، مش شرط يتحط بس لو مفيش بديل شخصي أحسن
  dynamic.push(t("child.coach.suggestions.scamCheck"));

  const defaults = [
    t("child.coach.suggestions.football"),
    t("child.coach.suggestions.howSave"),
    t("child.coach.suggestions.whatBudget"),
    t("child.coach.suggestions.scamCheck"),
  ];
  for (const s of defaults) {
    if (dynamic.length >= 4) break;
    if (!dynamic.includes(s)) dynamic.push(s);
  }
  return dynamic.slice(0, 4);
}

// bubbles are small, so Markdown gets a compact style: tight paragraph spacing,
// lists that actually show line breaks between items (the whole reason we're
// using Markdown here instead of a plain text node).
function Bubble({ text }) {
  return (
    <div className="prose-chat text-sm leading-relaxed [&_p]:my-1 first:[&_p]:mt-0 last:[&_p]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_strong]:font-bold">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

export default function Coach() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const greeting = () => ({ role: "assistant", text: t("child.coach.greeting", { name: user?.full_name || t("child.coach.greetingFallbackName") }) });
  const [messages, setMessages] = useState([greeting()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState(() => buildSuggestions(t));
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // نجيب محفظة/مهمات الطفل عشان نبني اقتراحات مخصصة له، بدون ما نوقف باقي الصفحة
  // لو النداءين دول فشلوا لأي سبب — بنسيب الاقتراحات الثابتة كـ fallback
  useEffect(() => {
    let cancelled = false;
    Promise.all([getMyWallet().catch(() => null), getMyMissions().catch(() => null)])
      .then(([wallet, missions]) => {
        if (!cancelled && (wallet || missions)) {
          setSuggestions(buildSuggestions(t, wallet, missions));
        }
      });
    return () => { cancelled = true; };
  }, [t]);

  // نجيب المحادثة المحفوظة أول ما نفتح الصفحة، بدل ما نرجع دايمًا للترحيب بس
  useEffect(() => {
    let cancelled = false;
    getCoachHistory()
      .then((res) => {
        if (cancelled) return;
        if (res?.messages?.length) {
          setMessages(res.messages.map((m) => ({ role: m.role, text: m.content })));
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setHistoryLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      // نبعت الـ request للـ Endpoint بتاعنا ونحدد mode: "child"، وكمان اللغة الحالية
      // عشان لو الباك اند اتظبط يرد بيها (مطلوب تعديل منفصل في aiCoach نفسه).
      const res = await base44.post("/functions/aiCoach", { message: msg, mode: "child", lang: i18n.language });
      setMessages((m) => [...m, { role: "assistant", text: res?.reply || t("child.coach.thinkingFallback") }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((m) => [...m, { role: "assistant", text: t("child.coach.errorFallback") }]);
    }
    setLoading(false);
  };

  const startNewChat = async () => {
    if (loading) return;
    try {
      await resetCoachHistory();
    } catch {
      // حتى لو فشل النداء، نفضّل نصفّر الشاشة عند الأقل بدل ما نسيبه واقف
    }
    setMessages([greeting()]);
  };

  return (
    <div className="px-4 pt-12 flex flex-col" style={{ minHeight: "calc(100vh - 7rem)" }}>
      <FadeIn className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/child")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div className="w-10 h-10 rounded-full grad-emerald flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold font-heading leading-tight">FinBuddy 🤖</h1>
          <div className="text-xs text-emerald-600 font-semibold">{t("child.coach.online")}</div>
        </div>
        <button
          onClick={startNewChat}
          title={t("child.coach.newChat")}
          className="w-9 h-9 rounded-full glass flex items-center justify-center shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </FadeIn>

      {/* messages */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-4 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={"flex gap-2 " + (m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "assistant" && <Lotfy size={32} />}
            <div
              className={"max-w-[78%] rounded-2xl px-4 py-2.5 animate-slide-up " + (m.role === "user" ? "grad-navy text-white rounded-br-sm text-sm leading-relaxed" : "glass rounded-bl-sm")}
            >
              {m.role === "user" ? m.text : <Bubble text={m.text} />}
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
      {historyLoaded && messages.length <= 1 && (
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
          placeholder={t("child.coach.placeholder")}
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} className="w-10 h-10 rounded-xl grad-emerald flex items-center justify-center disabled:opacity-40">
          <Send className="w-4 h-4 text-white rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );
}