from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, DailyQuestSet, DailyQuestClaim
from core.deps import require_child
from services.leveling import apply_xp
from services import quests as q
from schemas.quests import QuestOut, ChestOut, QuestsTodayOut, QuestClaimOut

router = APIRouter(prefix="/api/quests", tags=["Daily Quests"])


def _get_or_create_set(db: Session, child: User, day) -> DailyQuestSet:
    qs = db.query(DailyQuestSet).filter(DailyQuestSet.child_id == child.id, DailyQuestSet.quest_date == day).first()
    if qs:
        return qs
    qs = DailyQuestSet(child_id=child.id, quest_date=day, quests=q.generate_quests(db, child, day))
    db.add(qs)
    try:
        db.commit()
    except IntegrityError:  # طلبين متزامنين — التاني كسب، نقرا اللي اتخزّن
        db.rollback()
        qs = db.query(DailyQuestSet).filter(DailyQuestSet.child_id == child.id, DailyQuestSet.quest_date == day).first()
    return qs


def _claimed_keys(db: Session, child: User, day) -> set:
    return {r.quest_key for r in db.query(DailyQuestClaim).filter(
        DailyQuestClaim.child_id == child.id, DailyQuestClaim.quest_date == day).all()}


@router.get("/today", response_model=QuestsTodayOut)
def quests_today(child: User = Depends(require_child), db: Session = Depends(get_db)):
    day = q.today()
    qs = _get_or_create_set(db, child, day)
    claimed = _claimed_keys(db, child, day)

    out = []
    for item in qs.quests:
        progress = q.quest_progress(db, child, item["key"])
        out.append(QuestOut(
            key=item["key"], icon=q.QUEST_DEFS[item["key"]]["icon"], target=item["target"],
            progress=min(progress, item["target"]), xp=item["xp"],
            completed=progress >= item["target"], claimed=item["key"] in claimed,
        ))
    all_claimed = all(o.claimed for o in out)
    return QuestsTodayOut(
        date=day.isoformat(), quests=out,
        chest=ChestOut(xp=q.CHEST_XP, ready=all_claimed, claimed="chest" in claimed),
    )


@router.post("/{key}/claim", response_model=QuestClaimOut)
def claim_quest(key: str, child: User = Depends(require_child), db: Session = Depends(get_db)):
    day = q.today()
    qs = _get_or_create_set(db, child, day)
    item = next((i for i in qs.quests if i["key"] == key), None)
    if not item:
        raise HTTPException(status_code=404, detail="This quest is not part of today's quests")

    claimed = _claimed_keys(db, child, day)
    if key in claimed:
        raise HTTPException(status_code=409, detail="Quest already claimed")
    if q.quest_progress(db, child, key) < item["target"]:
        raise HTTPException(status_code=400, detail="Quest is not complete yet")

    leveled_up = apply_xp(child, item["xp"])
    db.add(DailyQuestClaim(child_id=child.id, quest_date=day, quest_key=key, xp_awarded=item["xp"]))

    # آخر مهمة اتستلمت → افتح الصندوق في نفس الـ transaction
    chest_xp = 0
    if all(i["key"] in claimed or i["key"] == key for i in qs.quests):
        chest_xp = q.CHEST_XP
        if apply_xp(child, chest_xp):
            leveled_up = True
        db.add(DailyQuestClaim(child_id=child.id, quest_date=day, quest_key="chest", xp_awarded=chest_xp))

    try:
        db.commit()
    except IntegrityError:  # ضغطتين سريعتين — واحدة بس تنجح
        db.rollback()
        raise HTTPException(status_code=409, detail="Quest already claimed")
    db.refresh(child)

    return QuestClaimOut(
        key=key, xp_awarded=item["xp"], chest_xp_awarded=chest_xp,
        leveled_up=leveled_up, new_xp=child.xp, new_level=child.level,
    )