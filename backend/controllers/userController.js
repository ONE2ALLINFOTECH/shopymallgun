const User = require("../models/User");
const axios = require("axios");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const sendOTP = async (req, res) => {
  const { emailOrMobile, isRegistration = false } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 15 * 60000); // 15 minutes

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

    console.log(`[Send OTP] Generated OTP: ${otp} for ${normalizedInput}`);

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
      console.log(`[Email] OTP sent to ${emailOrMobile}`);
    } else {
      const msg = `Your Shopymol login OTP is ${otp}. Do not share it with anyone.`;
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=368214D9E23633&campaign=8559&routeid=18&type=text&contacts=${normalizedInput}&senderid=SHPMOL&msg=${encodeURIComponent(msg)}`;
      try {
        const response = await axios.get(url);
        console.log(`[SMS] OTP sent to ${normalizedInput}:`, response.data);
      } catch (smsError) {
        console.error(`[SMS Error] for ${normalizedInput}:`, smsError.response?.data || smsError.message);
        return res.status(500).json({ error: "Failed to send SMS OTP" });
      }
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("[Send OTP] Error:", error.message);
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

  try {
    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      console.log(`[Verify OTP] User not found for: ${normalizedInput}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`[Verify OTP] Stored OTP: ${user.otp}, Received OTP: ${otp}, Expires: ${user.otpExpires}, Now: ${Date.now()}`);

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    console.log(`[Verify OTP] OTP verified for: ${normalizedInput}`);
    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("[Verify OTP] Error:", err.message);
    res.status(500).json({ error: "OTP verification failed" });
  }
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

  try {
    const user = await User.findOne({ emailOrMobile: normalizedInput });

    if (!user || !user.isVerified) {
      return res.status(400).json({ error: "OTP not verified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    console.log(`[Register User] User registered: ${normalizedInput}`);
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("[Register User] Error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
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

    console.log(`[Save Profile] Profile updated for: ${normalizedInput}`);
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
    console.error("[Save Profile] Error:", err.message);
    res.status(500).json({ error: "Error saving profile" });
  }
};

const sendEmailOTP = async (req, res) => {
  const { emailOrMobile } = req.body;

  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60000);

    user.resetOtp = otp;
    user.resetOtpExpires = expiry;
    await user.save();

    console.log(`[Send Email OTP] Generated OTP: ${otp} for ${emailOrMobile}`);

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
      text: `Your OTP for password reset is ${otp}. It is valid for 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Reset OTP sent to ${emailOrMobile}`);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("[Send Email OTP] Error:", err.message);
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

    console.log(`[Verify Email OTP] OTP verified for: ${emailOrMobile}`);
    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("[Verify Email OTP] Error:", err.message);
    res.status(500).json({ error: "OTP verification failed" });
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
    console.log("[Login] Attempt for:", normalizedInput);

    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      console.log("[Login] User not found:", normalizedInput);
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ error: "Password not set. Use OTP login or reset password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    console.log("[Login] Successful for:", normalizedInput);
    res.json({ success: true, message: "Login successful", is2FAEnabled: user.is2FAEnabled });
  } catch (err) {
    console.error("[Login] Error:", err.message);
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
    console.log("[Forgot Password OTP] Finding user for:", normalizedInput);

    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      console.log("[Forgot Password OTP] User not found:", normalizedInput);
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60000);
    await user.save();

    console.log(`[Forgot Password OTP] Generated OTP: ${otp}`);

    const msg = `Your Shopymol password reset OTP is ${otp}. Valid for 15 minutes.`;

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
      console.log(`[Email] OTP sent to: ${emailOrMobile}`);
    } else {
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=368214D9E23633&campaign=8559&routeid=18&type=text&contacts=${normalizedInput}&senderid=SHPMOL&msg=${encodeURIComponent(msg)}`;
      try {
        const response = await axios.get(url);
        console.log(`[SMS] OTP sent to ${normalizedInput}:`, response.data);
      } catch (smsError) {
        console.error(`[SMS Error] for ${normalizedInput}:`, smsError.response?.data || smsError.message);
        return res.status(500).json({ error: "Failed to send SMS OTP" });
      }
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("[Forgot Password OTP] Error:", err.message);
    res.status(500).json({ error: "Failed to send OTP" });
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
    console.log("[Verify Forgot Password OTP] Verifying for:", normalizedInput);

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

    console.log("[Verify Forgot Password OTP] OTP verified and cleared");
    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("[Verify Forgot Password OTP] Error:", err.message);
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
    console.log("[Reset Password] Resetting password for:", normalizedInput);

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

    console.log("[Reset Password] Password reset successful");
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("[Reset Password] Error:", err.message);
    res.status(500).json({ error: "Password reset failed" });
  }
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
      is2FAEnabled: user.is2FAEnabled,
    });
  } catch (err) {
    console.error("[Get Profile] Error:", err.message);
    res.status(500).json({ error: "Error fetching profile" });
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

    console.log(`[Deactivate Account] Account deactivated for: ${normalizedInput}`);
    res.json({ success: true, message: "Account deactivated successfully" });
  } catch (err) {
    console.error("[Deactivate Account] Error:", err.message);
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

    console.log(`[Delete Account] Account deleted for: ${normalizedInput}`);
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("[Delete Account] Error:", err.message);
    res.status(500).json({ error: "Failed to delete account" });
  }
};

const send2FAOTP = async (req, res) => {
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

    const secret = speakeasy.generateSecret({
      name: `Shopymol (${emailOrMobile})`,
    });

    user.twoFASecret = secret.base32;
    await user.save();

    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });

    console.log(`[Send 2FA OTP] Generated OTP: ${otp} for ${normalizedInput}`);

    const isEmail = emailOrMobile.includes("@");
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
        subject: "Shopymol 2FA Setup OTP",
        text: `Your 2FA setup OTP is ${otp}. Scan the QR code in your authenticator app and enter this OTP to enable 2FA.`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[Email] 2FA OTP sent to: ${emailOrMobile}`);
    } else {
      const msg = `Your Shopymol 2FA setup OTP is ${otp}. Scan the QR code in your authenticator app and enter this OTP to enable 2FA.`;
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=368214D9E23633&campaign=8559&routeid=18&type=text&contacts=${normalizedInput}&senderid=SHPMOL&msg=${encodeURIComponent(msg)}`;
      try {
        const response = await axios.get(url);
        console.log(`[SMS] 2FA OTP sent to ${normalizedInput}:`, response.data);
      } catch (smsError) {
        console.error(`[SMS Error] for ${normalizedInput}:`, smsError.response?.data || smsError.message);
        return res.status(500).json({ error: "Failed to send 2FA SMS OTP" });
      }
    }

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        console.error("[Send 2FA OTP] QR code error:", err.message);
        return res.status(500).json({ error: "QR code error" });
      }
      res.json({ success: true, qr: data_url, message: "2FA OTP sent and QR code generated" });
    });
  } catch (err) {
    console.error("[Send 2FA OTP] Error:", err.message);
    res.status(500).json({ error: "Failed to setup 2FA" });
  }
};

const verify2FA = async (req, res) => {
  const { emailOrMobile, otp } = req.body;
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

    if (!user || !user.twoFASecret) {
      return res.status(400).json({ error: "2FA is not setup for this user" });
    }

    console.log("[Verify 2FA] Verifying OTP:", otp, "for secret:", user.twoFASecret);

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: otp,
      window: 2, // Increased window to allow slight time sync issues
    });

    if (!verified) {
      console.log("[Verify 2FA] OTP verification failed for:", normalizedInput);
      return res.status(401).json({ error: "Invalid or expired 2FA OTP" });
    }

    user.is2FAEnabled = true;
    await user.save();

    console.log(`[Verify 2FA] 2FA enabled for: ${normalizedInput}`);
    res.json({ success: true, message: "2FA verified and enabled successfully" });
  } catch (err) {
    console.error("[Verify 2FA] Error:", err.message);
    res.status(500).json({ error: "2FA verification failed" });
  }
};

const disable2FA = async (req, res) => {
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

    user.twoFASecret = null;
    user.is2FAEnabled = false;
    await user.save();

    console.log(`[Disable 2FA] 2FA disabled for: ${normalizedInput}`);
    res.json({ success: true, message: "2FA disabled successfully" });
  } catch (err) {
    console.error("[Disable 2FA] Error:", err.message);
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