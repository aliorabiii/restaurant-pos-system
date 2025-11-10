// frontend/src/components/clerk/DeliveryTable.jsx
import React from "react";
import "./DeliveryTable.css";

const DeliveryTable = ({ orders, loading, onRefresh, onOrderSelect }) => {
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getDeliveryStatus = (order) => {
    if (order.deliveryTimestamps?.deliveredAt) {
      return "completed";
    } else {
      return "pending";
    }
  };

  const getStatusBadge = (order) => {
    const status = getDeliveryStatus(order);

    if (status === "completed") {
      return <span className="status-badge completed">✅ Delivered</span>;
    } else {
      return <span className="status-badge pending">⏳ Pending</span>;
    }
  };

  const isRowClickable = (order) => {
    // Only clickable if not delivered yet
    return !order.deliveryTimestamps?.deliveredAt;
  };

  if (loading) {
    return (
      <div className="delivery-table loading">
        <div className="loading-spinner"></div>
        <p>Loading delivery orders...</p>
      </div>
    );
  }

  return (
    <div className="delivery-table">
      <div className="table-header">
        <h3>Delivery Orders</h3>
        <button className="refresh-btn" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-deliveries">
          <p>No delivery orders found for the selected period</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Created At</th>
                <th>Out At</th>
                <th>Delivered At</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className={`delivery-row ${
                    isRowClickable(order) ? "clickable" : ""
                  } ${getDeliveryStatus(order)}`}
                  onClick={() => isRowClickable(order) && onOrderSelect(order)}
                >
                  <td className="order-number">{order.orderNumber}</td>

                  {/* Created At Time */}
                  <td className="order-time">
                    <div>
                      {formatTime(
                        order.deliveryTimestamps?.createdAt || order.createdAt
                      )}
                    </div>
                    <small>
                      {formatDate(
                        order.deliveryTimestamps?.createdAt || order.createdAt
                      )}
                    </small>
                  </td>

                  <td className="delivery-time">
                    {order.deliveryTimestamps?.outAt ? (
                      <>
                        <div>{formatTime(order.deliveryTimestamps.outAt)}</div>
                        <small>
                          {formatDate(order.deliveryTimestamps.outAt)}
                        </small>
                      </>
                    ) : (
                      <div className="not-set">Not Set</div>
                    )}
                  </td>

                  <td className="delivery-time">
                    {order.deliveryTimestamps?.deliveredAt ? (
                      <>
                        <div>
                          {formatTime(order.deliveryTimestamps.deliveredAt)}
                        </div>
                        <small>
                          {formatDate(order.deliveryTimestamps.deliveredAt)}
                        </small>
                      </>
                    ) : (
                      <div className="not-set">Not Set</div>
                    )}
                  </td>

                  <td className="customer-info">
                    <div className="customer-name">
                      {order.deliveryInfo?.customerName || "N/A"}
                    </div>
                    <small className="customer-phone">
                      {order.deliveryInfo?.customerPhone || "N/A"}
                    </small>
                  </td>
                  <td className="order-items-count">
                    {order.items.length} items
                  </td>
                  <td className="order-total">${order.total.toFixed(2)}</td>
                  <td className="order-status">{getStatusBadge(order)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeliveryTable;
