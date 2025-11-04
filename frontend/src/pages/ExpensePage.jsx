import React, { useState, useEffect } from 'react';
import { DollarSign, Plus } from 'lucide-react';
import ExpenseStats from '../components/ExpenseManagement/ExpenseStats';
import ExpenseList from '../components/ExpenseManagement/ExpenseList';
import ExpenseForm from '../components/ExpenseManagement/ExpenseForm';
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
} from '../services/expenseService';
import './ExpensePage.css';

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    type: '',
    status: 'active'
  });

  useEffect(() => {
    loadExpenses();
    loadStats();
  }, [filters]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllExpenses(filters);
      setExpenses(response.data || []);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getExpenseStats(filters);
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleSubmitExpense = async (expenseData) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense._id, expenseData);
      } else {
        await createExpense(expenseData);
      }
      loadExpenses();
      loadStats();
      setShowModal(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await deleteExpense(id);
      loadExpenses();
      loadStats();
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  return (
    <div className="expense-page">
      <div className="expense-container">
        {/* Header */}
        <div className="expense-header">
          <div className="expense-header-left">
            <h1>
              <DollarSign size={40} />
              Expense Management
            </h1>
            <p>Track and manage all business expenses</p>
          </div>
          <button onClick={handleAddExpense} className="add-expense-btn">
            <Plus size={20} />
            Add Expense
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="expense-error">
            {error}
          </div>
        )}

        {/* Statistics */}
        <ExpenseStats stats={stats} />

        {/* Expenses List */}
        <ExpenseList
          expenses={expenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          loading={loading}
        />

        {/* Add/Edit Modal */}
        {showModal && (
          <ExpenseForm
            expense={editingExpense}
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmitExpense}
          />
        )}
      </div>
    </div>
  );
};

export default ExpensePage;