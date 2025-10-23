import React, { useEffect, useState, useMemo } from "react";
import "./ShowProductModal.css";
import { getAllCategories } from "../services/categoryService";

/**
 * ShowProductModal
 * Props:
 * - product: product object (may have populated categories { _id, name } or plain id strings)
 * - onClose: fn
 * - imageBase: fn to convert image path to full URL (e.g. p => API_BASE + p)
 */
const ShowProductModal = ({ product, onClose, imageBase }) => {
  const [categoriesMap, setCategoriesMap] = useState(null);
  const token = typeof window !== "undefined" && localStorage.getItem("token");

  // Load categories once when needed (only if we might need to map ids)
  useEffect(() => {
    let mounted = true;

    const shouldLoad =
      product &&
      (typeof product.main_category === "string" ||
        typeof product.sub_category === "string" ||
        (product.main_category &&
          typeof product.main_category === "object" &&
          !product.main_category.name) ||
        (product.sub_category &&
          typeof product.sub_category === "object" &&
          !product.sub_category.name));

    if (!shouldLoad) {
      // If we don't need to load categories, set empty map so lookups don't show "Loading..."
      setCategoriesMap({});
      return;
    }

    const load = async () => {
      try {
        const cats = await getAllCategories(token);
        if (!mounted) return;
        // Expect cats to be an array of {_id, name}
        const map = {};
        if (Array.isArray(cats)) {
          cats.forEach((c) => {
            if (c && (c._id || c.id)) {
              const id = (c._id ?? c.id).toString();
              map[id] = c.name ?? "";
            }
          });
        }
        setCategoriesMap(map);
      } catch (err) {
        console.error("Failed to load categories for ShowProductModal:", err);
        setCategoriesMap({});
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [product, token]);

  if (!product) return null;

  // Debug — inspect the incoming product shape (remove in production)
  useEffect(() => {
    console.log("ShowProductModal product:", product);
  }, [product]);

  // Resolve category to display name robustly
  const getCategoryName = (category) => {
    if (category === null || category === undefined) return "N/A";

    // If populated object with name
    if (typeof category === "object") {
      if (typeof category.name === "string" && category.name.trim() !== "") {
        return category.name;
      }
      if (category._doc && typeof category._doc.name === "string") {
        return category._doc.name;
      }
      if (category._id) {
        const idStr = category._id.toString();
        if (categoriesMap && categoriesMap[idStr]) return categoriesMap[idStr];
        return "Unknown Category";
      }
      return "Unknown Category";
    }

    // If it's an id string, use map (if map not loaded yet show Loading...)
    if (typeof category === "string") {
      if (categoriesMap === null) return "Loading...";
      const name = categoriesMap[category];
      return name ? name : "Unknown Category";
    }

    return "Unknown Category";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Available";
      case "out_of_stock":
        return "Out of Stock";
      case "unavailable":
        return "Unavailable";
      case "disabled":
        return "Disabled";
      case "seasonal":
        return "Seasonal";
      case "preorder":
        return "Pre-order";
      default:
        return status || "Unknown";
    }
  };

  const displayedBasePrice = useMemo(() => {
    if (product.base_price !== undefined && product.base_price !== null) {
      return parseFloat(product.base_price).toFixed(2);
    }
    return "0.00";
  }, [product.base_price]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="show-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Product Details</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          {/* Image */}
          <div className="product-image-section">
            <img
              src={
                product.images && product.images.length
                  ? imageBase(product.images[0])
                  : "/placeholder.png"
              }
              alt={product.name || "Product Image"}
              className="product-image"
            />
          </div>

          {/* Info */}
          <div className="product-info">
            <div className="info-row">
              <label>Product Name:</label>
              <span className="info-value">{product.name || "N/A"}</span>
            </div>

            <div className="info-row">
              <label>Main Category:</label>
              <span className="info-value">
                {getCategoryName(product.main_category)}
              </span>
            </div>

            <div className="info-row">
              <label>Sub Category:</label>
              <span className="info-value">
                {getCategoryName(product.sub_category)}
              </span>
            </div>

            <div className="info-row">
              <label>Base Price:</label>
              <span className="price-value">${displayedBasePrice}</span>
            </div>

            <div className="info-row">
              <label>Status:</label>
              <span className={`status-badge ${product.status}`}>
                {getStatusText(product.status)}
              </span>
            </div>

            {product.prep_time_minutes && (
              <div className="info-row">
                <label>Prep Time:</label>
                <span className="info-value">
                  {product.prep_time_minutes} minutes
                </span>
              </div>
            )}

            {product.short_description && (
              <div className="info-row full-width">
                <label>Description:</label>
                <p className="description-text">{product.short_description}</p>
              </div>
            )}

            {product.has_sizes &&
              product.variants &&
              product.variants.length > 0 && (
                <div className="variants-section">
                  <h4>Size Prices</h4>
                  <div className="variants-list">
                    {product.variants.map((variant, idx) => (
                      <div key={idx} className="variant-item">
                        <span className="variant-size">
                          {variant.size
                            ? variant.size.charAt(0).toUpperCase() +
                              variant.size.slice(1)
                            : "Unknown"}
                        </span>
                        <span className="variant-price">
                          $
                          {variant.price !== undefined
                            ? parseFloat(variant.price).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="metadata-section">
              <h4>Product Information</h4>
              <div className="metadata-grid">
                <div className="metadata-item">
                  <label>Has Size Options:</label>
                  <span>{product.has_sizes ? "Yes" : "No"}</span>
                </div>
                <div className="metadata-item">
                  <label>Created:</label>
                  <span>
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="metadata-item">
                  <label>Last Updated:</label>
                  <span>
                    {product.updatedAt
                      ? new Date(product.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowProductModal;
