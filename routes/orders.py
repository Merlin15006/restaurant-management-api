
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from models.order import Order
from models.customer import Customer
from models.menu_item import MenuItem
from schemas.order import OrderCreate, OrderUpdate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    if not db.query(Customer).filter(Customer.id == data.customer_id).first():
        raise HTTPException(status_code=400, detail="Invalid customer_id")

    menu_item = db.query(MenuItem).filter(
        MenuItem.id == data.menu_item_id
    ).first()

    if not menu_item:
        raise HTTPException(status_code=400, detail="Invalid menu_item_id")

    if not menu_item.is_available:
        raise HTTPException(status_code=409, detail="Menu item is unavailable")

    order = Order(**data.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/", response_model=list[OrderResponse])
def get_orders(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Order).offset(skip).limit(limit).all()


@router.get("/details")
def get_order_details(db: Session = Depends(get_db)):
    results = (
        db.query(
            Order.id,
            Customer.name.label("customer_name"),
            MenuItem.name.label("item_name"),
            Order.quantity,
            Order.unit_price,
            Order.status,
            Order.order_date
        )
        .join(Customer, Order.customer_id == Customer.id)
        .join(MenuItem, Order.menu_item_id == MenuItem.id)
        .all()
    )

    return [
        {
            "order_id": row.id,
            "customer_name": row.customer_name,
            "item_name": row.item_name,
            "quantity": row.quantity,
            "unit_price": float(row.unit_price),
            "status": row.status,
            "order_date": row.order_date
        }
        for row in results
    ]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, data: OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not db.query(Customer).filter(Customer.id == data.customer_id).first():
        raise HTTPException(status_code=400, detail="Invalid customer_id")

    if not db.query(MenuItem).filter(MenuItem.id == data.menu_item_id).first():
        raise HTTPException(status_code=400, detail="Invalid menu_item_id")

    for key, value in data.model_dump().items():
        setattr(order, key, value)

    from datetime import datetime
    order.updated_at = datetime.now()
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}
