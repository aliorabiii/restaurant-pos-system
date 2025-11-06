import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { employeesAPI } from "../services/api";
import "./ReportsPage.css";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  FiDollarSign, // Money, revenue, payments
  FiTrendingUp, // Growth, increase, positive trend
  FiShoppingCart, // Orders, transactions
  FiCheckCircle, // Completed / success
  FiPieChart, // Distribution / ratio visual charts
  FiBarChart2, // Analytics / performance charts
  FiBox, // Inventory / items / products
  FiLayers, // Categories grouped
  FiCreditCard, // Payment methods / transactions
  FiClock, // Time / hours / scheduling
  FiCalendar, // Days / weeks / periodic charts
  FiUsers, // Employee or workforce data
} from "react-icons/fi";

const exportMultipleSheetsToExcel = (sheetsData, filename) => {
  const workbook = XLSX.utils.book_new();

  sheetsData.forEach((sheet) => {
    const { sheetName, data } = sheet;
    if (data && data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Auto-fit column widths
      const colWidths = Object.keys(data[0]).map((key) => ({
        wch:
          Math.max(
            key.length,
            ...data.map((row) => (row[key] ? row[key].toString().length : 0))
          ) + 2,
      }));
      worksheet["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
  });

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `${filename}.xlsx`);
};

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // State for all report data
  const [overviewStats, setOverviewStats] = useState(null);
  /* const [revenueOverTime, setRevenueOverTime] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]); */
  const [topProducts, setTopProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [salesByHour, setSalesByHour] = useState([]);
  const [salesByDay, setSalesByDay] = useState([]);
  const [employeeStats, setEmployeeStats] = useState(null);

  // NEW: Expense state
  const [expenseOverview, setExpenseOverview] = useState(null);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [expensesOverTime, setExpensesOverTime] = useState([]);
  const [topExpenseCategories, setTopExpenseCategories] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);

  useEffect(() => {
    loadAllReports();
  }, [dateRange, customStartDate, customEndDate]);

  const getDateRangeParams = () => {
    const today = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case "today":
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case "week":
        startDate = new Date(today.setDate(today.getDate() - 7));
        endDate = new Date();
        break;
      case "month":
        startDate = new Date(today.setDate(today.getDate() - 30));
        endDate = new Date();
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        }
        break;
      default:
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
    }

    return {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    };
  };

  const loadAllReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { startDate, endDate } = getDateRangeParams();

      if (!startDate || !endDate) return;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch all reports in parallel (INCLUDING NEW EXPENSE REPORTS)
      const [
        overviewRes,
        revenueRes,
        categoryRes,
        topProductsRes,
        paymentRes,
        hourlyRes,
        dailyRes,
        employeeRes,
        expenseOverviewRes,
        expensesCategoryRes,
        expensesTimeRes,
        topExpenseCategoriesRes,
        financialSummaryRes,
      ] = await Promise.all([
        fetch(
          `http://localhost:5000/api/reports/overview?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        ),
        fetch(
          `http://localhost:5000/api/reports/revenue-over-time?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        ),
        fetch(
          `http://localhost:5000/api/reports/sales-by-category?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        ),
        fetch(
          `http://localhost:5000/api/reports/top-products?startDate=${startDate}&endDate=${endDate}&limit=10`,
          { headers }
        ),
        fetch(
          `http://localhost:5000/api/reports/payment-methods?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        ),
        fetch(
          `http://localhost:5000/api/reports/sales-by-hour?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        ),
        fetch(
          `http://localhost:5000/api/reports/sales-by-day?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        ),
        employeesAPI.getStats(),
        // NEW EXPENSE FETCHES:
        fetch(
          `http://localhost:5000/api/reports/expense-overview?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        ),
        fetch(
          `http://localhost:5000/api/reports/expenses-by-category?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        ),
        fetch(
          `http://localhost:5000/api/reports/expenses-over-time?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        ),
        fetch(
          `http://localhost:5000/api/reports/top-expense-categories?startDate=${startDate}&endDate=${endDate}&limit=5`,
          { headers }
        ),
        fetch(
          `http://localhost:5000/api/reports/financial-summary?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        ),
      ]);

      const [
        overview,
        revenue,
        category,
        products,
        payment,
        hourly,
        daily,
        expenseOverviewData,
        expensesCategoryData,
        expensesTimeData,
        topExpenseCategoriesData,
        financialSummaryData,
      ] = await Promise.all([
        overviewRes.json(),
        revenueRes.json(),
        categoryRes.json(),
        topProductsRes.json(),
        paymentRes.json(),
        hourlyRes.json(),
        dailyRes.json(),
        expenseOverviewRes.json(),
        expensesCategoryRes.json(),
        expensesTimeRes.json(),
        topExpenseCategoriesRes.json(),
        financialSummaryRes.json(),
      ]);

      setOverviewStats(overview.data);
      setRevenueOverTime(revenue.data);
      setSalesByCategory(category.data);
      setTopProducts(products.data);
      setPaymentMethods(payment.data);
      setSalesByHour(hourly.data);
      setSalesByDay(daily.data);
      setEmployeeStats(employeeRes.data);

      // SET NEW EXPENSE DATA:
      setExpenseOverview(expenseOverviewData.data);
      setExpensesByCategory(expensesCategoryData.data);
      setExpensesOverTime(expensesTimeData.data);
      setTopExpenseCategories(topExpenseCategoriesData.data);
      setFinancialSummary(financialSummaryData.data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAllReports();
  };

  const handleExport = () => {
    const today = new Date().toISOString().split("T")[0];

    const sheetsData = [];

    // 1) Overview Summary
    if (overviewStats) {
      sheetsData.push({
        sheetName: "Overview",
        data: [
          { Metric: "Total Revenue", Value: overviewStats.totalRevenue },
          { Metric: "Subtotal", Value: overviewStats.totalSubtotal },
          { Metric: "Total Orders", Value: overviewStats.totalOrders },
          {
            Metric: "Average Order Value",
            Value: overviewStats.averageOrderValue,
          },
          { Metric: "Items Sold", Value: overviewStats.totalItemsSold },
          {
            Metric: "Total Expenses",
            Value: expenseOverview?.totalExpenses || 0,
          },
          {
            Metric: "Net Profit",
            Value: (
              overviewStats.totalRevenue -
              dailySalaryCost -
              totalExpenses
            ).toFixed(2),
          },
        ],
      });
    }

    // 2) Top Products
    sheetsData.push({
      sheetName: "Top Products",
      data: topProducts.map((p, index) => ({
        Rank: index + 1,
        Product: p.productName,
        Quantity: p.totalQuantity,
        Revenue: p.totalRevenue.toFixed(2),
        Orders: p.orders,
      })),
    });

    // 3) Top Expenses
    sheetsData.push({
      sheetName: "Top Expenses",
      data: topExpenseCategories.map((e, index) => ({
        Rank: index + 1,
        Category: e.category,
        Subcategory: e.subcategory,
        Amount: e.totalAmount.toFixed(2),
        Count: e.count,
      })),
    });

    // 4) Sales by Day
    sheetsData.push({
      sheetName: "Sales by Day",
      data: salesByDay.map((d) => ({
        Day: d.day,
        Revenue: d.revenue,
        Orders: d.orders,
      })),
    });

    // 5) Sales by Hour
    sheetsData.push({
      sheetName: "Sales by Hour",
      data: salesByHour.map((h) => ({
        Hour: h._id,
        Revenue: h.revenue,
        Orders: h.orders,
      })),
    });

    // Export final Excel
    exportMultipleSheetsToExcel(sheetsData, `report_${today}`);
  };

  // Chart colors
  const COLORS = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#4facfe",
    "#43e97b",
    "#fa709a",
  ];
  const EXPENSE_COLORS = [
    "#ef4444",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#06b6d4",
  ];

  // Calculate comprehensive financial data
  const dailySalaryCost = employeeStats?.salaryEstimates?.daily || 0;
  const totalExpenses = expenseOverview?.totalExpenses || 0;
  const grossRevenue = overviewStats?.totalRevenue || 0;
  const netProfit = grossRevenue - dailySalaryCost - totalExpenses;
  const profitMargin =
    grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(2) : 0;

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h2>📊 Reports & Analytics</h2>
          <p className="reports-subtitle">
            Complete financial and sales overview
          </p>
        </div>
        <div className="reports-actions">
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄 Refresh
          </button>
          <button className="export-btn" onClick={handleExport}>
            📥 Export
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="date-filter-section">
        <div className="date-filter-buttons">
          <button
            className={`filter-btn ${dateRange === "today" ? "active" : ""}`}
            onClick={() => setDateRange("today")}
          >
            Today
          </button>
          <button
            className={`filter-btn ${dateRange === "week" ? "active" : ""}`}
            onClick={() => setDateRange("week")}
          >
            Last 7 Days
          </button>
          <button
            className={`filter-btn ${dateRange === "month" ? "active" : ""}`}
            onClick={() => setDateRange("month")}
          >
            Last 30 Days
          </button>
          <button
            className={`filter-btn ${dateRange === "custom" ? "active" : ""}`}
            onClick={() => setDateRange("custom")}
          >
            Custom Range
          </button>
        </div>

        {dateRange === "custom" && (
          <div className="custom-date-inputs">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Overview Stats Cards */}
      <div className="overview-stats">
        <div className="stat-card revenue">
          <FiTrendingUp size={40} />
          <div className="stat-details">
            <h3>Total Revenue</h3>
            <p className="stat-value">${grossRevenue.toFixed(2)}</p>
            <span className="stat-label">
              Subtotal: ${overviewStats?.totalSubtotal?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        <div className="stat-card orders">
          <FiShoppingCart size={40} />
          <div className="stat-details">
            <h3>Total Orders</h3>
            <p className="stat-value">{overviewStats?.totalOrders || 0}</p>
            <span className="stat-label">Completed orders</span>
          </div>
        </div>

        <div className="stat-card average">
          <FiShoppingCart size={40} />
          <div className="stat-details">
            <h3>Average Order Value</h3>
            <p className="stat-value">
              ${overviewStats?.averageOrderValue?.toFixed(2) || "0.00"}
            </p>
            <span className="stat-label">Per transaction</span>
          </div>
        </div>

        <div className="stat-card items">
          <FiBox size={40} />
          <div className="stat-details">
            <h3>Items Sold</h3>
            <p className="stat-value">{overviewStats?.totalItemsSold || 0}</p>
            <span className="stat-label">Total quantity</span>
          </div>
        </div>

        {/* NEW EXPENSE STAT CARD */}
        <div className="stat-card expenses">
          <FiTrendingUp size={40} />
          <div className="stat-details">
            <h3>Total Expenses</h3>
            <p className="stat-value">${totalExpenses.toFixed(2)}</p>
            <span className="stat-label">
              {expenseOverview?.expenseCount || 0} expense entries
            </span>
          </div>
        </div>

        {/* NEW NET PROFIT CARD */}
        <div className={`stat-card ${netProfit >= 0 ? "profit" : "loss"}`}>
          <div className="stat-icon">{netProfit >= 0 ? "✅" : "❌"}</div>
          <div className="stat-details">
            <h3>Net Profit</h3>
            <p className="stat-value">${netProfit.toFixed(2)}</p>
            <span className="stat-label">Margin: {profitMargin}%</span>
          </div>
        </div>
      </div>

      <div className="financial-summary">
        <h3>
          <FiShoppingCart size={30} /> Comprehensive Financial Summary
        </h3>
        <div className="financial-grid">
          <div className="financial-item">
            <span className="label">Gross Revenue:</span>
            <span className="value revenue">${grossRevenue.toFixed(2)}</span>
          </div>
          <div className="financial-item">
            <span className="label">Tax Collected:</span>
            <span className="value">
              ${overviewStats?.totalTax?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="financial-item">
            <span className="label">Employee Salaries (Daily):</span>
            <span className="value expense">
              -${dailySalaryCost.toFixed(2)}
            </span>
          </div>
          <div className="financial-item">
            <span className="label">Business Expenses:</span>
            <span className="value expense">-${totalExpenses.toFixed(2)}</span>
          </div>
          <div className="financial-item">
            <span className="label"> • Total Expense Entries:</span>
            <span className="value">
              {expenseOverview?.expenseCount || 0} entries
            </span>
          </div>
          <div className="financial-item profit">
            <span className="label">Net Profit:</span>
            <span className={`value ${netProfit >= 0 ? "profit" : "loss"}`}>
              ${netProfit.toFixed(2)} ({profitMargin}%)
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* NEW:{/* NEW: Expenses by Category */}
        <div className="chart-card">
          <h3>💸 Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                dataKey="total"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry._id}: $${entry.total.toFixed(0)}`}
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="chart-card">
          <h3>💳 Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethods}
                dataKey="revenue"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry._id}: $${entry.revenue.toFixed(0)}`}
              >
                {paymentMethods.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours */}
        <div className="chart-card full-width">
          <h3>⏰ Sales by Hour (Peak Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="_id"
                label={{ value: "Hour", position: "insideBottom", offset: -5 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#667eea" name="Revenue ($)" />
              <Bar dataKey="orders" fill="#43e97b" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Day of Week */}
        <div className="chart-card full-width">
          <h3>📅 Sales by Day of Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#764ba2" name="Revenue ($)" />
              <Bar dataKey="orders" fill="#f093fb" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="top-products-section">
        <h3>🏆 Top Selling Products</h3>
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product Name</th>
                <th>Quantity Sold</th>
                <th>Revenue</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <tr key={product._id}>
                    <td className="rank">#{index + 1}</td>
                    <td className="product-name">{product.productName}</td>
                    <td>{product.totalQuantity}</td>
                    <td className="revenue">
                      ${product.totalRevenue.toFixed(2)}
                    </td>
                    <td>{product.orders}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No product data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW: Top Expense Categories Table */}
      <div className="top-products-section">
        <h3>💰 Top Expense Categories</h3>
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Total Amount</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {topExpenseCategories.length > 0 ? (
                topExpenseCategories.map((expense, index) => (
                  <tr key={index}>
                    <td className="rank">#{index + 1}</td>
                    <td className="product-name">{expense.category}</td>
                    <td>{expense.subcategory}</td>
                    <td className="revenue expense-amount">
                      ${expense.totalAmount.toFixed(2)}
                    </td>
                    <td>{expense.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No expense data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Costs Summary */}
      {employeeStats && (
        <div className="employee-costs-section">
          <h3>👷 Employee Salary Costs</h3>
          <div className="costs-grid">
            <div className="cost-item">
              <span className="label">Active Employees:</span>
              <span className="value">{employeeStats.activeEmployees}</span>
            </div>
            <div className="cost-item">
              <span className="label">Daily Cost:</span>
              <span className="value">
                ${employeeStats.salaryEstimates.daily.toFixed(2)}
              </span>
            </div>
            <div className="cost-item">
              <span className="label">Monthly Estimate:</span>
              <span className="value">
                ${employeeStats.salaryEstimates.monthly.toFixed(2)}
              </span>
            </div>
            <div className="cost-item">
              <span className="label">Yearly Estimate:</span>
              <span className="value">
                ${employeeStats.salaryEstimates.yearly.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
