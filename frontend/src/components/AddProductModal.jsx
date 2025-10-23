import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createProduct as apiCreateProduct } from "../services/productService";
import {
  getMainCategories,
  getSubcategories,
} from "../services/categoryService";
import "./AddProductModel.css";

export default function AddProductModal({ onClose, onCreated }) {
  const auth = useAuth();
  const token = auth?.token || localStorage.getItem("token");

  // Form state
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

  // Categories state - NO FALLBACKS
  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Variants state
  const [variants, setVariants] = useState([
    { size: "small", price: "" },
    { size: "medium", price: "" },
    { size: "large", price: "" },
  ]);

  // Load main categories on component mount
  useEffect(() => {
    loadMainCategories();
  }, []);

  // Load subcategories when main category changes
  useEffect(() => {
    if (formData.main_category) {
      loadSubcategories(formData.main_category);
      setFormData((prev) => ({ ...prev, sub_category: "" }));
    } else {
      setSubcategories([]);
    }
  }, [formData.main_category]);

  // Load main categories from API ONLY
  const loadMainCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await getMainCategories(token);
      console.log("Main categories API response:", res);

      if (res.success && res.data && res.data.length > 0) {
        setMainCategories(res.data);
        console.log("Main categories loaded:", res.data);
      } else {
        console.log("No main categories found in API");
        setMainCategories([]);
      }
    } catch (error) {
      console.error("Error loading main categories:", error);
      setMainCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load subcategories from API ONLY
  const loadSubcategories = async (parentId) => {
    if (!parentId) {
      setSubcategories([]);
      return;
    }

    setCategoriesLoading(true);
    try {
      console.log("Loading subcategories for parent:", parentId);
      const res = await getSubcategories(parentId, token);
      console.log("Subcategories API response:", res);

      if (res.success && res.data) {
        setSubcategories(res.data);
        console.log("Subcategories loaded:", res.data);
      } else {
        console.log("No subcategories found for this parent");
        setSubcategories([]);
      }
    } catch (error) {
      console.error("Error loading subcategories:", error);
      setSubcategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleFiles = (e) => {
    setImages(Array.from(e.target.files));
  };

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
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("main_category", formData.main_category);
      formDataToSend.append("sub_category", formData.sub_category);
      formDataToSend.append("short_description", formData.short_description);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("has_sizes", formData.has_sizes.toString());
      formDataToSend.append("base_price", parseFloat(formData.base_price) || 0);

      if (formData.prep_time_minutes) {
        formDataToSend.append("prep_time_minutes", formData.prep_time_minutes);
      }

      if (formData.has_sizes) {
        const variantsToSend = variants.map((variant) => ({
          size: variant.size,
          price: parseFloat(variant.price) || 0,
        }));
        formDataToSend.append("variants", JSON.stringify(variantsToSend));
      }

      images.forEach((file) => {
        if (file instanceof File) {
          formDataToSend.append("images", file);
        }
      });

      console.log("Submitting product with categories:", {
        main_category: formData.main_category,
        sub_category: formData.sub_category,
      });

      const res = await apiCreateProduct(formDataToSend, token);

      if (res && res.success) {
        onCreated(res.data);
      } else {
        alert(res?.message || "Failed to create product");
      }
    } catch (err) {
      console.error("Create product error:", err);
      alert(`Failed to create product: ${err.message}`);
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
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="add-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button
            type="button"
            onClick={handleClose}
            className="close-btn"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="modal-content">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>

              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Enter product name"
                  className={errors.name ? "error" : ""}
                />
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="main_category">Main Category *</label>
                  <select
                    id="main_category"
                    name="main_category"
                    value={formData.main_category}
                    onChange={handleInputChange}
                    required
                    disabled={loading || categoriesLoading}
                    className={errors.main_category ? "error" : ""}
                  >
                    <option value="">Select main category</option>
                    {mainCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.main_category && (
                    <span className="error-text">{errors.main_category}</span>
                  )}
                  {categoriesLoading && (
                    <span className="loading-text">Loading categories...</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="sub_category">Sub Category *</label>
                  <select
                    id="sub_category"
                    name="sub_category"
                    value={formData.sub_category}
                    onChange={handleInputChange}
                    required
                    disabled={
                      loading || categoriesLoading || !formData.main_category
                    }
                    className={errors.sub_category ? "error" : ""}
                  >
                    <option value="">
                      {formData.main_category
                        ? subcategories.length === 0
                          ? "No subcategories available"
                          : "Select sub category"
                        : "Select main category first"}
                    </option>
                    {subcategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.sub_category && (
                    <span className="error-text">{errors.sub_category}</span>
                  )}
                </div>
              </div>

              {/* Base Price */}
              <div className="form-group">
                <label htmlFor="base_price">Base Price *</label>
                <input
                  type="number"
                  id="base_price"
                  name="base_price"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="0.00"
                  className={errors.base_price ? "error" : ""}
                />
                {errors.base_price && (
                  <span className="error-text">{errors.base_price}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="short_description">Description</label>
                <textarea
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength={140}
                  disabled={loading}
                  placeholder="Brief description (optional)"
                />
                <div className="char-count">
                  {formData.short_description.length}/140
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className={errors.status ? "error" : ""}
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                  {errors.status && (
                    <span className="error-text">{errors.status}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="prep_time_minutes">Prep Time (minutes)</label>
                  <input
                    type="number"
                    id="prep_time_minutes"
                    name="prep_time_minutes"
                    value={formData.prep_time_minutes}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>
            </div>

            {/* Size Options */}
            <div className="form-section">
              <h3>Size Options</h3>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="has_sizes"
                    checked={formData.has_sizes}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <span className="checkmark"></span>
                  This product has different sizes (Small, Medium, Large)
                </label>
              </div>

              {formData.has_sizes && (
                <div className="sizes-section">
                  <h4>Size Prices *</h4>
                  {variants.map((variant, index) => (
                    <div key={variant.size} className="size-row">
                      <div className="size-label">
                        {variant.size.charAt(0).toUpperCase() +
                          variant.size.slice(1)}
                      </div>
                      <div className="size-input">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(index, e.target.value)
                          }
                          disabled={loading}
                          required
                          className={
                            errors[`size_${variant.size}`] ? "error" : ""
                          }
                        />
                        {errors[`size_${variant.size}`] && (
                          <span className="error-text">
                            {errors[`size_${variant.size}`]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Images Section */}
            <div className="form-section">
              <h3>Images</h3>
              <div className="form-group">
                <label htmlFor="images">Product Images</label>
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                  disabled={loading}
                />
                {images.length > 0 && (
                  <div className="selected-files">
                    <p>Selected files:</p>
                    {images.map((file, i) => (
                      <div key={i} className="file-name">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
