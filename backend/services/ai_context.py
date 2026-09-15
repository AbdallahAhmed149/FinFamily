from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from db.models import (
    User, UserRole, Wallet, Mission, MissionStatus, MissionKind,
    Transaction, TransactionDirection, TransactionType,
)


def _wallet_of(db: Session, user_id: str) -> Optional[Wallet]:
    return db.query(Wallet).filter(Wallet.owner_id == user_id).first()


def build_child_context(db: Session, child: User) -> str:
    """بيرجع نص بسيط فيه بيانات الطفل الحقيقية عشان يتحط في الـ system prompt بتاع FinBuddy."""
    wallet = _wallet_of(db, child.id)

    lines = [
        f"- Name: {child.full_name}",
        f"- Level {child.level}, {child.xp} XP, {child.streak}-day streak",
        f"- Wallet balance: {wallet.balance if wallet else 0:.0f} EGP",
    ]

    goals = wallet.savings_goals if wallet else []
    if goals:
        goals_str = "; ".join(f"{g.name} ({g.current:.0f}/{g.target:.0f} EGP)" for g in goals)
        lines.append(f"- Savings goals: {goals_str}")
    else:
        lines.append("- Savings goals: none set yet")

    pending = db.query(Mission).filter(Mission.assigned_to_id == child.id, Mission.status == MissionStatus.pending).count()
    submitted = db.query(Mission).filter(Mission.assigned_to_id == child.id, Mission.status == MissionStatus.submitted).count()
    lines.append(f"- Chores: {pending} to do, {submitted} waiting for a parent's approval")

    return "\n".join(lines)


def _spend_since(db: Session, wallet_id: str, since: datetime) -> float:
    """إجمالي الصرف الفعلي (مش تحويل لادخار) من محفظة معينة بعد تاريخ معين."""
    debits = (
        db.query(Transaction)
        .filter(
            Transaction.wallet_id == wallet_id,
            Transaction.direction == TransactionDirection.debit,
            Transaction.type.in_([TransactionType.redemption, TransactionType.card_purchase]),
            Transaction.created_date >= since,
        )
        .all()
    )
    return sum(t.amount for t in debits)


def _spending_risk_flags(db: Session, child_name: str, wallet: Wallet, now: datetime) -> list[str]:
    """بتحسب مؤشرات خطر حقيقية بالكود (مش تخمين من الموديل من أرقام خام):
    1) قفزة في الصرف الأسبوعي مقارنة بالأسبوع اللي قبله.
    2) نشاط صرف سريع/متكرر في وقت قصير (ممكن يبقى إشارة لاستخدام مش طبيعي للكارت).
    القيم دي بترجع كـ facts جاهزة تتحقن في الـ prompt، عشان Coach Nour يوصف الموجود
    بس، من غير ما "يستنتج" احتيال أو مخاطر من عنده."""
    flags: list[str] = []

    this_week = _spend_since(db, wallet.id, now - timedelta(days=7))
    last_week_total = _spend_since(db, wallet.id, now - timedelta(days=14))
    last_week = last_week_total - this_week  # صرف الأسبوع اللي قبل الحالي بس

    # عتبة دنيا (50 جنيه) عشان نتجنب "تضخيم" زيادة نسبية على أرقام صغيرة أوي مالها معنى
    if last_week >= 50 and this_week > last_week * 1.5:
        pct = ((this_week - last_week) / last_week) * 100
        flags.append(
            f"⚠️ {child_name}'s spending this week ({this_week:.0f} EGP) is {pct:.0f}% higher than last week ({last_week:.0f} EGP)."
        )
    elif last_week < 50 and this_week >= 150:
        # مافيش صرف يذكر الأسبوع اللي فات وفجأة صرف كبير الأسبوع ده
        flags.append(f"⚠️ {child_name} had little to no spending last week, but spent {this_week:.0f} EGP this week.")

    # نشاط سريع: 3 عمليات صرف أو أكتر خلال ساعة واحدة
    recent_debits = (
        db.query(Transaction)
        .filter(
            Transaction.wallet_id == wallet.id,
            Transaction.direction == TransactionDirection.debit,
            Transaction.type.in_([TransactionType.redemption, TransactionType.card_purchase]),
            Transaction.created_date >= now - timedelta(hours=1),
        )
        .order_by(Transaction.created_date.asc())
        .all()
    )
    if len(recent_debits) >= 3:
        flags.append(f"🚩 {child_name} made {len(recent_debits)} purchases within the last hour — worth a quick check.")

    return flags


def build_family_context(db: Session, parent: User) -> str:
    """بيرجع نص فيه ملخص العيلة كلها (كل الأطفال + إجماليات) عشان يتحط في الـ system prompt بتاع Coach Nour."""
    children = db.query(User).filter(User.family_id == parent.family_id, User.role == UserRole.child).all()
    now = datetime.utcnow()
    since = now - timedelta(days=30)

    lines = [f"- Parent: {parent.full_name}", f"- Children ({len(children)}):"]

    total_spending = 0.0
    total_savings = 0.0
    risk_flags: list[str] = []

    for c in children:
        wallet = _wallet_of(db, c.id)
        spend_total = 0.0
        if wallet:
            debits = (
                db.query(Transaction)
                .filter(
                    Transaction.wallet_id == wallet.id,
                    Transaction.direction == TransactionDirection.debit,
                    Transaction.type.in_([TransactionType.redemption, TransactionType.card_purchase]),  # صرف فعلي بس، مش تحويل لادخار
                    Transaction.created_date >= since,
                )
                .all()
            )
            spend_total = sum(t.amount for t in debits)

        total_spending += spend_total
        total_savings += wallet.savings_balance if wallet else 0.0

        if wallet:
            risk_flags.extend(_spending_risk_flags(db, c.full_name, wallet, now))

        limits = []
        if wallet:
            if wallet.daily_limit:
                limits.append(f"daily {wallet.daily_limit:.0f}")
            if wallet.weekly_limit:
                limits.append(f"weekly {wallet.weekly_limit:.0f}")
            if wallet.monthly_limit:
                limits.append(f"monthly {wallet.monthly_limit:.0f}")
        limits_str = ", ".join(limits) if limits else "none set"

        lines.append(
            f"  - {c.full_name}: Level {c.level}, {c.xp} XP, {c.streak}-day streak, "
            f"balance {wallet.balance if wallet else 0:.0f} EGP, savings {wallet.savings_balance if wallet else 0:.0f} EGP, "
            f"spent (last 30 days) {spend_total:.0f} EGP, limits: {limits_str}, "
            f"card {wallet.card_status.value if wallet else 'n/a'}"
        )

    pending_chores = (
        db.query(Mission)
        .filter(Mission.family_id == parent.family_id, Mission.kind == MissionKind.chore, Mission.status == MissionStatus.submitted)
        .count()
    )
    pending_redemptions = (
        db.query(Mission)
        .filter(Mission.family_id == parent.family_id, Mission.kind == MissionKind.redemption, Mission.status == MissionStatus.submitted)
        .count()
    )

    lines.append(f"- Family totals (last 30 days): spending {total_spending:.0f} EGP, savings {total_savings:.0f} EGP")
    lines.append(f"- Pending approvals: {pending_chores} chore(s), {pending_redemptions} reward request(s)")

    if risk_flags:
        lines.append("- Risk flags (already computed — just report these, don't invent additional ones):")
        lines.extend(f"  {f}" for f in risk_flags)
    else:
        lines.append("- Risk flags: none detected right now — spending looks normal for all children.")

    return "\n".join(lines)