import Product from "../models/Product.js";
import mongoose from "mongoose";

// Create product
export const createProduct = async (req, res) => {
  try {
    console.log("=== CREATE PRODUCT REQUEST ===");
    console.log("Request body:", req.body);

    const payload = { ...req.body };

    // If req.files includes images, store their paths
    if (req.files && req.files.length) {
      payload.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    // Convert string IDs to ObjectId
    if (payload.main_category) {
      payload.main_category = new mongoose.Types.ObjectId(
        payload.main_category
      );
    }
    if (payload.sub_category) {
      payload.sub_category = new mongoose.Types.ObjectId(payload.sub_category);
    }

    // Convert has_sizes to boolean
    if (payload.has_sizes) {
      payload.has_sizes = payload.has_sizes === "true";
    }

    // Handle variants if has_sizes is true
    if (payload.has_sizes && payload.variants) {
      try {
        payload.variants = JSON.parse(payload.variants);
      } catch (e) {
        console.log("Variants parsing failed, using as is");
      }
    }

    const createdBy = req.user?._id;

    console.log("Final payload before creation:", payload);

    const product = await Product.create({
      ...payload,
      created_by: createdBy,
      updated_by: createdBy,
    });

    // Populate category names for response
    await product.populate("main_category", "name");
    await product.populate("sub_category", "name");

    console.log("Product created successfully:", product._id);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("createProduct error", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update the getProducts function to handle pagination AND POS mode
export const getProducts = async (req, res) => {
  try {
    console.log("🔄 Fetching products with filters:", req.query);

    const {
      subcategory,
      maincategory,
      status,
      page = 1,
      limit = 15,
      pos = false,
      search = "", // 👈 NEW
    } = req.query;

    let filter = {};

    if (subcategory) filter.sub_category = subcategory;
    if (maincategory) filter.main_category = maincategory;
    if (status) filter.status = status;

    // 👇 NEW: name search (case-insensitive)
    if (search && typeof search === "string") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // POS mode: still apply filters, but no pagination
    if (pos === "true") {
      const products = await Product.find(filter)
        .populate("main_category", "name")
        .populate("sub_category", "name")
        .sort({ name: 1 })
        .lean();

      console.log(
        `✅ POS Mode: Found ${products.length} products (all products)`
      );

      return res.json({
        success: true,
        data: products,
        total: products.length,
        isPOS: true,
      });
    }

    // Regular pagination logic for admin panel
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("main_category", "name")
      .populate("sub_category", "name")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    console.log(
      `✅ Admin Mode: Found ${products.length} products on page ${page}`
    );

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalProducts / limitNum),
        totalProducts,
        productsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalProducts / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("❌ getProducts error", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product - FIXED VERSION
export const getProductById = async (req, res) => {
  try {
    console.log("🔄 Fetching single product with population...");

    const product = await Product.findById(req.params.id)
      .populate("main_category", "name")
      .populate("sub_category", "name")
      .lean();

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    console.log("📦 Single product after population:", {
      name: product.name,
      main_category: product.main_category,
      sub_category: product.sub_category,
    });

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("❌ getProductById error", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    console.log("=== UPDATE PRODUCT REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Files:", req.files);

    const payload = { ...req.body };

    // If req.files includes images, store their paths
    if (req.files && req.files.length) {
      payload.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    // Convert string IDs to ObjectId
    if (payload.main_category) {
      payload.main_category = new mongoose.Types.ObjectId(
        payload.main_category
      );
    }
    if (payload.sub_category) {
      payload.sub_category = new mongoose.Types.ObjectId(payload.sub_category);
    }

    // Convert has_sizes to boolean
    if (payload.has_sizes) {
      payload.has_sizes = payload.has_sizes === "true";
    }

    // Handle variants if has_sizes is true - UPDATED VERSION
    if (payload.has_sizes && payload.variants) {
      try {
        // Parse the variants JSON string
        if (typeof payload.variants === "string") {
          const parsedVariants = JSON.parse(payload.variants);

          // Ensure each variant has the correct structure
          payload.variants = parsedVariants.map((variant) => ({
            size: variant.size,
            price: parseFloat(variant.price) || 0,
            sku: variant.sku || "",
            cost: variant.cost ? parseFloat(variant.cost) : undefined,
          }));
        }
      } catch (e) {
        console.log("Variants parsing failed:", e.message);
        // If parsing fails, set to empty array
        payload.variants = [];
      }
    } else if (!payload.has_sizes) {
      // If no sizes, ensure variants is empty
      payload.variants = [];
    }

    payload.updated_by = req.user?._id;

    console.log("Final payload before update:", payload);

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // Populate category names for response
    await product.populate("main_category", "name");
    await product.populate("sub_category", "name");

    console.log("Product updated successfully:", product._id);
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("updateProduct error", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
