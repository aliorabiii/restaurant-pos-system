# 🍽️ Restaurant POS & Management System

A complete **Restaurant Point of Sale & Management System** built using the **MERN Stack**.  
This system is designed to support real restaurant workflows including order handling, cashier operations, expense tracking, employee management, financial reporting, and multi-user role permissions.

---

## ✨ Key Features

### 🖥️ Role-Based Dashboards
- **Main Admin**: Full access to all modules
- **Admin / Manager**: Manage products, employees, expenses, and reports
- **Accountant**: Access to financial reports & expense management
- **Cashier (Clerk)**: Dedicated cashier dashboard for order processing only

### 💵 POS & Cashier System
- Simple and fast cashier interface
- Real-time order handling
- Transaction summary display

### 🧾 Expense Tracking (including Salaries)
- Record business expenses by category
- Employee salaries are entered as **expense entries** (not auto calculated)
- Expense analytics charts & reports

### 👨‍🍳 Employee Management
- Add / Edit / Activate / Deactivate employees
- Track start dates, roles, and notes
- Daily salary is stored as reference but **salary payout is done through expenses**

### 🍔 Product / Inventory
- Add products with categories
- Manage availability & pricing

### 📊 Reports & Insights
- Revenue trends (daily / weekly / monthly)
- Peak sales hours and days
- Top-selling products
- Expense distribution
- Net profit calculations

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React.js (Vite) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose ORM) |
| Auth | JWT (JSON Web Token) |
| UI | Tailwind / Custom Components |
| Charts | Recharts |

---

## 🗂️ Project Structure
``
restaurant-pos/
│
├── backend/
│ ├── models/ # Mongoose Schemas
│ ├── controllers/ # API Logic
│ ├── routes/ # API Endpoints
│ ├── middleware/ # Auth & Role Permissions
│ ├── server.js
│
└── frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── context/ # Auth Context & User Session
│ ├── services/ # API Service Functions
│ ├── App.jsx
│ └── main.jsx
``

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone <YOUR-REPO-URL>
cd restaurant-pos

2️⃣ Backend Setup
cd backend
npm install


Create .env file:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000


Start backend:

npm run dev

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

