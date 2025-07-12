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
  send2FAOTP,
  verify2FA,
  disable2FA,
} = require("../controllers/userController");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", registerUser);
router.post("/profile-info", saveProfileInfo);
router.get("/profile", getUserProfile);
router.post("/login", loginUser);
router.post("/forgot/send-otp", sendForgotPasswordOTP);
router.post("/forgot/verify-otp", verifyForgotPasswordOTP);
router.post("/forgot/reset-password", resetPassword);
router.post("/send-email-otp", sendEmailOTP);
router.post("/verify-email-otp", verifyEmailOTP);
router.post("/send-2fa-otp", send2FAOTP);
router.post("/api/verify-2fa", verify2FA);
router.post("/disable-2fa", disable2FA);
router.post("/deactivate", deactivateAccount);
router.post("/delete", deleteAccount);

module.exports = router;