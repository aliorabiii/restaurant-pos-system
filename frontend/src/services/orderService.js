// frontend/src/services/orderService.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getOrders = async (token, params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.status) queryParams.append("status", params.status);

    const response = await axios.get(
      `${API_BASE}/orders?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const getDailySales = async (token, params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.date) queryParams.append("date", params.date);

    const response = await axios.get(
      `${API_BASE}/orders/daily-sales?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    throw error;
  }
};

export const getOrderById = async (token, orderId) => {
  try {
    const response = await axios.get(`${API_BASE}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

export const createOrder = async (orderData, token) => {
  try {
    const response = await axios.post(`${API_BASE}/orders`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error creating order - Full error:", error);
    console.error("❌ Error response data:", error.response?.data);
    console.error("❌ Error response status:", error.response?.status);
    throw error;
  }
};

// Add to frontend/src/services/orderService.js
export const updateOrder = async (orderId, orderData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE}/orders/${orderId}`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error updating order:", error);
    console.error("❌ Error response data:", error.response?.data);
    throw error;
  }
};

// frontend/src/services/orderService.js - Add this function
export const updateDeliveryStatus = async (orderId, action, token) => {
  try {
    const response = await axios.put(
      `${API_BASE}/orders/${orderId}/delivery-status`,
      { action },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error updating delivery status:", error);
    console.error("❌ Error response data:", error.response?.data);
    throw error;
  }
};

// frontend/src/services/orderService.js - Add these functions

export const updateDeliveryOut = async (orderId, token) => {
  try {
    console.log(`🔄 Calling API to mark order ${orderId} as out for delivery`);

    const response = await axios.put(
      `${API_BASE}/orders/${orderId}/delivery-out`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ API Response for delivery out:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating delivery out status:", error);
    console.error("❌ Error response data:", error.response?.data);
    console.error("❌ Error response status:", error.response?.status);
    throw error;
  }
};

export const updateDeliveryDelivered = async (orderId, token) => {
  try {
    console.log(`🔄 Calling API to mark order ${orderId} as delivered`);

    const response = await axios.put(
      `${API_BASE}/orders/${orderId}/delivery-delivered`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ API Response for delivery delivered:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating delivery delivered status:", error);
    console.error("❌ Error response data:", error.response?.data);
    console.error("❌ Error response status:", error.response?.status);
    throw error;
  }
};
