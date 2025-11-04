// frontend/src/pages/ClerkDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import CategoryDropdown from "../components/clerk/CategoryDropdown";
import ProductGrid from "../components/clerk/ProductGrid";
import SelectedItemsPanel from "../components/clerk/SelectedItemsPanel";
import ProductModal from "../components/clerk/ProductModal";
import {
  getMainCategories,
  getSubcategories,
} from "../services/categoryService";
import {
  fetchAllProducts, // Use the new function
  getProductsByCategory,
} from "../services/productService";
import { createOrder } from "../services/orderService";
import "./ClerkDashboard.css";

const ClerkDashboard = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

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

  // Load main categories and all products on component mount
  useEffect(() => {
    loadMainCategories();
    loadAllProducts();
  }, []);

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
      const res = await fetchAllProducts(token); // Use the new function
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
      // If no category selected, show all products
      loadAllProducts();
      return;
    }

    try {
      // Load subcategories for the selected main category
      const subRes = await getSubcategories(category._id, token);
      if (subRes.success) {
        setSubcategories(subRes.data || []);
      }

      // Load all products first, then filter by main category
      const allProductsRes = await fetchAllProducts(token); // Use the new function
      if (allProductsRes.success) {
        const allProducts = allProductsRes.data || [];
        // Filter products by main category
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

  const handleAddToOrder = (product, quantity, selectedVariant = null) => {
    const newItem = {
      id: `${product._id}-${
        selectedVariant ? selectedVariant.size : "default"
      }`,
      product: product,
      quantity: quantity,
      variant: selectedVariant,
      price: selectedVariant ? selectedVariant.price : product.base_price,
      addedAt: new Date(),
    };

    setSelectedItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => item.id === newItem.id
      );
      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updated = [...prev];
        updated[existingItemIndex].quantity += quantity;
        return updated;
      } else {
        // Add new item
        return [...prev, newItem];
      }
    });

    setShowProductModal(false);
    setSelectedProduct(null);
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
  };

  const handleSaveOrder = async (orderData) => {
    try {
      console.log("Saving order:", orderData);
      const res = await createOrder(orderData, token);
      console.log("Save order response:", res);
      if (res.success) {
        console.log("✅ Order saved successfully:", res.data);
        setLastOrderData(orderData);
        setShowInvoiceModal(true);
        setSelectedItems([]);
      } else {
        console.error("Failed to save order:", res.message);
        alert("Failed to save order: " + res.message);
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
    <div className="pos">
      {/* Products Section - 75% */}
      <div className="pos__products">
        <div className="pos__header">
          <h2>Products ({products.length})</h2>
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

      {/* Cart Section - 25% */}
      <div className="pos__cart">
        <SelectedItemsPanel
          selectedItems={selectedItems}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={handlePaymentMethodChange}
          cashierName={cashierName}
          onCashierChange={handleCashierChange}
          onSaveOrder={handleSaveOrder}
        />
      </div>

      {/* Product Modal */}
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

      {/* Invoice Modal */}
      {showInvoiceModal && lastOrderData && (
        <div className="invoice-modal-overlay" onClick={closeInvoiceModal}>
          <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
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
                    <h4>My Shop</h4>
                    <p>123 Main Street, City</p>
                    <p>Phone: (555) 123-4567</p>
                  </div>
                  <hr />
                  <div className="receipt-info">
                    <div>
                      <strong>Order:</strong> {lastOrderData.orderNumber}
                    </div>
                    <div>
                      <strong>Cashier:</strong>{" "}
                      {getCashierDisplayName(lastOrderData.cashier)}
                    </div>
                    <div>
                      <strong>Payment:</strong>{" "}
                      {getPaymentMethodDisplay(lastOrderData.paymentMethod)}
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
                        <div className="item-name">{item.productName}</div>
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
              <button className="close-invoice-btn" onClick={closeInvoiceModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClerkDashboard;
