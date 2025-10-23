import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProduct, getProductById } from "../services/productService";
import {
  getMainCategories,
  getSubcategories,
} from "../services/categoryService";
import "./EditProductModal.css";

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
      } else {
        alert(res?.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Update product error:", error);
      alert(`Failed to update product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button onClick={onClose} className="close-btn" disabled={loading}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            {/* Current Image Preview */}
            {product.images && product.images.length > 0 && (
              <div className="current-image-section">
                <label>Current Image</label>
                <div className="image-preview">
                  <img
                    src={imageBase(product.images[0])}
                    alt={product.name}
                    className="current-image"
                  />
                </div>
              </div>
            )}

            {/* Form Fields */}
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
                    {mainCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
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
                    {subcategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
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
              <h3>Update Images</h3>
              <div className="form-group">
                <label htmlFor="images">Add New Images</label>
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
                    <p>New files to upload:</p>
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

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="update-btn" disabled={loading}>
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
