const Category = require("../models/Category");

// ✅ Create Category
exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      metaTitle,
      metaDescription,
      status,
      isFeatured,
    } = req.body;

    const image = req.files?.image?.[0]?.path;
    const banner = req.files?.banner?.[0]?.path;

    const category = await Category.create({
      name,
      description,
      image,
      banner,
      metaTitle,
      metaDescription,
      status: status === "true", // formData sends strings
      isFeatured: isFeatured === "true",
    });

    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get All Categories
exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json(categories);
};

// ✅ Update Category
exports.updateCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      metaTitle,
      metaDescription,
      status,
      isFeatured,
    } = req.body;

    const updatedData = {
      name,
      description,
      metaTitle,
      metaDescription,
      status: status === "true",
      isFeatured: isFeatured === "true",
    };

    if (req.files?.image?.[0]) {
      updatedData.image = req.files.image[0].path;
    }

    if (req.files?.banner?.[0]) {
      updatedData.banner = req.files.banner[0].path;
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
