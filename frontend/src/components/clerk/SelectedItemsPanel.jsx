import React from "react";
import "./SelectedItemsPanel.css";

const SelectedItemsPanel = ({
  selectedItems,
  onUpdateItem,
  onRemoveItem,
  paymentMethod,
  onPaymentMethodChange,
}) => {
  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    onUpdateItem(itemId, { quantity: newQuantity });
  };

  const getItemDisplayName = (item) => {
    if (item.variant) {
      return `${item.product.name} (${item.variant.size})`;
    }
    return item.product.name;
  };

  return (
    <div className="selected-items-panel">
      <div className="panel-header">
        <h3>Selected Items</h3>
        <span className="items-count">({selectedItems.length})</span>
      </div>

      {/* Payment Method Section */}
      {selectedItems.length > 0 && (
        <div className="payment-section">
          <h4>Payment Method</h4>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
              />
              <span>💵 Cash</span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                value="credit_card"
                checked={paymentMethod === "credit_card"}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
              />
              <span>💳 Credit Card</span>
            </label>
          </div>
        </div>
      )}

      <div className="items-list">
        {selectedItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <p>No items selected</p>
          </div>
        ) : (
          selectedItems.map((item) => (
            <div key={item.id} className="selected-item">
              <div className="item-info">
                <h4 className="item-name">{getItemDisplayName(item)}</h4>
                <p className="item-price">${item.price.toFixed(2)} each</p>
              </div>

              <div className="item-controls">
                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

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

      {selectedItems.length > 0 && (
        <div className="order-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (11%):</span>
            <span>${(calculateTotal() * 0.11).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${(calculateTotal() * 1.11).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedItemsPanel;
