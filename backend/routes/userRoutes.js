const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP, registerUser } = require("../controllers/userController");
const { saveProfileInfo } = require("../controllers/userController");

const {
  sendEmailOTP,
  verifyEmailOTP,
  resetPassword,
   updateProfile,
  deleteProfile,
} = require("../controllers/userController");

const { getUserProfile } = require("../controllers/userController");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", registerUser);
router.post("/profile-info", saveProfileInfo);

router.post("/forgot/send-otp", sendEmailOTP);
router.post("/forgot/verify-otp", verifyEmailOTP);
router.post("/forgot/reset-password", resetPassword);
router.get("/profile", getUserProfile);
router.put("/update-profile", updateProfile);
router.delete("/delete-profile", deleteProfile);
module.exports = router;

