import { useState, useEffect } from 'react';
import { employeesAPI } from '../services/api';
import AddEmployeeModal from '../components/AddEmployeeModal';
import EditEmployeeModal from '../components/EditEmployeeModal';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const employeeRoles = [
    'Delivery Driver',
    'Shawarma Maker',
    'Kitchen Helper',
    'Cleaner',
    'Security Guard',
    'Dishwasher',
    'Food Prep',
    'Other'
  ];

  useEffect(() => {
    loadEmployees();
    loadStats();
  }, [filterRole, filterStatus]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterRole !== 'all') params.role = filterRole;
      if (filterStatus !== 'all') params.status = filterStatus;

      const response = await employeesAPI.getAll(params);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error loading employees:', error);
      alert('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await employeesAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddEmployee = () => {
    setShowAddModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      await employeesAPI.delete(employeeId);
      alert('Employee deleted successfully');
      loadEmployees();
      loadStats();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleToggleStatus = async (employeeId) => {
    try {
      await employeesAPI.toggleStatus(employeeId);
      loadEmployees();
      loadStats();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update employee status');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.phoneNumber?.includes(searchTerm);
    return matchesSearch;
  });

  const getRoleColor = (role) => {
    const colors = {
      'Delivery Driver': '#3498db',
      'Shawarma Maker': '#e67e22',
      'Kitchen Helper': '#9b59b6',
      'Cleaner': '#1abc9c',
      'Security Guard': '#34495e',
      'Dishwasher': '#16a085',
      'Food Prep': '#f39c12',
      'Other': '#95a5a6'
    };
    return colors[role] || '#95a5a6';
  };

  return (
    <div className="employee-management">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>👷 Employee Management</h2>
          <p className="page-subtitle">Manage non-system employees and salary tracking</p>
        </div>
        <button className="add-employee-btn" onClick={handleAddEmployee}>
          ➕ Add New Employee
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Employees</h3>
              <p className="stat-value">{stats.totalEmployees}</p>
            </div>
          </div>

          <div className="stat-card active">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Active Employees</h3>
              <p className="stat-value">{stats.activeEmployees}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Daily Salary Cost</h3>
              <p className="stat-value">${stats.salaryEstimates?.daily?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Monthly Estimate</h3>
              <p className="stat-value">${stats.salaryEstimates?.monthly?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          {employeeRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="employee-count">
          {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}
        </div>
      </div>

      {/* Employees Table */}
      {loading ? (
        <div className="loading-state">
          <p>Loading employees...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👷</div>
          <p>No employees found</p>
          <button className="empty-action-btn" onClick={handleAddEmployee}>
            Add Your First Employee
          </button>
        </div>
      ) : (
        <div className="employees-table-container">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Role</th>
                <th>Phone Number</th>
                <th>Daily Salary</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee._id}>
                  <td>
                    <div className="employee-cell">
                      <div className="employee-avatar">
                        {employee.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="employee-name">{employee.fullName}</span>
                        {employee.notes && (
                          <span className="employee-note">📝 {employee.notes}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="role-badge"
                      style={{ backgroundColor: getRoleColor(employee.role) }}
                    >
                      {employee.role}
                    </span>
                  </td>
                  <td>{employee.phoneNumber || '-'}</td>
                  <td className="salary-cell">${employee.dailySalary.toFixed(2)}</td>
                  <td>{new Date(employee.startDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${employee.status}`}>
                      {employee.status === 'active' ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEditEmployee(employee)}
                        title="Edit Employee"
                      >
                        ✏️
                      </button>
                      
                      <button
                        className="action-btn toggle"
                        onClick={() => handleToggleStatus(employee._id)}
                        title={employee.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {employee.status === 'active' ? '🔒' : '🔓'}
                      </button>

                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteEmployee(employee._id)}
                        title="Delete Employee"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddEmployeeModal
          roles={employeeRoles}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadEmployees();
            loadStats();
          }}
        />
      )}

      {showEditModal && selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          roles={employeeRoles}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
            loadEmployees();
            loadStats();
          }}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;