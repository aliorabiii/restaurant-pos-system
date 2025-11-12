<div align="center">

# 🍽️ Restaurant POS & Management System  
### Modern Full-Stack Solution for Restaurants

![GitHub Repo stars](https://img.shields.io/github/stars/aliorabiii/restaurant-pos-system?style=for-the-badge&color=gold)
![GitHub forks](https://img.shields.io/github/forks/aliorabiii/restaurant-pos-system?style=for-the-badge&color=blue)
![GitHub last commit](https://img.shields.io/github/last-commit/aliorabiii/restaurant-pos-system?style=for-the-badge&color=purple)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**A complete POS system built using the MERN stack with role-based dashboards, expense tracking, employee management, and financial analytics.**

</div>

---

## ✨ **Features Overview**

| Module | Description |
|--------|-------------|
| **POS / Cashier System** | Fast and optimized UI for order handling |
| **Role-Based Dashboards** | Different UI access for Admin / Manager / Accountant / Cashier |
| **Expense Management** | Track all business expenses & employee salaries as expenses |
| **Product Management** | Add, edit, categorize & manage inventory items |
| **Employee Management** | Add employees & manage employment status |
| **Analytics & Reports** | Revenue trends, top products, profit/loss, expenses overview |

---

## 🚀 **Tech Stack**

| Layer | Technology |
|------|------------|
| **Frontend** | React.js (Vite), Context API, Tailwind (optional custom styling) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (Token-Based Auth) |
| **Charts & Analytics** | Recharts |

---

## 🧭 **Project Structure**

```bash
restaurant-pos-system/
│
├── backend/
│   ├── controllers/       # API Logic (Products, Employees, Orders, Reports)
│   ├── middleware/        # Auth + Role Permissions
│   ├── models/            # MongoDB Schemas
│   ├── routes/            # REST API Endpoints
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/    # UI components
    │   ├── pages/         # Page views
    │   ├── context/       # Auth & User Session
    │   ├── services/      # API Calls (axios)
    │   └── App.jsx


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

