const User = require("../models/User");
const axios = require("axios");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const sendOTP = async (req, res) => {
  const { emailOrMobile, isRegistration = false } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiry = new Date(Date.now() + 10 * 60000);

  try {
    const isEmail = emailOrMobile.includes("@");
    let normalizedInput = emailOrMobile;

    // Normalize mobile number
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

    // For registration, check if user exists
    if (isRegistration && user) {
      return res.status(400).json({ error: "Email or mobile already exists" });
    }

    // Create new user if none exists
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

  // Check both formats to handle database inconsistencies
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
  const { emailOrMobile, firstName, lastName, gender, address } = req.body;
  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) {
      normalizedInput = `91${normalizedInput}`;
    }
  }

  try {
    const user = await User.findOne({ emailOrMobile: normalizedInput });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.gender = gender;
    user.address = address;

    await user.save();

    res.json({ success: true, message: "Profile info saved successfully" });
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
    if (!user.password) {
      return res.status(400).json({ error: "Password not set. Use OTP login or reset password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }
    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error("[Login Error]:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};
const sendForgotPasswordOTP = async (req, res) => {
  const { emailOrMobile } = req.body;
  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
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
      console.log("[Backend] User not found for OTP:", normalizedInput);
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    console.log("[Backend] OTP generated and saved for:", normalizedInput, "OTP:", otp);

    if (emailOrMobile.includes("@")) {
      await sendEmail(emailOrMobile, "Password Reset OTP", `Your OTP is ${otp}`);
      console.log("[Backend] Email OTP sent to:", emailOrMobile);
    } else {
      await sendSMS(normalizedInput, `Your OTP for password reset is ${otp}`);
      console.log("[Backend] SMS OTP sent to:", normalizedInput);
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("[Backend] Send Forgot Password OTP Error:", err.message);
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
    console.log("[Backend] Verifying OTP for:", normalizedInput, "OTP:", otp);
    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });
    if (!user) {
      console.log("[Backend] User not found for OTP verification:", normalizedInput);
      return res.status(404).json({ error: "User not found" });
    }
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      console.log("[Backend] Invalid or expired OTP for:", normalizedInput);
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    console.log("[Backend] OTP verified for:", normalizedInput);
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
      console.log("[Backend] User not found for password reset:", normalizedInput);
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.otp || user.otpExpires < Date.now()) {
      console.log("[Backend] OTP not verified or expired for:", normalizedInput);
      return res.status(400).json({ error: "OTP not verified or expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    console.log("[Backend] Password reset successful for:", normalizedInput);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("[Backend] Reset Password Error:", err.message);
    res.status(500).json({ error: "Password reset failed" });
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
  loginUser,
};