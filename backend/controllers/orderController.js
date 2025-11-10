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



// Update delivery status
export const updateDeliveryStatus = (action) => async (req, res) => {
  try {
    const { id } = req.params;

    console.log(
      `🔄 Updating delivery status for order ${id}, action: ${action}`
    );

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderType !== "delivery") {
      return res.status(400).json({
        success: false,
        message: "Not a delivery order",
      });
    }

    const now = new Date();
    let updateData = {};

    // Initialize deliveryTimestamps if it doesn't exist
    if (!order.deliveryTimestamps) {
      order.deliveryTimestamps = {
        createdAt: order.createdAt,
        outAt: null,
        deliveredAt: null,
      };
      await order.save();
    }

    if (action === "out") {
      // Set outAt time
      updateData = {
        "deliveryTimestamps.outAt": now,
      };
      console.log(`✅ Setting outAt to: ${now}`);
    } else if (action === "delivered") {
      // Verify that outAt exists before setting deliveredAt
      if (!order.deliveryTimestamps.outAt) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot mark as delivered before marking as out for delivery",
        });
      }
      updateData = {
        "deliveryTimestamps.deliveredAt": now,
      };
      console.log(`✅ Setting deliveredAt to: ${now}`);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("items.productId");

    console.log(`✅ Successfully updated order ${id}`);

    res.json({
      success: true,
      message: `Delivery status updated successfully`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error updating delivery status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating delivery status",
      error: error.message,
    });
  }
};
