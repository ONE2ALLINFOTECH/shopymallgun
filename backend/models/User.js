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
  twoFactorSecret: { type: String }, // Added for Google Authenticator TOTP secret
  twoFactorEnabled: { type: Boolean, default: false }, // Added to track if 2FA is enabled
});

module.exports = mongoose.model("User", userSchema);