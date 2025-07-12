const User = require("../models/User");
const axios = require("axios");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Google2FA = require("pragmarx/google2fa");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");

const google2fa = new Google2FA();

// Existing functions (sendOTP, verifyOTP, registerUser, etc.) remain unchanged
const sendOTP = async (req, res) => {
  const { emailOrMobile, isRegistration = false } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiry = new Date(Date.now() + 10 * 60000);

  try {
    const isEmail = emailOrMobile.includes("@");
    let normalizedInput = emailOrMobile;

    if (!isEmail) {
      normalizedInput = emailOrMobile.replace(/\D/g, "");
      if (normalizedInput.length === 10) {
        normalizedInput = `91${normalizedInput}`;
      }
      if (!/^\+?91\d{10}$/.test(normalizedInput)) {
        return res.status(400).json({ error: "Invalid mobile number format. Use +91XXXXXXXXXX or XXXXXXXXXX" });
      }
    }

    let user = await User.findOne({ emailOrMobile: normalizedInput });

    if (isRegistration && user) {
      return res.status(400).json({ error: "Email or mobile already exists" });
    }

    if (!user) {
      user = new User({ emailOrMobile: normalizedInput });
    }

    user.otp = otp;
    user.otpExpires = expiry;
    await user.save();

    console.log(`Generated OTP: ${otp} for ${normalizedInput}`);

    if (isEmail) {
      const transporter = nodemailer.createTransport({
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
        text: `Your Shopymol login OTP is ${otp}. Do not share it with anyone.`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email OTP sent to ${emailOrMobile}`);
    } else {
      const msg = `Your Shopymol login OTP is ${otp}. Do not share it with anyone.`;
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=368214D9E23633&campaign=8559&routeid=18&type=text&contacts=${normalizedInput}&senderid=SHPMOL&msg=${encodeURIComponent(msg)}`;
      try {
        const response = await axios.get(url);
        console.log(`SMS API response for ${normalizedInput}:`, response.data);
      } catch (smsError) {
        console.error(`SMS API error for ${normalizedInput}:`, smsError.response?.data || smsError.message);
        return res.status(500).json({ error: "Failed to send SMS OTP" });
      }
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error.message);
    res.status(500).json({ error: "OTP send failed" });
  }
};

const verifyOTP = async (req, res) => {
  const { emailOrMobile, otp } = req.body;

  if (!emailOrMobile || !otp) {
    return res.status(400).json({ error: "Email/mobile and OTP are required" });
  }

  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) {
      normalizedInput = `91${normalizedInput}`;
    }
  }

  const user = await User.findOne({
    $or: [
      { emailOrMobile: normalizedInput },
      { emailOrMobile: normalizedInput.replace(/^91/, "") },
    ],
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.json({ success: true, message: "OTP verified successfully" });
};

const registerUser = async (req, res) => {
  const { emailOrMobile, password } = req.body;
  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) {
      normalizedInput = `91${normalizedInput}`;
    }
  }

  const user = await User.findOne({ emailOrMobile: normalizedInput });

  if (!user || !user.isVerified) {
    return res.status(400).json({ error: "OTP not verified" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();

  res.json({ success: true, message: "User registered successfully" });
};

const saveProfileInfo = async (req, res) => {
  const { emailOrMobile, firstName, lastName, gender } = req.body;
  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) {
      normalizedInput = `91${normalizedInput}`;
    }
  }

  try {
    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (gender) user.gender = gender;

    await user.save();

    res.json({
      success: true,
      message: "Profile info saved successfully",
      data: {
        emailOrMobile: user.emailOrMobile,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
      },
    });
  } catch (err) {
    console.error("❌ Error saving profile:", err.message);
    res.status(500).json({ error: "Error saving profile" });
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

    console.log(`Generated Reset OTP: ${otp} for ${emailOrMobile}`);

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_KEY,
      },
    });

    const mailOptions = {
      from: `"Shopymol" <${process.env.BREVO_EMAIL}>`,
      to: emailOrMobile,
      subject: "Password Reset OTP - Shopymol",
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset Email OTP sent to ${emailOrMobile}`);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("❌ Error sending reset OTP:", err.message);
    res.status(500).json({ error: "Failed to send email OTP" });
  }
};

const verifyEmailOTP = async (req, res) => {
  const { emailOrMobile, otp } = req.body;

  const user = await User.findOne({ emailOrMobile });
  if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  res.json({ success: true, message: "OTP verified" });
};

const getUserProfile = async (req, res) => {
  const { emailOrMobile } = req.query;
  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) {
      normalizedInput = `91${normalizedInput}`;
    }
  }

  try {
    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      emailOrMobile: user.emailOrMobile,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      address: user.address,
      isVerified: user.isVerified,
      is2FAEnabled: user.is2FAEnabled, // Added for 2FA status
    });
  } catch (err) {
    console.error("❌ Error fetching profile:", err.message);
    res.status(500).json({ error: "Error fetching profile" });
  }
};

const loginUser = async (req, res) => {
  const { emailOrMobile, password } = req.body;
  let normalizedInput = emailOrMobile;

  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) normalizedInput = `91${normalizedInput}`;
  }

  try {
    console.log("[Backend] Login attempt for:", normalizedInput);

    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      console.log("[Backend] User not found for:", normalizedInput);
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ error: "Password not set. Use OTP login or reset password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    if (user.is2FAEnabled) {
      // Return a temporary token for 2FA verification
      const tempToken = jwt.sign({ id: user._id, requires2FA: true }, process.env.JWT_SECRET, { expiresIn: "5m" });
      return res.json({ success: true, message: "2FA required", tempToken, emailOrMobile: user.emailOrMobile });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, message: "Login successful", token, emailOrMobile: user.emailOrMobile });
  } catch (err) {
    console.error("[Backend] Login Error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};

const sendForgotPasswordOTP = async (req, res) => {
  const { emailOrMobile } = req.body;

  let normalizedInput = emailOrMobile;
  const isEmail = emailOrMobile.includes("@");

  if (!isEmail) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) normalizedInput = `91${normalizedInput}`;
  }

  try {
    console.log("[Backend] Finding user for OTP:", normalizedInput);

    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      console.log("[Backend] User not found:", normalizedInput);
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log("[Backend] OTP generated:", otp);

    const msg = `Your Shopymol password reset OTP is ${otp}. Valid for 10 minutes.`;

    if (isEmail) {
      const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.BREVO_EMAIL,
          pass: process.env.BREVO_KEY,
        },
      });

      const mailOptions = {
        from: `"Shopymol" <${process.env.BREVO_EMAIL}>`,
        to: emailOrMobile,
        subject: "Password Reset OTP - Shopymol",
        text: msg,
      };

      await transporter.sendMail(mailOptions);
      console.log("[Email] OTP sent to:", emailOrMobile);
    } else {
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=368214D9E23633&campaign=8559&routeid=18&type=text&contacts=${normalizedInput}&senderid=SHPMOL&msg=${encodeURIComponent(msg)}`;

      try {
        const response = await axios.get(url);
        console.log(`[SMS] Sent to ${normalizedInput}:`, response.data);
      } catch (smsError) {
        console.error(`[SMS ERROR] for ${normalizedInput}:`, smsError.response?.data || smsError.message);
        return res.status(500).json({ error: "Failed to send SMS OTP" });
      }
    }

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("[Backend] Forgot Password OTP Error:", err.message);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

