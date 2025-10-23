import Order from "../models/Order.js";
import mongoose from "mongoose";

// Create new order
export const createOrder = async (req, res) => {
  try {
    console.log("=== CREATE ORDER REQUEST ===");
    console.log("Request body:", req.body);

    const orderData = {
      ...req.body,
      createdBy: req.user?._id,
    };

    const order = await Order.create(orderData);

    console.log("✅ Order created successfully:", order.orderNumber);
    res.status(201).json({
      success: true,
      data: order,
      message: "Order saved successfully",
    });
  } catch (error) {
    console.error("❌ createOrder error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    let filter = {};

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("❌ getOrders error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("❌ getOrderById error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get daily sales report
export const getDailySales = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const dailyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          totalTax: { $sum: "$tax" },
          totalSubtotal: { $sum: "$subtotal" },
          averageOrderValue: { $avg: "$total" },
        },
      },
    ]);

    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: "completed",
    }).sort({ createdAt: -1 });

    const result = dailyOrders[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalTax: 0,
      totalSubtotal: 0,
      averageOrderValue: 0,
    };

    res.json({
      success: true,
      data: {
        ...result,
        orders: orders,
        date: startOfDay.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("❌ getDailySales error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
