from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from models.menu_item import MenuItem
from models.category import Category
from schemas.menu_item import MenuItemCreate, MenuItemUpdate, MenuItemResponse

router = APIRouter(prefix="/menu_items", tags=["Menu Items"])


@router.post("/", response_model=MenuItemResponse, status_code=201)
def create_menu_item(data: MenuItemCreate, db: Session = Depends(get_db)):
    if not db.query(Category).filter(Category.id == data.category_id).first():
        raise HTTPException(status_code=400, detail="Invalid category_id")

    item = MenuItem(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/", response_model=list[MenuItemResponse])
def get_menu_items(skip: int = 0, limit: int = 10, name: str | None = None,
                   db: Session = Depends(get_db)):
    query = db.query(MenuItem)

    if name:
        query = query.filter(MenuItem.name.ilike(f"%{name}%"))

    return query.offset(skip).limit(limit).all()


@router.get("/{item_id}", response_model=MenuItemResponse)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item


@router.put("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(item_id: int, data: MenuItemUpdate, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    if not db.query(Category).filter(Category.id == data.category_id).first():
        raise HTTPException(status_code=400, detail="Invalid category_id")

    for key, value in data.model_dump().items():
        setattr(item, key, value)

    from datetime import datetime
    item.updated_at = datetime.now()
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    db.delete(item)
    db.commit()
    return {"message": "Menu item deleted successfully"}