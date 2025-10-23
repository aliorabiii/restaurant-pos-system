const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = (token) => {
  const t =
    token || (typeof window !== "undefined" && localStorage.getItem("token"));
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const getMainCategories = async (token) => {
  try {
    console.log(
      "🌐 Fetching main categories from:",
      `${API_BASE}/categories/main`
    );
    const res = await fetch(`${API_BASE}/categories/main`, {
      headers: {
        ...getAuthHeaders(token),
      },
    });
    const data = await res.json();
    console.log("📦 Main categories response:", data);
    return data;
  } catch (error) {
    console.error("❌ Get main categories error:", error);
    return { success: false, message: error.message };
  }
};

export const getSubcategories = async (parentId, token) => {
  try {
    console.log("🌐 Fetching subcategories for:", parentId);
    const res = await fetch(
      `${API_BASE}/categories/subcategories/${parentId}`,
      {
        headers: {
          ...getAuthHeaders(token),
        },
      }
    );
    const data = await res.json();
    console.log("📦 Subcategories response:", data);
    return data; // Return the full response object
  } catch (error) {
    console.error("❌ Get subcategories error:", error);
    return { success: false, message: error.message };
  }
};

export const getAllCategories = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      headers: {
        ...getAuthHeaders(token),
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Get all categories error:", error);
    return { success: false, message: error.message };
  }
};
