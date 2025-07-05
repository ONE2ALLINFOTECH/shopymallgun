const Subsubcategory = require("../models/Subsubcategory");
const Product = require("../models/Product");

// ➕ Create
exports.createSubsubcategory = async (req, res) => {
  try {
    const subsubcategory = await Subsubcategory.create({
      name: req.body.name,
      subcategory: req.body.subcategory,
    });
    res.json(subsubcategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 📥 Get All with Optional Search & Product Count
exports.getSubsubcategories = async (req, res) => {
  try {
    const search = req.query.search || "";
    const filter = search ? { name: { $regex: search, $options: "i" } } : {};

    const subsubcategories = await Subsubcategory.find(filter).populate("subcategory");

    const withCounts = await Promise.all(
      subsubcategories.map(async (s) => {
        const count = await Product.countDocuments({ subsubcategory: s._id });
        return { ...s._doc, productCount: count };
      })
    );

    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subsubcategories" });
  }
};

// 📤 Get by Subcategory
exports.getSubsubcategoriesBySubcategory = async (req, res) => {
  try {
    const subsubcategories = await Subsubcategory.find({
      subcategory: req.params.subcategoryId,
    });
    res.json(subsubcategories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subsubcategories" });
  }
};

// ✏️ Update
exports.updateSubsubcategory = async (req, res) => {
  try {
    const updated = await Subsubcategory.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        subcategory: req.body.subcategory,
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update subsubcategory" });
  }
};

// ❌ Delete
exports.deleteSubsubcategory = async (req, res) => {
  try {
    await Subsubcategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete subsubcategory" });
  }
};
