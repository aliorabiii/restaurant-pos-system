import { useState, useEffect } from 'react';
import { usersAPI, rolesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      setRoles(response.data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      alert('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await usersAPI.update(user._id, {
        isActive: !user.isActive
      });
      alert(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    const colors = {
      main_admin: '#e74c3c',
      admin: '#3498db',
      manager: '#9b59b6',
      accountant: '#1abc9c',
      cashier: '#f39c12',
      waiter: '#16a085',
      kitchen: '#e67e22',
      inventory_manager: '#2ecc71'
    };
    return colors[role] || '#95a5a6';
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <div>
          <h2>👥 User Management</h2>
          <p className="page-subtitle">Manage users, roles, and permissions</p>
        </div>
        <button className="add-user-btn" onClick={handleAddUser}>
          ➕ Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="role-filter"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          {roles.map(role => (
            <option key={role._id} value={role.name}>
              {role.displayName}
            </option>
          ))}
        </select>

        <div className="user-count">
          {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading-state">
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name-text">{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span 
                      className="role-badge"
                      style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      
                      <button
                        className="action-btn toggle"
                        onClick={() => handleToggleStatus(user)}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                        disabled={user.role === 'main_admin'}
                      >
                        {user.isActive ? '🔒' : '🔓'}
                      </button>

                      {currentUser.role === 'main_admin' && user.role !== 'main_admin' && (
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      )}
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
        <AddUserModal
          roles={roles}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadUsers();
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          roles={roles}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;