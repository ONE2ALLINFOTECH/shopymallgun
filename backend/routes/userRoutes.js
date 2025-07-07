const express = require("express");
const router = express.Router();

const {
  sendOTP,
  verifyOTP,
  registerUser,
  saveProfileInfo,
  aadhaarKYC,
  verifyAadhaarOTP,
  verifyPAN,
  sendEmailOTP,
  verifyEmailOTP,
  resetPassword,
  getUserProfile,
} = require("../controllers/userController");

// ✅ User Registration & Login
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", registerUser);

// ✅ Profile Info
router.post("/profile-info", saveProfileInfo);
router.get("/profile", getUserProfile);

// ✅ Forgot Password
router.post("/forgot/send-otp", sendEmailOTP);
router.post("/forgot/verify-otp", verifyEmailOTP);
router.post("/forgot/reset-password", resetPassword);

// ✅ KYC Routes (Aadhaar & PAN)
router.post("/aadhaar/send-otp", aadhaarKYC);
router.post("/aadhaar/verify-otp", verifyAadhaarOTP);
router.post("/pan/verify", verifyPAN);

module.exports = router;
