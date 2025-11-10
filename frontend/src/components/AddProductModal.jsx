import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createProduct as apiCreateProduct } from "../services/productService";
import {
  getMainCategories,
  getSubcategories,
} from "../services/categoryService";

export default function AddProductModal({ onClose, onCreated }) {
  const auth = useAuth();
  const token = auth?.token || localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    main_category: "",
    sub_category: "",
    short_description: "",
    base_price: "",
    status: "available",
    prep_time_minutes: "",
    has_sizes: false,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [variants, setVariants] = useState([
    { size: "small", price: "" },
    { size: "medium", price: "" },
    { size: "large", price: "" },
  ]);

  useEffect(() => {
    (async () => {
      setCategoriesLoading(true);
      try {
        const res = await getMainCategories(token);
        setMainCategories(
          res?.success && Array.isArray(res.data) ? res.data : []
        );
      } catch {
        setMainCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!formData.main_category) {
        setSubcategories([]);
        return;
      }
      setCategoriesLoading(true);
      try {
        const res = await getSubcategories(formData.main_category, token);
        setSubcategories(
          res?.success && Array.isArray(res.data) ? res.data : []
        );
      } catch {
        setSubcategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, [formData.main_category, token]);

  const handleFiles = (e) => setImages(Array.from(e.target.files || []));
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (submitError) setSubmitError("");
  };
  const handleVariantChange = (i, v) => {
    const u = [...variants];
    u[i].price = v;
    setVariants(u);
    const key = `size_${variants[i].size}`;
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
    if (submitError) setSubmitError("");
  };

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Product name is required";
    if (!formData.main_category) e.main_category = "Main category is required";
    if (!formData.sub_category) e.sub_category = "Sub category is required";
    if (!formData.status) e.status = "Status is required";
    if (formData.base_price === "" || formData.base_price === null)
      e.base_price = "Base price is required";
    if (formData.has_sizes) {
      variants.forEach((v) => {
        if (v.price === "" || v.price === null)
          e[`size_${v.size}`] = `${v.size} price is required`;
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError("");
    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("main_category", formData.main_category);
      body.append("sub_category", formData.sub_category);
      body.append("short_description", formData.short_description);
      body.append("status", formData.status);
      body.append("has_sizes", formData.has_sizes.toString());
      body.append("base_price", parseFloat(formData.base_price) || 0);
      if (formData.prep_time_minutes)
        body.append("prep_time_minutes", formData.prep_time_minutes);
      if (formData.has_sizes) {
        body.append(
          "variants",
          JSON.stringify(
            variants.map((v) => ({
              size: v.size,
              price: parseFloat(v.price) || 0,
            }))
          )
        );
      }
      images.forEach(
        (file) => file instanceof File && body.append("images", file)
      );

      const res = await apiCreateProduct(body, token);
      if (res?.success) {
        onCreated(res.data);
        handleClose();
      } else {
        setSubmitError(res?.message || "Failed to create product");
      }
    } catch (err) {
      setSubmitError(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      main_category: "",
      sub_category: "",
      short_description: "",
      base_price: "",
      status: "available",
      prep_time_minutes: "",
      has_sizes: false,
    });
    setImages([]);
    setVariants([
      { size: "small", price: "" },
      { size: "medium", price: "" },
      { size: "large", price: "" },
    ]);
    setErrors({});
    setSubmitError("");
    setLoading(false);
    onClose();
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="modal-overlay"
      onClick={handleClose}
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
        onClick={stop}
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
            Add New Product
          </h5>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
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
          {submitError && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                color: "#dc2626",
                marginBottom: "1rem",
              }}
            >
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  Product Name <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: `1px solid ${errors.name ? "#dc2626" : "#d1d5db"}`,
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.name && (
                  <div
                    style={{
                      color: "#dc2626",
                      fontSize: "0.875rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {errors.name}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Main Category <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    name="main_category"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      border: `1px solid ${
                        errors.main_category ? "#dc2626" : "#d1d5db"
                      }`,
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                    }}
                    value={formData.main_category}
                    onChange={handleInputChange}
                    disabled={loading || categoriesLoading}
                  >
                    <option value="">Select main category</option>
                    {mainCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.main_category && (
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {errors.main_category}
                    </div>
                  )}
                  {categoriesLoading && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        marginTop: "0.25rem",
                      }}
                    >
                      Loading categories...
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Sub Category <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    name="sub_category"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      border: `1px solid ${
                        errors.sub_category ? "#dc2626" : "#d1d5db"
                      }`,
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                    }}
                    value={formData.sub_category}
                    onChange={handleInputChange}
                    disabled={
                      loading || categoriesLoading || !formData.main_category
                    }
                  >
                    <option value="">
                      {formData.main_category
                        ? subcategories.length === 0
                          ? "No subcategories available"
                          : "Select sub category"
                        : "Select main category first"}
                    </option>
                    {subcategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.sub_category && (
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {errors.sub_category}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Base Price <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <div style={{ display: "flex" }}>
                    <span
                      style={{
                        padding: "0.5rem 0.75rem",
                        backgroundColor: "#f9fafb",
                        border: `1px solid ${
                          errors.base_price ? "#dc2626" : "#d1d5db"
                        }`,
                        borderRight: "none",
                        borderRadius: "6px 0 0 6px",
                        fontSize: "0.875rem",
                        color: "#6b7280",
                      }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      name="base_price"
                      step="0.01"
                      min="0"
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.75rem",
                        border: `1px solid ${
                          errors.base_price ? "#dc2626" : "#d1d5db"
                        }`,
                        borderLeft: "none",
                        borderRadius: "0 6px 6px 0",
                        fontSize: "0.875rem",
                      }}
                      placeholder="0.00"
                      value={formData.base_price}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                  {errors.base_price && (
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {errors.base_price}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Status <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    name="status"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      border: `1px solid ${
                        errors.status ? "#dc2626" : "#d1d5db"
                      }`,
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                    }}
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                  {errors.status && (
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {errors.status}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  Description
                </label>
                <textarea
                  name="short_description"
                  rows="3"
                  maxLength={140}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    resize: "vertical",
                  }}
                  placeholder="Brief description (optional)"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    textAlign: "right",
                    marginTop: "0.25rem",
                  }}
                >
                  {formData.short_description.length}/140
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  name="prep_time_minutes"
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                  placeholder="e.g., 15"
                  value={formData.prep_time_minutes}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    id="has_sizes"
                    name="has_sizes"
                    checked={formData.has_sizes}
                    onChange={handleInputChange}
                    disabled={loading}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontWeight: "600" }}>
                    This product has different sizes (Small, Medium, Large)
                  </span>
                </label>
              </div>

              {formData.has_sizes && (
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
                      marginBottom: "0.5rem",
                    }}
                  >
                    Size Prices <span style={{ color: "#dc2626" }}>*</span>
                  </div>
                  {variants.map((variant, index) => (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "0.5rem",
                      }}
                      key={variant.size}
                    >
                      <div style={{ width: "80px" }}>
                        <span
                          style={{
                            fontWeight: "600",
                            textTransform: "capitalize",
                          }}
                        >
                          {variant.size}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex" }}>
                          <span
                            style={{
                              padding: "0.5rem 0.75rem",
                              backgroundColor: "#f9fafb",
                              border: `1px solid ${
                                errors[`size_${variant.size}`]
                                  ? "#dc2626"
                                  : "#d1d5db"
                              }`,
                              borderRight: "none",
                              borderRadius: "6px 0 0 6px",
                              fontSize: "0.875rem",
                              color: "#6b7280",
                            }}
                          >
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            style={{
                              flex: 1,
                              padding: "0.5rem 0.75rem",
                              border: `1px solid ${
                                errors[`size_${variant.size}`]
                                  ? "#dc2626"
                                  : "#d1d5db"
                              }`,
                              borderLeft: "none",
                              borderRadius: "0 6px 6px 0",
                              fontSize: "0.875rem",
                            }}
                            placeholder="0.00"
                            value={variant.price}
                            onChange={(e) =>
                              handleVariantChange(index, e.target.value)
                            }
                            disabled={loading}
                            required
                          />
                        </div>
                        {errors[`size_${variant.size}`] && (
                          <div
                            style={{
                              color: "#dc2626",
                              fontSize: "0.875rem",
                              marginTop: "0.25rem",
                            }}
                          >
                            {errors[`size_${variant.size}`]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  Product Images
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                />
                {images.length > 0 && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "0.875rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Selected files
                    </div>
                    {images.map((file, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: "0.875rem",
                          color: "#6b7280",
                        }}
                      >
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#f9fafb")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: loading ? "#9ca3af" : "#2563eb",
                  color: "white",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
                onMouseOver={(e) =>
                  !loading && (e.target.style.backgroundColor = "#1d4ed8")
                }
                onMouseOut={(e) =>
                  !loading && (e.target.style.backgroundColor = "#2563eb")
                }
              >
                <Save size={18} />
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
