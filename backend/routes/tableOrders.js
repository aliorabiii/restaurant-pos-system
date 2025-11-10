const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Table = require("../models/Table"); // You'll need a Table model

// Get active order for a table
router.get("/table/:tableId/active-order", async (req, res) => {
  try {
    const order = await Order.findOne({
      tableId: req.params.tableId,
      status: "active", // active, completed, cancelled
    }).populate("items.product");

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create or update table order
router.post("/table/:tableId/order", async (req, res) => {
  try {
    const { items, cashier, paymentMethod } = req.body;

    // Find existing active order
    let order = await Order.findOne({
      tableId: req.params.tableId,
      status: "active",
    });

    if (order) {
      // Update existing order
      order.items = items;
      order.updatedAt = new Date();
    } else {
      // Create new order
      order = new Order({
        tableId: req.params.tableId,
        tableNumber: req.body.tableNumber,
        items,
        cashier,
        paymentMethod,
        status: "active",
        orderNumber: `T${req.params.tableId}-${Date.now()}`,
      });
    }

    await order.save();

    // Update table status
    await Table.findByIdAndUpdate(req.params.tableId, {
      status: "occupied",
      currentOrder: order._id,
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete table order (payment)
router.post("/table/:tableId/complete", async (req, res) => {
  try {
    const order = await Order.findOne({
      tableId: req.params.tableId,
      status: "active",
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "No active order found" });
    }

    // Update order status
    order.status = "completed";
    order.paymentMethod = req.body.paymentMethod;
    order.paidAt = new Date();
    await order.save();

    // Free the table
    await Table.findByIdAndUpdate(req.params.tableId, {
      status: "empty",
      currentOrder: null,
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
