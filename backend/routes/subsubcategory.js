const express = require("express");
const router = express.Router();
const {
  createSubsubcategory,
  getSubsubcategories,
  getSubsubcategoriesBySubcategory,
  updateSubsubcategory,
  deleteSubsubcategory,
} = require("../controllers/subsubcategoryController");

// ➕ Create a new subsubcategory
router.post("/", createSubsubcategory);

// 📥 Get all subsubcategories (with optional search & product count)
router.get("/", getSubsubcategories);

// 📤 Get subsubcategories by subcategory
router.get("/:subcategoryId", getSubsubcategoriesBySubcategory);

// ✏️ Update subsubcategory (⬅️ Add this route for Edit support)
router.put("/:id", updateSubsubcategory);

// ❌ Delete subsubcategory
router.delete("/:id", deleteSubsubcategory);

module.exports = router;
