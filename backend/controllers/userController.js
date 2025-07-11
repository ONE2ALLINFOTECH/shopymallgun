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
        return res.status(400).json({ error: "Mobile number galat hai bhai, +91XXXXXXXXXX ya XXXXXXXXXX daal!" });
      }
    }

    let user = await User.findOne({ emailOrMobile: normalizedInput });

    if (isRegistration && user) {
      return res.status(400).json({ error: "Yeh email ya mobile pehle se registered hai!" });
    }

    if (!user) {
      user = new User({ emailOrMobile: normalizedInput });
    }

    user.otp = otp;
    user.otpExpires = expiry;
    await user.save();

    console.log(`[Backend] OTP banaya: ${otp} for ${normalizedInput}`);

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
        text: `Tera Shopymol login OTP hai ${otp}. Kisi se share mat kar!`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[Email] OTP bheja to ${emailOrMobile}`);
    } else {
      const msg = `Tera Shopymol login OTP hai ${otp}. Kisi se share mat kar!`;
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=368214D9E23633&campaign=8559&routeid=18&type=text&contacts=${normalizedInput}&senderid=SHPMOL&msg=${encodeURIComponent(msg)}`;
      try {
        const response = await axios.get(url);
        console.log(`[SMS] Bheja to ${normalizedInput}:`, response.data);
      } catch (smsError) {
        console.error(`[SMS Error] for ${normalizedInput}:`, smsError.response?.data || smsError.message);
        return res.status(500).json({ error: "SMS OTP bhejne mein gadbad!" });
      }
    }

    res.json({ success: true, message: "OTP bhej diya!" });
  } catch (error) {
    console.error("[Backend] OTP bhejne mein error:", error.message);
    res.status(500).json({ error: "OTP bhejne mein gadbad!" });
  }
};

const verifyOTP = async (req, res) => {
  const { emailOrMobile, otp } = req.body;

  if (!emailOrMobile || !otp) {
    return res.status(400).json({ error: "Email/mobile aur OTP dono chahiye!" });
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
    return res.status(404).json({ error: "User nahi mila!" });
  }

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ error: "OTP galat hai ya expire ho gaya!" });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.json({ success: true, message: "OTP verify ho gaya!" });
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
    return res.status(400).json({ error: "Pehle OTP verify kar bhai!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();

  res.json({ success: true, message: "User register ho gaya!" });
};

const saveProfileInfo = async (req, res) => {
  const { emailOrMobile, firstName, lastName, gender } = req.body;

  if (!emailOrMobile) {
    return res.status(400).json({ error: "Email ya mobile number daal bhai!" });
  }
  if (!firstName || !firstName.trim()) {
    return res.status(400).json({ error: "First name daal, zaruri hai!" });
  }
  if (!lastName || !lastName.trim()) {
    return res.status(400).json({ error: "Last name daal, zaruri hai!" });
  }
  if (gender && !["Male", "Female"].includes(gender)) {
    return res.status(400).json({ error: "Gender ya toh Male ya Female daal, ya khali chhod!" });
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
      return res.status(404).json({ error: "User nahi mila!" });
    }

    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.gender = gender || "";
    await user.save();

    console.log(`[Backend] Profile update kiya for ${normalizedInput}:`, { firstName, lastName, gender });

    res.json({ success: true, message: "Profile update ho gaya!", data: { firstName, lastName, gender } });
  } catch (err) {
    console.error("[Backend] Profile save mein error:", err.message);
    res.status(500).json({ error: "Profile save nahi hua!" });
  }
};

const sendEmailOTP = async (req, res) => {
  const { emailOrMobile } = req.body;

  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) return res.status(404).json({ error: "User nahi mila!" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 10 * 60000);

    user.resetOtp = otp;
    user.resetOtpExpires = expiry;
    await user.save();

    console.log(`[Backend] Reset OTP banaya: ${otp} for ${emailOrMobile}`);

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
      text: `Tera OTP password reset ke liye hai ${otp}. 10 minute tak valid hai.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Reset OTP bheja to ${emailOrMobile}`);

    res.json({ success: true, message: "OTP email pe bhej diya!" });
  } catch (err) {
    console.error("[Backend] Reset OTP bhejne mein error:", err.message);
    res.status(500).json({ error: "Email OTP bhejne mein gadbad!" });
  }
};

