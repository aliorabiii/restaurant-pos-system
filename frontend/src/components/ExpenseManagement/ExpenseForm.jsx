import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const ExpenseForm = ({ expense, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'COGS',
    subcategory: '',
    description: '',
    amount: '',
    status: 'active',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'COGS',
    'Utilities',
    'Rent',
    'Operational',
    'Marketing',
    'Delivery',
    'Maintenance',
    'Salaries',
    'Other'
  ];

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date.split('T')[0],
        category: expense.category,
        subcategory: expense.subcategory,
        description: expense.description,
        amount: expense.amount.toString(),
        status: expense.status,
        notes: expense.notes || ''
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.subcategory.trim()) newErrors.subcategory = 'Subcategory is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      await onSubmit(expenseData);
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to save expense' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-modal-overlay">
      <div className="expense-modal">
        <div className="expense-modal-header">
          <h2>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button onClick={onClose} className="expense-modal-close" type="button">
            <X size={20} />
          </button>
        </div>

        <div className="expense-modal-body">
          {errors.submit && (
            <div className="expense-error">
              {errors.submit}
            </div>
          )}

          <div className="expense-form-grid">
            <div className="expense-form-group">
              <label className="expense-form-label required">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`expense-form-input ${errors.date ? 'error' : ''}`}
              />
              {errors.date && <span className="expense-form-error">{errors.date}</span>}
            </div>

            <div className="expense-form-group">
              <label className="expense-form-label required">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`expense-form-select ${errors.category ? 'error' : ''}`}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="expense-form-error">{errors.category}</span>}
            </div>

            <div className="expense-form-group full-width">
              <label className="expense-form-label required">Subcategory</label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="e.g., Raw Materials, Electricity Bill"
                className={`expense-form-input ${errors.subcategory ? 'error' : ''}`}
              />
              {errors.subcategory && <span className="expense-form-error">{errors.subcategory}</span>}
            </div>

            <div className="expense-form-group full-width">
              <label className="expense-form-label required">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the expense"
                className={`expense-form-input ${errors.description ? 'error' : ''}`}
              />
              {errors.description && <span className="expense-form-error">{errors.description}</span>}
            </div>

            <div className="expense-form-group">
              <label className="expense-form-label required">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`expense-form-input ${errors.amount ? 'error' : ''}`}
              />
              {errors.amount && <span className="expense-form-error">{errors.amount}</span>}
            </div>

            <div className="expense-form-group">
              <label className="expense-form-label required">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="expense-form-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="expense-form-group full-width">
              <label className="expense-form-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes (optional)"
                className="expense-form-textarea"
              />
            </div>
          </div>
        </div>

        <div className="expense-modal-footer">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="expense-modal-btn primary"
          >
            <Save size={20} />
            {loading ? 'Saving...' : (expense ? 'Update Expense' : 'Add Expense')}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="expense-modal-btn secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;