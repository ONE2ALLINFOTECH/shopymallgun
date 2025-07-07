const User = require("../models/User");
const axios = require("axios");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer"); // Move this to the top

const sendOTP = async (req, res) => {
  const { emailOrMobile } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiry = new Date(Date.now() + 10 * 60000);
  
  console.log("🔍 BREVO_EMAIL:", process.env.BREVO_EMAIL);
  console.log("🔍 BREVO_KEY:", process.env.BREVO_KEY ? "✅ Present" : "❌ Missing");
  
  try {
    const isEmail = emailOrMobile.includes("@");

    let user = await User.findOne({ emailOrMobile });
    if (!user) user = new User({ emailOrMobile });

    user.otp = otp;
    user.otpExpires = expiry;

    if (isEmail) {
      const transporter = nodemailer.createTransporter({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.BREVO_EMAIL,
          pass: process.env.BREVO_KEY,
        },
      });

      const mailOptions = {
        from: `"Shopymol OTP" <no-reply@shopymol.com>`,
        to: emailOrMobile,
        subject: "Shopymol OTP Verification",
        text: `Your OTP for Shopymol registration is ${otp}. It is valid for 10 minutes.`,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email Sent:", info.response);
    } else {
      const msg = `Your Shopymol login OTP is ${otp}. Do not share it with anyone.`;
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=368214D9E23633&campaign=8559&routeid=18&type=text&contacts=${emailOrMobile}&senderid=SHPMOL&msg=${encodeURIComponent(msg)}`;
      await axios.get(url);
    }

    await user.save();
    res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    console.error("❌ Error sending OTP:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "OTP send failed" });
    }
  }
};

const verifyOTP = async (req, res) => {
  const { emailOrMobile, otp } = req.body;
  
  try {
    const user = await User.findOne({ emailOrMobile });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error.message);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

const registerUser = async (req, res) => {
  const { emailOrMobile, password } = req.body;
  
  try {
    const user = await User.findOne({ emailOrMobile });

    if (!user || !user.isVerified) {
      return res.status(400).json({ error: "OTP not verified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Error registering user:", error.message);
    res.status(500).json({ error: "User registration failed" });
  }
};

const saveProfileInfo = async (req, res) => {
  const { emailOrMobile, firstName, lastName, gender, address } = req.body;

  try {
    const user = await User.findOne({ emailOrMobile });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.gender = gender;
    user.address = address;

    await user.save();

    res.json({ success: true, message: "Profile info saved" });
  } catch (error) {
    console.error("❌ Error saving profile:", error.message);
    res.status(500).json({ error: "Error saving profile" });
  }
};

// This should be your Aadhaar send OTP function
const sendAadhaarOTP = async (req, res) => {
  const { emailOrMobile, aadhaarNumber } = req.body;

  console.log("🔍 Aadhaar OTP Request:", { emailOrMobile, aadhaarNumber });

  try {
    // Validate input
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      return res.status(400).json({ error: "Invalid Aadhaar number" });
    }

    // Check environment variables
    if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
      console.error("❌ Missing Cashfree credentials");
      return res.status(500).json({ error: "Service configuration error" });
    }

    const user = await User.findOne({ emailOrMobile });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User found:", user.emailOrMobile);

    const response = await axios.post(
      "https://sandbox.cashfree.com/kyc/v2/aadhaar/verify",
      {
        aadhaar_number: aadhaarNumber,
        consent: "Y",
        reason: "KYC for onboarding",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "1.0",
        },
      }
    );

    console.log("✅ Cashfree Response:", response.data);

    const txnId = response.data.txn_id;

    // Save Aadhaar info
    user.aadhaarNumber = aadhaarNumber;
    user.aadhaarTxnId = txnId;
    await user.save();

    res.json({ success: true, txnId, message: "Aadhaar OTP sent successfully" });
  } catch (error) {
    console.error("❌ Aadhaar OTP Error:", error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ error: "Invalid API credentials" });
    }
    
    res.status(500).json({ 
      error: "Aadhaar OTP request failed",
      details: error.response?.data?.message || error.message
    });
  }
};

// Keep your existing aadhaarKYC function for backward compatibility
const aadhaarKYC = async (req, res) => {
  // This is the same as sendAadhaarOTP - you can remove this if not needed
  return sendAadhaarOTP(req, res);
};

const verifyAadhaarOTP = async (req, res) => {
  const { emailOrMobile, otp } = req.body;

  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user || !user.aadhaarTxnId) {
      return res.status(404).json({ error: "Invalid request" });
    }

    const verifyResponse = await axios.post(
      "https://sandbox.cashfree.com/kyc/v2/aadhaar/verify/otp",
      {
        otp,
        txn_id: user.aadhaarTxnId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "1.0",
        },
      }
    );

    console.log("✅ Aadhaar OTP Verification Response:", verifyResponse.data);

    user.aadhaarVerified = true;
    user.aadhaarTxnId = null; // Clear transaction ID after verification
    await user.save();

    res.json({ success: true, message: "Aadhaar verified successfully" });
  } catch (error) {
    console.error("❌ Aadhaar OTP Verification Error:", error.response?.data || error.message);
    res.status(400).json({ 
      error: "Aadhaar OTP verification failed",
      details: error.response?.data?.message || error.message
    });
  }
};

const verifyPAN = async (req, res) => {
  const { emailOrMobile, panNumber } = req.body;

  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) return res.status(404).json({ error: "User not found" });

    const response = await axios.post(
      "https://sandbox.cashfree.com/kyc/v2/pan/verify",
      {
        pan: panNumber,
        consent: "Y",
        reason: "PAN verification for KYC",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "1.0",
        },
      }
    );

    const { status } = response.data;

    if (status !== "SUCCESS") {
      return res.status(400).json({ error: "PAN not verified" });
    }

    user.panNumber = panNumber;
    user.panVerified = true;
    await user.save();

    res.json({ success: true, message: "PAN verified successfully" });
  } catch (error) {
    console.error("❌ PAN Verification Error:", error.response?.data || error.message);
    res.status(400).json({ 
      error: "PAN verification failed",
      details: error.response?.data?.message || error.message
    });
  }
};

const sendEmailOTP = async (req, res) => {
  const { emailOrMobile } = req.body;

  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 10 * 60000);

    user.resetOtp = otp;
    user.resetOtpExpires = expiry;
    await user.save();

    const transporter = nodemailer.createTransporter({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_KEY,
      },
    });

    const mailOptions = {
      from: `"ONE2ALL DEVELOPERS" <${process.env.BREVO_EMAIL}>`,
      to: emailOrMobile,
      subject: "Password Reset OTP - Shopymol",
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("❌ Email OTP Error:", error.message);
    res.status(500).json({ error: "Failed to send email OTP" });
  }
};

const verifyEmailOTP = async (req, res) => {
  const { emailOrMobile, otp } = req.body;

  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("❌ Email OTP Verification Error:", error.message);
    res.status(500).json({ error: "Email OTP verification failed" });
  }
};

const resetPassword = async (req, res) => {
  const { emailOrMobile, password } = req.body;

  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Password Reset Error:", error.message);
    res.status(500).json({ error: "Password reset failed" });
  }
};

const getUserProfile = async (req, res) => {
  const { emailOrMobile } = req.query;

  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      emailOrMobile: user.emailOrMobile,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      address: user.address,
      aadhaarVerified: user.aadhaarVerified,
      panVerified: user.panVerified,
    });
  } catch (error) {
    console.error("❌ Get Profile Error:", error.message);
    res.status(500).json({ error: "Error fetching profile" });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  registerUser,
  saveProfileInfo,
  sendAadhaarOTP,    // Add this new function
  aadhaarKYC,        // Keep for backward compatibility
  verifyAadhaarOTP,
  verifyPAN,
  sendEmailOTP,
  verifyEmailOTP,
  resetPassword,
  getUserProfile
};