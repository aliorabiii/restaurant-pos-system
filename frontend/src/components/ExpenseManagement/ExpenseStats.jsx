import React from 'react';
import { DollarSign, TrendingUp, Calendar, PieChart } from 'lucide-react';

const ExpenseStats = ({ stats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!stats) {
    return (
      <div className="expense-stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="expense-stat-card">
            <div className="expense-loading">
              <div className="expense-loading-spinner"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Statistics Cards */}
      <div className="expense-stats-grid">
        <div className="expense-stat-card blue">
          <div className="expense-stat-content">
            <div className="expense-stat-info">
              <h3>Total Expenses</h3>
              <p className="expense-stat-value">
                {formatCurrency(stats.totalExpenses || 0)}
              </p>
            </div>
            <div className="expense-stat-icon">
              <DollarSign size={28} />
            </div>
          </div>
        </div>

        <div className="expense-stat-card green">
          <div className="expense-stat-content">
            <div className="expense-stat-info">
              <h3>Daily Average</h3>
              <p className="expense-stat-value">
                {formatCurrency(stats.dailyAverage || 0)}
              </p>
            </div>
            <div className="expense-stat-icon">
              <TrendingUp size={28} />
            </div>
          </div>
        </div>

        <div className="expense-stat-card purple">
          <div className="expense-stat-content">
            <div className="expense-stat-info">
              <h3>Monthly Average</h3>
              <p className="expense-stat-value">
                {formatCurrency(stats.monthlyAverage || 0)}
              </p>
            </div>
            <div className="expense-stat-icon">
              <Calendar size={28} />
            </div>
          </div>
        </div>

        <div className="expense-stat-card orange">
          <div className="expense-stat-content">
            <div className="expense-stat-info">
              <h3>Total Count</h3>
              <p className="expense-stat-value">
                {stats.totalCount || 0}
              </p>
            </div>
            <div className="expense-stat-icon">
              <PieChart size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.byCategory && stats.byCategory.length > 0 && (
        <div className="expense-category-breakdown">
          <h3>
            <PieChart size={24} />
            Expenses by Category
          </h3>
          <div className="expense-category-grid">
            {stats.byCategory.map(cat => {
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

              return (
                <div key={cat._id} className="expense-category-item">
                  <span className={`expense-category-badge ${getCategoryColor(cat._id)}`}>
                    {cat._id}
                  </span>
                  <p className="expense-category-amount">{formatCurrency(cat.total)}</p>
                  <p className="expense-category-count">{cat.count} entries</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseStats;