from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime


class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None


class CustomerUpdate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None


class CustomerResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)