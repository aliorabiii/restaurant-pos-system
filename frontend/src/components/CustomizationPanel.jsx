import { useState } from 'react';
import './CustomizationPanel.css';

const CustomizationPanel = ({ product, onAddToCart, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleCustomizationChange = (customizationName, option) => {
    setSelectedCustomizations(prev => {
      const exists = prev.find(
        c => c.customizationName === customizationName && c.name === option.name
      );

      if (exists) {
        return prev.filter(
          c => !(c.customizationName === customizationName && c.name === option.name)
        );
      } else {
        return [...prev, {
          customizationName,
          name: option.name,
          price: option.price
        }];
      }
    });
  };

  const calculateItemPrice = () => {
    const customizationTotal = selectedCustomizations.reduce(
      (sum, custom) => sum + custom.price,
      0
    );
    return (product.price + customizationTotal) * quantity;
  };

  const handleAddToCart = () => {
    const cartItem = {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      customizations: selectedCustomizations,
      specialInstructions,
      subtotal: calculateItemPrice()
    };
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="customization-overlay" onClick={onClose}>
      <div className="customization-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="panel-header">
          <h2>{product.name}</h2>
          <p className="base-price">${product.price.toFixed(2)}</p>
        </div>

        {product.customizations && product.customizations.length > 0 && (
          <div className="customization-section">
            <h3>Customize Your Order</h3>
            {product.customizations.map((customization, idx) => (
              <div key={idx} className="customization-group">
                <h4>{customization.name}</h4>
                {customization.options.map((option, optIdx) => (
                  <label key={optIdx} className="customization-option">
                    <input
                      type="checkbox"
                      checked={selectedCustomizations.some(
                        c => c.customizationName === customization.name && c.name === option.name
                      )}
                      onChange={() => handleCustomizationChange(customization.name, option)}
                    />
                    <span className="option-name">{option.name}</span>
                    {option.price > 0 && (
                      <span className="option-price">+${option.price.toFixed(2)}</span>
                    )}
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="quantity-section">
          <h3>Quantity</h3>
          <div className="quantity-controls">
            <button
              className="qty-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              −
            </button>
            <span className="quantity-value">{quantity}</span>
            <button
              className="qty-btn"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="special-instructions">
          <h3>Special Instructions</h3>
          <textarea
            placeholder="Add any special requests..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows="3"
          />
        </div>

        <div className="panel-footer">
          <div className="total-price">
            <span>Total:</span>
            <span className="price">${calculateItemPrice().toFixed(2)}</span>
          </div>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;