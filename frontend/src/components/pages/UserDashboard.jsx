import React, { useState, useEffect } from "react";
import {
  Mail, Shield, CheckCircle, AlertCircle, X, Send, Clock, LogOut, User, Package, CreditCard,
  ShoppingCart, Search, ChevronRight, Menu, Lock, Eye, EyeOff, Edit3
} from "lucide-react";
import api from "../api/api";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState("otp");
  const [userData, setUserData] = useState({ firstName: "", lastName: "", gender: "", emailOrMobile: "" });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [show2FAPopup, setShow2FAPopup] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    emailOrMobile: ""
  });

  useEffect(() => {
    let interval;
    if ((otpSent || show2FAPopup || show2FASetup) && !otpVerified && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, show2FAPopup, show2FASetup, otpVerified, timer]);

  useEffect(() => {
    if (otp.join("").length === 6 && !loading) {
      if (show2FAPopup || show2FASetup) {
        handleVerify2FA();
      } else if (showForgotPassword) {
        handleVerifyForgotPasswordOTP();
      } else {
        handleVerifyOTP();
      }
    }
  }, [otp, loading, show2FAPopup, show2FASetup, showForgotPassword]);

  useEffect(() => {
    if (isLoggedIn && userData.emailOrMobile) {
      setEditData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        gender: userData.gender || "",
        emailOrMobile: userData.emailOrMobile || ""
      });
      fetch2FAStatus();
    }
  }, [isLoggedIn, userData]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const showPopup = (type, message) => {
    console.log(`[Popup] ${type}: ${message}`);
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: "", message: "" }), 3000);
  };

  const fetch2FAStatus = async () => {
    try {
      const res = await api.get(`/user/profile?emailOrMobile=${userData.emailOrMobile}`);
      setIs2FAEnabled(res.data.is2FAEnabled || false);
    } catch (err) {
      console.error("[Fetch 2FA Status] Error:", err.response?.data || err.message);
    }
  };

  const handleSendOTP = async () => {
    if (!emailOrMobile.trim()) {
      showPopup("error", "Email ya mobile number daal, bhai!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Send OTP] Requesting OTP for:", emailOrMobile);
      const res = await api.post("/user/send-otp", { emailOrMobile, isRegistration: false });
      console.log("[Send OTP] Response:", res.data);
      if (res.data.error && res.data.error.includes("not registered")) {
        showPopup("error", "Aapka email ya number nahi hai, pehle registration karo");
        setOtpSent(false);
      } else {
        showPopup("success", "OTP bhej diya gaya!");
        setOtpSent(true);
        setTimer(120);
        setCanResend(false);
        setShowOtpPopup(true);
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      console.error("[Send OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "OTP bhejne mein problem hui");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    if (!emailOrMobile.trim() || !otpValue || otpValue.length !== 6) {
      showPopup("error", "Email/mobile aur 6-digit OTP daal");
      return;
    }
    setLoading(true);
    try {
      console.log("[Verify OTP] Payload:", { emailOrMobile, otp: otpValue });
      await api.post("/user/verify-otp", { emailOrMobile, otp: otpValue });
      setOtp(["", "", "", "", "", ""]);
      setShowOtpPopup(false);
      setOtpVerified(true);
      if (is2FAEnabled) {
        await handleSend2FAOTP();
      } else {
        const res = await api.get(`/user/profile?emailOrMobile=${emailOrMobile}`);
        setUserData({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          gender: res.data.gender || "",
          emailOrMobile: res.data.emailOrMobile || emailOrMobile
        });
        setIsLoggedIn(true);
        showPopup("success", "Login ho gaya!");
      }
    } catch (err) {
      console.error("[Verify OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "OTP galat hai, sahi OTP daal");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!emailOrMobile.trim() || !password.trim()) {
      showPopup("error", "Email/mobile aur password daal");
      return;
    }
    setLoading(true);
    try {
      console.log("[Password Login] Attempting login for:", emailOrMobile);
      const res = await api.post("/user/login", { emailOrMobile, password });
      if (res.data.is2FAEnabled) {
        setIs2FAEnabled(true);
        await handleSend2FAOTP();
      } else {
        const profileRes = await api.get(`/user/profile?emailOrMobile=${emailOrMobile}`);
        setUserData({
          firstName: profileRes.data.firstName || "",
          lastName: profileRes.data.lastName || "",
          gender: profileRes.data.gender || "",
          emailOrMobile: profileRes.data.emailOrMobile || emailOrMobile
        });
        setIsLoggedIn(true);
        showPopup("success", "Login ho gaya!");
      }
    } catch (err) {
      console.error("[Password Login] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Login fail hua");
    } finally {
      setLoading(false);
    }
  };

  const handleSend2FAOTP = async () => {
    setLoading(true);
    try {
      console.log("[Send 2FA OTP] Sending 2FA OTP to:", emailOrMobile || userData.emailOrMobile);
      const res = await api.post("/user/send-2fa-otp", { emailOrMobile: emailOrMobile || userData.emailOrMobile });
      console.log("[Send 2FA OTP] Response:", res.data);
      showPopup("success", "2FA OTP bhej diya gaya!");
      setShow2FAPopup(true);
      setTimer(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      if (res.data.qr) setQrCode(res.data.qr);
    } catch (err) {
      console.error("[Send 2FA OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "2FA OTP bhejne mein problem hui");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      console.log("[Setup 2FA] Requesting QR code for:", userData.emailOrMobile);
      const res = await api.post("/user/send-2fa-otp", { emailOrMobile: userData.emailOrMobile });
      setQrCode(res.data.qr);
      setShow2FASetup(true);
      setOtp(["", "", "", "", "", ""]);
      setTimer(120);
      setCanResend(false);
      showPopup("success", "2FA OTP bheja gaya. QR code scan karo aur OTP daal!");
    } catch (err) {
      console.error("[Setup 2FA] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "2FA setup mein problem hui");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    const otpValue = otp.join("");
    if (!otpValue || otpValue.length !== 6) {
      showPopup("error", "6-digit 2FA OTP daal, bhai!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Verify 2FA] Verifying for:", emailOrMobile || userData.emailOrMobile, "OTP:", otpValue);
      const res = await api.post("/api/verify-2fa", { emailOrMobile: emailOrMobile || userData.emailOrMobile, otp: otpValue });
      console.log("[Verify 2FA] Response:", res.data);
      setIs2FAEnabled(true);
      setOtpVerified(true);
      setShow2FAPopup(false);
      setShow2FASetup(false);
      setQrCode("");
      setOtp(["", "", "", "", "", ""]);
      if (!isLoggedIn) {
        const profileRes = await api.get(`/user/profile?emailOrMobile=${emailOrMobile || userData.emailOrMobile}`);
        setUserData({
          firstName: profileRes.data.firstName || "",
          lastName: profileRes.data.lastName || "",
          gender: profileRes.data.gender || "",
          emailOrMobile: profileRes.data.emailOrMobile || emailOrMobile
        });
        setIsLoggedIn(true);
      }
      showPopup("success", "2FA verify ho gaya!");
    } catch (err) {
      console.error("[Verify 2FA] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "2FA OTP galat hai, sahi OTP daal");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    try {
      console.log("[Disable 2FA] Disabling for:", userData.emailOrMobile);
      await api.post("/user/disable-2fa", { emailOrMobile: userData.emailOrMobile });
      setIs2FAEnabled(false);
      showPopup("success", "2FA band kar diya gaya!");
    } catch (err) {
      console.error("[Disable 2FA] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "2FA band karne mein problem hui");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      console.log("[Resend OTP] Resending OTP to:", emailOrMobile || userData.emailOrMobile);
      const endpoint = show2FAPopup || show2FASetup ? "/user/send-2fa-otp" : showForgotPassword ? "/user/forgot/send-otp" : "/user/send-otp";
      const res = await api.post(endpoint, { emailOrMobile: emailOrMobile || userData.emailOrMobile, isRegistration: false });
      console.log("[Resend OTP] Response:", res.data);
      showPopup("success", "OTP dobara bhej diya!");
      setTimer(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      console.error("[Resend OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "OTP dobara bhejne mein problem hui");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordOTP = async () => {
    if (!emailOrMobile.trim()) {
      showPopup("error", "Email ya mobile number daal, bhai!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Forgot Password OTP] Sending OTP to:", emailOrMobile);
      const res = await api.post("/user/forgot/send-otp", { emailOrMobile });
      console.log("[Forgot Password OTP] Response:", res.data);
      if (res.data.error && res.data.error.includes("not registered")) {
        showPopup("error", "Aapka email ya number nahi hai, pehle registration karo");
        setOtpSent(false);
      } else {
        showPopup("success", "OTP bhej diya gaya!");
        setOtpSent(true);
        setTimer(120);
        setCanResend(false);
        setShowOtpPopup(true);
      }
    } catch (err) {
      console.error("[Forgot Password OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "OTP bhejne mein problem hui");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotPasswordOTP = async () => {
    const otpValue = otp.join("");
    if (!otpValue || otpValue.length !== 6) {
      showPopup("error", "6-digit OTP daal, bhai!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Verify Forgot Password OTP] Verifying for:", emailOrMobile, "OTP:", otpValue);
      const res = await api.post("/user/forgot/verify-otp", { emailOrMobile, otp: otpValue });
      console.log("[Verify Forgot Password OTP] Response:", res.data);
      showPopup("success", "OTP verify ho gaya!");
      setOtpVerified(true);
      setShowOtpPopup(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      console.error("[Verify Forgot Password OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "OTP galat hai, sahi OTP daal");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      showPopup("error", "Dono password fields bharo!");
      return;
    }
    if (newPassword !== confirmPassword) {
      showPopup("error", "Password match nahi karte!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Reset Password] Resetting password for:", emailOrMobile);
      const res = await api.post("/user/forgot/reset-password", { emailOrMobile, password: newPassword });
      console.log("[Reset Password] Response:", res.data);
      showPopup("success", "Password reset ho gaya!");
      setTimeout(() => {
        setShowForgotPassword(false);
        setNewPassword("");
        setConfirmPassword("");
        setOtpSent(false);
        setOtpVerified(false);
      }, 1500);
    } catch (err) {
      console.error("[Reset Password] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Password reset mein problem hui");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log("[Logout] Logging out user:", userData?.emailOrMobile);
    setIsLoggedIn(false);
    setEmailOrMobile("");
    setOtp(["", "", "", "", "", ""]);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpSent(false);
    setOtpVerified(false);
    setShow2FAPopup(false);
    setShow2FASetup(false);
    setQrCode("");
    setIs2FAEnabled(false);
    setUserData({ firstName: "", lastName: "", gender: "", emailOrMobile: "" });
    setShowForgotPassword(false);
    setTimer(120);
    setCanResend(false);
    showPopup("success", "Logout ho gaya!");
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleSaveProfile = async () => {
    if (!editData.firstName || !editData.emailOrMobile) {
      showPopup("error", "First name aur email/mobile daal!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Save Profile] Updating profile for:", userData.emailOrMobile);
      const res = await api.post("/user/profile-info", {
        emailOrMobile: userData.emailOrMobile,
        firstName: editData.firstName,
        lastName: editData.lastName,
        gender: editData.gender,
      });
      console.log("[Save Profile] Response:", res.data);
      setUserData({
        firstName: editData.firstName,
        lastName: editData.lastName,
        gender: editData.gender,
        emailOrMobile: userData.emailOrMobile
      });
      setIsEditing(false);
      showPopup("success", "Profile update ho gaya!");
    } catch (err) {
      console.error("[Save Profile] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Profile update mein problem hui");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!window.confirm("Account deactivate karna hai kya?")) return;
    setLoading(true);
    try {
      console.log("[Deactivate Account] Deactivating for:", userData.emailOrMobile);
      const res = await api.post("/user/deactivate", { emailOrMobile: userData.emailOrMobile });
      console.log("[Deactivate Account] Response:", res.data);
      handleLogout();
      showPopup("success", "Account deactivate ho gaya!");
    } catch (err) {
      console.error("[Deactivate Account] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Account deactivate mein problem hui");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Account delete karna hai? Ye wapas nahi hoga!")) return;
    setLoading(true);
    try {
      console.log("[Delete Account] Deleting for:", userData.emailOrMobile);
      const res = await api.post("/user/delete", { emailOrMobile: userData.emailOrMobile });
      console.log("[Delete Account] Response:", res.data);
      handleLogout();
      showPopup("success", "Account delete ho gaya!");
    } catch (err) {
      console.error("[Delete Account] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Account delete mein problem hui");
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { icon: Package, label: "MY ORDERS", path: "/my-orders" },
    {
      icon: User,
      label: "ACCOUNT SETTINGS",
      path: "/account-settings",
      subItems: [
        { label: "Profile Information", path: "/profile" },
        { label: "Manage Addresses", path: "/addresses" },
        { label: "PAN Card Information", path: "/pan" },
      ],
    },
    {
      icon: CreditCard,
      label: "PAYMENTS",
      path: "/payments",
      subItems: [
        { label: "Gift Cards", path: "/gift-cards", amount: "₹0" },
        { label: "Saved UPI", path: "/upi" },
        { label: "Saved Cards", path: "/cards" },
      ],
    },
    {
      icon: Package,
      label: "MY STUFF",
      path: "/my-stuff",
      subItems: [
        { label: "My Coupons", path: "/coupons" },
        { label: "My Reviews & Ratings", path: "/reviews" },
        { label: "All Notifications", path: "/notifications" },
        { label: "My Wishlist", path: "/wishlist" },
      ],
    },
  ];

  const NavBar = () => (
    <div className="bg-blue-600 text-white">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="text-xl font-bold">Shopymol</div>
            <div className="text-xs text-yellow-300">Explore</div>
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-4 hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-2 pl-4 pr-10 text-black rounded"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 hover:bg-blue-700 p-2 rounded">
            <span className="hidden md:block">{userData?.firstName || "User"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="flex items-center space-x-1 hover:bg-blue-700 p-2 rounded">
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden md:block">Cart</span>
          </button>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`${sidebarOpen ? "block" : "hidden"} md:block fixed md:relative inset-0 md:inset-auto z-40 md:z-auto`}>
      <div className="bg-black bg-opacity-50 md:bg-transparent absolute inset-0 md:relative" onClick={() => setSidebarOpen(false)}>
        <div className="bg-white w-64 h-full p-4 shadow-lg md:shadow-none" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {userData?.firstName?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Hello,</p>
              <p className="font-semibold">{userData?.firstName || "User"} {userData?.lastName || ""}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item, index) => (
              <div key={index}>
                <Link to={item.path} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  {item.subItems && <ChevronRight className="w-4 h-4 text-gray-400" />}
                </Link>
                {item.subItems && (
                  <div className="ml-8 space-y-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link key={subIndex} to={subItem.path} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{subItem.label}</span>
                        {subItem.amount && <span className="text-sm font-medium">{subItem.amount}</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-8 pt-4 border-t">
            <div className="text-sm text-gray-600 mb-2">Frequently Visited:</div>
            <div className="space-y-1">
              <Link to="/track-order" className="text-sm text-gray-500 hover:text-blue-600">Track Order</Link>
              <Link to="/help" className="text-sm text-gray-500 hover:text-blue-600">Help Center</Link>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-6 flex items-center justify-center space-x-2 p-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  const Setup2FAPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-80">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-blue-600">2FA Setup Karo</h2>
          <button
            onClick={() => {
              setShow2FASetup(false);
              setOtp(["", "", "", "", "", ""]);
              setQrCode("");
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-2">Is QR code ko authenticator app se scan karo:</p>
        {qrCode && <img src={qrCode} alt="2FA QR Code" className="w-full mb-2" />}
        <p className="text-sm text-gray-600 mb-2">6-digit OTP daal jo app mein dikhega:</p>
        <div className="flex justify-center space-x-2 mb-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              maxLength={1}
              className="w-10 h-10 border-2 border-gray-300 rounded text-center text-lg focus:outline-none focus:border-blue-500"
            />
          ))}
        </div>
        <p className="text-sm text-blue-500 mb-2 text-center">
          {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : "Timer khatam! Resend karo"}
        </p>
        {canResend && (
          <button
            onClick={handleResendOTP}
            disabled={loading}
            className="w-full text-sm text-orange-500 hover:text-orange-700"
          >
            2FA OTP Dobara Bhejo
          </button>
        )}
        <button
          onClick={handleVerify2FA}
          disabled={loading || otp.join("").length !== 6}
          className="w-full mt-2 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Verify 2FA</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const Verify2FAPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-80">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-blue-600">2FA OTP Verify Karo</h2>
          <button onClick={() => { setShow2FAPopup(false); setOtp(["", "", "", "", "", ""]); }} className="text-blue-500 hover:text-blue-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {emailOrMobile || userData.emailOrMobile} pe bheja gaya 2FA OTP daal:
        </p>
        <div className="flex justify-center space-x-2 mb-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              maxLength={1}
              className="w-10 h-10 border-2 border-gray-300 rounded text-center text-lg focus:outline-none focus:border-blue-500"
            />
          ))}
        </div>
        <p className="text-sm text-blue-500 mb-2 text-center">
          {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : "Timer khatam! Resend karo"}
        </p>
        {canResend && (
          <button
            onClick={handleResendOTP}
            disabled={loading}
            className="w-full text-sm text-orange-500 hover:text-orange-700"
          >
            2FA OTP Dobara Bhejo
          </button>
        )}
        <button
          onClick={handleVerify2FA}
          disabled={loading || otp.join("").length !== 6}
          className="w-full mt-2 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Verify 2FA</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const OtpPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-80">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-blue-600">
            {showForgotPassword ? "Password Reset OTP" : "OTP Verify Karo"}
          </h2>
          <button onClick={() => { setShowOtpPopup(false); setOtp(["", "", "", "", "", ""]); }} className="text-blue-500 hover:text-blue-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {emailOrMobile} pe bheja gaya OTP daal:
        </p>
        <div className="flex justify-center space-x-2 mb-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              maxLength={1}
              className="w-10 h-10 border-2 border-gray-300 rounded text-center text-lg focus:outline-none focus:border-blue-500"
            />
          ))}
        </div>
        <p className="text-sm text-blue-500 mb-2 text-center">
          {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : "Timer khatam! Resend karo"}
        </p>
        {canResend && (
          <button
            onClick={handleResendOTP}
            disabled={loading}
            className="w-full text-sm text-orange-500 hover:text-orange-700"
          >
            OTP Dobara Bhejo
          </button>
        )}
      </div>
    </div>
  );

  const PersonalInfoSection = () => (
    <div className="bg-white rounded shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Personal Information</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="bg-blue-600 text-white py-1.5 px-4 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={isEditing ? editData.firstName : userData?.firstName || ""}
              onChange={(e) => isEditing && setEditData({ ...editData, firstName: e.target.value })}
              className="w-full p-2 border rounded bg-gray-50"
              placeholder="First Name"
              readOnly={!isEditing}
            />
          </div>
          <div>
            <input
              type="text"
              value={isEditing ? editData.lastName : userData?.lastName || ""}
              onChange={(e) => isEditing && setEditData({ ...editData, lastName: e.target.value })}
              className="w-full p-2 border rounded bg-gray-50"
              placeholder="Last Name"
              readOnly={!isEditing}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={isEditing ? editData.gender === "Male" : userData?.gender === "Male"}
                onChange={() => isEditing && setEditData({ ...editData, gender: "Male" })}
                className="mr-2"
                disabled={!isEditing}
              />
              Male
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={isEditing ? editData.gender === "Female" : userData?.gender === "Female"}
                onChange={() => isEditing && setEditData({ ...editData, gender: "Female" })}
                className="mr-2"
                disabled={!isEditing}
              />
              Female
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="Other"
                checked={isEditing ? editData.gender === "Other" : userData?.gender === "Other"}
                onChange={() => isEditing && setEditData({ ...editData, gender: "Other" })}
                className="mr-2"
                disabled={!isEditing}
              />
              Other
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={
              isEditing
                ? editData.emailOrMobile.includes("@")
                  ? editData.emailOrMobile
                  : ""
                : userData?.emailOrMobile.includes("@")
                ? userData.emailOrMobile
                : ""
            }
            onChange={(e) => isEditing && setEditData({ ...editData, emailOrMobile: e.target.value })}
            className="w-full p-2 border rounded bg-gray-50"
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
          <input
            type="text"
            value={
              isEditing
                ? !editData.emailOrMobile.includes("@")
                  ? `+91${editData.emailOrMobile.replace(/^91/, "")}`
                  : ""
                : !userData?.emailOrMobile.includes("@")
                ? `+91${userData.emailOrMobile.replace(/^91/, "")}`
                : ""
            }
            onChange={(e) => isEditing && setEditData({ ...editData, emailOrMobile: e.target.value.replace(/\D/g, "") })}
            className="w-full p-2 border rounded bg-gray-50"
            readOnly={!isEditing}
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
            {is2FAEnabled ? (
              <button
                onClick={handleDisable2FA}
                disabled={loading}
                className="text-red-600 hover:text-red-800 flex items-center space-x-1"
              >
                <Shield className="w-4 h-4" />
                <span>Disable 2FA</span>
              </button>
            ) : (
              <button
                onClick={handleSetup2FA}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <Shield className="w-4 h-4" />
                <span>Enable 2FA</span>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600">
            2FA Status: <span className={is2FAEnabled ? "text-green-600" : "text-red-600"}>
              {is2FAEnabled ? "Enabled" : "Disabled"}
            </span>
          </p>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h3>
          <div className="flex space-x-4">
            <button
              onClick={handleDeactivateAccount}
              disabled={loading}
              className="text-red-600 hover:text-red-800 flex items-center space-x-1"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Deactivate Account</span>
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="text-red-600 hover:text-red-800 flex items-center space-x-1"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const LoginSection = () => (
    <div className="bg-white rounded shadow p-6">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">Login</h1>
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 text-center ${loginMethod === "otp" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          onClick={() => setLoginMethod("otp")}
        >
          OTP Login
        </button>
        <button
          className={`flex-1 py-2 text-center ${loginMethod === "password" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          onClick={() => setLoginMethod("password")}
        >
          Password Login
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email ya Mobile Number</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
              className="w-full p-2 pl-10 border rounded focus:outline-none focus:border-blue-500"
              placeholder="Email ya mobile number daal"
            />
          </div>
        </div>

        {loginMethod === "password" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 pl-10 border rounded focus:outline-none focus:border-blue-500"
                placeholder="Password daal"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={loginMethod === "otp" ? handleSendOTP : handlePasswordLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{loginMethod === "otp" ? "OTP Bhejo" : "Login"}</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowForgotPassword(true)}
          className="w-full text-blue-600 hover:text-blue-800 text-sm"
        >
          Password Bhool Gaye?
        </button>
      </div>
    </div>
  );

  const ForgotPasswordSection = () => (
    <div className="bg-white rounded shadow p-6">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">Password Reset Karo</h1>
      <div className="space-y-4">
        {!otpVerified ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email ya Mobile Number</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  className="w-full p-2 pl-10 border rounded focus:outline-none focus:border-blue-500"
                  placeholder="Email ya mobile number daal"
                />
              </div>
            </div>
            <button
              onClick={handleForgotPasswordOTP}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>OTP Bhejo</span>
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Naya Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 pl-10 border rounded focus:outline-none focus:border-blue-500"
                  placeholder="Naya password daal"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Confirm Karo</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 pl-10 border rounded focus:outline-none focus:border-blue-500"
                  placeholder="Password confirm karo"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Password Reset Karo</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setOtpSent(false);
                setOtpVerified(false);
                setOtp(["", "", "", "", "", ""]);
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="w-full text-blue-600 hover:text-blue-800 text-sm"
            >
              Wapas Login Pe Jao
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded shadow p-4 max-w-sm w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${popup.type === "success" ? "bg-green-100" : "bg-red-100"}`}>
                  {popup.type === "success" ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                </div>
                <h3 className={`font-semibold ${popup.type === "success" ? "text-green-800" : "text-red-800"}`}>{popup.type === "success" ? "Success!" : "Error!"}</h3>
              </div>
              <button onClick={() => setPopup({ show: false, type: "", message: "" })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700">{popup.message}</p>
          </div>
        </div>
      )}

      <NavBar />

      {show2FASetup && <Setup2FAPopup />}
      {show2FAPopup && <Verify2FAPopup />}
      {showOtpPopup && <OtpPopup />}

      <div className="container mx-auto p-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="md:w-1/4">
          {isLoggedIn && <Sidebar />}
        </div>
        <div className="md:w-3/4">
          {!isLoggedIn ? (
            showForgotPassword ? (
              <ForgotPasswordSection />
            ) : (
              <LoginSection />
            )
          ) : (
            <PersonalInfoSection />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;