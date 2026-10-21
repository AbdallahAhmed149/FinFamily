from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, LessonCompletion, GameCompletion
from core.deps import require_child
from services.leveling import apply_xp
from services.streaks import touch_streak
from services import lessons as L
from services import worlds as W
from schemas.lessons import (
    LessonProgressOut, LessonCompleteRequest, LessonCompleteResponse,
    AdventureOut, WorldOut, WorldLessonOut, WorldGameOut,
)

router = APIRouter(prefix="/api", tags=["Lessons & Adventure"])


def _completions(db: Session, child: User) -> dict:
    return {r.lesson_id: r for r in db.query(LessonCompletion).filter(LessonCompletion.child_id == child.id).all()}


@router.get("/lessons/progress", response_model=List[LessonProgressOut])
def lessons_progress(child: User = Depends(require_child), db: Session = Depends(get_db)):
    comp = _completions(db, child)
    out = []
    for i, lid in enumerate(L.LESSON_ORDER):
        c = comp.get(lid)
        out.append(LessonProgressOut(
            id=lid, status=L.status_for(i, comp),
            best_score=c.best_score if c else 0, total=c.total if c else 0, attempts=c.attempts if c else 0,
            xp=L.LESSON_XP[lid], gems=L.lesson_gems(lid),
        ))
    return out


@router.post("/lessons/{lesson_id}/complete", response_model=LessonCompleteResponse)
def complete_lesson(lesson_id: str, payload: LessonCompleteRequest,
                    child: User = Depends(require_child), db: Session = Depends(get_db)):
    if lesson_id not in L.LESSON_XP:
        raise HTTPException(status_code=404, detail="Unknown lesson")

    comp = _completions(db, child)
    index = L.LESSON_ORDER.index(lesson_id)
    if L.status_for(index, comp) == "locked":
        raise HTTPException(status_code=403, detail="Finish the previous lesson first")

    # الكويز دايمًا بنفس عدد الأسئلة — أي total تاني معناه طلب متلاعب بيه
    if payload.total != L.QUESTIONS_PER_QUIZ or payload.score > payload.total:
        raise HTTPException(status_code=400, detail="Invalid quiz result")

    passed_now = L.is_passing(payload.score, payload.total)
    record = comp.get(lesson_id)
    if record is None:
        record = LessonCompletion(child_id=child.id, lesson_id=lesson_id, attempts=0, best_score=0, total=payload.total)
        db.add(record)

    first_pass = passed_now and not record.passed
    record.attempts = (record.attempts or 0) + 1
    if payload.score >= (record.best_score or 0):
        record.best_score, record.total = payload.score, payload.total

    xp_awarded = gems_awarded = 0
    leveled_up = False
    streak_result = None
    if first_pass:
        record.passed = True
        record.first_passed_date = datetime.utcnow()
        xp_awarded, gems_awarded = L.LESSON_XP[lesson_id], L.lesson_gems(lesson_id)
        record.xp_awarded, record.gems_awarded = xp_awarded, gems_awarded
        child.gems = (child.gems or 0) + gems_awarded
        leveled_up = apply_xp(child, xp_awarded)
    if payload.score > 0:
        streak_result = touch_streak(child)  # التعلّم نشاط حقيقي بيحافظ على الـ streak

    try:
        db.commit()
    except IntegrityError:  # طلبين متزامنين على نفس الدرس لأول مرة — نعيد المحاولة بنسخة السجل اللي اتحفظت
        db.rollback()
        raise HTTPException(status_code=409, detail="Please try again")
    db.refresh(child)

    nxt = L.LESSON_ORDER[index + 1] if index + 1 < len(L.LESSON_ORDER) else None
    return LessonCompleteResponse(
        lesson_id=lesson_id, passed=record.passed, first_pass=first_pass,
        best_score=record.best_score, total=record.total,
        xp_awarded=xp_awarded, gems_awarded=gems_awarded, leveled_up=leveled_up,
        new_xp=child.xp, new_level=child.level, new_gems=child.gems or 0,
        next_lesson_id=nxt if record.passed else None,
        streak_freeze_used=streak_result.freezes_used if streak_result else 0,
        streak_freeze_earned=streak_result.freeze_earned if streak_result else False,
        streak_lost=streak_result.lost_streak if streak_result else 0,
        new_streak_freezes=child.streak_freezes or 0,
    )


@router.get("/adventure", response_model=AdventureOut)
def adventure(child: User = Depends(require_child), db: Session = Depends(get_db)):
    comp = _completions(db, child)
    level = child.level or 1

    games = {}
    for r in db.query(GameCompletion).filter(GameCompletion.child_id == child.id).all():
        g = games.setdefault(r.game_id, {"plays": 0, "best": 0.0})
        g["plays"] += 1
        if r.total:
            g["best"] = max(g["best"], r.score / r.total)

    out = []
    for w in W.WORLDS:
        lessons = []
        passed = 0
        for lid in w["lessons"]:
            c = comp.get(lid)
            if c and c.passed:
                passed += 1
            lessons.append(WorldLessonOut(
                id=lid, status=L.status_for(L.LESSON_ORDER.index(lid), comp),
                best_score=c.best_score if c else 0, total=c.total if c else 0,
            ))
        g = games.get(w["game"], {"plays": 0, "best": 0.0})
        stars = W.stars_for_ratio(g["best"]) if g["plays"] else 0
        progress = W.world_progress(passed, len(w["lessons"]), stars)
        out.append(WorldOut(
            id=w["id"], unlock_level=w["unlock_level"], unlocked=level >= w["unlock_level"],
            lessons=lessons, game=WorldGameOut(id=w["game"], plays=g["plays"], best_stars=stars),
            progress=progress, completed=progress >= 100,
        ))
    return AdventureOut(level=level, worlds=out)