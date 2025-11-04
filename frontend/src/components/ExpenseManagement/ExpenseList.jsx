import React from 'react';
import { Edit, Trash2, Filter } from 'lucide-react';

const ExpenseList = ({ expenses, onEdit, onDelete, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'COGS': 'bg-red-100 text-red-800',
      'Utilities': 'bg-yellow-100 text-yellow-800',
      'Rent': 'bg-indigo-100 text-indigo-800',
      'Operational': 'bg-green-100 text-green-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Delivery': 'bg-orange-100 text-orange-800',
      'Maintenance': 'bg-teal-100 text-teal-800',
      'Salaries': 'bg-blue-100 text-blue-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  if (loading) {
    return (
      <div className="expense-table-container">
        <div className="expense-table-header">
          <h3>
            <Filter size={24} />
            Recent Expenses
          </h3>
        </div>
        <div className="expense-loading">
          <div className="expense-loading-spinner"></div>
          <p className="expense-loading-text">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="expense-table-container">
        <div className="expense-table-header">
          <h3>
            <Filter size={24} />
            Recent Expenses
          </h3>
        </div>
        <div className="expense-empty">
          <div className="expense-empty-icon">📊</div>
          <p className="expense-empty-title">No expenses found</p>
          <p className="expense-empty-subtitle">Click "Add Expense" to create your first expense entry</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-table-container">
      <div className="expense-table-header">
        <h3>
          <Filter size={24} />
          Recent Expenses
        </h3>
      </div>

      <div className="expense-table-wrapper">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense._id}>
                <td>
                  {new Date(expense.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td>
                  <span className={`expense-badge ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </td>
                <td>
                  <div className="expense-description">
                    <strong>{expense.description}</strong>
                    <small>{expense.subcategory}</small>
                  </div>
                </td>
                <td className="expense-amount">
                  {formatCurrency(expense.amount)}
                </td>
                <td>
                  <div className="expense-actions">
                    <button
                      onClick={() => onEdit(expense)}
                      className="expense-action-btn edit"
                      title="Edit expense"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(expense._id)}
                      className="expense-action-btn delete"
                      title="Delete expense"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;