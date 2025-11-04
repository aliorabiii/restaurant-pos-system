// src/services/productService.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = (token) => {
  const t =
    token || (typeof window !== "undefined" && localStorage.getItem("token"));
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// Get products with pagination (for Admin Panel)
export const fetchProducts = async (token, queryString = "") => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:5000"
      }/api/products?${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Get ALL products without pagination (for Clerk Dashboard POS)
export const fetchAllProducts = async (token) => {
  try {
    console.log("Fetching ALL products for POS...");

    const API_BASE =
      import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const url = `${API_BASE}/products?pos=true`; // Use pos parameter

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetch ALL products response:", data);
    return data;
  } catch (error) {
    console.error("Fetch ALL products error:", error);
    return { success: false, message: error.message };
  }
};

export const createProduct = async (formData, token) => {
  try {
    console.log("Creating product, sending to:", `${API_BASE}/products`);
    console.log("FormData entries:");

    // Log form data for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(token),
        // NOTE: DO NOT set Content-Type for FormData
      },
      body: formData,
    });

    const data = await res.json();
    console.log("Create product response:", data);
    return data;
  } catch (error) {
    console.error("Create product error:", error);
    return { success: false, message: error.message };
  }
};

export const updateProduct = async (productId, formData, token) => {
  try {
    console.log("Updating product:", productId);
    console.log("Update FormData entries:");

    // Log form data for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(token),
        // NOTE: DO NOT set Content-Type for FormData
      },
      body: formData,
    });

    const data = await res.json();
    console.log("Update product response:", data);
    return data;
  } catch (error) {
    console.error("Update product error:", error);
    return { success: false, message: error.message };
  }
};

export const getProductById = async (productId, token) => {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}`, {
      headers: {
        ...getAuthHeaders(token),
      },
    });
    const json = await res.json();
    // Return the product object directly (backend returns { success: true, data: product })
    return json.data ?? json;
  } catch (error) {
    console.error("Get product by ID error:", error);
    return null;
  }
};

// Get products by subcategory
export const getProductsByCategory = async (subcategoryId, token) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      }/products?subcategory=${subcategoryId}&pos=true`, // Add pos=true for POS mode
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
};

export const deleteProduct = async (productId, token) => {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(token),
      },
    });
    return res.json();
  } catch (error) {
    console.error("Delete product error:", error);
    return { success: false, message: error.message };
  }
};
