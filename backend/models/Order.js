import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  variant: {
    size: String,
    price: Number,
  },
  subCategory: {
    type: String,
    required: true,
  },
});

// Add delivery timestamps schema
const deliveryTimestampsSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  outAt: {
    type: Date,
    default: null,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [orderItemSchema],
    itemNames: [String],
    subCategories: [String],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    tip: {
      type: Number,
      default: 0,
      min: 0,
    },
    orderType: {
      type: String,
      enum: ["inside", "delivery"],
      default: "inside",
    },
    deliveryInfo: {
      customerName: {
        type: String,
        default: null,
      },
      customerPhone: {
        type: String,
        default: null,
      },
      customerAddress: {
        type: String,
        default: null,
      },
      deliveryCost: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    // MAKE DELIVERY TIMESTAMPS OPTIONAL
    deliveryTimestamps: {
      type: deliveryTimestampsSchema,
      default: null, // Set default to null instead of empty object
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "credit_card", "mobile"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderType: 1 }); // Add index for orderType

export default mongoose.model("Order", orderSchema);
