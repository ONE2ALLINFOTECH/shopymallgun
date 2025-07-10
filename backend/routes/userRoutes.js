const express = require("express");
const router = express.Router();
const {
  sendOTP, // For registration OTP
  verifyOTP, // For registration OTP verification
  registerUser,
  saveProfileInfo,
  loginUser,
  sendForgotPasswordOTP, // For forgot password OTP
  verifyForgotPasswordOTP, // For forgot password OTP verification
  resetPassword,
  getUserProfile,
} = require("../controllers/userController");

// Registration and Profile Routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", registerUser);
router.post("/profile-info", saveProfileInfo);
router.get("/profile", getUserProfile);

// Login and Forgot Password Routes
router.post("/login", loginUser);
router.post("/forgot/send-otp", sendForgotPasswordOTP);
router.post("/forgot/verify-otp", verifyForgotPasswordOTP);
router.post("/forgot/reset-password", resetPassword);

module.exports = router;