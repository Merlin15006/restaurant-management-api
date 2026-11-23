from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


class OrderCreate(BaseModel):
    customer_id: int
    menu_item_id: int
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0)
    status: str = "Pending"


class OrderUpdate(BaseModel):
    customer_id: int
    menu_item_id: int
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0)
    status: str


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    menu_item_id: int
    quantity: int
    unit_price: float
    status: str
    order_date: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)