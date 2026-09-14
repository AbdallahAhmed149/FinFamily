import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Sparkles, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { GlassCard, FadeIn, Pill } from "@/components/fin/ui";
import { fmtEGP } from "@/lib/finData";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getChildWallet, getCoachHistory, resetCoachHistory } from "@/lib/finApi";

const AVATARS = ["🦁", "🦊", "🐻", "🐱", "🐯", "🐰"];

const SUGGESTIONS = [
  "How is each child doing this week?",
  "Any spending risks I should know about?",
  "Suggest a better allowance plan",
  "How do I protect the family from scams?",
  "Who is the most disciplined saver?",
];

const greeting = (name) => ({
  role: "ai",
  text: `Hello ${name || "there"} 👋 I'm Coach Nour, your family finance analyst. I monitor your children's spending, savings, and card activity. Ask me about risks, limits, allowances, or fintech safety.`,
  icon: "🤖",
});

// bubbles are small, so Markdown gets a compact style: tight paragraph spacing,
// and — importantly — numbered/bulleted steps actually break onto their own
// lines instead of running together as one wall of text.
function Bubble({ text }) {
  return (
    <div className="prose-chat text-sm [&_p]:my-1 first:[&_p]:mt-0 last:[&_p]:mb-0 [&_ol]:my-1 [&_ul]:my-1 [&_li]:my-1 [&_strong]:font-bold">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

export default function ParentCoach() {
  const navigate = useNavigate();
  const { user, getFamilyChildren } = useAuth();
  const [snapshot, setSnapshot] = useState([]);
  const [messages, setMessages] = useState([greeting(user?.full_name)]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // نجيب المحادثة المحفوظة أول ما نفتح الصفحة، بدل ما نرجع دايمًا للترحيب بس
  useEffect(() => {
    let cancelled = false;
    getCoachHistory()
      .then((res) => {
        if (cancelled) return;
        if (res?.messages?.length) {
          setMessages(res.messages.map((m) => ({ role: m.role === "assistant" ? "ai" : "user", text: m.content, icon: "🤖" })));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { children } = await getFamilyChildren();
        const wallets = await Promise.all(children.map((c) => getChildWallet(c.id).catch(() => null)));
        if (!cancelled) {
          setSnapshot(children.map((c, i) => ({ id: c.id, name: c.full_name, avatar: AVATARS[i % AVATARS.length], score: wallets[i]?.financial_score ?? 50 })));
        }
      } catch {
        // فشل التحميل هنا مش critical — الصفحة بتفضل تشتغل من غير الـ snapshot
      }
    })();
    return () => { cancelled = true; };
  }, [getFamilyChildren]);

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
      setMessages((m) => [...m, { role: "ai", text: res?.reply || "Let me check the family data and get back to you.", icon: "🤖" }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((m) => [...m, { role: "ai", text: "I couldn't reach the AI service right now. Please try again in a moment.", icon: "🤖" }]);
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
    <div className="px-4 pt-12 pb-6 flex flex-col" style={{ minHeight: "calc(100vh - 7rem)" }}>
      <FadeIn className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/parent")} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold font-heading flex-1">AI Family Coach</h1>
        <Pill color="#00B894"><Sparkles className="w-3 h-3" /> Pro</Pill>
        <button
          onClick={startNewChat}
          title="Start a new chat"
          className="w-9 h-9 rounded-full glass flex items-center justify-center shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </FadeIn>

      {/* family snapshot */}
      <FadeIn delay={40} className="grid grid-cols-3 gap-2 mb-4">
        {snapshot.map((m) => (
          <div key={m.id} className="glass rounded-2xl p-2.5 text-center">
            <div className="text-lg">{m.avatar}</div>
            <div className="text-[10px] font-bold">{m.name}</div>
            <div className="text-[10px] font-semibold" style={{ color: m.score >= 75 ? "#00B894" : "#FFC857" }}>{m.score} score</div>
          </div>
        ))}
      </FadeIn>

      {/* messages */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-3">
        {messages.map((m, i) => (
          <FadeIn key={i} delay={30}>
            <div className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "ai" && <div className="w-8 h-8 rounded-full grad-navy text-white flex items-center justify-center text-sm shrink-0">{m.icon || "🤖"}</div>}
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${m.role === "user" ? "grad-emerald text-white rounded-br-sm text-sm" : "glass rounded-bl-sm"}`}>
                {m.role === "user" ? m.text : <Bubble text={m.text} />}
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
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about your family's finances..." className="flex-1 bg-transparent outline-none px-3 text-sm font-medium" />
        <button onClick={() => send()} disabled={loading} className="w-10 h-10 rounded-xl grad-emerald text-white flex items-center justify-center active:scale-95 transition-all disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}