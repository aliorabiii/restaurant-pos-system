// debug version of AdminDashboard.jsx - paste over the file temporarily
import React, { useState, useEffect } from "react";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import UserManagement from "../components/UserManagement";
import "./AdminDashboard.css";
import ProductsPage from "./ProductsPage";
import ClerkDashboard from "./ClerkDashboard";

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
            <Route path="clerk" element={<ClerkDashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
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
      <h2>Welcome back, {user?.name || "User"}! 👋</h2>
      <div style={{ padding: 12 }}>
        <p>
          This is a debug build. If this screen shows, routing and layout are
          working.
        </p>
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
            onClick={() => navigate("/admin/reports")}
          >
            <span className="action-icon">📋</span>
            <span>View Reports</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate("/admin/settings")}
          >
            <span className="action-icon">⚙️</span>
            <span>Settings</span>
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

const ReportsPage = () => (
  <div className="page-placeholder">
    <h2>📊 Reports</h2>
    <p>Reports page coming soon...</p>
  </div>
);

const SettingsPage = () => (
  <div className="page-placeholder">
    <h2>⚙️ Settings</h2>
    <p>Settings page coming soon...</p>
  </div>
);

export default AdminDashboard;
