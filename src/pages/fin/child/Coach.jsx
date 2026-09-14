import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Sparkles, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Lotfy from "@/components/fin/Lotfy";
import { FadeIn } from "@/components/fin/ui";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getCoachHistory, resetCoachHistory } from "@/lib/finApi";

const suggestions = [
  "I want a football ⚽",
  "How do I save money?",
  "What's a budget?",
  "Is this message a scam?",
];

const greeting = (name) => ({
  role: "assistant",
  text: `Hi ${name || "there"}! 👋 I'm FinBuddy 🤖, your AI money buddy. I'll help you learn money skills by thinking together. Tell me a goal or ask me anything! 💚`,
});

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
  const { user } = useAuth();
  const [messages, setMessages] = useState([greeting(user?.full_name)]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

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
      // نبعت الـ request للـ Endpoint بتاعنا ونحدد mode: "child"
      const res = await base44.post("/functions/aiCoach", { message: msg, mode: "child" });
      setMessages((m) => [...m, { role: "assistant", text: res?.reply || "Hmm, let me think about that!" }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((m) => [...m, { role: "assistant", text: "Oops, my brain is offline for a second. Try again!" }]);
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
    setMessages([greeting(user?.full_name)]);
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
        <div className="flex-1">
          <h1 className="text-lg font-extrabold font-heading leading-tight">FinBuddy 🤖</h1>
          <div className="text-xs text-emerald-600 font-semibold">● Online · AI Money Buddy</div>
        </div>
        <button
          onClick={startNewChat}
          title="Start a new chat"
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
          placeholder="Ask FinBuddy anything..."
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} className="w-10 h-10 rounded-xl grad-emerald flex items-center justify-center disabled:opacity-40">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}