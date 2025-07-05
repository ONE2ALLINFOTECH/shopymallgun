const Brand = require("../models/Brand");
const Product = require("../models/Product"); // Make sure this exists and has 'brand' field

// ➕ Create Brand
exports.createBrand = async (req, res) => {
  try {
    const brand = await Brand.create({
      name: req.body.name,
      subsubcategory: req.body.subsubcategory,
    });
    res.json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 📥 Get All Brands with Subsubcategory + Product Count
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().populate("subsubcategory");

    // Add product count for each brand
    const brandWithCount = await Promise.all(
      brands.map(async (brand) => {
        const count = await Product.countDocuments({ brand: brand._id });
        return {
          ...brand.toObject(),
          productCount: count,
        };
      })
    );

    res.json(brandWithCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Brand
exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        subsubcategory: req.body.subsubcategory,
      },
      { new: true }
    );
    res.json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ❌ Delete Brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: "Brand deleted", id: brand._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
