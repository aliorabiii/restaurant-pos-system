// frontend/src/pages/ClerkDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CategoryDropdown from "../components/clerk/CategoryDropdown";
import ProductGrid from "../components/clerk/ProductGrid";
import SelectedItemsPanel from "../components/clerk/SelectedItemsPanel";
import ProductModal from "../components/clerk/ProductModal";
import OrdersPage from "../components/clerk/OrdersPage";
import DeliveryPage from "../components/clerk/DeliveryPage"; // ADD THIS IMPORT
import TableBar from "../components/clerk/TableBar";
import {
  getMainCategories,
  getSubcategories,
} from "../services/categoryService";
import {
  fetchAllProducts,
  getProductsByCategory,
} from "../services/productService";
import { createOrder } from "../services/orderService";
import { tableService } from "../services/tableService";
import { tableOrderService } from "../services/tableOrderService";
import "./ClerkDashboard.css";

const ClerkDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Add active tab state - UPDATED TO INCLUDE DELIVERY
  const [activeTab, setActiveTab] = useState("cashier");

  // State for tables
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);

  // State for categories and products
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");

  // State for selected items and modal
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashierName, setCashierName] = useState("hassan");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [lastOrderData, setLastOrderData] = useState(null);

  // State for loading
  const [loading, setLoading] = useState(false);

  // Add Clerk Header State
  const [clerkHeader, setClerkHeader] = useState({
    title: "Clerk Dashboard",
    cashier: "Hassan",
    date: new Date().toLocaleDateString(),
  });

  // Add logout handler for standalone mode - MAKE SURE THIS IS DEFINED
  const handleLogout = async () => {
    try {
      if (logout) await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Load tables on component mount
  useEffect(() => {
    loadTables();
    loadMainCategories();
    loadAllProducts();

    // Update date every minute
    const interval = setInterval(() => {
      setClerkHeader((prev) => ({
        ...prev,
        date: new Date().toLocaleDateString(),
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Load tables - ALL START AS EMPTY (RED)
  const loadTables = async () => {
    setTableLoading(true);
    try {
      const res = await tableService.getAllTables();
      if (res.success) {
        // Check localStorage for existing table orders to set correct status
        const tableOrders = tableOrderService.getAllTableOrders();
        const tablesWithStatus = res.data.map((table) => {
          const hasActiveOrder =
            tableOrders[table._id] &&
            tableOrders[table._id].status === "active" &&
            tableOrders[table._id].items &&
            tableOrders[table._id].items.length > 0;
          return {
            ...table,
            status: hasActiveOrder ? "occupied" : "empty", // Only occupied if has items
          };
        });

        setTables(tablesWithStatus);
        console.log(
          `✅ Loaded ${tablesWithStatus.length} tables - All start as empty (red)`
        );
      }
    } catch (error) {
      console.error("Error loading tables:", error);
    } finally {
      setTableLoading(false);
    }
  };

  // Handle table selection - UPDATE STATUS BASED ON ITEMS
  const handleTableSelect = async (table) => {
    setTableLoading(true);

    try {
      // Always load the current order for the table
      const orderRes = await tableOrderService.getActiveTableOrder(table._id);

      if (
        orderRes.success &&
        orderRes.data &&
        orderRes.data.items &&
        orderRes.data.items.length > 0
      ) {
        // Convert stored items to frontend format
        const orderItems = orderRes.data.items.map((item) => ({
          id: item.id || `${item.productId}-${Date.now()}`,
          product: {
            _id: item.productId,
            name: item.productName,
            base_price: item.price,
            sub_category: item.subCategory ? { name: item.subCategory } : null,
          },
          quantity: item.quantity,
          variant: item.variant || null,
          price: item.price,
          addedAt: new Date(item.addedAt || Date.now()),
        }));

        setSelectedItems(orderItems);
        setSelectedTable(table);
        console.log(
          `✅ Loaded ${orderItems.length} items for table ${table.number}`
        );

        // Ensure table status is occupied if it has items
        if (table.status !== "occupied") {
          updateTableStatus(table, "occupied");
        }
      } else {
        // No existing order or empty order, start fresh
        setSelectedTable(table);
        setSelectedItems([]);

        console.log(`🆕 Starting fresh order for table ${table.number}`);
      }
    } catch (error) {
      console.error("Error handling table selection:", error);
      // Fallback: just select the table with empty items
      setSelectedTable(table);
      setSelectedItems([]);
    } finally {
      setTableLoading(false);
    }
  };

  // Auto-save when items change - but don't interfere with immediate updates
  useEffect(() => {
    if (selectedTable && selectedTable._id && selectedItems.length > 0) {
      // Use a small delay to ensure state is updated
      const saveTimer = setTimeout(() => {
        saveTableOrderToBackend();
      }, 500);

      return () => clearTimeout(saveTimer);
    }
  }, [selectedItems, selectedTable]);

  // Update table status - SIMPLIFIED
  const updateTableStatus = (table, status) => {
    const updatedTable = { ...table, status };
    setTables((prev) =>
      prev.map((t) => (t._id === table._id ? updatedTable : t))
    );

    if (selectedTable?._id === table._id) {
      setSelectedTable(updatedTable);
    }

    console.log(`🔄 Table ${table.number} status updated to: ${status}`);
  };

  // New order handler (for takeaway - no table)
  const handleNewOrder = () => {
    setSelectedTable(null);
    setSelectedItems([]);
  };

  // SAVE TABLE ORDER WHEN ITEMS CHANGE (AUTO-SAVE)
  useEffect(() => {
    if (selectedTable && selectedTable.status === "occupied") {
      saveTableOrderToBackend();
    }
  }, [selectedItems, selectedTable]);

  // Auto-save function - UPDATE STATUS WHEN ITEMS ARE ADDED
  const saveTableOrderToBackend = async () => {
    if (!selectedTable || !selectedTable._id) return;

    try {
      const orderData = {
        items: selectedItems.map((item) => ({
          id: item.id,
          productId: item.product._id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          variant: item.variant,
          subCategory: item.product.sub_category?.name || "Unknown",
          addedAt: new Date().toISOString(),
        })),
        cashier: cashierName,
        paymentMethod: paymentMethod,
        tableNumber: selectedTable.number,
        status: "active",
      };

      await tableOrderService.saveTableOrder(selectedTable._id, orderData);
      console.log(
        `✅ Auto-saved ${selectedItems.length} items for table ${selectedTable.number}`
      );

      // UPDATE TABLE STATUS BASED ON ITEM COUNT
      if (selectedItems.length > 0 && selectedTable.status !== "occupied") {
        updateTableStatus(selectedTable, "occupied");
      } else if (
        selectedItems.length === 0 &&
        selectedTable.status !== "empty"
      ) {
        updateTableStatus(selectedTable, "empty");
      }
    } catch (error) {
      console.error("Error auto-saving table order:", error);
    }
  };

  const loadMainCategories = async () => {
    try {
      const res = await getMainCategories(token);
      if (res.success) {
        setMainCategories(res.data);
      }
    } catch (error) {
      console.error("Error loading main categories:", error);
    }
  };

  const loadAllProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchAllProducts(token);
      if (res.success) {
        setProducts(res.data || []);
        console.log(`✅ Loaded ${res.data?.length || 0} products for POS`);
      } else {
        console.error("Failed to load products:", res.message);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading all products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMainCategorySelect = async (category) => {
    setSelectedMainCategory(category);
    setSelectedSubcategory(null);
    setSubcategories([]);
    setLoading(true);

    if (!category) {
      loadAllProducts();
      return;
    }

    try {
      const subRes = await getSubcategories(category._id, token);
      if (subRes.success) {
        setSubcategories(subRes.data || []);
      }

      const allProductsRes = await fetchAllProducts(token);
      if (allProductsRes.success) {
        const allProducts = allProductsRes.data || [];
        const filteredProducts = allProducts.filter(
          (product) => product.main_category?._id === category._id
        );
        setProducts(filteredProducts);
        console.log(
          `✅ Filtered to ${filteredProducts.length} products for category: ${category.name}`
        );
      }
    } catch (error) {
      console.error("Error loading category data:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategorySelect = async (subcategory) => {
    setSelectedSubcategory(subcategory);
    setLoading(true);

    try {
      const res = await getProductsByCategory(subcategory._id, token);
      if (res.success) {
        setProducts(res.data || []);
        console.log(
          `✅ Loaded ${res.data?.length || 0} products for subcategory: ${
            subcategory.name
          }`
        );
      } else {
        console.error("Failed to load products by subcategory:", res.message);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Handle add to order - UPDATE STATUS WHEN FIRST ITEM IS ADDED
  const handleAddToOrder = (product, quantity, selectedVariant = null) => {
    console.log("🔄 Adding to order:", product.name, quantity, selectedVariant);

    const newItem = {
      id: `${product._id}-${
        selectedVariant ? selectedVariant.size : "default"
      }-${Date.now()}`,
      product: product,
      quantity: quantity,
      variant: selectedVariant,
      price: selectedVariant ? selectedVariant.price : product.base_price,
      addedAt: new Date(),
    };

    // Update state immediately
    setSelectedItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) =>
          item.product._id === product._id &&
          ((!item.variant && !selectedVariant) ||
            (item.variant &&
              selectedVariant &&
              item.variant.size === selectedVariant.size))
      );

      if (existingItemIndex > -1) {
        const updated = [...prev];
        updated[existingItemIndex].quantity += quantity;
        console.log(
          "✅ Updated existing item quantity:",
          updated[existingItemIndex]
        );
        return updated;
      } else {
        console.log("✅ Added new item:", newItem);
        return [...prev, newItem];
      }
    });

    setShowProductModal(false);
    setSelectedProduct(null);

    // Update table status if needed
    if (selectedTable && selectedTable.status === "empty") {
      updateTableStatus(selectedTable, "occupied");
    }
  };

  const handleUpdateItem = (itemId, updates) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleCashierChange = (cashier) => {
    setCashierName(cashier);
    setClerkHeader((prev) => ({
      ...prev,
      cashier: getCashierDisplayName(cashier),
    }));
  };

  // Complete order - RESET TO EMPTY (RED)
  const handleSaveOrder = async (orderData) => {
    try {
      if (selectedTable) {
        // TABLE ORDER - Save to database AND clear table
        console.log("Saving TABLE order to database:", orderData);

        // Add table information to the order data
        const tableOrderData = {
          ...orderData,
          tableId: selectedTable._id,
          tableNumber: selectedTable.number,
          orderType: "inside",
        };

        // Save to your database using your existing createOrder service
        const res = await createOrder(tableOrderData, token);
        console.log("Save TABLE order response:", res);

        if (res.success) {
          console.log(
            "✅ Table order saved to database successfully:",
            res.data
          );

          // Clear the table order from localStorage
          await tableOrderService.completeTableOrder(selectedTable._id);

          setLastOrderData(tableOrderData);
          setShowInvoiceModal(true);

          // UPDATE TABLE STATUS TO EMPTY (RED)
          updateTableStatus(selectedTable, "empty");
          setSelectedItems([]);
          setSelectedTable(null);
        } else {
          console.error("Failed to save table order to database:", res.message);
          alert("Failed to save order: " + res.message);
        }
      } else {
        // TAKEAWAY ORDER - Use existing logic
        console.log("Saving takeaway order:", orderData);
        const res = await createOrder(orderData, token);
        console.log("Save order response:", res);

        if (res.success) {
          console.log("✅ Takeaway order saved successfully:", res.data);
          setLastOrderData(orderData);
          setShowInvoiceModal(true);
          setSelectedItems([]);
        } else {
          console.error("Failed to save order:", res.message);
          alert("Failed to save order: " + res.message);
        }
      }
    } catch (error) {
      console.error("❌ Error saving order:", error);
      alert("Error saving order: " + error.message);
    }
  };

  const printReceipt = () => {
    const content = document.getElementById("thermal-receipt").innerHTML;
    const win = window.open("", "PRINT", "width=300,height=600");
    win.document.write("<html><head><title>Receipt</title></head><body>");
    win.document.write(content);
    win.document.write("</body></html>");
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setLastOrderData(null);
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  const getCashierDisplayName = (cashierId) => {
    const cashiers = {
      hassan: "Hassan",
      ali: "Ali",
    };
    return cashiers[cashierId] || cashierId;
  };

  const getPaymentMethodDisplay = (method) => {
    const paymentDisplay = {
      cash: "Cash",
      credit_card: "Credit Card",
      mobile: "Mobile Pay",
    };
    return paymentDisplay[method] || method;
  };

  return (
    <div className="clerk-dashboard-fullscreen">
      {/* Clerk Header */}
      <header className="clerk-header">
        <div className="clerk-header-left">
          <h1 className="clerk-title">POS System</h1>
          <span className="clerk-subtitle">Clerk Dashboard</span>
        </div>

        {/* UPDATED: Navigation Tabs with Delivery */}
        <div className="clerk-nav-tabs">
          <button
            className={`nav-tab ${activeTab === "cashier" ? "active" : ""}`}
            onClick={() => setActiveTab("cashier")}
          >
            Cashier
          </button>
          <button
            className={`nav-tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`nav-tab ${activeTab === "delivery" ? "active" : ""}`}
            onClick={() => setActiveTab("delivery")}
          >
            Delivery
          </button>
        </div>

        <div className="clerk-header-right">
          <div className="cashier-info">
            <span className="cashier-label">Cashier:</span>
            <span className="cashier-name">{clerkHeader.cashier}</span>
          </div>
          <div className="products-count">
            {activeTab === "cashier"
              ? selectedTable
                ? `Table ${selectedTable.number} - ${selectedItems.length} items`
                : `${products.length} Products Available`
              : activeTab === "orders"
              ? "Order History"
              : "Delivery Management"}
          </div>
          <button className="clerk-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      {activeTab === "cashier" ? (
        <>
          {/* TABLE BAR - ONLY IN CASHIER TAB */}
          <TableBar
            tables={tables}
            selectedTable={selectedTable}
            onTableSelect={handleTableSelect}
            onNewOrder={handleNewOrder}
            loading={tableLoading}
          />

          <div className="pos">
            {/* Products Section */}
            <div className="pos__products">
              <div className="pos__header">
                <div className="pos__filters">
                  <div className="filter-group main-category-filter">
                    <CategoryDropdown
                      title="Main Category"
                      categories={mainCategories}
                      selectedCategory={selectedMainCategory}
                      onCategorySelect={handleMainCategorySelect}
                      placeholder="All Products"
                    />
                  </div>

                  <div className="filter-group sub-category-filter">
                    <CategoryDropdown
                      title="Sub Category"
                      categories={subcategories}
                      selectedCategory={selectedSubcategory}
                      onCategorySelect={handleSubcategorySelect}
                      placeholder="Select Sub Category"
                      disabled={!selectedMainCategory}
                    />
                  </div>
                </div>
              </div>

              <div className="pos__search">
                <input
                  type="text"
                  placeholder={`Search ${products.length} products…`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="form-control"
                />
              </div>

              <ProductGrid
                products={filteredProducts}
                loading={loading}
                onProductSelect={handleProductSelect}
              />
            </div>

            {/* Cart Section */}
            <div className="pos__cart">
              <SelectedItemsPanel
                selectedItems={selectedItems}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={handlePaymentMethodChange}
                onSaveOrder={handleSaveOrder}
                selectedTable={selectedTable}
              />
            </div>

            {/* Modals */}
            {showProductModal && selectedProduct && (
              <ProductModal
                product={selectedProduct}
                onClose={() => {
                  setShowProductModal(false);
                  setSelectedProduct(null);
                }}
                onAddToOrder={handleAddToOrder}
              />
            )}

            {showInvoiceModal && lastOrderData && (
              <div
                className="invoice-modal-overlay"
                onClick={closeInvoiceModal}
              >
                <div
                  className="invoice-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="invoice-modal-header">
                    <h3>Order Invoice</h3>
                    <button className="close-btn" onClick={closeInvoiceModal}>
                      ×
                    </button>
                  </div>

                  <div className="invoice-modal-content">
                    <div id="thermal-receipt">
                      <div className="receipt-content">
                        <div className="receipt-header">
                          <h4>My Restaurant</h4>
                          <p>123 Main Street, City</p>
                          <p>Phone: (555) 123-4567</p>
                        </div>
                        <hr />
                        <div className="receipt-info">
                          <div>
                            <strong>Order:</strong> {lastOrderData.orderNumber}
                          </div>
                          {lastOrderData.tableNumber && (
                            <div>
                              <strong>Table:</strong>{" "}
                              {lastOrderData.tableNumber}
                            </div>
                          )}
                          <div>
                            <strong>Cashier:</strong>{" "}
                            {getCashierDisplayName(lastOrderData.cashier)}
                          </div>
                          <div>
                            <strong>Payment:</strong>{" "}
                            {getPaymentMethodDisplay(
                              lastOrderData.paymentMethod
                            )}
                          </div>
                          <div>
                            <strong>Date:</strong>{" "}
                            {new Date(lastOrderData.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <hr />
                        <div className="receipt-items">
                          {lastOrderData.items.map((item, idx) => (
                            <div key={idx} className="receipt-item">
                              <div className="item-name">
                                {item.productName}
                              </div>
                              <div className="item-details">
                                <span className="item-quantity">
                                  x{item.quantity}
                                </span>
                                <span className="item-price">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <hr />
                        <div className="receipt-totals">
                          <div className="total-row">
                            <span>Subtotal:</span>
                            <span>${lastOrderData.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="total-row">
                            <span>Tax (11%):</span>
                            <span>${lastOrderData.tax.toFixed(2)}</span>
                          </div>
                          {/* ADDED: Delivery Cost in Invoice */}
                          {lastOrderData.deliveryInfo?.deliveryCost > 0 && (
                            <div className="total-row">
                              <span>Delivery:</span>
                              <span>
                                +$
                                {lastOrderData.deliveryInfo.deliveryCost.toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          )}
                          <div className="total-row grand-total">
                            <span>Total:</span>
                            <span>${lastOrderData.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="receipt-footer">
                          <p>Thank you for your business!</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="invoice-modal-actions">
                    <button className="print-btn" onClick={printReceipt}>
                      🖨️ Print Invoice
                    </button>
                    <button
                      className="close-invoice-btn"
                      onClick={closeInvoiceModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : activeTab === "orders" ? (
        <OrdersPage />
      ) : (
        <DeliveryPage />
      )}
    </div>
  );
};

export default ClerkDashboard;
