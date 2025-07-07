const express = require("express");
const router = express.Router();

// Import all functions from userController
const { 
  sendOTP, 
  verifyOTP, 
  registerUser,
  saveProfileInfo,
  sendAadhaarOTP,      // Use the new function name
  verifyAadhaarOTP,
  verifyPAN,
  sendEmailOTP,
  verifyEmailOTP,
  resetPassword,
  getUserProfile
} = require("../controllers/userController");

// Basic authentication routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", registerUser);

// Profile routes
router.post("/profile-info", saveProfileInfo);
router.get("/profile", getUserProfile);

// Aadhaar KYC routes
router.post("/aadhaar/send-otp", sendAadhaarOTP);    // ✅ Use the new function
router.post("/aadhaar/verify-otp", verifyAadhaarOTP);

// PAN verification route
router.post("/pan/verify", verifyPAN);

// Password reset routes
router.post("/forgot/send-otp", sendEmailOTP);
router.post("/forgot/verify-otp", verifyEmailOTP);
router.post("/forgot/reset-password", resetPassword);

module.exports = router;