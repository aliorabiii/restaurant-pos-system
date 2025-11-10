// frontend/src/components/clerk/DeliveryStats.jsx
import React from "react";
import "./DeliveryStats.css";

const DeliveryStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="delivery-stats loading">
        <div className="loading-spinner"></div>
        <p>Loading delivery statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="delivery-stats">
        <h3>Delivery Statistics</h3>
        <div className="no-data">
          <p>No delivery data available for the selected period</p>
        </div>
      </div>
    );
  }

  const completionRate =
    stats.totalDeliveries > 0
      ? Math.round((stats.completedDeliveries / stats.totalDeliveries) * 100)
      : 0;

  return (
    <div className="delivery-stats">
      <h3>Delivery Statistics</h3>

      {/* Summary Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.totalDeliveries || 0}</div>
          <div className="stat-label">Total Deliveries</div>
        </div>
        <div className="stat-card">
          <div className="stat-value completed">
            {stats.completedDeliveries || 0}
          </div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value pending">
            {stats.pendingDeliveries || 0}
          </div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="revenue-card">
        <div className="revenue-value">
          ${stats.totalRevenue?.toFixed(2) || "0.00"}
        </div>
        <div className="revenue-label">Total Revenue</div>
      </div>

      {/* Completion Rate */}
      <div className="completion-rate">
        <h4>Completion Rate</h4>
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        <div className="completion-text">
          <span>{completionRate}%</span>
          <span>
            {stats.completedDeliveries} of {stats.totalDeliveries} delivered
          </span>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="insights">
        <h4>Delivery Insights</h4>

        {stats.totalDeliveries === 0 ? (
          <div className="insight-item">
            <p>📊 No delivery orders for this period</p>
          </div>
        ) : (
          <>
            {stats.pendingDeliveries > 0 ? (
              <div className="insight-item warning">
                <p>
                  🚨 <strong>{stats.pendingDeliveries}</strong> delivery
                  {stats.pendingDeliveries !== 1 ? "s" : ""} need attention
                </p>
              </div>
            ) : (
              <div className="insight-item success">
                <p>✅ All deliveries completed for this period</p>
              </div>
            )}

            {completionRate === 100 && (
              <div className="insight-item success">
                <p>🎉 Perfect completion rate! All orders delivered</p>
              </div>
            )}

            {completionRate >= 80 && completionRate < 100 && (
              <div className="insight-item good">
                <p>👍 Great performance! {completionRate}% completion rate</p>
              </div>
            )}

            {completionRate < 80 && completionRate > 0 && (
              <div className="insight-item warning">
                <p>
                  📈 Room for improvement - {completionRate}% completion rate
                </p>
              </div>
            )}

            {stats.totalRevenue > 0 && (
              <div className="insight-item revenue">
                <p>
                  💰 Average revenue per delivery:{" "}
                  <strong>
                    ${(stats.totalRevenue / stats.totalDeliveries).toFixed(2)}
                  </strong>
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <h4>Performance Summary</h4>
        <div className="performance-grid">
          <div className="performance-item">
            <span className="performance-label">Total Orders:</span>
            <span className="performance-value">{stats.totalDeliveries}</span>
          </div>
          <div className="performance-item">
            <span className="performance-label">Completed:</span>
            <span className="performance-value completed">
              {stats.completedDeliveries}
            </span>
          </div>
          <div className="performance-item">
            <span className="performance-label">Pending:</span>
            <span className="performance-value pending">
              {stats.pendingDeliveries}
            </span>
          </div>
          <div className="performance-item">
            <span className="performance-label">Completion Rate:</span>
            <span className="performance-value rate">{completionRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStats;
