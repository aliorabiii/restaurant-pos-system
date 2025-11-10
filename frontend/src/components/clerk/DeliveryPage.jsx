/* eslint-disable no-case-declarations */
// frontend/src/components/clerk/DeliveryPage.jsx
import React, { useState, useEffect } from "react";
import DeliveryTable from "./DeliveryTable";
import DeliveryStats from "./DeliveryStats";
import { getOrders } from "../../services/orderService";
import {
  updateDeliveryOut,
  updateDeliveryDelivered,
} from "../../services/orderService";
import "./DeliveryPage.css";

const DeliveryPage = () => {
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const token = localStorage.getItem("token");

  const dateRanges = {
    today: getDateRange("today"),
    yesterday: getDateRange("yesterday"),
    lastWeek: getDateRange("lastWeek"),
    lastMonth: getDateRange("lastMonth"),
  };

  function getDateRange(range) {
    const now = new Date();
    switch (range) {
      case "today":
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        return { startDate: todayStart, endDate: todayEnd };

      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return { startDate: yesterdayStart, endDate: yesterdayEnd };

      case "lastWeek":
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - 7);
        lastWeekStart.setHours(0, 0, 0, 0);
        const lastWeekEnd = new Date(now);
        lastWeekEnd.setHours(23, 59, 59, 999);
        return { startDate: lastWeekStart, endDate: lastWeekEnd };

      case "lastMonth":
        const lastMonthStart = new Date(now);
        lastMonthStart.setMonth(now.getMonth() - 1);
        lastMonthStart.setHours(0, 0, 0, 0);
        const lastMonthEnd = new Date(now);
        lastMonthEnd.setHours(23, 59, 59, 999);
        return { startDate: lastMonthStart, endDate: lastMonthEnd };

      default:
        return { startDate: new Date(), endDate: new Date() };
    }
  }

  const loadDeliveryOrders = async () => {
    setLoading(true);
    try {
      let params = {};

      if (dateFilter === "custom" && customDate) {
        const selectedDate = new Date(customDate);
        const startDate = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endDate = new Date(selectedDate.setHours(23, 59, 59, 999));
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      } else if (dateFilter !== "custom") {
        const range = dateRanges[dateFilter];
        params.startDate = range.startDate.toISOString();
        params.endDate = range.endDate.toISOString();
      }

      const ordersRes = await getOrders(token, params);
      if (ordersRes.success) {
        const allOrders = ordersRes.data || [];
        const deliveryOrders = allOrders.filter(
          (order) => order.orderType === "delivery"
        );
        setDeliveryOrders(deliveryOrders);

        const calculatedStats = calculateDeliveryStats(deliveryOrders);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error("Error loading delivery orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryStats = (orders) => {
    if (!orders || orders.length === 0) {
      return {
        totalDeliveries: 0,
        completedDeliveries: 0,
        pendingDeliveries: 0,
        totalRevenue: 0,
        averageDeliveryTime: 0,
      };
    }

    const completedDeliveries = orders.filter(
      (order) => order.deliveryTimestamps?.deliveredAt
    ).length;

    const pendingDeliveries = orders.length - completedDeliveries;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    const completedOrders = orders.filter(
      (order) =>
        order.deliveryTimestamps?.outAt && order.deliveryTimestamps?.deliveredAt
    );

    let averageDeliveryTime = 0;
    if (completedOrders.length > 0) {
      const totalTime = completedOrders.reduce((sum, order) => {
        const outTime = new Date(order.deliveryTimestamps.outAt).getTime();
        const deliveredTime = new Date(
          order.deliveryTimestamps.deliveredAt
        ).getTime();
        return sum + (deliveredTime - outTime);
      }, 0);
      averageDeliveryTime = totalTime / completedOrders.length / (1000 * 60);
    }

    return {
      totalDeliveries: orders.length,
      completedDeliveries,
      pendingDeliveries,
      totalRevenue,
      averageDeliveryTime: Math.round(averageDeliveryTime),
    };
  };

  const handleOrderSelect = (order) => {
    if (!order.deliveryTimestamps?.deliveredAt) {
      setSelectedOrder(order);
      setShowDeliveryModal(true);
    }
  };

  const handleUpdateDeliveryStatus = async (orderId, action) => {
    try {
      let result;

      if (action === "out") {
        result = await updateDeliveryOut(orderId, token);
      } else if (action === "delivered") {
        result = await updateDeliveryDelivered(orderId, token);
      }

      if (result && result.success) {
        setDeliveryOrders((prev) =>
          prev.map((order) => (order._id === orderId ? result.data : order))
        );

        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(result.data);
        }

        const calculatedStats = calculateDeliveryStats(
          deliveryOrders.map((order) =>
            order._id === orderId ? result.data : order
          )
        );
        setStats(calculatedStats);

        console.log(
          `✅ Successfully ${
            action === "out" ? "marked out for delivery" : "marked as delivered"
          }`
        );
        return true;
      } else {
        console.error("Failed to update delivery status:", result?.message);
        alert(result?.message || "Failed to update delivery status");
        return false;
      }
    } catch (error) {
      console.error("Error updating delivery status:", error);
      alert(error.response?.data?.message || "Error updating delivery status");
      return false;
    }
  };

  const handleCloseModal = () => {
    setShowDeliveryModal(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    loadDeliveryOrders();
  }, [dateFilter, customDate]);

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    if (filter !== "custom") {
      setCustomDate("");
    }
  };

  const handleCustomDateChange = (date) => {
    setCustomDate(date);
    setDateFilter("custom");
  };

  return (
    <div className="delivery-page">
      <div className="delivery-header">
        <div className="date-filters">
          <button
            className={`date-filter-btn ${
              dateFilter === "today" ? "active" : ""
            }`}
            onClick={() => handleDateFilterChange("today")}
          >
            Today
          </button>
          <button
            className={`date-filter-btn ${
              dateFilter === "yesterday" ? "active" : ""
            }`}
            onClick={() => handleDateFilterChange("yesterday")}
          >
            Yesterday
          </button>
          <button
            className={`date-filter-btn ${
              dateFilter === "lastWeek" ? "active" : ""
            }`}
            onClick={() => handleDateFilterChange("lastWeek")}
          >
            Last Week
          </button>
          <button
            className={`date-filter-btn ${
              dateFilter === "lastMonth" ? "active" : ""
            }`}
            onClick={() => handleDateFilterChange("lastMonth")}
          >
            Last Month
          </button>
          <div className="custom-date-filter">
            <input
              type="date"
              value={customDate}
              onChange={(e) => handleCustomDateChange(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="custom-date-input"
            />
          </div>
        </div>

        <div className="delivery-summary">
          <span className="deliveries-count">
            {deliveryOrders.length} Deliveries
          </span>
          {stats && (
            <span className="revenue">
              Total: ${stats.totalRevenue?.toFixed(2) || "0.00"}
            </span>
          )}
        </div>
      </div>

      <div className="delivery-content">
        <div className="delivery-table-section">
          <DeliveryTable
            orders={deliveryOrders}
            loading={loading}
            onRefresh={loadDeliveryOrders}
            onOrderSelect={handleOrderSelect}
          />
        </div>

        <div className="delivery-stats-section">
          <DeliveryStats stats={stats} loading={loading} />
        </div>
      </div>

      {showDeliveryModal && selectedOrder && (
        <DeliveryStatusModal
          order={selectedOrder}
          onUpdateStatus={handleUpdateDeliveryStatus}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

// Organized Delivery Status Modal Component
const DeliveryStatusModal = ({ order, onUpdateStatus, onClose }) => {
  const [updating, setUpdating] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);

  const handleDeliveryOut = async () => {
    setUpdating(true);
    setCurrentAction("out");
    try {
      const success = await onUpdateStatus(order._id, "out");
      if (success) {
        console.log("✅ Marked as out for delivery");
      }
    } catch (error) {
      console.error("❌ Error marking out for delivery:", error);
    } finally {
      setUpdating(false);
      setCurrentAction(null);
    }
  };

  const handleDeliveryArrived = async () => {
    setUpdating(true);
    setCurrentAction("delivered");
    try {
      const success = await onUpdateStatus(order._id, "delivered");
      if (success) {
        console.log("✅ Marked as delivered");
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Error marking as delivered:", error);
    } finally {
      setUpdating(false);
      setCurrentAction(null);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDeliveryDuration = () => {
    if (
      !order.deliveryTimestamps?.outAt ||
      !order.deliveryTimestamps?.deliveredAt
    ) {
      return null;
    }

    const outTime = new Date(order.deliveryTimestamps.outAt).getTime();
    const deliveredTime = new Date(
      order.deliveryTimestamps.deliveredAt
    ).getTime();
    const duration = (deliveredTime - outTime) / (1000 * 60);

    return Math.round(duration);
  };

  const isOutAtDisabled = !!order.deliveryTimestamps?.outAt;
  const isDeliveredAtDisabled =
    !order.deliveryTimestamps?.outAt || !!order.deliveryTimestamps?.deliveredAt;
  const deliveryDuration = calculateDeliveryDuration();
  const isCompleted = !!order.deliveryTimestamps?.deliveredAt;

  return (
    <div className="delivery-modal-overlay" onClick={onClose}>
      <div className="delivery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delivery-modal-header">
          <h3>Delivery Order #{order.orderNumber}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="delivery-modal-content">
          {/* Order Information Section */}
          <div className="info-section">
            <h4> Order Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Order Number:</span>
                <span className="info-value">{order.orderNumber}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Order Time:</span>
                <span className="info-value">
                  {formatDateTime(order.createdAt)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Amount:</span>
                <span className="info-value">${order.total.toFixed(2)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Items Count:</span>
                <span className="info-value">{order.items.length} items</span>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="info-section">
            <h4> Customer Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Customer Name:</span>
                <span className="info-value">
                  {order.deliveryInfo?.customerName || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone Number:</span>
                <span className="info-value">
                  {order.deliveryInfo?.customerPhone || "N/A"}
                </span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Delivery Address:</span>
                <span className="info-value">
                  {order.deliveryInfo?.customerAddress || "N/A"}
                </span>
              </div>
              {order.deliveryInfo?.deliveryCost > 0 && (
                <div className="info-item">
                  <span className="info-label">Delivery Cost:</span>
                  <span className="info-value">
                    ${order.deliveryInfo.deliveryCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items Section */}
          <div className="info-section">
            <h4> Order Items</h4>
            <div className="order-items-container">
              {order.items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <div className="item-main">
                    <span className="item-name">{item.productName}</span>
                    {item.variant?.size && (
                      <span className="item-variant">
                        ({item.variant.size})
                      </span>
                    )}
                  </div>
                  <div className="item-details">
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Progress Section */}
          <div className="info-section">
            <h4> Delivery Progress</h4>
            <div className="progress-grid">
              <div className="progress-item">
                <span className="progress-label">Order Created:</span>
                <span className="progress-value">
                  {formatDateTime(
                    order.deliveryTimestamps?.createdAt || order.createdAt
                  )}
                </span>
              </div>
              <div className="progress-item">
                <span className="progress-label">Out for Delivery:</span>
                <span
                  className={`progress-value ${
                    isOutAtDisabled ? "completed" : "pending"
                  }`}
                >
                  {isOutAtDisabled
                    ? formatDateTime(order.deliveryTimestamps.outAt)
                    : "Not started"}
                </span>
              </div>
              <div className="progress-item">
                <span className="progress-label">Delivered:</span>
                <span
                  className={`progress-value ${
                    isCompleted ? "completed" : "pending"
                  }`}
                >
                  {isCompleted
                    ? formatDateTime(order.deliveryTimestamps.deliveredAt)
                    : "In progress"}
                </span>
              </div>

              {deliveryDuration && (
                <div className="progress-item full-width">
                  <span className="progress-label">Delivery Duration:</span>
                  <span className="progress-value completed">
                    {deliveryDuration} minutes
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Side by Side */}
          {!isCompleted && (
            <div className="action-buttons-section">
              <h4> Quick Actions</h4>
              <div className="buttons-row">
                <button
                  className={`action-btn out-btn ${
                    isOutAtDisabled ? "disabled" : ""
                  }`}
                  onClick={handleDeliveryOut}
                  disabled={isOutAtDisabled || updating}
                >
                  {updating && currentAction === "out"
                    ? "⏳ Updating..."
                    : isOutAtDisabled
                    ? "✅ Out for Delivery"
                    : "🚚 Mark Out for Delivery"}
                </button>

                <button
                  className={`action-btn delivered-btn ${
                    isDeliveredAtDisabled ? "disabled" : ""
                  }`}
                  onClick={handleDeliveryArrived}
                  disabled={isDeliveredAtDisabled || updating}
                >
                  {updating && currentAction === "delivered"
                    ? "⏳ Updating..."
                    : isCompleted
                    ? "✅ Delivered"
                    : isDeliveredAtDisabled
                    ? "⏳ Waiting..."
                    : "✅ Mark as Delivered"}
                </button>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {isCompleted && (
            <div className="completion-section">
              <div className="success-icon">✅</div>
              <h4>Delivery Completed Successfully!</h4>
              <div className="completion-details">
                <p>
                  <strong>Order:</strong> #{order.orderNumber}
                </p>
                <p>
                  <strong>Delivered at:</strong>{" "}
                  {formatDateTime(order.deliveryTimestamps.deliveredAt)}
                </p>
                {deliveryDuration && (
                  <p>
                    <strong>Delivery time:</strong> {deliveryDuration} minutes
                  </p>
                )}
                <p className="saved-notice">✅ Status saved to database</p>
              </div>
              <button className="close-action-btn" onClick={onClose}>
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;
