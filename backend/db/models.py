import uuid
import random
import string
from datetime import datetime
import enum

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Float, Integer, JSON
from sqlalchemy.orm import relationship

from .database import Base


class UserRole(str, enum.Enum):
    parent = "parent"
    child = "child"


class CardStatus(str, enum.Enum):
    active = "active"
    frozen = "frozen"
    deactivated = "deactivated"  # دائم — بيحتاج "Claim New Card" عشان يرجع يشتغل


class MissionKind(str, enum.Enum):
    chore = "chore"          # الأب بيسند مهمة، الطفل لما يعملها بياخد مكافأة (credit)
    redemption = "redemption"  # الطفل بيطلب يصرف كوينز على حاجة (debit) لما الأب يوافق


class MissionStatus(str, enum.Enum):
    pending = "pending"      # لسه الطفل ما عملهاش
    submitted = "submitted"  # الطفل عملها وبينتظر موافقة الأب
    approved = "approved"
    rejected = "rejected"


class TransactionType(str, enum.Enum):
    mission_reward = "mission_reward"
    redemption = "redemption"
    allowance = "allowance"
    savings_transfer = "savings_transfer"
    card_purchase = "card_purchase"
    adjustment = "adjustment"


class TransactionDirection(str, enum.Enum):
    credit = "credit"
    debit = "debit"


class PurchaseStatus(str, enum.Enum):
    completed = "completed"  # اتخصمت فورًا (جوه الحدود المسموحة)
    pending = "pending"      # مستنية موافقة الأب (تخطت حد الصرف)
    rejected = "rejected"    # الأب رفضها، أو الفئة محظورة، أو الكارت مجمد/متعطل


def _generate_family_code():
    # كود قصير سهل إن الأب يقوله لابنه (زي كود دعوة)
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def _generate_card_number():
    # رقم كارت وهمي (مش حقيقي خالص) — بنعرض آخر 4 أرقام بس، زي أي كارت حقيقي
    last4 = "".join(random.choices(string.digits, k=4))
    return f"5061 •••• •••• {last4}"


class Family(Base):
    __tablename__ = "families"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)

    # الكود ده الطفل بيستخدمه عشان يعرف يدخل على عيلته وقت الـ login
    family_code = Column(String, unique=True, index=True, default=_generate_family_code)

    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = relationship("User", back_populates="family", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)

    # كل يوزر (أب أو طفل) لازم يبقى تابع لعيلة
    family_id = Column(String, ForeignKey("families.id"), nullable=False, index=True)
    family = relationship("Family", back_populates="members")

    role = Column(Enum(UserRole), nullable=False)
    full_name = Column(String, nullable=False)

    # بيانات الأب بس (الطفل معندوش إيميل ولا باسورد أصلاً)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)

    # بيانات الطفل بس
    pin_hash = Column(String, nullable=True)

    # gamification (الطفل بس — بتتحدث تلقائي مع كل mission يتوافق عليها)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak = Column(Integer, default=0)

    wallet = relationship("Wallet", back_populates="owner", uselist=False, cascade="all, delete-orphan")

    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(String, nullable=True)


class Wallet(Base):
    """كل طفل ليه Wallet واحدة بتتعمل تلقائي وقت ما الأب يضيفه."""
    __tablename__ = "wallets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    owner_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    owner = relationship("User", back_populates="wallet")

    balance = Column(Float, default=0.0)          # الكوينز/الفلوس المتاحة للصرف
    savings_balance = Column(Float, default=0.0)  # إجمالي الادخار عبر كل الأهداف

    daily_limit = Column(Float, nullable=True)
    weekly_limit = Column(Float, nullable=True)
    monthly_limit = Column(Float, nullable=True)
    blocked_categories = Column(JSON, default=list)  # ["Entertainment", ...]

    card_status = Column(Enum(CardStatus), default=CardStatus.active)
    card_number = Column(String, default=_generate_card_number)  # وهمي بالكامل — مفيش تكامل حقيقي مع Meeza
    card_theme = Column(String, default="blue")  # الطفل هو اللي بيختاره من صفحته

    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    savings_goals = relationship("SavingsGoal", back_populates="wallet", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="wallet", cascade="all, delete-orphan")
    card_purchases = relationship("CardPurchase", back_populates="wallet", cascade="all, delete-orphan")


class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    wallet_id = Column(String, ForeignKey("wallets.id"), nullable=False, index=True)
    wallet = relationship("Wallet", back_populates="savings_goals")

    name = Column(String, nullable=False)
    icon = Column(String, default="🎯")
    color = Column(String, default="#00B894")
    target = Column(Float, nullable=False)
    current = Column(Float, default=0.0)

    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Mission(Base):
    """
    بتغطي حالتين مختلفتين بنفس الشكل:
    - kind=chore: الأب بيسندها، الطفل يعملها ويعمل submit، الأب يوافق -> credit
    - kind=redemption: الطفل بيطلبها (عايز يصرف كوينز على حاجة)، الأب يوافق -> debit
    """
    __tablename__ = "missions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    family_id = Column(String, ForeignKey("families.id"), nullable=False, index=True)

    assigned_to_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)  # الطفل
    created_by_id = Column(String, ForeignKey("users.id"), nullable=False)  # مين طلبها (أب أو طفل)

    kind = Column(Enum(MissionKind), nullable=False, default=MissionKind.chore)
    status = Column(Enum(MissionStatus), nullable=False, default=MissionStatus.pending)

    title = Column(String, nullable=False)
    category = Column(String, default="Home")
    icon = Column(String, default="✅")
    reward = Column(Float, nullable=False)  # قيمة المكافأة (chore) أو التكلفة (redemption)
    due_label = Column(String, nullable=True)  # نص وصفي زي "Today" / "Tomorrow" (مش تاريخ دقيق دلوقتي)

    reviewed_by_id = Column(String, nullable=True)
    reviewed_date = Column(DateTime, nullable=True)
    review_note = Column(String, nullable=True)

    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    wallet_id = Column(String, ForeignKey("wallets.id"), nullable=False, index=True)
    wallet = relationship("Wallet", back_populates="transactions")

    family_id = Column(String, ForeignKey("families.id"), nullable=False, index=True)
    related_mission_id = Column(String, ForeignKey("missions.id"), nullable=True)

    type = Column(Enum(TransactionType), nullable=False)
    direction = Column(Enum(TransactionDirection), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)

    created_date = Column(DateTime, default=datetime.utcnow)


class CardPurchase(Base):
    """
    محاكاة 'سحبة كارت' في محل (POS) — مفيش تكامل حقيقي مع Meeza أو أي بنك.
    الطفل بيعمل submit لمحاولة شراء، والباك اند بيقرر فورًا (completed) أو
    بيحطها مستنية موافقة الأب (pending) لو تخطت حد الصرف.
    """
    __tablename__ = "card_purchases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    family_id = Column(String, ForeignKey("families.id"), nullable=False, index=True)
    child_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    wallet_id = Column(String, ForeignKey("wallets.id"), nullable=False, index=True)
    wallet = relationship("Wallet", back_populates="card_purchases")

    merchant = Column(String, nullable=False)
    category = Column(String, default="Other")
    location = Column(String, nullable=True)
    amount = Column(Float, nullable=False)

    status = Column(Enum(PurchaseStatus), nullable=False, default=PurchaseStatus.pending)
    decline_reason = Column(String, nullable=True)  # ليه اترفضت فورًا (فئة محظورة / كارت مجمد...)

    reviewed_by_id = Column(String, nullable=True)
    reviewed_date = Column(DateTime, nullable=True)

    created_date = Column(DateTime, default=datetime.utcnow)