const verifyForgotPasswordOTP = async (req, res) => {
  const { emailOrMobile, otp } = req.body;

  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) normalizedInput = `91${normalizedInput}`;
  }

  try {
    console.log("[Backend] Verifying OTP for:", normalizedInput);

    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    console.log("[Backend] OTP verified and cleared");
    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("[Backend] Verify Forgot Password OTP Error:", err.message);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

const resetPassword = async (req, res) => {
  const { emailOrMobile, password } = req.body;

  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) normalizedInput = `91${normalizedInput}`;
  }

  try {
    console.log("[Backend] Resetting password for:", normalizedInput);

    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    console.log("[Backend] Password reset successful");
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("[Backend] Reset Password Error:", err.message);
    res.status(500).json({ error: "Password reset failed" });
  }
};

const deactivateAccount = async (req, res) => {
  const { emailOrMobile } = req.body;
  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) {
      normalizedInput = `91${normalizedInput}`;
    }
  }

  try {
    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.json({ success: true, message: "Account deactivated successfully" });
  } catch (err) {
    console.error("❌ Error deactivating account:", err.message);
    res.status(500).json({ error: "Failed to deactivate account" });
  }
};

const deleteAccount = async (req, res) => {
  const { emailOrMobile } = req.body;
  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) {
      normalizedInput = `91${normalizedInput}`;
    }
  }

  try {
    const user = await User.findOneAndDelete({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting account:", err.message);
    res.status(500).json({ error: "Failed to delete account" });
  }
};

// New 2FA functions
const send2FAOTP = async (req, res) => {
  const { emailOrMobile } = req.body;
  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) normalizedInput = `91${normalizedInput}`;
  }

  try {
    console.log("[Backend] Enabling 2FA for:", normalizedInput);
    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      console.log("[Backend] User not found:", normalizedInput);
      return res.status(404).json({ error: "User not found" });
    }

    if (user.is2FAEnabled) {
      return res.status(400).json({ error: "2FA already enabled" });
    }

    const secret = google2fa.generateSecret(16);
    user.google2FASecret = secret;
    await user.save();

    const qrCodeUrl = google2fa.getQRCodeUrl(
      "Shopymol",
      user.emailOrMobile,
      secret
    );

    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);
    console.log("[Backend] 2FA QR code generated for:", normalizedInput);

    res.json({ success: true, message: "Scan the QR code with Google Authenticator", qrCode: qrCodeImage, secret });
  } catch (err) {
    console.error("[Backend] 2FA Setup Error:", err.message);
    res.status(500).json({ error: "Failed to set up 2FA" });
  }
};

