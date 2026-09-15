import os
from typing import List

from openai import OpenAI
from pydantic import BaseModel
from dotenv import load_dotenv

# إجبار السيرفر إنه يحمل المتغيرات من الـ .env فوراً
load_dotenv(override=True)

raw_key = os.getenv("OPENAI_API_KEY")
if not raw_key:
    raise ValueError("OPENAI_API_KEY is missing from .env file")

# السطر السحري اللي هينضف الـ Key من أي مسافات أو رموز مخفية
api_key = raw_key.strip()

client = OpenAI(api_key=api_key)

# اسم الموديل وحد التوكنز بقوا configurable من الـ .env بدل ما يكونوا هاردكودد،
# عشان أي تجربة (موديل تاني، رد أطول/أقصر) تتم من غير تعديل كود أو ريديبلوي.
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
AI_COACH_MAX_TOKENS = int(os.getenv("AI_COACH_MAX_TOKENS", "350"))
AI_COACH_TEMPERATURE = float(os.getenv("AI_COACH_TEMPERATURE", "0.7"))


class AICoachError(Exception):
    """بتترفع لو نداء الـ OpenAI فشل، عشان الـ route يتعامل معاها ويرجع رد
    واضح للفرونت من غير ما تفضل الرسالة (اللي ممكن تكون exception تقني خام)
    تتخزن في تاريخ المحادثة وتتبعت للطفل/الأب كإنها رد حقيقي من الـ AI."""


# كام رسالة قديمة (يوزر + موديل) نبعتها مع كل طلب جديد. رقم محدود عشان
# نتحكم في تكلفة/عدد التوكنز، مش عشان نمنع الذاكرة — العدد ده كافي لمعظم
# محادثات الـ Coach لأنها أصلاً قصيرة ومركزة.
HISTORY_WINDOW = 12

# الجزء الثابت بس (شخصية الـ AI وقواعده) — البيانات الشخصية بقت بتتحط ديناميكيًا
# تحت في get_ai_response() من services/ai_context.py، مش هاردكودد هنا.
CHILD_PROMPT = """You are "FinBuddy 🤖", the AI financial learning buddy inside FinFamily — a gamified financial education app for Egyptian children.

YOUR TEACHING STYLE (very important):
- Teach through QUESTIONS, not just answers. Guide the child to reason himself/herself. Ask one focused question at a time, then wait for their reply.
- Be warm, playful, encouraging, and short (2-4 sentences). Use occasional emojis.
- When the child states a goal or number, reflect it back and ask the next logical question (e.g. "How much could you save each week?" then offer 2-3 simple choices).
- Cover ONLY: saving, budgeting, needs vs wants, smart spending, safe digital finance, goal setting, and basic investing concepts (as education, never real trading).
- For any sensitive or real-money decision, encourage asking a parent first.
- Celebrate effort and good reasoning, not just correct answers.
- Currency is EGP. Never give adult banking advice or execute transactions.

CONVERSATION MEMORY (very important):
- The messages below are a REAL, ONGOING conversation with this child — you already know everything said so far.
- NEVER re-introduce yourself or repeat your opening greeting after the first message. Just continue naturally, like a real ongoing chat.
- Refer back to what the child already told you (their goal, numbers, choices) instead of asking again.

FORMATTING (important — this renders as a chat bubble that supports Markdown):
- Keep it conversational, not a report. Only use a numbered/bulleted list when you are giving concrete multi-step instructions.
- When you do give steps, put EACH step on its own line (a real line break between items), and bold the key word only, not whole sentences.

Here is what you actually know about the child you're talking to right now (use it, don't ignore it):
{context}"""

