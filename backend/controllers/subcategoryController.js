const Subcategory = require("../models/Subcategory");

// ✅ CREATE Subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      category,
      description,
      status,
      isFeatured,
      sortOrder,
      metaTitle,
      metaDescription,
    } = req.body;

    const image = req.file?.path || null;

    const subcategory = await Subcategory.create({
      name,
      slug,
      category,
      description,
      image,
      status,
      isFeatured: isFeatured === "true",
      sortOrder,
      metaTitle,
      metaDescription,
    });

    res.status(201).json(subcategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ GET All Subcategories
exports.getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find()
      .populate("category")
      .sort({ createdAt: -1 });

    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
};

// ✅ GET Subcategories by Category ID
exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const subcategories = await Subcategory.find({
      category: req.params.categoryId,
    });
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subcategories by category" });
  }
};

// ✅ UPDATE Subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      category,
      description,
      status,
      isFeatured,
      sortOrder,
      metaTitle,
      metaDescription,
    } = req.body;

    const updateData = {
      name,
      slug,
      category,
      description,
      status: status === "true",
      isFeatured: isFeatured === "true",
      sortOrder,
      metaTitle,
      metaDescription,
    };

    if (req.file?.path) {
      updateData.image = req.file.path;
    }

    const updated = await Subcategory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ DELETE Subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    await Subcategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Subcategory deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
