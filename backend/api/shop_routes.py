from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, Wallet, UserItem
from core.deps import require_child
from services.shop import SHOP_ITEMS
from schemas.shop import ShopItemOut, ShopOut, ShopActionOut

router = APIRouter(prefix="/api/shop", tags=["Gem Shop"])


def _wallet(db: Session, child: User) -> Wallet:
    w = db.query(Wallet).filter(Wallet.owner_id == child.id).first()
    if not w:
        raise HTTPException(status_code=500, detail="This child has no wallet")
    return w


def _owned_ids(db: Session, child: User) -> set:
    return {r.item_id for r in db.query(UserItem).filter(UserItem.child_id == child.id).all()}


def _is_equipped(child: User, wallet: Wallet, item_id: str, kind: str) -> bool:
    if kind == "frame":
        return child.equipped_frame == item_id
    if kind == "title":
        return child.equipped_title == item_id
    return wallet.card_theme == item_id


@router.get("", response_model=ShopOut)
def get_shop(child: User = Depends(require_child), db: Session = Depends(get_db)):
    wallet = _wallet(db, child)
    owned = _owned_ids(db, child)
    items = [
        ShopItemOut(id=i, kind=meta["kind"], price=meta["price"], owned=i in owned,
                    equipped=_is_equipped(child, wallet, i, meta["kind"]))
        for i, meta in SHOP_ITEMS.items()
    ]
    return ShopOut(gems=child.gems or 0, items=items, equipped_frame=child.equipped_frame,
                   equipped_title=child.equipped_title, equipped_card_theme=wallet.card_theme)


@router.post("/{item_id}/buy", response_model=ShopActionOut)
def buy_item(item_id: str, child: User = Depends(require_child), db: Session = Depends(get_db)):
    item = SHOP_ITEMS.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Unknown item")
    if item_id in _owned_ids(db, child):
        raise HTTPException(status_code=409, detail="You already own this item")

    # خصم ذرّي: UPDATE ... WHERE gems >= price. لو طلبين متزامنين (أو الجواهر اتصرفت في نفس اللحظة)
    # واحد بس بينجح، ومفيش رصيد سالب أبدًا — بدل read-modify-write اللي كان ممكن يتخطّى الرصيد.
    updated = (
        db.query(User)
        .filter(User.id == child.id, User.gems >= item["price"])
        .update({User.gems: User.gems - item["price"]}, synchronize_session=False)
    )
    if updated == 0:
        db.rollback()
        raise HTTPException(status_code=400, detail="Not enough gems")

    db.add(UserItem(child_id=child.id, item_id=item_id, price_paid=item["price"]))
    try:
        db.commit()
    except IntegrityError:  # ضغطتين سريعتين على نفس العنصر — التاني يتلغي والجواهر ماتتخصمش
        db.rollback()
        raise HTTPException(status_code=409, detail="You already own this item")
    db.refresh(child)
    return ShopActionOut(gems=child.gems or 0, item_id=item_id)


@router.post("/{item_id}/equip", response_model=ShopActionOut)
def equip_item(item_id: str, child: User = Depends(require_child), db: Session = Depends(get_db)):
    item = SHOP_ITEMS.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Unknown item")
    if item_id not in _owned_ids(db, child):
        raise HTTPException(status_code=403, detail="Buy this item first")
    if item["kind"] == "frame":
        child.equipped_frame = item_id
    elif item["kind"] == "title":
        child.equipped_title = item_id
    else:
        _wallet(db, child).card_theme = item_id
    db.commit()
    db.refresh(child)
    return ShopActionOut(gems=child.gems or 0, item_id=item_id)


@router.post("/unequip/{kind}", response_model=ShopActionOut)
def unequip(kind: str, child: User = Depends(require_child), db: Session = Depends(get_db)):
    if kind == "frame":
        child.equipped_frame = None
    elif kind == "title":
        child.equipped_title = None
    else:  # الثيمات بترجع للأساسي من صفحة الكارت (الثيمات المجانية)
        raise HTTPException(status_code=400, detail="Only frames and titles can be removed")
    db.commit()
    db.refresh(child)
    return ShopActionOut(gems=child.gems or 0, item_id=kind)