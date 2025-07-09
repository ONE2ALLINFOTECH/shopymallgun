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
  const { emailOrMobile, firstName, lastName, gender, email, newEmailOrMobile } = req.body;
  let normalizedInput = emailOrMobile;
  let normalizedNewInput = newEmailOrMobile;

  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) {
      normalizedInput = `91${normalizedInput}`;
    }
  }

  if (newEmailOrMobile && !newEmailOrMobile.includes("@")) {
    normalizedNewInput = newEmailOrMobile.replace(/\D/g, "");
    if (normalizedNewInput.length === 10) {
      normalizedNewInput = `91${normalizedNewInput}`;
    }
    if (!/^\+?91\d{10}$/.test(normalizedNewInput)) {
      return res.status(400).json({ error: "Invalid mobile number format for new mobile number" });
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

    // Update fields only if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (gender) user.gender = gender;
    if (email) user.email = email;
    if (newEmailOrMobile && user.isVerified) {
      // Ensure new emailOrMobile is unique
      const existingUser = await User.findOne({ emailOrMobile: normalizedNewInput });
      if (existingUser && existingUser.emailOrMobile !== user.emailOrMobile) {
        return res.status(400).json({ error: "New email or mobile already exists" });
      }
      user.emailOrMobile = normalizedNewInput;
      user.isVerified = true; // Retain verified status for new emailOrMobile
    }

    await user.save();

    res.json({ success: true, message: "Profile info saved successfully" });
  } catch (err) {
    console.error("❌ Error saving profile:", err.message);
    res.status(500).json({ error: "Error saving profile" });
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
    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.deleteOne({ emailOrMobile: user.emailOrMobile });
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting account:", err.message);
    res.status(500).json({ error: "Error deleting account" });
  }
};

const sendEmailOTP = async (req, res) => {
  const { emailOrMobile } = req.body;

  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) {
      // Create a temporary user for OTP verification if the email is new
      const otp = Math.floor(100000 + Math.random() * 900000);
      const expiry = new Date(Date.now() + 10 * 60000);
      const tempUser = new User({ emailOrMobile, resetOtp: otp, resetOtpExpires: expiry });
      await tempUser.save();

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
        text: `Your OTP for email verification is ${otp}. It is valid for 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email OTP sent to ${emailOrMobile}`);
      return res.json({ success: true, message: "OTP sent to email" });
    }

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
      subject: "Email Verification OTP - Shopymol",
      text: `Your OTP for email verification is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email OTP sent to ${emailOrMobile}`);

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

  user.resetOtp = null;
  user.resetOtpExpires = null;
  await user.save();

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
      email: user.email,
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
  deleteAccount,
  sendEmailOTP,
  verifyEmailOTP,
  resetPassword,
  getUserProfile,
};