// frontend/src/components/clerk/ProductGrid.jsx
import React from "react";
import "./ProductGrid.css";

const ProductGrid = ({ products, loading, onProductSelect }) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h3>No products found</h3>
        <p>Select a category to view products</p>
      </div>
    );
  }

  const handleAddClick = (e, product) => {
    e.stopPropagation(); // Prevent the card click from firing
    onProductSelect(product);
  };

  return (
    <div className="pos__grid">
      {products.map((product) => (
        <div
          key={product._id}
          className="pos__card"
          onClick={() => onProductSelect(product)}
        >
          <div className="product-image">
            <img
              src={
                product.images?.length
                  ? product.images[0].startsWith("http")
                    ? product.images[0]
                    : `http://localhost:5000${product.images[0]}`
                  : "/placeholder.png"
              }
              alt={product.name}
              onError={(e) => {
                e.target.src = "/placeholder.png";
              }}
            />
          </div>
          <div className="pos__card-name">{product.name}</div>
          <div className="pos__card-meta">
            <span className="pill">
              {product.sub_category?.name || "General"}
            </span>
            {product.has_sizes && product.variants?.length > 0 ? (
              <div className="price">
                ${Math.min(...product.variants.map((v) => v.price)).toFixed(2)}+
              </div>
            ) : (
              <div className="price">${product.base_price?.toFixed(2)}</div>
            )}
          </div>
          <button
            className="add-button"
            onClick={(e) => handleAddClick(e, product)}
          >
            Add
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
