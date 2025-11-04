// frontend/src/components/clerk/SelectedItemsPanel.jsx
import React, { useState } from "react";
import "./SelectedItemsPanel.css";

const SelectedItemsPanel = ({
  selectedItems,
  onUpdateItem,
  onRemoveItem,
  paymentMethod,
  onPaymentMethodChange,
  cashierName = "hassan",
  onCashierChange = () => {},
  onSaveOrder,
}) => {
  const [editingItem, setEditingItem] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);

  const cashiers = [
    { id: "hassan", name: "Hassan" },
    { id: "ali", name: "Ali" },
  ];

  const calculateSubtotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.11;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const getOrderNumber = () => {
    return `ORD-${Date.now().toString().slice(-6)}`;
  };

  const getItemDisplayName = (item) => {
    if (item.variant) {
      return `${item.product.name} (${item.variant.size})`;
    }
    return item.product.name;
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setTempQuantity(item.quantity);
  };

  const handleTempQuantityChange = (change) => {
    const newQuantity = tempQuantity + change;
    if (newQuantity >= 1) {
      setTempQuantity(newQuantity);
    }
  };

  const handleSaveChanges = () => {
    if (editingItem && tempQuantity !== editingItem.quantity) {
      onUpdateItem(editingItem.id, { quantity: tempQuantity });
    }
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setTempQuantity(1);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please add items to cart before checkout");
      return;
    }

    // Extract item names and subcategories
    const itemNames = selectedItems.map((item) => getItemDisplayName(item));
    const subCategories = [
      ...new Set(
        selectedItems.map(
          (item) => item.product.sub_category?.name || "Unknown"
        )
      ),
    ];

    const orderData = {
      orderNumber: getOrderNumber(),
      items: selectedItems.map((item) => ({
        productId: item.product._id,
        productName: getItemDisplayName(item),
        quantity: item.quantity,
        price: item.price,
        variant: item.variant,
        subCategory: item.product.sub_category?.name || "Unknown",
      })),
      itemNames: itemNames, // Add itemNames array
      subCategories: subCategories, // Add subCategories array
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      paymentMethod: paymentMethod, // Use the actual selected method
      cashier: cashierName,
      createdAt: new Date(),
      status: "completed",
    };

    console.log("Order data being sent:", orderData);
    onSaveOrder(orderData);
  };

  return (
    <div className="selected-items-panel">
      <div className="panel-header">
        <h2>Cart</h2>
        <span className="items-count">{selectedItems.length}</span>
      </div>

      <div className="cart-list">
        {selectedItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <p>No items yet</p>
          </div>
        ) : (
          selectedItems.map((item) => (
            <div key={item.id} className="cart-row">
              <div className="cart-info">
                <div className="cart-name">{getItemDisplayName(item)}</div>
                <div className="item-details">
                  <span className="item-price">
                    ${item.price.toFixed(2)} each
                  </span>
                  <span className="item-quantity">Qty: {item.quantity}</span>
                  <span className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="cart-controls">
                <button
                  onClick={() => handleEditItem(item)}
                  className="edit-btn"
                  title="Edit item"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="remove-btn"
                  title="Remove item"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Always show payment, cashier and totals section when there are items */}
      {selectedItems.length > 0 && (
        <div className="cart-footer">
          <div className="pos__totals">
            <div>
              <span>Subtotal</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div>
              <span>Tax (11%)</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="payment-section">
            <label className="form-label">Payment Method:</label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="form-select"
            >
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="mobile">Mobile Pay</option>
            </select>
          </div>

          <div className="cashier-section">
            <label className="form-label">Cashier:</label>
            <select
              value={cashierName}
              onChange={(e) => onCashierChange(e.target.value)}
              className="form-select"
            >
              {cashiers.map((cashier) => (
                <option key={cashier.id} value={cashier.id}>
                  {cashier.name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleCheckout} className="checkout">
            Complete Sale
          </button>
        </div>
      )}

      {/* Edit Quantity Modal */}
      {editingItem && (
        <div className="edit-modal-overlay" onClick={handleCancelEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Edit {getItemDisplayName(editingItem)}</h3>
              <button className="close-btn" onClick={handleCancelEdit}>
                ×
              </button>
            </div>
            <div className="edit-modal-content">
              <div className="quantity-controls">
                <label>Quantity:</label>
                <div className="quantity-input-group">
                  <button
                    onClick={() => handleTempQuantityChange(-1)}
                    disabled={tempQuantity <= 1}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{tempQuantity}</span>
                  <button
                    onClick={() => handleTempQuantityChange(1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="price-summary">
                <div className="price-row">
                  <span>Price each:</span>
                  <span>${editingItem.price.toFixed(2)}</span>
                </div>
                <div className="price-row total">
                  <span>Total:</span>
                  <span>${(editingItem.price * tempQuantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="edit-modal-actions">
              <button onClick={handleCancelEdit} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleSaveChanges} className="save-btn">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedItemsPanel;
