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
        <p>Select a subcategory to view products</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      <h3 className="section-title">Products</h3>
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th className="name-col">Product Name</th>
              <th className="price-col">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="product-row"
                onClick={() => onProductSelect(product)}
              >
                <td className="product-name">{product.name}</td>
                <td className="product-price">
                  {product.has_sizes && product.variants?.length > 0 ? (
                    <div className="variant-prices">
                      {product.variants.map((variant, index) => (
                        <div key={index} className="variant-price">
                          <span className="variant-size">{variant.size}:</span>
                          <span className="variant-amount">
                            ${variant.price?.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span>${product.base_price?.toFixed(2)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductGrid;
