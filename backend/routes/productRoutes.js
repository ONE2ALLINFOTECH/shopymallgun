

const express = require("express");
const router = express.Router();
const {
  createProduct,
  checkSKUExists,
  getProductBySKU,
  updateProduct,
  deleteProduct,
  getProductCount,
  getAllProducts,
  getProductById
} = require("../controllers/productController");

const upload = require("../middleware/upload");

// ✅ Add this route to fetch all products
router.get("/", getAllProducts);

// Create product route (with image upload)
router.post("/", upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
  { name: "video", maxCount: 1 },
]), createProduct);

router.put("/:id", upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
  { name: "video", maxCount: 1 },
]), updateProduct);

router.delete("/:id", deleteProduct);

// ✅ SKU check route
router.post("/sku-check", checkSKUExists);
router.get("/sku/:sku", getProductBySKU);
router.get("/total-count", getProductCount);
router.get("/:id", getProductById); // 👈 Add this!

module.exports = router;