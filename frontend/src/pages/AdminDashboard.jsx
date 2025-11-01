import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserManagement from "../components/UserManagement";
import EmployeeManagement from "./EmployeeManagement";
import "./AdminDashboard.css";
import { useAuth } from "../context/AuthContext";
import ProductsPage from "./ProductsPage";
import ClerkDashboard from "./ClerkDashboard";

// React Icons imports
import {
  FiPieChart,
  FiUsers,
  FiUserCheck,
  FiPackage,
  FiBarChart2,
  FiSettings,
  FiShoppingCart,
  FiLogOut,
  FiMenu,
  FiDollarSign,
  FiHome,
} from "react-icons/fi";

// Icon components with consistent styling
const DashboardIcon = () => <FiPieChart className="icon" />;
const UsersIcon = () => <FiUsers className="icon" />;
const EmployeesIcon = () => <FiUserCheck className="icon" />;
const ProductsIcon = () => <FiPackage className="icon" />;
const ReportsIcon = () => <FiBarChart2 className="icon" />;
const SettingsIcon = () => <FiSettings className="icon" />;
const ClerkIcon = () => <FiShoppingCart className="icon" />;
const LogoutIcon = () => <FiLogOut className="icon" />;
const MenuIcon = () => <FiMenu className="icon" />;
const RevenueIcon = () => <FiDollarSign className="icon" />;

const AdminDashboard = () => {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <pre>{String(error)}</pre>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="error-container">
        <h2>Auth context not found</h2>
        <p>Please check your AuthContext provider.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      <div
        className={`main-content ${
          sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
        }`}
      >
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <MenuIcon />
            </button>
            <h1>Admin Dashboard</h1>
          </div>

          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || "Unknown"}</span>
                <span className="user-role">{user?.role || "—"}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogoutIcon />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="clerk" element={<ClerkDashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { icon: <UsersIcon />, label: "Total Users", value: "1,234" },
    { icon: <EmployeesIcon />, label: "Employees", value: "56" },
    { icon: <ProductsIcon />, label: "Orders Today", value: "89" },
    { icon: <RevenueIcon />, label: "Revenue", value: "$12,456" },
  ];

  const quickActions = [
    { icon: <UsersIcon />, label: "Manage Users", path: "/admin/users" },
    { icon: <EmployeesIcon />, label: "Employees", path: "/admin/employees" },
    { icon: <ProductsIcon />, label: "Products", path: "/admin/products" },
    { icon: <ReportsIcon />, label: "Reports", path: "/admin/reports" },
    { icon: <SettingsIcon />, label: "Settings", path: "/admin/settings" },
    { icon: <ClerkIcon />, label: "Clerk", path: "/admin/clerk" },
  ];

  return (
    <div className="dashboard-home">
      <div className="welcome-section">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Here's your restaurant overview</p>
      </div>

      <div className="stats-section">
        <h2>Overview</h2>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3>{stat.label}</h3>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="action-card"
              onClick={() => navigate(action.path)}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReportsPage = () => (
  <div className="page-content">
    <div className="page-header">
      <h1>
        <ReportsIcon /> Reports
      </h1>
      <p>View analytics and insights</p>
    </div>
    <div className="page-placeholder">
      <p>Reports dashboard coming soon...</p>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="page-content">
    <div className="page-header">
      <h1>
        <SettingsIcon /> Settings
      </h1>
      <p>Manage your preferences</p>
    </div>
    <div className="page-placeholder">
      <p>Settings panel coming soon...</p>
    </div>
  </div>
);

export default AdminDashboard;
