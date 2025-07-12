const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  emailOrMobile: { type: String, required: true, unique: true },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  firstName: { type: String },
  lastName: { type: String },
  gender: { type: String },
  address: { type: String },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date },
  isActive: { type: Boolean, default: true },
  google2FASecret: { type: String }, // Added for 2FA secret
  is2FAEnabled: { type: Boolean, default: false }, // Added for 2FA status
});

module.exports = mongoose.model("User", userSchema);