const verifyEmailOTP = async (req, res) => {
  const { emailOrMobile, otp } = req.body;

  const user = await User.findOne({ emailOrMobile });
  if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
    return res.status(400).json({ error: "OTP galat hai ya expire ho gaya!" });
  }

  res.json({ success: true, message: "OTP verify ho gaya!" });
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

    if (!user) return res.status(404).json({ error: "User nahi mila!" });

    console.log(`[Backend] Profile fetch kiya for ${normalizedInput}:`, {
      emailOrMobile: user.emailOrMobile,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      isVerified: user.isVerified,
    });

    res.json({
      emailOrMobile: user.emailOrMobile,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      gender: user.gender || "",
      isVerified: user.isVerified,
    });
  } catch (err) {
    console.error("[Backend] Profile fetch mein error:", err.message);
    res.status(500).json({ error: "Profile fetch nahi hua!" });
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
      console.log("[Backend] User nahi mila for:", normalizedInput);
      return res.status(404).json({ error: "User nahi mila!" });
    }

    if (!user.password) {
      return res.status(400).json({ error: "Password set nahi hai. OTP se login kar ya password reset kar!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password galat hai!" });
    }

    res.json({ success: true, message: "Login ho gaya!" });
  } catch (err) {
    console.error("[Backend] Login Error:", err.message);
    res.status(500).json({ error: "Login nahi hua!" });
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
    console.log("[Backend] OTP bhej raha hu for forgot password:", normalizedInput);

    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      console.log("[Backend] User nahi mila:", normalizedInput);
      return res.status(404).json({ error: "User nahi mila!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log("[Backend] OTP banaya:", otp);

    const msg = `Tera Shopymol password reset OTP hai ${otp}. 10 minute tak valid hai.`;

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
      console.log("[Email] OTP bheja to:", emailOrMobile);
    } else {
      const url = `http://websms.textidea.com/app/smsapi/index.php?key=368214D9E23633&campaign=8559&routeid=18&type=text&contacts=${normalizedInput}&senderid=SHPMOL&msg=${encodeURIComponent(msg)}`;

      try {
        const response = await axios.get(url);
        console.log(`[SMS] Bheja to ${normalizedInput}:`, response.data);
      } catch (smsError) {
        console.error(`[SMS ERROR] for ${normalizedInput}:`, smsError.response?.data || smsError.message);
        return res.status(500).json({ error: "SMS OTP bhejne mein gadbad!" });
      }
    }

    return res.json({ success: true, message: "OTP bhej diya!" });
  } catch (err) {
    console.error("[Backend] Forgot Password OTP Error:", err.message);
    return res.status(500).json({ error: "OTP bhejne mein gadbad!" });
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
    console.log("[Backend] OTP verify kar raha hu for:", normalizedInput);

    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User nahi mila!" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "OTP galat hai ya expire ho gaya!" });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    console.log("[Backend] OTP verify kiya aur clear kiya");
    res.json({ success: true, message: "OTP verify ho gaya!" });

  } catch (err) {
    console.error("[Backend] Verify Forgot Password OTP Error:", err.message);
    res.status(500).json({ error: "OTP verify nahi hua!" });
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
    console.log("[Backend] Password reset kar raha hu for:", normalizedInput);

    const user = await User.findOne({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User nahi mila!" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    console.log("[Backend] Password reset ho gaya");
    res.json({ success: true, message: "Password reset ho gaya!" });

  } catch (err) {
    console.error("[Backend] Reset Password Error:", err.message);
    res.status(500).json({ error: "Password reset nahi hua!" });
  }
};

const deleteAccount = async (req, res) => {
  const { emailOrMobile } = req.body;

  let normalizedInput = emailOrMobile;
  if (!emailOrMobile.includes("@")) {
    normalizedInput = emailOrMobile.replace(/\D/g, "");
    if (normalizedInput.length === 10) normalizedInput = `91${normalizedInput}`;
  }

  try {
    console.log("[Backend] Account delete kar raha hu for:", normalizedInput);

    const user = await User.findOneAndDelete({
      $or: [
        { emailOrMobile: normalizedInput },
        { emailOrMobile: normalizedInput.replace(/^91/, "") },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User nahi mila!" });
    }

    console.log("[Backend] Account delete ho gaya");
    res.json({ success: true, message: "Account delete ho gaya!" });
  } catch (err) {
    console.error("[Backend] Delete Account Error:", err.message);
    res.status(500).json({ error: "Account delete nahi hua!" });
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
  deleteAccount
};