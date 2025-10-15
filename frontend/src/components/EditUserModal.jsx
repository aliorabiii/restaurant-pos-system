import { useState } from 'react';
import { usersAPI } from '../services/api';
import './Modal.css';

const EditUserModal = ({ user, roles, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get permissions from selected role automatically
      const selectedRole = roles.find(r => r.name === formData.role);
      const userData = {
        ...formData,
        permissions: selectedRole ? selectedRole.permissions : []
      };

      await usersAPI.update(user._id, userData);
      alert('User updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.name === formData.role);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit User</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div className="error-alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={user.role === 'main_admin'}
            >
              {roles.map(role => (
                <option key={role._id} value={role.name}>
                  {role.displayName}
                </option>
              ))}
            </select>
            {selectedRole && (
              <p className="role-description">{selectedRole.description}</p>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={user.role === 'main_admin'}
              />
              <span>Active User</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;