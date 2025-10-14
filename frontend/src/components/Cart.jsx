import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = ({ onCheckout }) => {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    discount,
    setDiscount,
    calculateSubtotal,
    calculateTax,
    calculateTotal
  } = useCart();

  const handleDiscountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setDiscount(Math.max(0, value));
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Order Cart</h2>
        {cartItems.length > 0 && (
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear All
          </button>
        )}
      </div>

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>🛒</p>
            <p>Cart is empty</p>
            <p className="empty-subtitle">Add items to get started</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-header">
                <div className="item-name">
                  <span className="item-quantity">{item.quantity}x</span>
                  {item.name}
                </div>
                <button
                  className="remove-item-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  ✕
                </button>
              </div>

              {item.customizations && item.customizations.length > 0 && (
                <div className="item-customizations">
                  {item.customizations.map((custom, idx) => (
                    <div key={idx} className="customization-item">
                      - {custom.name}
                      {custom.price > 0 && (
                        <span className="custom-price">
                          +${custom.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {item.specialInstructions && (
                <div className="special-note">
                  Note: {item.specialInstructions}
                </div>
              )}

              <div className="item-price">${item.subtotal.toFixed(2)}</div>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <>
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="summary-row discount-row">
              <span>Discount:</span>
              <input
                type="number"
                value={discount}
                onChange={handleDiscountChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="discount-input"
              />
            </div>
            <div className="summary-row total-row">
              <span>TOTAL:</span>
              <span className="total-amount">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>

          <div className="cart-actions">
            <button className="checkout-btn cash" onClick={() => onCheckout('cash')}>
              💵 Pay with Cash
            </button>
            <button className="checkout-btn card" onClick={() => onCheckout('card')}>
              💳 Pay with Card
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;