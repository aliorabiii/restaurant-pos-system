import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { employeesAPI } from '../../services/api'; // ✅ Make sure this import path is correct

const ExpenseForm = ({ expense, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'COGS',
    subcategory: '',
    description: '',
    amount: '',
    status: 'active',
    notes: '',
    employeeId: '' // ✅ Added for salary category
  });

  const [employees, setEmployees] = useState([]); // ✅ Employee list
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
    'Salaries', // ✅ Employee Salary Category
    'Other'
  ];

  // ✅ Load employees when the form opens
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await employeesAPI.getAll({ status: 'active' });
        setEmployees(response.data || []);
      } catch (err) {
        console.error('Error loading employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date.split('T')[0],
        category: expense.category,
        subcategory: expense.subcategory,
        description: expense.description,
        amount: expense.amount.toString(),
        status: expense.status,
        notes: expense.notes || '',
        employeeId: expense.employeeId || '' // ✅ Load existing employee if editing salary
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
      setErrors(prev => ({ ...prev, [name]: '' }));
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

    // ✅ If Salaries category → employee must be selected
    if (formData.category === 'Salaries' && !formData.employeeId) {
      newErrors.employeeId = 'Select an employee for salary payments';
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

      // ✅ Remove employeeId if not Salaries category
      if (expenseData.category !== 'Salaries') {
        delete expenseData.employeeId;
      }

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
          {errors.submit && <div className="expense-error">{errors.submit}</div>}

          <div className="expense-form-grid">
            
            {/* Date */}
            <div className="expense-form-group">
              <label className="expense-form-label required">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange}/>
            </div>

            {/* Category */}
            <div className="expense-form-group">
              <label className="expense-form-label required">Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* ✅ Employee selector appears only if Salaries category */}
            {formData.category === 'Salaries' && (
              <div className="expense-form-group full-width">
                <label className="expense-form-label required">Employee</label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className={errors.employeeId ? 'error' : ''}
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName} ({emp.role})
                    </option>
                  ))}
                </select>
                {errors.employeeId && <span className="expense-form-error">{errors.employeeId}</span>}
              </div>
            )}

            <div className="expense-form-group full-width">
              <label className="expense-form-label required">Subcategory</label>
              <input type="text" name="subcategory" value={formData.subcategory} onChange={handleChange}/>
            </div>

            <div className="expense-form-group full-width">
              <label className="expense-form-label required">Description</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange}/>
            </div>

            <div className="expense-form-group">
              <label className="expense-form-label required">Amount</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange}/>
            </div>

            <div className="expense-form-group">
              <label className="expense-form-label required">Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="expense-form-group full-width">
              <label className="expense-form-label">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange}/>
            </div>
          </div>
        </div>

        <div className="expense-modal-footer">
          <button onClick={handleSubmit} disabled={loading} className="expense-modal-btn primary">
            <Save size={20} /> {loading ? 'Saving...' : (expense ? 'Update Expense' : 'Add Expense')}
          </button>
          <button onClick={onClose} disabled={loading} className="expense-modal-btn secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
