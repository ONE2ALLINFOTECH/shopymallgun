// routes/adminRoutes.js

const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  registerAdmin
} = require("../controllers/adminController");

// 🔐 Admin Login
router.post("/login", loginAdmin);

// 🧪 Admin Register (only for initial use, then remove or protect)
router.post("/register", registerAdmin);

module.exports = router;
