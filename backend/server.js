
// ← Add this
// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import reportRoutes from './routes/reportRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js'; 
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js"; // ADD THIS IMPORT
import path from "path";
import { fileURLToPath } from "url";
// Add to your existing imports
import orderRoutes from "./routes/orderRoutes.js";

// Load environment variables
dotenv.config();

// Create __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images (make sure backend/uploads exists)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Add to your existing routes
app.use("/api/orders", orderRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "🍔 Restaurant POS Backend API",
    version: "2.0.0",
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      roles: '/api/roles',
      reports: '/api/reports',
      employees: '/api/employees',
       products: "/api/products",
      categories: "/api/categories", // ← Add this
    }
  
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/employees', employeeRoutes);  // ← Add this
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes); // ADD THIS ROUTE

// Add this route to debug categories - TEMPORARY
app.get("/api/debug/categories", async (req, res) => {
  try {
    // Dynamically import Category model
    const { default: Category } = await import("./models/Category.js");

    const categories = await Category.find().lean();
    console.log("🔍 ALL CATEGORIES IN DATABASE:");
    categories.forEach((cat) => {
      console.log(
        `ID: ${cat._id}, Name: ${cat.name}, Type: ${cat.type}, Parent: ${cat.parent}`
      );
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Debug categories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add this temporary route to re-seed categories
app.get("/api/reseed-categories", async (req, res) => {
  try {
    const { default: seedCategories } = await import(
      "./utils/seedCategories.js"
    );
    console.log("🌱 Manually re-seeding categories...");
    const result = await seedCategories();

    if (result) {
      res.json({
        success: true,
        message: "Categories re-seeded successfully with proper IDs!",
      });
    } else {
      res.json({
        success: false,
        message: "Category re-seeding failed",
      });
    }
  } catch (error) {
    console.error("Manual re-seed error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add this debug route to check subcategory query
app.get("/api/debug/subcategories/:parentId", async (req, res) => {
  try {
    const { parentId } = req.params;
    const { default: Category } = await import("./models/Category.js");

    console.log("🔍 Debugging subcategories for parent:", parentId);

    // Check if parent exists
    const parentCategory = await Category.findById(parentId);
    console.log("Parent category:", parentCategory);

    // Check subcategories
    const subcategories = await Category.find({
      type: "sub",
      parent: parentId,
    });

    console.log("Found subcategories:", subcategories);

    res.json({
      success: true,
      data: {
        parentExists: !!parentCategory,
        subcategoriesCount: subcategories.length,
        subcategories: subcategories,
      },
    });
  } catch (error) {
    console.error("Debug subcategories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add this route to force re-seed categories
app.get("/api/force-reseed-categories", async (req, res) => {
  try {
    console.log("🌱 FORCE RE-SEEDING CATEGORIES...");
    const { default: seedCategories } = await import(
      "./utils/seedCategories.js"
    );

    const result = await seedCategories();

    if (result) {
      res.json({
        success: true,
        message:
          "✅ Categories successfully re-seeded with proper relationships!",
      });
    } else {
      res.json({
        success: false,
        message: "❌ Category re-seeding failed",
      });
    }
  } catch (error) {
    console.error("Force re-seed error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add this route to migrate product categories after server restart
app.get("/api/migrate-product-categories", async (req, res) => {
  try {
    console.log("🔄 Migrating product categories to new category IDs...");

    const { default: Product } = await import("./models/Product.js");
    const { default: Category } = await import("./models/Category.js");

    // Get all categories
    const allCategories = await Category.find().lean();

    // Create a map of category names to IDs
    const categoryMap = {};
    allCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Get all products
    const products = await Product.find().populate(
      "main_category sub_category"
    );

    let updatedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      const updateData = {};

      // Check main category
      if (product.main_category && typeof product.main_category === "object") {
        const newMainCatId = categoryMap[product.main_category.name];
        if (
          newMainCatId &&
          newMainCatId.toString() !== product.main_category._id.toString()
        ) {
          updateData.main_category = newMainCatId;
          needsUpdate = true;
          console.log(
            `🔄 Updating main category for ${product.name}: ${product.main_category.name}`
          );
        }
      }

      // Check sub category
      if (product.sub_category && typeof product.sub_category === "object") {
        const newSubCatId = categoryMap[product.sub_category.name];
        if (
          newSubCatId &&
          newSubCatId.toString() !== product.sub_category._id.toString()
        ) {
          updateData.sub_category = newSubCatId;
          needsUpdate = true;
          console.log(
            `🔄 Updating sub category for ${product.name}: ${product.sub_category.name}`
          );
        }
      }

      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, updateData);
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `✅ Migrated ${updatedCount} products to new category IDs`,
      updatedCount,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add this TEST route to debug the category issue
app.get("/api/test-categories", async (req, res) => {
  try {
    const { default: Category } = await import("./models/Category.js");

    console.log("🔍 TEST: Checking all categories...");

    // Get ALL categories
    const allCategories = await Category.find().lean();

    // Get main categories
    const mainCategories = allCategories.filter((cat) => cat.type === "main");

    // Get subcategories
    const subcategories = allCategories.filter((cat) => cat.type === "sub");

    console.log("📊 TEST RESULTS:");
    console.log(`Total categories: ${allCategories.length}`);
    console.log(`Main categories: ${mainCategories.length}`);
    console.log(`Subcategories: ${subcategories.length}`);

    // Check if Food category exists
    const foodCategory = mainCategories.find((cat) => cat.name === "Food");
    console.log(`Food category exists: ${!!foodCategory}`);
    if (foodCategory) {
      console.log(`Food category ID: ${foodCategory._id}`);

      // Check subcategories for Food
      const foodSubcategories = subcategories.filter(
        (sub) =>
          sub.parent && sub.parent.toString() === foodCategory._id.toString()
      );
      console.log(`Food subcategories found: ${foodSubcategories.length}`);
      foodSubcategories.forEach((sub) => {
        console.log(`  - ${sub.name} (Parent: ${sub.parent})`);
      });
    }

    res.json({
      success: true,
      data: {
        totalCategories: allCategories.length,
        mainCategories: mainCategories.length,
        subcategories: subcategories.length,
        foodCategory: foodCategory
          ? {
              _id: foodCategory._id,
              name: foodCategory.name,
            }
          : null,
        foodSubcategories: foodCategory
          ? subcategories
              .filter(
                (sub) =>
                  sub.parent &&
                  sub.parent.toString() === foodCategory._id.toString()
              )
              .map((sub) => ({ name: sub.name, parent: sub.parent }))
          : [],
      },
    });
  } catch (error) {
    console.error("TEST error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware (should be after routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    // Seed categories on startup
    try {
      const { default: seedCategories } = await import(
        "./utils/seedCategories.js"
      );
      await seedCategories();
    } catch (error) {
      console.log("Category seeding skipped or failed:", error.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to database:", error.message);
    process.exit(1);
  });
