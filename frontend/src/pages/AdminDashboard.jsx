import React, { useState, useEffect } from "react";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Sidebar from '../components/Sidebar';
import UserManagement from '../components/UserManagement';
import EmployeeManagement from './EmployeeManagement';
import ExpensePage from './ExpensePage';  // ← Add this import
import './AdminDashboard.css';

import { useAuth } from "../context/AuthContext";
import ProductsPage from "./ProductsPage";
import ClerkDashboard from "./ClerkDashboard";
import ReportsPage from "./ReportsPage.jsx";

const AdminDashboard = () => {
  console.log("AdminDashboard render start");
  const auth = useAuth();
  console.log("useAuth returned:", auth);
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("AdminDashboard mounted");
    return () => console.log("AdminDashboard unmount");
  }, []);

  const handleLogout = async () => {
    try {
      if (logout) await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message || String(err));
    }
  };

  // If a runtime error happened show it
  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Something went wrong</h2>
        <pre style={{ color: "red" }}>{String(error)}</pre>
      </div>
    );
  }

  // If useAuth returned nothing, show warning
  if (!auth) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Auth context not found</h2>
        <p>
          The <code>useAuth()</code> hook returned <code>undefined</code>. Check
          that your <code>AuthContext</code> provider wraps <code>App</code> and
          that the hook is exported correctly.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div
        className={`main-content ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1>Admin Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || "Unknown"}</span>
                <span className="user-role">{user?.role || "—"}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/expenses" element={<ExpensePage />} />  {/* ← Add this route */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="clerk" element={<ClerkDashboard />} />
            <Route path="products" element={<ProductsPage />} />
      
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    console.log("DashboardHome mounted; user:", user);
  }, [user]);

  return (
    <div className="dashboard-home">
      <h2>Welcome back, {user?.name}! 👋</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-value">-</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👷</div>
          <div className="stat-info">
            <h3>Employees</h3>
            <p className="stat-value">-</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Orders Today</h3>
            <p className="stat-value">-</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Revenue</h3>
            <p className="stat-value">$0.00</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button
            className="action-card"
            onClick={() => navigate("/admin/users")}
          >
            <span className="action-icon">➕</span>
            <span>Add New User</span>
          </button>
          <button 
            className="action-card"
            onClick={() => navigate("/admin/employees")}
          >
            <span className="action-icon">👷</span>
            <span>Add Employee</span>
          </button>
          <button 
            className="action-card"
            onClick={() => navigate("/admin/expenses")}  // ← Add this
          >
            <span className="action-icon">💰</span>
            <span>Manage Expenses</span>
          </button>
          <button 
            className="action-card"
            onClick={() => navigate("/admin/reports")}
          >
            <span className="action-icon">📋</span>
            <span>View Reports</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate("/admin/products")}
          >
            <span className="action-icon">📦</span>
            <span>Manage Products</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate("/admin/clerk")}
          >
            <span className="action-icon">🛒</span>
            <span>Clerk Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;