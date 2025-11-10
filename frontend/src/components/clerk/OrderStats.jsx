// frontend/src/components/clerk/OrderStats.jsx
import React from "react";
import "./OrderStats.css";

const OrderStats = ({ stats, orders, loading }) => {
  // Calculate total tips from orders
  const calculateTotalTips = () => {
    if (!orders || orders.length === 0) return 0;

    return orders.reduce((total, order) => total + (order.tip || 0), 0);
  };

  // Calculate top products from orders (always top 10 by quantity)
  const calculateTopProducts = () => {
    if (!orders || orders.length === 0) return [];

    const productMap = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = `${item.productName}-${item.subCategory}`;
        if (!productMap[key]) {
          productMap[key] = {
            name: item.productName,
            subCategory: item.subCategory,
            quantity: 0,
            revenue: 0,
          };
        }
        productMap[key].quantity += item.quantity;
        productMap[key].revenue += item.price * item.quantity;
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Always top 10 by quantity
  };

  // Calculate top categories from orders (always top 10 by quantity)
  const calculateTopCategories = () => {
    if (!orders || orders.length === 0) return [];

    const categoryMap = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.subCategory;
        if (!categoryMap[category]) {
          categoryMap[category] = {
            category: category,
            quantity: 0,
            revenue: 0,
          };
        }
        categoryMap[category].quantity += item.quantity;
        categoryMap[category].revenue += item.price * item.quantity;
      });
    });

    return Object.values(categoryMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Always top 10 by quantity
  };

  const topProducts = calculateTopProducts();
  const topCategories = calculateTopCategories();
  const totalTips = calculateTotalTips();

  if (loading) {
    return (
      <div className="order-stats loading">
        <div className="loading-spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (!stats || !orders || orders.length === 0) {
    return (
      <div className="order-stats">
        <h3>Statistics</h3>
        <div className="no-data">
          <p>No data available for the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-stats">
      <h3>Statistics</h3>

      {/* Summary Cards - Now 3 columns with Total Tips */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.totalOrders || 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            ${stats.totalRevenue?.toFixed(2) || "0.00"}
          </div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${totalTips.toFixed(2)}</div>
          <div className="stat-label">Total Tips</div>
        </div>
      </div>

      {/* Top Products - Always top 10 */}
      <div className="top-products">
        <h4>Most Purchased Products</h4>
        {topProducts.length === 0 ? (
          <p className="no-products">No products data available</p>
        ) : (
          <div className="products-list">
            {topProducts.map((product, index) => (
              <div key={index} className="product-item">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-category">{product.subCategory}</div>
                </div>
                <div className="product-stats">
                  <div className="product-quantity">
                    {product.quantity} sold
                  </div>
                  <div className="product-revenue">
                    ${product.revenue.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Breakdown - Always top 10 */}
      <div className="category-breakdown">
        <h4>Sales by Category</h4>
        <div className="categories-list">
          {topCategories.map((category, index) => (
            <div key={index} className="category-item">
              <div className="category-name">{category.category}</div>
              <div className="category-stats">
                <span>{category.quantity} items</span>
                <span>${category.revenue.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderStats;