const verify2FA = async (req, res) => {
  const { emailOrMobile, otp } = req.body;
  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) normalizedInput = `91${normalizedInput}`;
  }

  try {
    console.log("[Backend] Verifying 2FA for:", normalizedInput);
    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user || !user.google2FASecret) {
      return res.status(400).json({ error: "2FA not enabled for this user" });
    }

    const isValid = google2fa.verifyKey(user.google2FASecret, otp, 1); // Window of 1 for 30-second OTP
    if (!isValid) {
      return res.status(400).json({ error: "Invalid 2FA OTP" });
    }

    user.is2FAEnabled = true;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("[Backend] 2FA verified for:", normalizedInput);
    res.json({ success: true, message: "2FA verified successfully", token, emailOrMobile: user.emailOrMobile });
  } catch (err) {
    console.error("[Backend] 2FA Verification Error:", err.message);
    res.status(500).json({ error: "2FA verification failed" });
  }
};

const disable2FA = async (req, res) => {
  const { emailOrMobile } = req.body;
  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) normalizedInput = `91${normalizedInput}`;
  }

  try {
    console.log("[Backend] Disabling 2FA for:", normalizedInput);
    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.google2FASecret = null;
    user.is2FAEnabled = false;
    await user.save();

    console.log("[Backend] 2FA disabled for:", normalizedInput);
    res.json({ success: true, message: "2FA disabled successfully" });
  } catch (err) {
    console.error("[Backend] Disable 2FA Error:", err.message);
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  registerUser,
  saveProfileInfo,
  sendEmailOTP,
  verifyEmailOTP,
  resetPassword,
  loginUser,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  getUserProfile,
  deactivateAccount,
  deleteAccount,
  send2FAOTP,
  verify2FA,
  disable2FA,
};