import React, { useEffect, useState, useCallback } from "react";
import ShowProductModal from "../components/ShowProductModal";
import EditProductModal from "../components/EditProductModal";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiSearch,
} from "react-icons/fi";
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
  const [allCategories, setAllCategories] = useState([]);

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
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "15");

        if (selectedMainCategory)
          params.append("maincategory", selectedMainCategory);
        if (selectedSubCategory)
          params.append("subcategory", selectedSubCategory);
        if (statusFilter) params.append("status", statusFilter);
        if (searchTerm) params.append("search", searchTerm);

        const API_BASE =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const url = `${API_BASE}/products?${params.toString()}`;

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

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
    [token, selectedMainCategory, selectedSubCategory, statusFilter, searchTerm]
  );

  // Load main categories
  const loadMainCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await getMainCategories(token);
      if (res.success && res.data) {
        setMainCategories(res.data);
        setAllCategories((prev) => {
          const newCategories = [...res.data];
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
        setAllCategories((prev) => {
          const filtered = prev.filter(
            (cat) =>
              !res.data.some((subCat) => subCat._id === cat._id) &&
              !cat.parent_id
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

  // Reload products when filters OR search change
  useEffect(() => {
    setCurrentPage(1);
    loadProducts(1);
  }, [
    selectedMainCategory,
    selectedSubCategory,
    statusFilter,
    searchTerm,
    loadProducts,
  ]);

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
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, ...updateData } : p))
      );
      setEditModal(false);
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
      available: { class: "bg-success", text: "Available" },
      out_of_stock: { class: "bg-danger", text: "Out of Stock" },
      unavailable: { class: "bg-danger", text: "Unavailable" },
    };
    const config = statusConfig[status] || {
      class: "bg-secondary",
      text: status,
    };
    return (
      <span className={`badge ${config.class} text-white`}>{config.text}</span>
    );
  };

  const getCategoryName = (category) => {
    if (!category) return "N/A";

    if (typeof category === "object" && category.name) {
      return category.name;
    }

    if (typeof category === "string") {
      const foundCategory = allCategories.find((cat) => cat._id === category);
      if (foundCategory) return foundCategory.name;

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

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`btn btn-sm ${
            currentPage === i ? "btn-primary" : "btn-outline-secondary border-0"
          }`}
          disabled={loading}
        >
          {i}
        </button>
      );
    }

    const resultsInfo = `Showing ${filteredProducts.length} of ${paginationInfo.totalProducts} products`;

    return (
      <div className="d-flex justify-content-between align-items-center mt-3 px-3 py-2 bg-light rounded">
        <div className="text-muted small">{resultsInfo}</div>
        <div className="d-flex align-items-center gap-1">
          <button
            onClick={handlePrevPage}
            disabled={!paginationInfo.hasPrevPage || loading}
            className="btn btn-sm btn-outline-secondary border-0"
          >
            ‹
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageClick(1)}
                className="btn btn-sm btn-outline-secondary border-0"
                disabled={loading}
              >
                1
              </button>
              {startPage > 2 && <span className="px-1 text-muted">...</span>}
            </>
          )}

          {pages}

          {endPage < paginationInfo.totalPages && (
            <>
              {endPage < paginationInfo.totalPages - 1 && (
                <span className="px-1 text-muted">...</span>
              )}
              <button
                onClick={() => handlePageClick(paginationInfo.totalPages)}
                className="btn btn-sm btn-outline-secondary border-0"
                disabled={loading}
              >
                {paginationInfo.totalPages}
              </button>
            </>
          )}

          <button
            onClick={handleNextPage}
            disabled={!paginationInfo.hasNextPage || loading}
            className="btn btn-sm btn-outline-secondary border-0"
          >
            ›
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-3">
      {/* Header Section */}
      <div className="row mb-3">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h4 mb-1 text-dark fw-bold">Products Management</h1>
              <p className="text-muted mb-0 small">
                Manage your product inventory and listings
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-2"
              onClick={() => setOpen(true)}
            >
              <FiPlus size={14} />
              Add New Product
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section - Improved Layout */}
      <div className="row mb-3">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="row g-3 align-items-end">
                {/* First Row: Search and Status */}
                <div className="col-md-6">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold text-dark mb-1 small">
                        <FiSearch className="me-1" size={12} />
                        Search Products
                      </label>
                      <div className="input-group input-group-sm">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Search by product name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-dark mb-1 small">
                        Status
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="available">Available</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Second Row: Categories */}
                <div className="col-md-5">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark mb-1 small">
                        Main Category
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedMainCategory}
                        onChange={(e) =>
                          setSelectedMainCategory(e.target.value)
                        }
                      >
                        <option value="">All Categories</option>
                        {mainCategories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark mb-1 small">
                        Sub Category
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        disabled={!selectedMainCategory}
                      >
                        <option value="">All Sub Categories</option>
                        {subcategories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="col-md-1">
                  <button
                    className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                    onClick={clearFilters}
                    title="Clear all filters"
                  >
                    <FiFilter size={12} />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="row">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted small">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-4">
                  <div className="mb-2">
                    <FiSearch size={32} className="text-muted" />
                  </div>
                  <h6 className="text-dark mb-1">No products found</h6>
                  <p className="text-muted small mb-3">
                    {paginationInfo.totalProducts === 0
                      ? "Get started by creating your first product"
                      : "Try adjusting your search or filters"}
                  </p>
                  {paginationInfo.totalProducts === 0 ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setOpen(true)}
                    >
                      <FiPlus className="me-1" size={12} />
                      Add Your First Product
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th
                            scope="col"
                            className="ps-3 py-2 text-dark fw-semibold small text-uppercase"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Product Name
                          </th>
                          <th
                            scope="col"
                            className="py-2 text-dark fw-semibold small text-uppercase"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Main Category
                          </th>
                          <th
                            scope="col"
                            className="py-2 text-dark fw-semibold small text-uppercase"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Sub Category
                          </th>
                          <th
                            scope="col"
                            className="py-2 text-dark fw-semibold small text-uppercase"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="py-2 text-dark fw-semibold small text-uppercase"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Sizes
                          </th>
                          <th
                            scope="col"
                            className="py-2 text-dark fw-semibold small text-uppercase"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="pe-3 py-2 text-dark fw-semibold small text-uppercase text-center"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product._id} className="border-top">
                            <td className="ps-3 py-2">
                              <div
                                className="fw-semibold text-dark small"
                                style={{ fontSize: "0.825rem" }}
                              >
                                {product.name}
                              </div>
                            </td>
                            <td className="py-2">
                              <span
                                className="text-dark small"
                                style={{ fontSize: "0.825rem" }}
                              >
                                {getCategoryName(product.main_category)}
                              </span>
                            </td>
                            <td className="py-2">
                              <span
                                className="text-dark small"
                                style={{ fontSize: "0.825rem" }}
                              >
                                {getCategoryName(product.sub_category)}
                              </span>
                            </td>
                            <td className="py-2">
                              <div
                                className="fw-bold text-dark small"
                                style={{ fontSize: "0.825rem" }}
                              >
                                ${product.base_price?.toFixed(2) || "0.00"}
                              </div>
                              {product.prep_time_minutes && (
                                <small
                                  className="text-muted"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {product.prep_time_minutes} min
                                </small>
                              )}
                            </td>
                            <td className="py-2">
                              {product.has_sizes &&
                              product.variants?.length > 0 ? (
                                <div className="d-flex flex-column gap-0">
                                  {product.variants
                                    .slice(0, 3)
                                    .map((variant, index) => (
                                      <div
                                        key={index}
                                        className="d-flex justify-content-between align-items-center"
                                      >
                                        <small
                                          className="text-uppercase fw-semibold text-dark"
                                          style={{ fontSize: "0.7rem" }}
                                        >
                                          {variant.size.charAt(0)}
                                        </small>
                                        <small
                                          className="text-dark"
                                          style={{ fontSize: "0.7rem" }}
                                        >
                                          ${variant.price?.toFixed(2)}
                                        </small>
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <span
                                  className="text-muted small"
                                  style={{ fontSize: "0.825rem" }}
                                >
                                  No sizes
                                </span>
                              )}
                            </td>
                            <td className="py-2">
                              {getStatusBadge(product.status)}
                            </td>
                            <td className="pe-3 py-2">
                              <div className="d-flex justify-content-center gap-1">
                                <button
                                  onClick={() => handleShowProduct(product)}
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center p-1"
                                  title="View"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  <FiEye size={12} />
                                </button>
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="btn btn-sm btn-outline-warning d-flex align-items-center p-1"
                                  title="Edit"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  <FiEdit2 size={12} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product._id)
                                  }
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center p-1"
                                  title="Delete"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  <FiTrash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination with Results Info */}
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
