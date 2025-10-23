import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { type, parent } = req.query;

    let filter = {};
    if (type) filter.type = type;
    if (parent) filter.parent = parent;

    const categories = await Category.find(filter)
      .populate("parent", "name")
      .sort({ name: 1 });

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMainCategories = async (req, res) => {
  try {
    const mainCategories = await Category.find({ type: "main" }).sort({
      name: 1,
    });

    res.json({ success: true, data: mainCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;

    console.log("🔄 Fetching subcategories for parent:", parentId);

    const subcategories = await Category.find({
      type: "sub",
      parent: parentId,
    }).sort({ name: 1 });

    console.log(
      `✅ Found ${subcategories.length} subcategories for parent ${parentId}`
    );
    console.log("📦 Subcategories:", subcategories);

    res.json({ success: true, data: subcategories });
  } catch (error) {
    console.error("❌ getSubcategories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
