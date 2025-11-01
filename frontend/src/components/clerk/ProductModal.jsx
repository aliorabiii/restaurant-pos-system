// frontend/src/components/clerk/ProductModal.jsx
import React, { useState } from "react";
import "./ProductModal.css";

const ProductModal = ({ product, onClose, onAddToOrder }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleAddToOrder = () => {
    onAddToOrder(product, quantity, selectedVariant);
  };

  const getDisplayPrice = () => {
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product.base_price;
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-modal-header">
          <h3>{product.name}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="product-modal-content">
          {/* Product Description */}
          {product.short_description && (
            <div className="description-section">
              <p>{product.short_description}</p>
            </div>
          )}

          {/* Size Selection (if product has sizes) */}
          {product.has_sizes && product.variants?.length > 0 ? (
            <div className="variants-section">
              <label className="section-label">Select Size:</label>
              <div className="variants-grid">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    className={`variant-btn ${
                      selectedVariant?.size === variant.size ? "selected" : ""
                    }`}
                    onClick={() => handleVariantSelect(variant)}
                  >
                    <span className="variant-size">{variant.size}</span>
                    <span className="variant-price">
                      ${variant.price.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
              {!selectedVariant && (
                <p className="variant-warning">Please select a size</p>
              )}
            </div>
          ) : (
            <div className="price-section">
              <label className="section-label">Price:</label>
              <div className="base-price">
                ${product.base_price?.toFixed(2)}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="quantity-section">
            <label className="section-label">Quantity:</label>
            <div className="quantity-input-group">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="quantity-btn"
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="quantity-btn"
              >
                +
              </button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="price-summary">
            <div className="price-row">
              <span>Price each:</span>
              <span>${getDisplayPrice().toFixed(2)}</span>
            </div>
            <div className="price-row total">
              <span>Total:</span>
              <span>${(getDisplayPrice() * quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="product-modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button
            onClick={handleAddToOrder}
            disabled={product.has_sizes && !selectedVariant}
            className="add-to-order-btn"
          >
            Add to Order (${(getDisplayPrice() * quantity).toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
