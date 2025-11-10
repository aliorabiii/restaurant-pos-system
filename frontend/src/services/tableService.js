// frontend/src/services/tableService.js

export const tableService = {
  // Get all tables - using mock data only for now
  getAllTables: async () => {
    try {
      return getMockTables();
    } catch (error) {
      console.error("Error loading tables:", error);
      return getMockTables(); // Fallback to mock data
    }
  },

  // Update table status - local only for now
  updateTableStatus: async (tableId, status) => {
    try {
      console.log(`Updating table ${tableId} to status: ${status}`);
      // For now, just return success without API call
      return {
        success: true,
        data: { _id: tableId, status },
      };
    } catch (error) {
      console.error("Error updating table status:", error);
      return { success: false, message: error.message };
    }
  },
};

// Mock data - ALL TABLES START AS EMPTY (RED)
const getMockTables = () => {
  const mockTables = Array.from({ length: 12 }, (_, i) => ({
    _id: `table-${i + 1}`,
    number: i + 1,
    status: "empty", // ALL TABLES START EMPTY (RED)
    capacity: i < 8 ? 4 : 6,
    currentOrder: null,
    customerName: null,
  }));

  return {
    success: true,
    data: mockTables,
  };
};
