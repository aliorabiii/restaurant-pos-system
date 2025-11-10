// frontend/src/services/tableOrderService.js

const TABLE_ORDERS_KEY = "tableOrders";

export const tableOrderService = {
  // Get active order for a table
  getActiveTableOrder: async (tableId) => {
    try {
      const storedOrders = localStorage.getItem(TABLE_ORDERS_KEY);
      const tableOrders = storedOrders ? JSON.parse(storedOrders) : {};

      const order = tableOrders[tableId];
      console.log(`📋 Loading order for table ${tableId}:`, order);

      return {
        success: true,
        data: order || null,
      };
    } catch (error) {
      console.error("Error getting table order:", error);
      return {
        success: false,
        data: null,
      };
    }
  },

  // Save/update table order
  saveTableOrder: async (tableId, orderData) => {
    try {
      const storedOrders = localStorage.getItem(TABLE_ORDERS_KEY);
      const tableOrders = storedOrders ? JSON.parse(storedOrders) : {};

      tableOrders[tableId] = {
        ...orderData,
        tableId: tableId,
        status: "active",
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(TABLE_ORDERS_KEY, JSON.stringify(tableOrders));
      console.log(
        `💾 Saved ${orderData.items?.length || 0} items for table ${tableId}`,
        orderData.items
      );

      return {
        success: true,
        data: tableOrders[tableId],
      };
    } catch (error) {
      console.error("Error saving table order:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Complete table order
  completeTableOrder: async (tableId) => {
    try {
      const storedOrders = localStorage.getItem(TABLE_ORDERS_KEY);
      const tableOrders = storedOrders ? JSON.parse(storedOrders) : {};

      delete tableOrders[tableId];

      localStorage.setItem(TABLE_ORDERS_KEY, JSON.stringify(tableOrders));
      console.log(`✅ Completed and cleared order for table ${tableId}`);

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      console.error("Error completing table order:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Get all table orders (for debugging)
  getAllTableOrders: () => {
    try {
      const storedOrders = localStorage.getItem(TABLE_ORDERS_KEY);
      const orders = storedOrders ? JSON.parse(storedOrders) : {};
      console.log("📊 All table orders:", orders);
      return orders;
    } catch (error) {
      console.error("Error getting all table orders:", error);
      return {};
    }
  },
};
