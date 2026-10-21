from typing import List, Optional

from pydantic import BaseModel


class ShopItemOut(BaseModel):
    id: str
    kind: str            # card_theme | frame | title
    price: int
    owned: bool
    equipped: bool


class ShopOut(BaseModel):
    gems: int
    items: List[ShopItemOut]
    equipped_frame: Optional[str] = None
    equipped_title: Optional[str] = None
    equipped_card_theme: Optional[str] = None


class ShopActionOut(BaseModel):
    gems: int
    item_id: str