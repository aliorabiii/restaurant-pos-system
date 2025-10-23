import React, { useState } from "react";
import "./ProductModal.css";

const ProductModal = ({ product, onClose, onAddToOrder }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const imageBase = (imgPath) => {
    if (!imgPath) return "/placeholder.png";
    if (imgPath.startsWith("http")) return imgPath;
    const base = (
      import.meta.env.VITE_API_URL || "http://localhost:5000"
    ).replace(/\/api\/?$/, "");
    return imgPath.startsWith("/") ? `${base}${imgPath}` : `${base}/${imgPath}`;
  };

  const handleAddToOrder = () => {
    onAddToOrder(product, quantity, selectedVariant);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const getDisplayPrice = () => {
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product.base_price;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product.name}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="product-image">
            <img
              src={
                product.images?.length
                  ? imageBase(product.images[0])
                  : "/placeholder.png"
              }
              alt={product.name}
            />
          </div>

          <div className="product-details">
            {product.short_description && (
              <p className="product-description">{product.short_description}</p>
            )}

            {product.has_sizes && product.variants?.length > 0 ? (
              <div className="variants-section">
                <h4>Select Size:</h4>
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
                <h4>Price:</h4>
                <div className="base-price">
                  ${product.base_price?.toFixed(2)}
                </div>
              </div>
            )}

            <div className="quantity-section">
              <h4>Quantity:</h4>
              <div className="quantity-controls">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div className="total-section">
              <h4>Total:</h4>
              <div className="total-price">
                ${(getDisplayPrice() * quantity).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={handleAddToOrder}
            disabled={product.has_sizes && !selectedVariant}
            className="add-to-order-btn"
          >
            ➕ Add to Order (${(getDisplayPrice() * quantity).toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
