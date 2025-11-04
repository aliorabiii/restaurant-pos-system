import React, { useEffect, useState, useCallback } from "react";
import ShowProductModal from "../components/ShowProductModal";
import EditProductModal from "../components/EditProductModal";
import {
  fetchProducts,
  deleteProduct,
  updateProduct,
} from "../services/productService";
import AddProductModal from "../components/AddProductModal";
import { useAuth } from "../context/AuthContext";
import {
  getMainCategories,
  getSubcategories,
} from "../services/categoryService";
import "./ProductsPage.css";

export default function ProductsPage() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Category states
  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [allCategories, setAllCategories] = useState([]); // Combined categories for lookup

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 15,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Load products with pagination
  const loadProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        // Build query parameters with pagination
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "15");

        if (selectedMainCategory)
          params.append("maincategory", selectedMainCategory);
        if (selectedSubCategory)
          params.append("subcategory", selectedSubCategory);
        if (statusFilter) params.append("status", statusFilter);

        // Create the full URL with query parameters
        const API_BASE =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const url = `${API_BASE}/products?${params.toString()}`;

        console.log("Fetching products from:", url);

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();

        if (res.success) {
          setProducts(res.data || []);
          setFilteredProducts(res.data || []);
          setPaginationInfo(
            res.pagination || {
              currentPage: page,
              totalPages: 1,
              totalProducts: res.data?.length || 0,
              productsPerPage: 15,
              hasNextPage: false,
              hasPrevPage: false,
            }
          );
          setCurrentPage(page);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    },
    [token, selectedMainCategory, selectedSubCategory, statusFilter]
  );

  // Load main categories
  const loadMainCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await getMainCategories(token);
      if (res.success && res.data) {
        setMainCategories(res.data);
        // Update all categories for lookup
        setAllCategories((prev) => {
          const newCategories = [...res.data];
          // Keep existing subcategories if any
          const existingSubcategories = prev.filter(
            (cat) => !res.data.some((mainCat) => mainCat._id === cat._id)
          );
          return [...newCategories, ...existingSubcategories];
        });
      } else {
        setMainCategories([]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setMainCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadSubcategories = async (parentId) => {
    if (!parentId) {
      setSubcategories([]);
      return;
    }
    try {
      const res = await getSubcategories(parentId, token);
      if (res.success && res.data) {
        setSubcategories(res.data);
        // Update all categories for lookup
        setAllCategories((prev) => {
          // Remove old subcategories for this parent
          const filtered = prev.filter(
            (cat) =>
              !res.data.some((subCat) => subCat._id === cat._id) &&
              !cat.parent_id // Keep main categories
          );
          return [...filtered, ...res.data];
        });
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error("Error loading subcategories:", error);
      setSubcategories([]);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts(1);
    loadMainCategories();
  }, []);

  // Load subcategories when main category changes
  useEffect(() => {
    if (selectedMainCategory) {
      loadSubcategories(selectedMainCategory);
      setSelectedSubCategory("");
    } else {
      setSubcategories([]);
      setSelectedSubCategory("");
    }
  }, [selectedMainCategory]);

  // Filter products locally for search (since we already have paginated data)
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Note: Category and status filters are handled server-side via loadProducts
    // This local filtering is only for search within the current page

    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  // Reload products when filters change (server-side filtering)
  useEffect(() => {
    setCurrentPage(1);
    loadProducts(1);
  }, [selectedMainCategory, selectedSubCategory, statusFilter, loadProducts]);

  // Pagination handlers
  const handleNextPage = () => {
    if (paginationInfo.hasNextPage) {
      const nextPage = currentPage + 1;
      loadProducts(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (paginationInfo.hasPrevPage) {
      const prevPage = currentPage - 1;
      loadProducts(prevPage);
    }
  };

  const handlePageClick = (pageNumber) => {
    loadProducts(pageNumber);
  };

  const handleProductCreated = (productData) => {
    // Reload first page to show the new product
    loadProducts(1);
    setOpen(false);
  };

  const handleShowProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditModal(true);
  };

  const handleUpdateProduct = async (productId, updateData) => {
    try {
      // Update local state immediately for better UX
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, ...updateData } : p))
      );
      setEditModal(false);
      // Reload current page to ensure data consistency
      await loadProducts(currentPage);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const res = await deleteProduct(productId, token);
      if (res.success) {
        // Reload current page to reflect deletion
        await loadProducts(currentPage);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMainCategory("");
    setSelectedSubCategory("");
    setStatusFilter("");
    setCurrentPage(1);
    loadProducts(1);
  };

  const imageBase = (imgPath) => {
    if (!imgPath) return "/placeholder.png";
    if (imgPath.startsWith("http")) return imgPath;
    const base = (
      import.meta.env.VITE_API_URL || "http://localhost:5000"
    ).replace(/\/api\/?$/, "");
    return imgPath.startsWith("/") ? `${base}${imgPath}` : `${base}/${imgPath}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { class: "status-available", text: "Available" },
      out_of_stock: { class: "status-out-of-stock", text: "Out of Stock" },
      unavailable: { class: "status-unavailable", text: "Unavailable" },
    };
    const config = statusConfig[status] || {
      class: "status-unknown",
      text: status,
    };
    return (
      <span className={`status-badge ${config.class}`}>{config.text}</span>
    );
  };

  // Improved category name function
  const getCategoryName = (category) => {
    if (!category) return "N/A";

    // If category is already an object with name
    if (typeof category === "object" && category.name) {
      return category.name;
    }

    // If category is a string ID, look it up
    if (typeof category === "string") {
      // First check in allCategories
      const foundCategory = allCategories.find((cat) => cat._id === category);
      if (foundCategory) return foundCategory.name;

      // If not found, try to find in the current product data
      // This handles cases where the category might be populated in the product response
      const productWithCategory = products.find(
        (p) =>
          p.main_category?._id === category ||
          p.main_category === category ||
          p.sub_category?._id === category ||
          p.sub_category === category
      );

      if (productWithCategory) {
        if (
          productWithCategory.main_category &&
          (productWithCategory.main_category._id === category ||
            productWithCategory.main_category === category)
        ) {
          return typeof productWithCategory.main_category === "object"
            ? productWithCategory.main_category.name
            : "Loading...";
        }
        if (
          productWithCategory.sub_category &&
          (productWithCategory.sub_category._id === category ||
            productWithCategory.sub_category === category)
        ) {
          return typeof productWithCategory.sub_category === "object"
            ? productWithCategory.sub_category.name
            : "Loading...";
        }
      }

      return "Loading...";
    }

    return "N/A";
  };

  // Load all categories on component mount and when products change
  useEffect(() => {
    const loadAllCategories = async () => {
      if (products.length > 0) {
        // Extract unique category IDs from products
        const mainCategoryIds = [
          ...new Set(
            products
              .map((p) => p.main_category?._id || p.main_category)
              .filter(Boolean)
          ),
        ];

        const subCategoryIds = [
          ...new Set(
            products
              .map((p) => p.sub_category?._id || p.sub_category)
              .filter(Boolean)
          ),
        ];

        // Load missing categories
        for (const categoryId of [...mainCategoryIds, ...subCategoryIds]) {
          if (
            categoryId &&
            !allCategories.find((cat) => cat._id === categoryId)
          ) {
            try {
              // This would require a new API endpoint to get category by ID
              // For now, we rely on the existing category loading
            } catch (error) {
              console.error("Error loading category:", error);
            }
          }
        }
      }
    };

    loadAllCategories();
  }, [products, allCategories]);

  // Render pagination component
  const renderPagination = () => {
    if (paginationInfo.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      paginationInfo.totalPages,
      startPage + maxVisiblePages - 1
    );

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`pagination-btn ${currentPage === i ? "active" : ""}`}
          disabled={loading}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <button
          onClick={handlePrevPage}
          disabled={!paginationInfo.hasPrevPage || loading}
          className="pagination-btn pagination-prev"
        >
          Previous
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageClick(1)}
              className="pagination-btn"
              disabled={loading}
            >
              1
            </button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {pages}

        {endPage < paginationInfo.totalPages && (
          <>
            {endPage < paginationInfo.totalPages - 1 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              onClick={() => handlePageClick(paginationInfo.totalPages)}
              className="pagination-btn"
              disabled={loading}
            >
              {paginationInfo.totalPages}
            </button>
          </>
        )}

        <button
          onClick={handleNextPage}
          disabled={!paginationInfo.hasNextPage || loading}
          className="pagination-btn pagination-next"
        >
          Next
        </button>
      </div>
    );
  };

  // Results information
  const resultsInfo = `Showing ${filteredProducts.length} products on page ${currentPage} of ${paginationInfo.totalPages} (Total: ${paginationInfo.totalProducts} products)`;

  return (
    <div className="products-page">
      <div className="page-header">
        <h2>Products Management</h2>
        <button className="add-product-btn" onClick={() => setOpen(true)}>
          + Add New Product
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>Filters & Search</h3>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All
          </button>
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Products</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Main Category</label>
            <select
              value={selectedMainCategory}
              onChange={(e) => setSelectedMainCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Main Categories</option>
              {mainCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sub Category</label>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedMainCategory}
              className="filter-select"
            >
              <option value="">All Sub Categories</option>
              {subcategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          {resultsInfo}
          {(searchTerm ||
            selectedMainCategory ||
            selectedSubCategory ||
            statusFilter) && (
            <span className="active-filters">• Filters active</span>
          )}
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="loading-state">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No products found</h3>
          <p>
            {paginationInfo.totalProducts === 0
              ? "Create your first product"
              : "Try adjusting filters"}
          </p>
          {paginationInfo.totalProducts === 0 ? (
            <button className="add-product-btn" onClick={() => setOpen(true)}>
              + Add Product
            </button>
          ) : (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th className="image-col">Image</th>
                  <th className="name-col">Product Name</th>
                  <th className="category-col">Main Category</th>
                  <th className="category-col">Sub Category</th>
                  <th className="price-col">Price</th>
                  <th className="sizes-col">Sizes</th>
                  <th className="status-col">Status</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="product-row">
                    <td>
                      <div className="product-image-wrapper">
                        <img
                          src={
                            product.images?.length
                              ? imageBase(product.images[0])
                              : "/placeholder.png"
                          }
                          alt={product.name}
                          className="product-table-image"
                        />
                      </div>
                    </td>
                    <td>
                      <div className="product-name">{product.name}</div>
                    </td>
                    <td>
                      <div className="category-name">
                        {getCategoryName(product.main_category)}
                      </div>
                    </td>
                    <td>
                      <div className="category-name">
                        {getCategoryName(product.sub_category)}
                      </div>
                    </td>
                    <td>
                      <div className="base-price">
                        ${product.base_price?.toFixed(2) || "0.00"}
                      </div>
                      {product.prep_time_minutes && (
                        <div className="prep-time">
                          {product.prep_time_minutes} min
                        </div>
                      )}
                    </td>
                    <td>
                      {product.has_sizes && product.variants?.length > 0 ? (
                        <div className="size-prices">
                          {product.variants
                            .slice(0, 3)
                            .map((variant, index) => (
                              <div key={index} className="size-price-item">
                                <span className="size-label">
                                  {variant.size.charAt(0).toUpperCase()}
                                </span>
                                <span className="size-price">
                                  ${variant.price?.toFixed(2)}
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <span className="no-sizes">No sizes</span>
                      )}
                    </td>
                    <td>{getStatusBadge(product.status)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleShowProduct(product)}
                          className="action-btn view-btn"
                          title="View"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="action-btn edit-btn"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="action-btn delete-btn"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Modals */}
      {showModal && (
        <ShowProductModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          imageBase={imageBase}
        />
      )}
      {editModal && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setEditModal(false)}
          onUpdate={handleUpdateProduct}
          imageBase={imageBase}
        />
      )}
      {open && (
        <AddProductModal
          onClose={() => setOpen(false)}
          onCreated={handleProductCreated}
        />
      )}
    </div>
  );
}
