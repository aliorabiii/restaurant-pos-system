// Create order
export const createOrder = async (orderData, token) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Get orders
export const getOrders = async (token, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      }/orders?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Get daily sales report
export const getDailySales = async (token, date = null) => {
  try {
    const queryParams = date ? `?date=${date}` : "";
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      }/orders/daily-sales${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch daily sales");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    throw error;
  }
};
