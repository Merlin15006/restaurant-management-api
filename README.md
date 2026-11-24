Restaurant Ordering System API

1. Project Overview
The Restaurant Ordering System is a web-based application developed to manage restaurant operations using CRUD (Create, Read, Update, Delete) functionality.
It allows users to manage categories, menu items, customers and orders through REST APIs. It also provides a customer ordering interface and an admin dashboard.

2. Technology Stack
- Programming Language: Python
- Backend Framework: FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy
- Data Validation: Pydantic
- Frontend: HTML, CSS, JavaScript
- API Documentation: Swagger UI
- Version Control: Git and GitHub

3. Database Structure
The project contains four main tables:
1. Categories – Stores restaurant menu categories.
2. Menu Items – Stores food item details and availability.
3. Customers – Stores customer information.
4. Orders – Stores customer orders and connects customers with menu items.
The database uses primary keys, foreign keys and timestamps to maintain relationships and data integrity.

4. Project Structure
restaurant_api/
├── database/
│   └── db.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── admin.html
│   ├── admin.css
│   └── admin.js
├── models/
├── routes/
├── schemas/
├── main.py
├── .env
├── .gitignore
└── README.md

5. Installation and Setup
Step 1: Clone the repository
git clone https://github.com/Merlin15006/restaurant-management-api.git
cd restaurant-management-api
Step 2: Create a virtual environment
python -m venv venv
Activate it on Windows:
venv\Scripts\activate
Step 3: Install dependencies
Install the required packages:
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv
Step 4: Configure the database
Create a PostgreSQL database and configure your database connection details in the `.env` file.
Do not upload your `.env` file to GitHub.
Step 5: Run the application
uvicorn main:app --reload

6. Application URLs
- Customer Website: http://127.0.0.1:8000/
- Admin Dashboard: http://127.0.0.1:8000/admin.html
- Swagger API Documentation: http://127.0.0.1:8000/docs

7. CRUD Operations
The application provides CRUD operations for:
- Categories
- Menu Items
- Customers
- Orders
The API supports creating, retrieving, updating and deleting records.

8. Additional Features
- Input validation using Pydantic.
- Foreign key validation.
- Menu item availability checking during order placement.
- Joined order details using SQL JOIN.
- Search and filtering in the admin dashboard.
- Order status management.

9. Version Control
The project is maintained using Git and GitHub.

GitHub Repository:
https://github.com/Merlin15006/restaurant-management-api
