// frontend/src/components/clerk/OrdersTable.jsx
import React, { useState } from "react";
import "./OrdersTable.css";

const OrdersTable = ({ orders, loading, onRefresh }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: "💵",
      credit_card: "💳",
      mobile: "📱",
    };
    return icons[method] || "💰";
  };

  // ADDED: Get order type badge
  const getOrderTypeBadge = (orderType) => {
    const badges = {
      inside: " Inside",
      delivery: " Delivery",
    };
    return badges[orderType] || orderType;
  };

  if (loading) {
    return (
      <div className="orders-table loading">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-table">
      <div className="table-header">
        <h3>Orders</h3>
        <button className="refresh-btn" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>No orders found for the selected period</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Time</th>
                <th>Type</th> {/* ADDED: Order Type column */}
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr
                    className="order-row"
                    onClick={() => toggleOrderDetails(order._id)}
                  >
                    <td className="order-number">{order.orderNumber}</td>
                    <td className="order-time">
                      <div>{formatTime(order.createdAt)}</div>
                      <small>{formatDate(order.createdAt)}</small>
                    </td>
                    <td className="order-type">
                      {" "}
                      {/* ADDED: Order Type cell */}
                      <span className={`type-badge ${order.orderType}`}>
                        {getOrderTypeBadge(order.orderType)}
                      </span>
                    </td>
                    <td className="order-items-count">
                      {order.items.length} items
                    </td>
                    <td className="order-total">${order.total.toFixed(2)}</td>
                    <td className="order-payment">
                      <span className="payment-method">
                        {getPaymentMethodIcon(order.paymentMethod)}
                        {order.paymentMethod.replace("_", " ")}
                      </span>
                    </td>
                    <td className="order-status">
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>

                  {expandedOrder === order._id && (
                    <tr className="order-details-row">
                      <td colSpan="7">
                        {" "}
                        {/* CHANGED: colSpan from 6 to 7 */}
                        <div className="order-details">
                          <h4>Order Details</h4>

                          {/* ADDED: Delivery Information Section */}
                          {/* {order.orderType === "delivery" &&
                            order.deliveryInfo && (
                              <div className="delivery-info-section">
                                <h5> Delivery Information</h5>
                                <div className="delivery-details">
                                  <div className="delivery-row">
                                    <strong>Customer:</strong>{" "}
                                    {order.deliveryInfo.customerName}
                                  </div>
                                  <div className="delivery-row">
                                    <strong>Phone:</strong>{" "}
                                    {order.deliveryInfo.customerPhone}
                                  </div>
                                  <div className="delivery-row">
                                    <strong>Address:</strong>{" "}
                                    {order.deliveryInfo.customerAddress}
                                  </div>
                                  {order.deliveryInfo.deliveryCost > 0 && (
                                    <div className="delivery-row">
                                      <strong>Delivery Cost:</strong> $
                                      {order.deliveryInfo.deliveryCost.toFixed(
                                        2
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )} */}

                          <div className="order-items">
                            {order.items.map((item, index) => (
                              <div key={index} className="order-item">
                                <div className="item-info">
                                  <span className="item-name">
                                    {item.productName}
                                  </span>
                                  {item.variant?.size && (
                                    <span className="item-variant">
                                      ({item.variant.size})
                                    </span>
                                  )}
                                </div>
                                <div className="item-quantity-price">
                                  <span className="quantity">
                                    x{item.quantity}
                                  </span>
                                  <span className="price">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="order-summary">
                            <div className="summary-row">
                              <span>Subtotal:</span>
                              <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                              <span>Tax:</span>
                              <span>${order.tax.toFixed(2)}</span>
                            </div>

                            {/* ADDED: Delivery Cost in Summary */}
                            {order.deliveryInfo?.deliveryCost > 0 && (
                              <div className="summary-row delivery-cost">
                                <span>Delivery Cost:</span>
                                <span>
                                  +${order.deliveryInfo.deliveryCost.toFixed(2)}
                                </span>
                              </div>
                            )}

                            {/* ADDED: Tip in Summary */}
                            {order.tip > 0 && (
                              <div className="summary-row tip">
                                <span>Tip:</span>
                                <span>+${order.tip.toFixed(2)}</span>
                              </div>
                            )}

                            <div className="summary-row total">
                              <span>Total:</span>
                              <span>${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
