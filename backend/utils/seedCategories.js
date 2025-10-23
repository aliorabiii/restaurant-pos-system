import mongoose from "mongoose";
import Category from "../models/Category.js";

const seedCategories = async () => {
  try {
    console.log("🚀 Starting category seeding...");

    // Check if categories already exist
    const existingCategories = await Category.countDocuments();

    if (existingCategories > 0) {
      console.log(
        `✅ Categories already exist (${existingCategories} total), skipping seeding`
      );

      // Log existing categories for debugging
      const allCategories = await Category.find().lean();
      console.log("\n📊 EXISTING CATEGORIES:");
      console.log("Total categories:", allCategories.length);
      console.log(
        "Main categories:",
        allCategories.filter((c) => c.type === "main").length
      );
      console.log(
        "Subcategories:",
        allCategories.filter((c) => c.type === "sub").length
      );

      return true;
    }

    console.log(
      "📝 No existing categories found, creating default categories..."
    );

    // Create main categories
    const mainCategories = [
      { name: "Food", type: "main", description: "Main food category" },
      { name: "Drinks", type: "main", description: "Beverages and drinks" },
      {
        name: "Desserts",
        type: "main",
        description: "Sweet treats and desserts",
      },
      {
        name: "Side Dishes",
        type: "main",
        description: "Side dishes and additions",
      },
    ];

    console.log("📝 Creating main categories...");
    const createdMainCategories = await Category.insertMany(mainCategories);
    console.log(
      "✅ Created main categories:",
      createdMainCategories.map((cat) => cat.name)
    );

    // Create subcategories
    const subcategories = [
      // Food subcategories
      { name: "Appetizers", type: "sub", parent: createdMainCategories[0]._id },
      {
        name: "Combo Meals",
        type: "sub",
        parent: createdMainCategories[0]._id,
      },
      { name: "Salads", type: "sub", parent: createdMainCategories[0]._id },
      { name: "Snacks", type: "sub", parent: createdMainCategories[0]._id },
      { name: "Burgers", type: "sub", parent: createdMainCategories[0]._id },
      { name: "Shwarma", type: "sub", parent: createdMainCategories[0]._id },
      { name: "Kids Meals", type: "sub", parent: createdMainCategories[0]._id },
      {
        name: "Special Offers",
        type: "sub",
        parent: createdMainCategories[0]._id,
      },

      // Drinks subcategories
      {
        name: "Soft Drinks",
        type: "sub",
        parent: createdMainCategories[1]._id,
      },
      {
        name: "Hot Beverages",
        type: "sub",
        parent: createdMainCategories[1]._id,
      },
      {
        name: "Fresh Juices",
        type: "sub",
        parent: createdMainCategories[1]._id,
      },
      { name: "Smoothies", type: "sub", parent: createdMainCategories[1]._id },
      { name: "Cocktails", type: "sub", parent: createdMainCategories[1]._id },

      // Desserts subcategories
      { name: "Crepe", type: "sub", parent: createdMainCategories[2]._id },
      { name: "Waffle", type: "sub", parent: createdMainCategories[2]._id },
      { name: "Pancake", type: "sub", parent: createdMainCategories[2]._id },
      { name: "Ice Cream", type: "sub", parent: createdMainCategories[2]._id },
      { name: "Cakes", type: "sub", parent: createdMainCategories[2]._id },

      // Side Dishes subcategories
      { name: "Fries", type: "sub", parent: createdMainCategories[3]._id },
      {
        name: "Dips and Sauces",
        type: "sub",
        parent: createdMainCategories[3]._id,
      },
      {
        name: "Mini Starters",
        type: "sub",
        parent: createdMainCategories[3]._id,
      },
      {
        name: "Bread and Add-ons",
        type: "sub",
        parent: createdMainCategories[3]._id,
      },
    ];

    console.log("📝 Creating subcategories...");
    const createdSubcategories = await Category.insertMany(subcategories);
    console.log("✅ Created subcategories:", createdSubcategories.length);

    // Verify the data
    const allCategories = await Category.find().lean();
    console.log("\n📊 FINAL CATEGORY COUNT:");
    console.log("Total categories:", allCategories.length);
    console.log(
      "Main categories:",
      allCategories.filter((c) => c.type === "main").length
    );
    console.log(
      "Subcategories:",
      allCategories.filter((c) => c.type === "sub").length
    );

    // Log some sample relationships
    const foodSubs = allCategories.filter(
      (c) =>
        c.type === "sub" &&
        c.parent &&
        c.parent.toString() === createdMainCategories[0]._id.toString()
    );
    console.log(`\n🔗 Food has ${foodSubs.length} subcategories:`);
    foodSubs.forEach((sub) => console.log(`   - ${sub.name}`));

    return true;
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    return false;
  }
};

export default seedCategories;
