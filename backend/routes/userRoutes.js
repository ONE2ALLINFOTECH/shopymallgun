
const express = require("express");
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  registerUser,
  saveProfileInfo,
  loginUser,
  sendEmailOTP,
  verifyEmailOTP,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
  getUserProfile,
  deactivateAccount,
  deleteAccount,
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
router.post("/send-email-otp", sendEmailOTP);
router.post("/verify-email-otp", verifyEmailOTP);

// New Routes for Deactivate and Delete
router.post("/deactivate", deactivateAccount);
router.post("/delete", deleteAccount);

module.exports = router;
