const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const axios = require("axios");

const sendOTP = async (req, res) => {
  let { emailOrMobile } = req.body;
  emailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiry = new Date(Date.now() + 2 * 60000);

  try {
    const user = await User.findOne({ emailOrMobile });
    if (user) {
      return res.status(400).json({ error: "Your profile already exists" });
    }

    const newUser = new User({ emailOrMobile, otp, otpExpires: expiry });
    console.log("Saving user to MongoDB Atlas:", newUser);
    await newUser.save();
    console.log("User saved successfully:", newUser);

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
        from: `"Shopymol OTP" <no-reply@shopymol.com>`,
        to: emailOrMobile,
        subject: "Shopymol OTP Verification",
        text: `Your OTP for registration is ${otp}. Valid for 2 minutes.`,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email OTP sent to:", emailOrMobile);
    } else {
      const msg = `Your Shopymol OTP is ${otp}. Valid for 2 minutes.`;
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=368214D9E23633&campaign=8559&routeid=18&type=text&contacts=${emailOrMobile}&senderid=SHPMOL&msg=${encodeURIComponent(msg)}`;
      await axios.get(url);
      console.log("SMS OTP sent to:", emailOrMobile);
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error.message, error.stack);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email or mobile already exists" });
    }
    res.status(500).json({ error: "OTP send failed", details: error.message });
  }
};

const verifyOTP = async (req, res) => {
  let { emailOrMobile, otp } = req.body;
  emailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    console.log("Verifying OTP for user:", user);
    await user.save();
    console.log("OTP verified, user updated:", user);

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error.message, error.stack);
    res.status(500).json({ error: "OTP verification failed", details: error.message });
  }
};

const registerUser = async (req, res) => {
  let { emailOrMobile, password } = req.body;
  emailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user || !user.isVerified) {
      return res.status(400).json({ error: "OTP not verified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    console.log("Registering user with password:", user);
    await user.save();
    console.log("User registered successfully:", user);

    res.json({ success: true, message: "Password set successfully" });
  } catch (error) {
    console.error("Error registering user:", error.message, error.stack);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
};

const saveProfileInfo = async (req, res) => {
  let { emailOrMobile, firstName, lastName, gender, address } = req.body;
  emailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.firstName = firstName?.trim();
    user.lastName = lastName?.trim();
    user.gender = gender?.trim();
    user.address = address?.trim();
    user.isProfileComplete = true;
    console.log("Saving profile to MongoDB Atlas:", user);
    await user.save();
    console.log("Profile saved successfully:", user);

    res.json({ success: true, message: "Profile saved successfully" });
  } catch (error) {
    console.error("Error saving profile:", error.message, error.stack);
    res.status(500).json({ error: "Error saving profile", details: error.message });
  }
};

const sendEmailOTP = async (req, res) => {
  let { emailOrMobile } = req.body;
  emailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiry = new Date(Date.now() + 2 * 60000);

  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.resetOtp = otp;
    user.resetOtpExpires = expiry;
    console.log("Saving reset OTP:", user);
    await user.save();
    console.log("Reset OTP saved:", user);

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
        from: `"Shopymol Reset" <no-reply@shopymol.com>`,
        to: emailOrMobile,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is ${otp}. Valid for 2 minutes.`,
      };

      await transporter.sendMail(mailOptions);
      console.log("Reset email OTP sent to:", emailOrMobile);
    } else {
      const msg = `Your Shopymol password reset OTP is ${otp}. Valid for 2 minutes.`;
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=368214D9E23633&campaign=8559&routeid=18&type=text&contacts=${emailOrMobile}&senderid=SHPMOL&msg=${encodeURIComponent(msg)}`;
      await axios.get(url);
      console.log("Reset SMS OTP sent to:", emailOrMobile);
    }

    res.json({ success: true, message: "Reset OTP sent successfully" });
  } catch (error) {
    console.error("Error sending reset OTP:", error.message, error.stack);
    res.status(500).json({ error: "Failed to send reset OTP", details: error.message });
  }
};

const verifyEmailOTP = async (req, res) => {
  let { emailOrMobile, otp } = req.body;
  emailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    res.json({ success: true, message: "Reset OTP verified" });
  } catch (error) {
    console.error("Error verifying reset OTP:", error.message, error.stack);
    res.status(500).json({ error: "OTP verification failed", details: error.message });
  }
};

const resetPassword = async (req, res) => {
  let { emailOrMobile, password } = req.body;
  emailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    console.log("Resetting password for user:", user);
    await user.save();
    console.log("Password reset successfully:", user);

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error.message, error.stack);
    res.status(500).json({ error: "Password reset failed", details: error.message });
  }
};

const getUserProfile = async (req, res) => {
  let { emailOrMobile } = req.query;
  emailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Fetching profile from MongoDB Atlas:", user);
    res.json({
      success: true,
      data: {
        emailOrMobile: user.emailOrMobile,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        address: user.address,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error.message, error.stack);
    res.status(500).json({ error: "Error fetching profile", details: error.message });
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
  getUserProfile,
};