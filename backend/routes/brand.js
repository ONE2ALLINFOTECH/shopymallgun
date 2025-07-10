// routes/brand.js

const express = require("express");
const router = express.Router();

const {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand
} = require("../controllers/brandController");

// 📦 Brand CRUD Routes
router.get("/", getBrands);          // Get all brands
router.post("/", createBrand);       // Create brand
router.put("/:id", updateBrand);     // Update brand by ID
router.delete("/:id", deleteBrand);  // Delete brand by ID

module.exports = router;
