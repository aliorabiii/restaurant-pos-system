import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateProduct, getProductById } from "../services/productService";
import {
  getMainCategories,
  getSubcategories,
} from "../services/categoryService";

const EditProductModal = ({
  product,
  onClose,
  onUpdate,
  categories = [],
  imageBase,
}) => {
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

  // Categories state
  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Variants state for sizes
  const [variants, setVariants] = useState([
    { size: "small", price: "" },
    { size: "medium", price: "" },
    { size: "large", price: "" },
  ]);

  // Fallback categories
  const fallbackCategories = {
    main: [
      { _id: "507f1f77bcf86cd799439011", name: "Food" },
      { _id: "507f1f77bcf86cd799439012", name: "Drinks" },
      { _id: "507f1f77bcf86cd799439013", name: "Desserts" },
      { _id: "507f1f77bcf86cd799439014", name: "Side Dishes" },
    ],
    sub: {
      "507f1f77bcf86cd799439011": [
        { _id: "507f1f77bcf86cd799439021", name: "Appetizers" },
        { _id: "507f1f77bcf86cd799439022", name: "Combo Meals" },
        { _id: "507f1f77bcf86cd799439023", name: "Salads" },
        { _id: "507f1f77bcf86cd799439024", name: "Snacks" },
        { _id: "507f1f77bcf86cd799439025", name: "Burgers" },
        { _id: "507f1f77bcf86cd799439026", name: "Shwarma" },
        { _id: "507f1f77bcf86cd799439027", name: "Kids Meals" },
        { _id: "507f1f77bcf86cd799439028", name: "Special Offers" },
      ],
      "507f1f77bcf86cd799439012": [
        { _id: "507f1f77bcf86cd799439031", name: "Soft Drinks" },
        { _id: "507f1f77bcf86cd799439032", name: "Hot Beverages" },
        { _id: "507f1f77bcf86cd799439033", name: "Fresh Juices" },
        { _id: "507f1f77bcf86cd799439034", name: "Smoothies" },
        { _id: "507f1f77bcf86cd799439035", name: "Cocktails" },
      ],
      "507f1f77bcf86cd799439013": [
        { _id: "507f1f77bcf86cd799439041", name: "Crepe" },
        { _id: "507f1f77bcf86cd799439042", name: "Waffle" },
        { _id: "507f1f77bcf86cd799439043", name: "Pancake" },
        { _id: "507f1f77bcf86cd799439044", name: "Ice Cream" },
        { _id: "507f1f77bcf86cd799439045", name: "Cakes" },
      ],
      "507f1f77bcf86cd799439014": [
        { _id: "507f1f77bcf86cd799439051", name: "Fries" },
        { _id: "507f1f77bcf86cd799439052", name: "Dips and Sauces" },
        { _id: "507f1f77bcf86cd799439053", name: "Mini Starters" },
        { _id: "507f1f77bcf86cd799439054", name: "Bread and Add-ons" },
      ],
    },
  };

  // Load categories first, then set form data
  useEffect(() => {
    if (product) {
      loadCategoriesAndSetForm();
    }
  }, [product]);

  const loadCategoriesAndSetForm = async () => {
    setCategoriesLoading(true);
    try {
      // Load main categories first
      await loadMainCategories();

      // Then set the form data with the product values
      const mainCategoryId = getCategoryId(product.main_category);
      const subCategoryId = getCategoryId(product.sub_category);

      console.log("Setting form with:", {
        mainCategoryId,
        subCategoryId,
        mainCategory: product.main_category,
        subCategory: product.sub_category,
      });

      // Set the basic form data first
      setFormData({
        name: product.name || "",
        main_category: mainCategoryId || "",
        sub_category: subCategoryId || "",
        short_description: product.short_description || "",
        base_price: product.base_price || "",
        status: product.status || "available",
        prep_time_minutes: product.prep_time_minutes || "",
        has_sizes: product.has_sizes || false,
      });

      // If we have a main category, load its subcategories
      if (mainCategoryId) {
        await loadSubcategories(mainCategoryId);
      }

      // Initialize variants
      if (product.variants && product.variants.length > 0) {
        const newVariants = [
          { size: "small", price: "" },
          { size: "medium", price: "" },
          { size: "large", price: "" },
        ];

        product.variants.forEach((variant) => {
          const index = newVariants.findIndex((v) => v.size === variant.size);
          if (index !== -1) {
            newVariants[index].price = variant.price || "";
          }
        });

        setVariants(newVariants);
      }

      setCategoriesLoaded(true);
    } catch (error) {
      console.error("Error loading categories and setting form:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Helper function to get category ID whether it's an object or string
  const getCategoryId = (category) => {
    if (!category) return "";
    if (typeof category === "string") return category;
    if (category._id) return category._id;
    return "";
  };

  const loadMainCategories = async () => {
    try {
      const res = await getMainCategories(token);
      if (res.success && res.data && res.data.length > 0) {
        setMainCategories(res.data);
      } else {
        setMainCategories(fallbackCategories.main);
      }
    } catch (error) {
      console.error("Error loading main categories:", error);
      setMainCategories(fallbackCategories.main);
    }
  };

  const loadSubcategories = async (parentId) => {
    try {
      const res = await getSubcategories(parentId, token);
      if (res.success && res.data && res.data.length > 0) {
        setSubcategories(res.data);
      } else {
        const fallbackSubcategories = fallbackCategories.sub[parentId] || [];
        setSubcategories(fallbackSubcategories);
      }
    } catch (error) {
      console.error("Error loading subcategories:", error);
      const fallbackSubcategories = fallbackCategories.sub[parentId] || [];
      setSubcategories(fallbackSubcategories);
    }
  };

  // Load subcategories when main category changes - but only after initial load
  useEffect(() => {
    if (formData.main_category && categoriesLoaded) {
      loadSubcategories(formData.main_category);
      // Only clear sub category when main category changes after initial load
      if (formData.sub_category) {
        setFormData((prev) => ({ ...prev, sub_category: "" }));
      }
    }
  }, [formData.main_category, categoriesLoaded]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVariantChange = (index, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index].price = value;
    setVariants(updatedVariants);
    if (errors[`size_${variants[index].size}`]) {
      setErrors((prev) => ({ ...prev, [`size_${variants[index].size}`]: "" }));
    }
  };

  const handleFiles = (e) => {
    setImages(Array.from(e.target.files));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.main_category)
      newErrors.main_category = "Main category is required";
    if (!formData.sub_category)
      newErrors.sub_category = "Sub category is required";
    if (!formData.status) newErrors.status = "Status is required";

    if (!formData.base_price || formData.base_price === "") {
      newErrors.base_price = "Base price is required";
    }

    if (formData.has_sizes) {
      variants.forEach((variant) => {
        if (!variant.price || variant.price === "") {
          newErrors[
            `size_${variant.size}`
          ] = `${variant.size} price is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!validateForm()) {
      alert("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);

    try {
      const updateData = new FormData();

      updateData.append("name", formData.name);
      updateData.append("main_category", formData.main_category);
      updateData.append("sub_category", formData.sub_category);
      updateData.append("short_description", formData.short_description);
      updateData.append("status", formData.status);
      updateData.append("has_sizes", formData.has_sizes.toString());
      updateData.append("base_price", parseFloat(formData.base_price) || 0);

      if (formData.prep_time_minutes) {
        updateData.append("prep_time_minutes", formData.prep_time_minutes);
      }

      if (formData.has_sizes) {
        const variantsToSend = variants.map((variant) => ({
          size: variant.size,
          price: parseFloat(variant.price) || 0,
        }));
        updateData.append("variants", JSON.stringify(variantsToSend));
      }

      images.forEach((file) => {
        if (file instanceof File) {
          updateData.append("images", file);
        }
      });

      const res = await updateProduct(product._id, updateData, token);

      if (res.success) {
        onUpdate(product._id, res.data);
        handleClose();
      } else {
        setSubmitError(res?.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Update product error:", error);
      setSubmitError(`Failed to update product: ${error.message}`);
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

  if (!product) return null;

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
            Edit Product
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

          {/* Current Image Preview */}
          {product.images && product.images.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Current Image
              </label>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "0.5rem",
                  display: "inline-block",
                }}
              >
                <img
                  src={imageBase(product.images[0])}
                  alt={product.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              </div>
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
                  Update Images
                </label>
                <input
                  type="file"
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
                      New files to upload:
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
                {loading ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
