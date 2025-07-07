const User = require("../models/User");
const axios = require("axios");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// 🔹 1. Send OTP (Email or Mobile)
const sendOTP = async (req, res) => {
  const { emailOrMobile } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiry = new Date(Date.now() + 10 * 60000);

  try {
    const isEmail = emailOrMobile.includes("@");

    let user = await User.findOne({ emailOrMobile });
    if (!user) user = new User({ emailOrMobile });

    user.otp = otp;
    user.otpExpires = expiry;

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
        text: `Your OTP for Shopymol registration is ${otp}. It is valid for 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);
    } else {
      const msg = `Your Shopymol login OTP is ${otp}. Do not share it with anyone.`;
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=368214D9E23633&campaign=8559&routeid=18&type=text&contacts=${emailOrMobile}&senderid=SHPMOL&msg=${encodeURIComponent(
        msg
      )}`;
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

// 🔹 2. Verify OTP
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

// 🔹 3. Register User
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

// 🔹 4. Save Profile Info
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
  } catch (err) {
    res.status(500).json({ error: "Error saving profile" });
  }
};

// 🔹 5. Send Email OTP (Forgot Password)
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
      from: `"ONE2ALL DEVELOPERS" <${process.env.BREVO_EMAIL}>`,
      to: emailOrMobile,
      subject: "Password Reset OTP - Shopymol",
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Failed to send email OTP" });
  }
};

// 🔹 6. Verify Email OTP (Forgot Password)
const verifyEmailOTP = async (req, res) => {
  const { emailOrMobile, otp } = req.body;

  const user = await User.findOne({ emailOrMobile });
  if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  res.json({ success: true, message: "OTP verified" });
};

// 🔹 7. Reset Password
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

// 🔹 8. Get Profile
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
  } catch {
    res.status(500).json({ error: "Error fetching profile" });
  }
};

// 🔹 9. Aadhaar Send OTP (Cashfree)
const aadhaarKYC = async (req, res) => {
  try {
    const { aadhaar_number, consent, reason } = req.body;

    const response = await axios.post(
      "https://sandbox.cashfree.com/kyc/v2/aadhaar/verify",
      { aadhaar_number, consent, reason },
      {
        headers: {
          "x-api-version": "1.0",
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error?.response?.data || error);
    res.status(500).json({ error: "OTP request failed" });
  }
};

// 🔹 10. Aadhaar Verify OTP
const verifyAadhaarOTP = async (req, res) => {
  try {
    const { reference_id, otp, aadhaar_number } = req.body;

    const response = await axios.post(
      "https://sandbox.cashfree.com/kyc/v2/aadhaar/verify/otp",
      { reference_id, otp, aadhaar_number },
      {
        headers: {
          "x-api-version": "1.0",
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error?.response?.data || error);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

// 🔹 11. PAN Verification
const verifyPAN = async (req, res) => {
  try {
    const { pan_number } = req.body;

    const response = await axios.post(
      "https://sandbox.cashfree.com/kyc/v1/pan/verify",
      { pan: pan_number },
      {
        headers: {
          "x-api-version": "1.0",
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error?.response?.data || error);
    res.status(500).json({ error: "PAN verification failed" });
  }
};

// ✅ FINAL EXPORT
module.exports = {
  sendOTP,
  verifyOTP,
  registerUser,
  saveProfileInfo,
  aadhaarKYC,
  verifyAadhaarOTP,
  verifyPAN,
  sendEmailOTP,
  verifyEmailOTP,
  resetPassword,
  getUserProfile,
};
