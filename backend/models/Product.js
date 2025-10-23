import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ["small", "medium", "large"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sku: {
      type: String,
      default: "",
    },
    cost: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    main_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Main category is required"],
    },
    sub_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Sub category is required"],
    },
    short_description: { type: String, maxlength: 140 },
    images: [{ type: String }],
    variants: [variantSchema],
    base_price: {
      type: Number,
      required: function () {
        return !(this.variants && this.variants.length);
      },
    },
    has_sizes: {
      type: Boolean,
      default: false,
    },
    // In the status field, add "unavailable" to the enum
    status: {
      type: String,
      enum: [
        "available",
        "out_of_stock",
        "unavailable",
        "disabled",
        "seasonal",
        "preorder",
      ],
      default: "available",
    },
    prep_time_minutes: { type: Number },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// Add index for better performance
productSchema.index({ main_category: 1, sub_category: 1 });
productSchema.index({ status: 1 });

export default mongoose.model("Product", productSchema);
