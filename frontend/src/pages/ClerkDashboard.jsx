import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import CategorySection from "../components/clerk/CategorySection";
import ProductGrid from "../components/clerk/ProductGrid";
import SelectedItemsPanel from "../components/clerk/SelectedItemsPanel";
import InvoicePanel from "../components/clerk/InvoicePanel";
import ProductModal from "../components/clerk/ProductModal";
import {
  getMainCategories,
  getSubcategories,
} from "../services/categoryService";
import { getProductsByCategory } from "../services/productService";
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

  // State for selected items and modal
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // State for loading
  const [loading, setLoading] = useState(false);

  // Load main categories on component mount
  useEffect(() => {
    loadMainCategories();
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

  const handleMainCategorySelect = async (category) => {
    setSelectedMainCategory(category);
    setSelectedSubcategory(null);
    setProducts([]);

    try {
      const res = await getSubcategories(category._id, token);
      if (res.success) {
        setSubcategories(res.data);
      }
    } catch (error) {
      console.error("Error loading subcategories:", error);
    }
  };

  const handleSubcategorySelect = async (subcategory) => {
    setSelectedSubcategory(subcategory);
    setLoading(true);

    try {
      const res = await getProductsByCategory(subcategory._id, token);
      if (res.success) {
        setProducts(res.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
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

  const handleSaveOrder = async (orderData) => {
    try {
      const res = await createOrder(orderData, token);
      if (res.success) {
        console.log("✅ Order saved successfully:", res.data);
        alert("Order saved successfully!");
        // Clear selected items after successful save
        setSelectedItems([]);
      } else {
        alert("Failed to save order: " + res.message);
      }
    } catch (error) {
      console.error("❌ Error saving order:", error);
      alert("Error saving order: " + error.message);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  return (
    <div className="clerk-dashboard">
      {/* Left Section - Invoice */}
      <div className="dashboard-section invoice-section">
        <InvoicePanel
          selectedItems={selectedItems}
          paymentMethod={paymentMethod}
          onSaveOrder={handleSaveOrder}
        />
      </div>

      {/* Center Section - Product Selection */}
      <div className="dashboard-section main-section">
        <div className="categories-container">
          <CategorySection
            title="Main Categories"
            categories={mainCategories}
            selectedCategory={selectedMainCategory}
            onCategorySelect={handleMainCategorySelect}
            isMainCategory={true}
          />

          {selectedMainCategory && (
            <CategorySection
              title="Sub Categories"
              categories={subcategories}
              selectedCategory={selectedSubcategory}
              onCategorySelect={handleSubcategorySelect}
              isMainCategory={false}
            />
          )}
        </div>

        {selectedSubcategory && (
          <ProductGrid
            products={products}
            loading={loading}
            onProductSelect={handleProductSelect}
          />
        )}
      </div>

      {/* Right Section - Selected Items */}
      <div className="dashboard-section selected-items-section">
        <SelectedItemsPanel
          selectedItems={selectedItems}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={handlePaymentMethodChange}
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
    </div>
  );
};

export default ClerkDashboard;
