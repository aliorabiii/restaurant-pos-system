// frontend/src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

// React Icons imports for Sidebar
import {
  FiPieChart,
  FiUsers,
  FiUserCheck,
  FiPackage,
  FiBarChart2,
  FiSettings,
  FiShoppingCart,
  FiHome,
  FiDollarSign,
} from "react-icons/fi";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, hasRole } = useAuth();

  const menuItems = [
    {
      path: "/admin",
      icon: <FiPieChart className="nav-icon" />,
      label: "Dashboard",
      roles: ["main_admin", "admin", "manager", "accountant", "cashier"],
    },
    {
      path: "/admin/users",
      icon: <FiUsers className="nav-icon" />,
      label: "User Management",
      roles: ["main_admin", "admin"],
    },
    {
      path: "/admin/expenses",
      icon: <FiDollarSign className="nav-icon" />,
      label: "Expense Management",
      roles: ["main_admin", "admin", "manager", "accountant"],
    },
    {
      path: "/admin/employees",
      icon: <FiUserCheck className="nav-icon" />,
      label: "Employee Management",
      roles: ["main_admin", "admin", "manager"],
    },
    {
      path: "/clerk", // CHANGED: Now points to separate route
      icon: <FiShoppingCart className="nav-icon" />,
      label: "Clerk Dashboard",
      roles: ["main_admin","cashier"],
    },
    {
      path: "/admin/products",
      icon: <FiPackage className="nav-icon" />,
      label: "Products",
      roles: ["main_admin", "admin", "manager"],
    },
    {
      path: "/admin/reports",
      icon: <FiBarChart2 className="nav-icon" />,
      label: "Reports",
      roles: ["main_admin", "admin", "manager", "accountant"],
    },
    {
      path: "/admin/settings",
      icon: <FiSettings className="nav-icon" />,
      label: "Settings",
      roles: ["main_admin", "admin"],
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : "expanded"}`}>
      <div className="sidebar-header">
        <div className="logo">
          {!isCollapsed && <span className="logo-text">Restaurant POS</span>}
          {isCollapsed && <FiHome className="logo-icon" />}
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
              {item.icon}
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="badge-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="badge-info">
              <span className="badge-name">{user?.name}</span>
              <span className="badge-role">{user?.role}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
