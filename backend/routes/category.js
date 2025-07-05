const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const upload = require("../middleware/upload");

// 🆕 Use fields for multiple files
const multiUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

router.post("/", multiUpload, createCategory);
router.get("/", getCategories);
router.put("/:id", multiUpload, updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
