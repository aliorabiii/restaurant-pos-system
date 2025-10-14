import { useState, useEffect } from 'react';
import { productAPI, orderAPI } from '../services/api';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import CustomizationPanel from '../components/CustomizationPanel';
import Cart from '../components/Cart';
import PaymentModal from '../components/PaymentModal';
import Receipt from '../components/Receipt';
import { useCart } from '../context/CartContext';
import './CashierDashboard.css';

const CashierDashboard = () => {
  const [categories] = useState(['Sandwich', 'Pizza', 'Drinks', 'Sides', 'Desserts']);
  const [selectedCategory, setSelectedCategory] = useState('Sandwich');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(false);

  const { addToCart, cartItems, clearCart, calculateSubtotal, calculateTax, calculateTotal, discount } = useCart();

  // Load products when category changes
  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getByCategory(selectedCategory);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  const handleCheckout = (method) => {
    setPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (paymentDetails) => {
    try {
      setLoading(true);

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations || [],
          subtotal: item.subtotal
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        discount: discount,
        total: calculateTotal(),
        paymentMethod: paymentDetails.paymentMethod,
        paymentStatus: 'completed',
        cashier: 'Ali', // You can make this dynamic later with auth
        tableNumber: 'Takeaway',
        cashReceived: paymentDetails.cashReceived,
        change: paymentDetails.change
      };

      // Create order
      const response = await orderAPI.create(orderData);
      
      setCurrentOrder(response.data);
      setShowPaymentModal(false);
      setShowReceipt(true);
      clearCart();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCurrentOrder(null);
  };

  return (
    <div className="cashier-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🍔 Restaurant POS</h1>
          <p className="header-subtitle">Cashier Dashboard</p>
        </div>
        <div className="header-right">
          <div className="cashier-info">
            <span className="cashier-name">👤 Cashier: Ali</span>
            <span className="current-time">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Panel - Cart */}
        <div className="left-panel">
          <Cart onCheckout={handleCheckout} />
        </div>

        {/* Center Panel - Products */}
        <div className="center-panel">
          {/* Categories */}
          <div className="categories-section">
            <h3>Categories</h3>
            <div className="categories-grid">
              {categories.map((category) => (
                <CategoryCard
                  key={category}
                  category={category}
                  isActive={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="products-section">
            <div className="section-header">
              <h3>{selectedCategory}</h3>
              <span className="product-count">{products.length} items</span>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <p>Loading products...</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Info */}
        <div className="right-panel">
          <div className="info-card">
            <h3>📊 Today's Summary</h3>
            <div className="summary-item">
              <span>Orders:</span>
              <span className="summary-value">-</span>
            </div>
            <div className="summary-item">
              <span>Revenue:</span>
              <span className="summary-value">$0.00</span>
            </div>
            <div className="summary-item">
              <span>Items Sold:</span>
              <span className="summary-value">0</span>
            </div>
          </div>

          <div className="info-card">
            <h3>🎯 Quick Actions</h3>
            <button className="action-btn">View Orders</button>
            <button className="action-btn">Reports</button>
            <button className="action-btn">Settings</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <CustomizationPanel
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          total={calculateTotal()}
          paymentMethod={paymentMethod}
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}

      {showReceipt && currentOrder && (
        <Receipt
          order={currentOrder}
          onClose={handleCloseReceipt}
          onPrint={handlePrintReceipt}
        />
      )}
    </div>
  );
};

export default CashierDashboard;