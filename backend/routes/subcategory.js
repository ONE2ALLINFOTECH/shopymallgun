const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createSubcategory,
  getSubcategories,
  getSubcategoriesByCategory,
  updateSubcategory,
  deleteSubcategory,
} = require("../controllers/subcategoryController");

// ✅ Cloudinary-based image upload
router.post("/", upload.single("image"), createSubcategory);
router.get("/", getSubcategories);
router.get("/:categoryId", getSubcategoriesByCategory);
router.put("/:id", upload.single("image"), updateSubcategory);
router.delete("/:id", deleteSubcategory);

module.exports = router;