PARENT_PROMPT = """You are "Coach Nour", the AI family finance analyst inside FinFamily — an AI-powered family banking app for Egyptian families. You are advising the parent (account owner). Be professional, data-driven, concise (3-6 sentences unless a list is warranted), and actionable. Currency is EGP.

Your job: analyze consumption patterns across all members, alert the parent to risks (overspending, fraud-like patterns, limit breaches), suggest spending controls (limits, category blocks), recommend allowance adjustments, and teach fintech safety (2FA, scam awareness, card security). Prioritize actionable safeguards. Flag anything that needs immediate attention.

RISK FLAGS: The context below already includes a "Risk flags" section computed directly from real transaction data (spending spikes, rapid-purchase activity). Only report risks that are actually listed there — never invent or guess at a risk pattern that isn't explicitly given to you. If it says "none detected", tell the parent things look normal rather than manufacturing a concern.

CONVERSATION MEMORY (very important):
- The messages below are a REAL, ONGOING conversation with this parent — you already know everything said so far.
- NEVER re-introduce yourself or repeat your opening greeting after the first message. Continue naturally, like a real ongoing chat.
- Build on what was already discussed instead of repeating it from scratch.

FORMATTING (important — this renders as a chat bubble that supports Markdown):
- When you give a set of recommendations or steps, format them as a proper Markdown numbered list with EACH item on its own line — never run them together in one paragraph.
- Bold only the short label of each point (e.g. "**Set spending limits**: ..."), not full sentences.
- Keep paragraphs short; prefer lists over long prose when there is more than one recommendation.

Here is what you actually know about this family right now (use it, don't ignore it):
{context}"""


class ChatMessage(BaseModel):
    message: str
    mode: str = "child"  # الديفولت child


class HistoryTurn(BaseModel):
    role: str  # "user" / "assistant"
    content: str


# رد ثابت وآمن يترجع لو رسالة الطفل اتصنّفت كمحتوى غير مناسب، من غير ما نبعت
# حاجة للموديل الرئيسي أصلاً (بيوفر تكلفة استدعاء زيادة، وبيمنع أي محاولة
# jailbreak من توصل للموديل الرئيسي من الأساس).
CHILD_SAFE_REDIRECT = (
    "Let's keep our chat about money stuff — saving, budgeting, goals, and staying safe online! 💚 "
    "If something's bothering you, please talk to a parent or a trusted adult about it."
)


def is_flagged_content(text: str) -> bool:
    """بتستخدم OpenAI Moderation endpoint (مجاني، مش نفس الموديل الرئيسي) عشان
    تفحص رسالة الطفل قبل ما توصل لـ FinBuddy. ده حاجز أمان حقيقي مش تعليمة
    نصية بس في الـ prompt — لو فشل الفحص نفسه (network مثلاً)، بنسيب الرسالة
    تعدي عادي (fail-open) عشان مشكلة في الـ moderation API نفسها متبوظش تجربة
    الطفل بالكامل؛ الـ system prompt يفضل خط الدفاع التاني.
    """
    try:
        result = client.moderations.create(model="omni-moderation-latest", input=text)
        return bool(result.results and result.results[0].flagged)
    except Exception:
        return False


def get_ai_response(
    chat_data: ChatMessage,
    context: str,
    history: List[HistoryTurn] = None,
    child_name: str = "the child",
) -> str:
    # تحديد الـ System Prompt بناءً على الـ mode، وحقن البيانات الحقيقية جواه
    template = PARENT_PROMPT if chat_data.mode == "parent" else CHILD_PROMPT
    system_instruction = template.format(context=context)
    user_prefix = "Parent asks: " if chat_data.mode == "parent" else f"{child_name} asks: "

    messages = [{"role": "system", "content": system_instruction}]
    for turn in (history or [])[-HISTORY_WINDOW:]:
        messages.append({"role": turn.role, "content": turn.content})
    messages.append({"role": "user", "content": f"{user_prefix}{chat_data.message}"})

    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=AI_COACH_MAX_TOKENS,  # اتزودت شوية عن 250 عشان ردود الخطوات المتعددة متتقطعش في النص
            temperature=AI_COACH_TEMPERATURE,
        )
        return response.choices[0].message.content
    except Exception as e:
        # قبل كان هنا بيرجع "AI Service Error: ..." كـ string عادي، فده كان
        # بيتخزن في الداتابيز كرد "assistant" حقيقي ويتبعت للمستخدم (طفل أو أب)
        # كإنه رد فعلي من الـ AI، وكان كمان بيدخل في الـ conversation history
        # بتاعة المرة الجاية فيلخبط الموديل. دلوقتي بترفع Exception، والـ route
        # هو اللي بيقرر الرد المناسب وميخزنهاش في الـ history خالص.
        raise AICoachError(str(e)) from e