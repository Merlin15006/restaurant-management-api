from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routes import categories, menu_items, customers, orders

app = FastAPI(title="Restaurant Ordering System API")

app.include_router(categories.router)
app.include_router(menu_items.router)
app.include_router(customers.router)
app.include_router(orders.router)

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")