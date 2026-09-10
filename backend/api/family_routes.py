from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import (
    User, UserRole, Wallet, SavingsGoal, Mission, MissionKind, MissionStatus,
    Transaction, TransactionType, TransactionDirection,
)
from core.deps import get_current_user, require_parent, require_child
from schemas.wallet import (
    WalletOut, WalletLimitsUpdate, WalletCardStatusUpdate,
    SavingsGoalCreate, SavingsGoalDeposit, SavingsGoalOut,
    MissionCreate, MissionReview, MissionOut,
    TransactionOut,
)

router = APIRouter(prefix="/api", tags=["Wallet & Missions"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_family_child(db: Session, family_id: str, child_id: str) -> User:
    child = (
        db.query(User)
        .filter(User.id == child_id, User.family_id == family_id, User.role == UserRole.child)
        .first()
    )
    if not child:
        raise HTTPException(status_code=404, detail="Child not found in your family")
    return child


def _get_wallet_for(db: Session, child: User) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.owner_id == child.id).first()
    if not wallet:
        # ماينفعش يحصل عمليًا (بنعمل Wallet تلقائي وقت إنشاء الطفل) — بس تحسبًا
        raise HTTPException(status_code=500, detail="This child has no wallet")
    return wallet


def _log_transaction(db: Session, wallet: Wallet, family_id: str, type_, direction, amount, description, mission_id=None):
    txn = Transaction(
        wallet_id=wallet.id,
        family_id=family_id,
        related_mission_id=mission_id,
        type=type_,
        direction=direction,
        amount=amount,
        description=description,
    )
    db.add(txn)
    return txn


# ---------------------------------------------------------------------------
# Wallet
# ---------------------------------------------------------------------------

@router.get("/wallet/me", response_model=WalletOut)
def get_my_wallet(child: User = Depends(require_child), db: Session = Depends(get_db)):
    return _get_wallet_for(db, child)


@router.get("/wallet/child/{child_id}", response_model=WalletOut)
def get_child_wallet(child_id: str, parent: User = Depends(require_parent), db: Session = Depends(get_db)):
    child = _get_family_child(db, parent.family_id, child_id)
    return _get_wallet_for(db, child)


@router.patch("/wallet/child/{child_id}/limits", response_model=WalletOut)
def update_child_limits(
    child_id: str,
    payload: WalletLimitsUpdate,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    child = _get_family_child(db, parent.family_id, child_id)
    wallet = _get_wallet_for(db, child)

    if payload.daily_limit is not None:
        wallet.daily_limit = payload.daily_limit
    if payload.weekly_limit is not None:
        wallet.weekly_limit = payload.weekly_limit
    if payload.monthly_limit is not None:
        wallet.monthly_limit = payload.monthly_limit
    if payload.blocked_categories is not None:
        wallet.blocked_categories = payload.blocked_categories

    db.commit()
    db.refresh(wallet)
    return wallet


@router.patch("/wallet/child/{child_id}/card-status", response_model=WalletOut)
def update_card_status(
    child_id: str,
    payload: WalletCardStatusUpdate,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    child = _get_family_child(db, parent.family_id, child_id)
    wallet = _get_wallet_for(db, child)
    wallet.card_status = payload.card_status
    db.commit()
    db.refresh(wallet)
    return wallet


# ---------------------------------------------------------------------------
# Savings goals (بتاعة الطفل نفسه)
# ---------------------------------------------------------------------------

@router.post("/wallet/me/goals", response_model=SavingsGoalOut)
def create_my_goal(payload: SavingsGoalCreate, child: User = Depends(require_child), db: Session = Depends(get_db)):
    wallet = _get_wallet_for(db, child)
    goal = SavingsGoal(
        wallet_id=wallet.id,
        name=payload.name,
        icon=payload.icon,
        color=payload.color,
        target=payload.target,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.post("/wallet/me/goals/{goal_id}/deposit", response_model=SavingsGoalOut)
def deposit_to_goal(
    goal_id: str,
    payload: SavingsGoalDeposit,
    child: User = Depends(require_child),
    db: Session = Depends(get_db),
):
    wallet = _get_wallet_for(db, child)
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.wallet_id == wallet.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    if wallet.balance < payload.amount:
        raise HTTPException(status_code=400, detail="Not enough balance in wallet")

    # التحويل: من الرصيد المتاح إلى هدف الادخار
    wallet.balance -= payload.amount
    wallet.savings_balance += payload.amount
    goal.current += payload.amount

    _log_transaction(
        db, wallet, child.family_id,
        TransactionType.savings_transfer, TransactionDirection.debit,
        payload.amount, f"Transferred to savings goal: {goal.name}",
    )

    db.commit()
    db.refresh(goal)
    return goal


# ---------------------------------------------------------------------------
# Missions (chores + reward redemptions — نفس الـ entity)
# ---------------------------------------------------------------------------

@router.post("/missions", response_model=MissionOut)
def create_mission(payload: MissionCreate, parent: User = Depends(require_parent), db: Session = Depends(get_db)):
    # الأب مش بيعمل هنا غير chores (تسنيد مهمة) — طلبات الصرف الطفل هو اللي بيعملها في /missions/redeem
    if not payload.assigned_to_id:
        raise HTTPException(status_code=400, detail="assigned_to_id is required")
    _get_family_child(db, parent.family_id, payload.assigned_to_id)

    mission = Mission(
        family_id=parent.family_id,
        assigned_to_id=payload.assigned_to_id,
        created_by_id=parent.id,
        kind=MissionKind.chore,
        status=MissionStatus.pending,
        title=payload.title,
        category=payload.category,
        icon=payload.icon,
        reward=payload.reward,
        due_label=payload.due_label,
    )
    db.add(mission)
    db.commit()
    db.refresh(mission)
    return mission


@router.post("/missions/redeem", response_model=MissionOut)
def request_redemption(payload: MissionCreate, child: User = Depends(require_child), db: Session = Depends(get_db)):
    # الطفل بيطلب يصرف كوينز على حاجة — بتروح مباشرة "submitted" مستنية موافقة الأب
    mission = Mission(
        family_id=child.family_id,
        assigned_to_id=child.id,
        created_by_id=child.id,
        kind=MissionKind.redemption,
        status=MissionStatus.submitted,
        title=payload.title,
        category=payload.category,
        icon=payload.icon,
        reward=payload.reward,
    )
    db.add(mission)
    db.commit()
    db.refresh(mission)
    return mission


@router.post("/missions/{mission_id}/submit", response_model=MissionOut)
def submit_mission(mission_id: str, child: User = Depends(require_child), db: Session = Depends(get_db)):
    mission = (
        db.query(Mission)
        .filter(Mission.id == mission_id, Mission.assigned_to_id == child.id, Mission.kind == MissionKind.chore)
        .first()
    )
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    if mission.status != MissionStatus.pending:
        raise HTTPException(status_code=400, detail=f"Mission is already {mission.status.value}")

    mission.status = MissionStatus.submitted
    db.commit()
    db.refresh(mission)
    return mission


@router.post("/missions/{mission_id}/review", response_model=MissionOut)
def review_mission(
    mission_id: str,
    payload: MissionReview,
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    mission = db.query(Mission).filter(Mission.id == mission_id, Mission.family_id == parent.family_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    if mission.status != MissionStatus.submitted:
        raise HTTPException(status_code=400, detail=f"Mission is not awaiting review (status: {mission.status.value})")

    child = db.query(User).filter(User.id == mission.assigned_to_id).first()
    wallet = _get_wallet_for(db, child)

    if payload.decision == "reject":
        mission.status = MissionStatus.rejected
    else:
        if mission.kind == MissionKind.chore:
            wallet.balance += mission.reward
            child.xp = (child.xp or 0) + int(mission.reward)
            _log_transaction(
                db, wallet, parent.family_id,
                TransactionType.mission_reward, TransactionDirection.credit,
                mission.reward, mission.title, mission_id=mission.id,
            )
        else:  # redemption
            if wallet.balance < mission.reward:
                raise HTTPException(status_code=400, detail="Child doesn't have enough balance for this redemption")
            wallet.balance -= mission.reward
            _log_transaction(
                db, wallet, parent.family_id,
                TransactionType.redemption, TransactionDirection.debit,
                mission.reward, mission.title, mission_id=mission.id,
            )
        mission.status = MissionStatus.approved

    mission.reviewed_by_id = parent.id
    mission.reviewed_date = datetime.utcnow()
    mission.review_note = payload.note

    db.commit()
    db.refresh(mission)
    return mission


@router.get("/missions/mine", response_model=List[MissionOut])
def my_missions(
    status: Optional[MissionStatus] = Query(None),
    child: User = Depends(require_child),
    db: Session = Depends(get_db),
):
    q = db.query(Mission).filter(Mission.assigned_to_id == child.id)
    if status:
        q = q.filter(Mission.status == status)
    return q.order_by(Mission.created_date.desc()).all()


@router.get("/missions/family", response_model=List[MissionOut])
def family_missions(
    child_id: Optional[str] = Query(None),
    status: Optional[MissionStatus] = Query(None),
    parent: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    q = db.query(Mission).filter(Mission.family_id == parent.family_id)
    if child_id:
        q = q.filter(Mission.assigned_to_id == child_id)
    if status:
        q = q.filter(Mission.status == status)
    return q.order_by(Mission.created_date.desc()).all()


# ---------------------------------------------------------------------------
# Transactions
# ---------------------------------------------------------------------------

@router.get("/transactions/mine", response_model=List[TransactionOut])
def my_transactions(child: User = Depends(require_child), db: Session = Depends(get_db)):
    wallet = _get_wallet_for(db, child)
    return (
        db.query(Transaction)
        .filter(Transaction.wallet_id == wallet.id)
        .order_by(Transaction.created_date.desc())
        .all()
    )


@router.get("/transactions/child/{child_id}", response_model=List[TransactionOut])
def child_transactions(child_id: str, parent: User = Depends(require_parent), db: Session = Depends(get_db)):
    child = _get_family_child(db, parent.family_id, child_id)
    wallet = _get_wallet_for(db, child)
    return (
        db.query(Transaction)
        .filter(Transaction.wallet_id == wallet.id)
        .order_by(Transaction.created_date.desc())
        .all()
    )