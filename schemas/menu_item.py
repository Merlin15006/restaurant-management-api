from pydantic import BaseModel, ConfigDict
from datetime import datetime


class MenuItemCreate(BaseModel):
    category_id: int
    name: str
    description: str | None = None
    price: float
    is_available: bool = True


class MenuItemUpdate(BaseModel):
    category_id: int
    name: str
    description: str | None = None
    price: float
    is_available: bool = True


class MenuItemResponse(BaseModel):
    id: int
    category_id: int
    name: str
    description: str | None = None
    price: float
    is_available: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)