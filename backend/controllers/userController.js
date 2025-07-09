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
    let user = await User.findOne({ emailOrMobile });

    // For registration, check if user already exists
    if (isRegistration && user) {
      return res.status(400).json({ error: "Email or mobile already exists" });
    }

    // If user doesn't exist, create a new user record (for dashboard, allow existing users)
    if (!user) {
      user = new User({ emailOrMobile });
    }

    user.otp = otp;
    user.otpExpires = expiry;
    await user.save();

    console.log(`Generated OTP: ${otp} for ${emailOrMobile}`); // Log OTP for debugging

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
        text: `Your OTP for Shopymol ${isRegistration ? "registration" : "dashboard access"} is ${otp}. It is valid for 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email OTP sent to ${emailOrMobile}`);
    } else {
      const msg = `Your Shopymol ${isRegistration ? "registration" : "dashboard access"} OTP is ${otp}. Do not share it with anyone.`;
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=${process.env.TEXTIDEA_API_KEY}&campaign=${process.env.TEXTIDEA_CAMPAIGN}&routeid=${process.env.TEXTIDEA_ROUTEID}&type=text&contacts=${emailOrMobile}&senderid=${process.env.TEXTIDEA_SENDERID}&msg=${encodeURIComponent(msg)}`;
      const response = await axios.get(url);
      console.log(`SMS API response:`, response.data); // Log SMS API response for debugging
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error.message);
    res.status(500).json({ error: "OTP send failed" });
  }
};

const verifyOTP = async (req, res) => {
  const { emailOrMobile, otp } = req.body;
  const user = await User.findOne({ emailOrMobile });

  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
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
  const user = await User.findOne({ emailOrMobile });

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

    console.log(`Generated Reset OTP: ${otp} for ${emailOrMobile}`); // Log OTP for debugging

    const transporter = nodemailer.createTransport({
      host: "sms-relay.brevo.com",
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

const resetPassword = async (req, res) => {
  const { emailOrMobile, password } = req.body;

  const user = await User.findOne({ emailOrMobile });
  if (!user) return res.status(404).json({ error: "User not found" });

  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;
  user.resetOtp = null;
  user.resetOtpExpires = null;
  await user.save();

  res.json({ success: true, message: "Password reset successful" });
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
      isVerified: user.isVerified,
    });
  } catch (err) {
    console.error("❌ Error fetching profile:", err.message);
    res.status(500).json({ error: "Error fetching profile" });
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