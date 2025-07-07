// In your routes file (e.g., routes/user.js)
const express = require('express');
const router = express.Router();
const { 
  sendOTP, 
  verifyOTP, 
  registerUser, 
  saveProfileInfo, 
  sendAadhaarOTP,    // Use this for the /aadhaar/send-otp endpoint
  verifyAadhaarOTP, 
  verifyPAN,
  sendEmailOTP,
  verifyEmailOTP,
  resetPassword,
  getUserProfile
} = require('../controllers/userController');

// Existing routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', registerUser);
router.post('/save-profile', saveProfileInfo);

// Aadhaar routes
router.post('/aadhaar/send-otp', sendAadhaarOTP);  // This should match your frontend call
router.post('/aadhaar/verify-otp', verifyAadhaarOTP);

// PAN route
router.post('/pan/verify', verifyPAN);

// Password reset routes
router.post('/forgot-password', sendEmailOTP);
router.post('/verify-reset-otp', verifyEmailOTP);
router.post('/reset-password', resetPassword);

// Profile route
router.get('/profile', getUserProfile);

module.exports = router;