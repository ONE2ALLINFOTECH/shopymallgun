const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP, registerUser } = require("../controllers/userController");
const { saveProfileInfo } = require("../controllers/userController");
const { aadhaarKYC, verifyAadhaarOTP } = require("../controllers/userController");
const { verifyPAN } = require("../controllers/userController");
const {
  sendEmailOTP,
  verifyEmailOTP,
  resetPassword,
  
} = require("../controllers/userController");

const { getUserProfile } = require("../controllers/userController");
// Add this route mapping
router.post('/aadhaar/send-otp', aadhaarKYC);           // ✅ Map to your function
router.post('/aadhaar/verify-otp', verifyAadhaarOTP);   // ✅ Map to verify function
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", registerUser);
router.post("/profile-info", saveProfileInfo);
router.post("/aadhaar/send-otp", aadhaarKYC);
router.post("/aadhaar/verify-otp", verifyAadhaarOTP);
router.post("/pan/verify", verifyPAN);
router.post("/forgot/send-otp", sendEmailOTP);
router.post("/forgot/verify-otp", verifyEmailOTP);
router.post("/forgot/reset-password", resetPassword);
router.get("/profile", getUserProfile);

module.exports = router;
