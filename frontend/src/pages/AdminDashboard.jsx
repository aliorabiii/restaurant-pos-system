import { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import UserManagement from '../components/UserManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
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
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = () => {
  const { user } = useAuth();

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

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Reports</h3>
            <p className="stat-value">-</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card">
            <span className="action-icon">➕</span>
            <span>Add New User</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📋</span>
            <span>View Reports</span>
          </button>
          <button className="action-card">
            <span className="action-icon">⚙️</span>
            <span>Settings</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📊</span>
            <span>Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Placeholder components
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