import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, hasRole } = useAuth();

  const menuItems = [
    {
<<<<<<< HEAD
      path: '/admin',
      icon: '🏠',
      label: 'Dashboard',
      roles: ['main_admin', 'admin', 'manager', 'accountant', 'cashier']
    },
    {
      path: '/admin/users',
      icon: '👥',
      label: 'User Management',
      roles: ['main_admin', 'admin']
    },
    {
      path: '/admin/employees',  // ← NEW
      icon: '👷',
      label: 'Employee Management',
      roles: ['main_admin', 'admin', 'manager']
=======
      path: "/admin",
      icon: "🏠",
      label: "Dashboard",
      roles: ["main_admin", "admin", "manager", "accountant"],
    },
    {
      path: "/admin/clerk",
      icon: "🛒",
      label: "Clerk Dashboard",
      roles: ["main_admin", "admin", "manager", "clerk"],
>>>>>>> origin/hsn
    },
    {
      path: "/admin/products",
      icon: "📦",
      label: "Products",
      roles: ["main_admin", "admin", "manager"],
    },
    {
      path: "/admin/users",
      icon: "👥",
      label: "User Management",
      roles: ["main_admin", "admin"],
    },
    {
      path: "/admin/reports",
      icon: "📊",
      label: "Reports",
      roles: ["main_admin", "admin", "manager", "accountant"],
    },
    {
      path: "/admin/settings",
      icon: "⚙️",
      label: "Settings",
      roles: ["main_admin", "admin"],
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🍔</span>
          {isOpen && <span className="logo-text">Restaurant POS</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          if (!hasRole(...item.roles)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {isOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {isOpen && (
          <div className="user-badge">
            <div className="badge-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="badge-info">
              <span className="badge-name">{user?.name}</span>
              <span className="badge-role">{user?.role}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
