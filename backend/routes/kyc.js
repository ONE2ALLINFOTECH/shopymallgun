const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");

const getToken = async () => {
  const res = await axios.post(`${process.env.CASHFREE_BASE_URL}/auth/token`, {
    client_id: process.env.CASHFREE_CLIENT_ID,
    client_secret: process.env.CASHFREE_CLIENT_SECRET
  });
  return res.data.data.token;
};

// Step 1: Start Aadhaar KYC
router.post("/start", async (req, res) => {
  const { name, phone, email, aadhaar, pan } = req.body;

  // ✅ Check duplicate
  const exists = await User.findOne({ $or: [{ aadhaar }, { pan }] });
  if (exists) return res.status(400).json({ message: "Aadhaar or PAN already used" });

  const referenceId = "KYC_" + Date.now();
  const token = await getToken();

  const kycRes = await axios.post(`${process.env.CASHFREE_BASE_URL}/kyc/aadhaar-otp/initiate`, {
    reference_id: referenceId,
    aadhaar_number: aadhaar
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  // Save initial data
  await User.create({ name, phone, email, aadhaar, pan, referenceId });

  res.json({ message: "OTP Sent", referenceId });
});

// Step 2: Submit OTP
router.post("/verify", async (req, res) => {
  const { referenceId, otp } = req.body;
  const token = await getToken();

  const verifyRes = await axios.post(`${process.env.CASHFREE_BASE_URL}/kyc/aadhaar-otp/submit`, {
    reference_id: referenceId,
    otp
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  // ✅ Mark user verified
  await User.findOneAndUpdate({ referenceId }, { verified: true });

  res.json({ message: "KYC Verified" });
});

module.exports = router;
