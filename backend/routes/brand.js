const express = require("express");
const router = express.Router();
const {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand
} = require("../controllers/brandController");

// CRUD Routes
router.get("/", getBrands);
router.post("/", createBrand);
router.put("/:id", updateBrand);
router.delete("/:id", deleteBrand);

module.exports = router;
