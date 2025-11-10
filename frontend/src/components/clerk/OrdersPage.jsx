/* eslint-disable no-case-declarations */
// frontend/src/components/clerk/OrdersPage.jsx
import React, { useState, useEffect } from "react";
import OrdersTable from "./OrdersTable";
import OrderStats from "./OrderStats";
import { getOrders } from "../../services/orderService";
import "./OrdersPage.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
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

  const loadOrders = async () => {
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

      // Load orders for the table
      const ordersRes = await getOrders(token, params);
      if (ordersRes.success) {
        setOrders(ordersRes.data || []);
      }

      // Calculate statistics from the loaded orders (FIXED)
      const calculatedStats = calculateStatsFromOrders(ordersRes.data || []);
      setStats(calculatedStats);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics directly from orders data
  const calculateStatsFromOrders = (orders) => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalTax: 0,
        totalSubtotal: 0,
        orders: [],
      };
    }

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalTax = orders.reduce((sum, order) => sum + order.tax, 0);
    const totalSubtotal = orders.reduce(
      (sum, order) => sum + order.subtotal,
      0
    );

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalTax,
      totalSubtotal,
      orders: orders,
    };
  };

  useEffect(() => {
    loadOrders();
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
    <div className="orders-page">
      {/* Date Filter Controls */}
      <div className="orders-header">
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
              max={new Date().toISOString().split("T")[0]} // Only past dates allowed
              className="custom-date-input"
            />
          </div>
        </div>

        <div className="orders-summary">
          <span className="orders-count">{orders.length} Orders</span>
          {stats && (
            <span className="revenue">
              Total: ${stats.totalRevenue?.toFixed(2) || "0.00"}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="orders-content">
        <div className="orders-table-section">
          <OrdersTable
            orders={orders}
            loading={loading}
            onRefresh={loadOrders}
          />
        </div>

        <div className="orders-stats-section">
          <OrderStats
            stats={stats}
            orders={orders} // Pass orders for statistics calculation
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
