const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  emailOrMobile: { type: String, required: true, unique: true },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },

  // New Profile Fields
  firstName: { type: String },
  lastName: { type: String },
  gender: { type: String },
  address: { type: String },
  aadhaarNumber: { type: String },
aadhaarVerified: { type: Boolean, default: false },
aadhaarTxnId: { type: String }, // txn_id from Cashfree response
panNumber: { type: String },
panVerified: { type: Boolean, default: false },
resetOtp: { type: String },
resetOtpExpires: { type: Date },

});

module.exports = mongoose.model("User", userSchema);
