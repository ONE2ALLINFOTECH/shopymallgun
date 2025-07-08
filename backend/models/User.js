const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  emailOrMobile: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  otp: { type: String },
  otpExpires: { type: Date },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date },
  password: { type: String },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  gender: { type: String, enum: ["male", "female", "other"], trim: true },
  address: { type: String, trim: true },
  isVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);