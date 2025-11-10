import React, { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import { getAllCategories } from "../services/categoryService";

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

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#10b981"; // green
      case "out_of_stock":
        return "#f59e0b"; // amber
      case "unavailable":
        return "#ef4444"; // red
      case "disabled":
        return "#6b7280"; // gray
      case "seasonal":
        return "#8b5cf6"; // violet
      case "preorder":
        return "#3b82f6"; // blue
      default:
        return "#6b7280"; // gray
    }
  };

  const displayedBasePrice = useMemo(() => {
    if (product.base_price !== undefined && product.base_price !== null) {
      return parseFloat(product.base_price).toFixed(2);
    }
    return "0.00";
  }, [product.base_price]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="modal-content-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "85%",
          maxWidth: "650px",
          maxHeight: "85vh",
          overflow: "auto",
          zIndex: 10000,
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5
            className="modal-title"
            style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}
          >
            Product Details
          </h5>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "1.5rem" }}>
          {/* Image */}
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <img
              src={
                product.images && product.images.length
                  ? imageBase(product.images[0])
                  : "/placeholder.png"
              }
              alt={product.name || "Product Image"}
              style={{
                width: "200px",
                height: "200px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
          </div>

          {/* Product Information */}
          <div style={{ display: "grid", gap: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "600", color: "#374151" }}>
                Product Name:
              </span>
              <span style={{ color: "#111827" }}>{product.name || "N/A"}</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "600", color: "#374151" }}>
                Main Category:
              </span>
              <span style={{ color: "#111827" }}>
                {getCategoryName(product.main_category)}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "600", color: "#374151" }}>
                Sub Category:
              </span>
              <span style={{ color: "#111827" }}>
                {getCategoryName(product.sub_category)}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "600", color: "#374151" }}>
                Base Price:
              </span>
              <span style={{ color: "#111827", fontWeight: "600" }}>
                ${displayedBasePrice}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "600", color: "#374151" }}>
                Status:
              </span>
              <span
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  backgroundColor: getStatusColor(product.status) + "20",
                  color: getStatusColor(product.status),
                  border: `1px solid ${getStatusColor(product.status)}40`,
                  width: "fit-content",
                }}
              >
                {getStatusText(product.status)}
              </span>
            </div>

            {product.prep_time_minutes && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "600", color: "#374151" }}>
                  Prep Time:
                </span>
                <span style={{ color: "#111827" }}>
                  {product.prep_time_minutes} minutes
                </span>
              </div>
            )}

            {product.short_description && (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <span style={{ fontWeight: "600", color: "#374151" }}>
                  Description:
                </span>
                <p
                  style={{
                    color: "#111827",
                    margin: 0,
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  {product.short_description}
                </p>
              </div>
            )}

            {product.has_sizes &&
              product.variants &&
              product.variants.length > 0 && (
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "1rem",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.75rem",
                      color: "#374151",
                    }}
                  >
                    Size Prices
                  </div>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {product.variants.map((variant, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.5rem 0.75rem",
                          backgroundColor: "white",
                          borderRadius: "4px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "600",
                            textTransform: "capitalize",
                            color: "#374151",
                          }}
                        >
                          {variant.size
                            ? variant.size.charAt(0).toUpperCase() +
                              variant.size.slice(1)
                            : "Unknown"}
                        </span>
                        <span
                          style={{
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
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

            {/* Metadata Section */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                padding: "1rem",
                backgroundColor: "#f9fafb",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  marginBottom: "0.75rem",
                  color: "#374151",
                }}
              >
                Product Information
              </div>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <span style={{ fontWeight: "500", color: "#374151" }}>
                    Has Size Options:
                  </span>
                  <span style={{ color: "#111827" }}>
                    {product.has_sizes ? "Yes" : "No"}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <span style={{ fontWeight: "500", color: "#374151" }}>
                    Created:
                  </span>
                  <span style={{ color: "#111827" }}>
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <span style={{ fontWeight: "500", color: "#374151" }}>
                    Last Updated:
                  </span>
                  <span style={{ color: "#111827" }}>
                    {product.updatedAt
                      ? new Date(product.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "1.5rem",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "0.5rem 1.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#374151",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#f9fafb")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowProductModal;
