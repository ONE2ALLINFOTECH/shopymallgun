import React, { useState, useEffect } from "react";
import {
  Mail, Shield, CheckCircle, AlertCircle, X, Send, Clock, LogOut, RefreshCw, User, Package, CreditCard,
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
  const [userData, setUserData] = useState({ firstName: "", lastName: "", gender: "", emailOrMobile: "", twoFactorEnabled: false });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    emailOrMobile: ""
  });
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState(["", "", "", "", "", ""]);
  const [show2FAVerification, setShow2FAVerification] = useState(false);

  useEffect(() => {
    let interval;
    if (otpSent && !otpVerified && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    if (otpSent && !otpVerified && otp.join("").length === 6) {
      handleVerifyOTP();
    }
    return () => clearInterval(interval);
  }, [otpSent, otpVerified, timer, otp]);

  useEffect(() => {
    if (isLoggedIn) {
      setEditData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        gender: userData.gender || "",
        emailOrMobile: userData.emailOrMobile || ""
      });
    }
  }, [userData]);

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

  const handleSendOTP = async () => {
    if (!emailOrMobile.trim()) {
      showPopup("error", "Email or mobile number is required");
      return;
    }
    setLoading(true);
    try {
      console.log("[Send OTP] Requesting OTP for:", emailOrMobile);
      const res = await api.post("/user/send-otp", { emailOrMobile, isRegistration: false });
      console.log("[Send OTP] Response:", res.data);
      if (res.data && res.data.error && res.data.error.includes("not registered")) {
        showPopup("error", "Aapka email ya number nahi hai, pehle registration karo");
        setOtpSent(false);
      } else {
        showPopup("success", res.data.message || "OTP sent successfully");
        setOtpSent(true);
        setTimer(120);
        setCanResend(false);
        setShowOtpPopup(true);
      }
    } catch (err) {
      console.error("[Send OTP] Error:", err.response?.data || err.message);
      if (err.response?.data?.error && err.response.data.error.includes("not registered")) {
        showPopup("error", "Aapka email ya number nahi hai, pehle registration karo");
        setOtpSent(false);
      } else {
        showPopup("error", err.response?.data?.error || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.join("").trim()) {
      showPopup("error", "OTP is required");
      return;
    }
    setLoading(true);
    try {
      console.log("[Verify OTP] Verifying for:", emailOrMobile, "OTP:", otp.join(""));
      await api.post("/user/verify-otp", { emailOrMobile, otp: otp.join("") });
      const res = await api.get(`/user/profile?emailOrMobile=${emailOrMobile}`);
      console.log("[Verify OTP] Profile Data:", res.data);
      setUserData({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        gender: res.data.gender || "",
        emailOrMobile: res.data.emailOrMobile || emailOrMobile,
        twoFactorEnabled: res.data.twoFactorEnabled || false
      });
      setOtpVerified(true);
      setIsLoggedIn(true);
      setShowOtpPopup(false);
      showPopup("success", "OTP verified successfully");
    } catch (err) {
      console.error("[Verify OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Please enter the correct OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!emailOrMobile.trim() || !password.trim()) {
      showPopup("error", "Email/mobile and password are required");
      return;
    }
    setLoading(true);
    try {
      console.log("[Password Login] Attempting login for:", emailOrMobile);
      const res = await api.post("/user/login", { emailOrMobile, password });
      console.log("[Password Login] Response:", res.data);
      if (res.data.twoFactorRequired) {
        const profileRes = await api.get(`/user/profile?emailOrMobile=${emailOrMobile}`);
        setUserData({
          firstName: profileRes.data.firstName || "",
          lastName: profileRes.data.lastName || "",
          gender: profileRes.data.gender || "",
          emailOrMobile: profileRes.data.emailOrMobile || emailOrMobile,
          twoFactorEnabled: profileRes.data.twoFactorEnabled || false
        });
        setShow2FAVerification(true);
        showPopup("info", "Please enter 2FA code");
      } else {
        const profileRes = await api.get(`/user/profile?emailOrMobile=${emailOrMobile}`);
        console.log("[Password Login] Profile Data:", profileRes.data);
        setUserData({
          firstName: profileRes.data.firstName || "",
          lastName: profileRes.data.lastName || "",
          gender: profileRes.data.gender || "",
          emailOrMobile: profileRes.data.emailOrMobile || emailOrMobile,
          twoFactorEnabled: profileRes.data.twoFactorEnabled || false
        });
        setIsLoggedIn(true);
        showPopup("success", res.data.message || "Login successful");
      }
    } catch (err) {
      console.error("[Password Login] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      console.log("[Resend OTP] Resending OTP to:", emailOrMobile);
      const res = await api.post("/user/send-otp", { emailOrMobile, isRegistration: false });
      console.log("[Resend OTP] Response:", res.data);
      showPopup("success", "OTP resent successfully");
      setTimer(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      console.error("[Resend OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordOTP = async () => {
    if (!emailOrMobile.trim()) {
      showPopup("error", "Email or mobile number is required");
      return;
    }
    setLoading(true);
    try {
      console.log("[Forgot Password OTP] Sending OTP to:", emailOrMobile);
      const res = await api.post("/user/forgot/send-otp", { emailOrMobile });
      console.log("[Forgot Password OTP] Response:", res.data);
      if (res.data && res.data.error && res.data.error.includes("not registered")) {
        showPopup("error", "Aapka email ya number nahi hai, pehle registration karo");
        setOtpSent(false);
      } else {
        showPopup("success", res.data.message || "OTP sent successfully");
        setOtpSent(true);
        setTimer(120);
        setCanResend(false);
        setShowOtpPopup(true);
      }
    } catch (err) {
      console.error("[Forgot Password OTP] Error:", err.response?.data || err.message);
      if (err.response?.data?.error && err.response.data.error.includes("not registered")) {
        showPopup("error", "Aapka email ya number nahi hai, pehle registration karo");
        setOtpSent(false);
      } else {
        showPopup("error", err.response?.data?.error || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotPasswordOTP = async () => {
    if (!otp.join("").trim()) {
      showPopup("error", "OTP is required");
      return;
    }
    setLoading(true);
    try {
      console.log("[Verify Forgot Password OTP] Verifying for:", emailOrMobile, "OTP:", otp.join(""));
      const res = await api.post("/user/forgot/verify-otp", { emailOrMobile, otp: otp.join("") });
      console.log("[Verify Forgot Password OTP] Response:", res.data);
      showPopup("success", res.data.message || "OTP verified successfully");
      setOtpVerified(true);
    } catch (err) {
      console.error("[Verify Forgot Password OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      showPopup("error", "Both password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      showPopup("error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      console.log("[Reset Password] Resetting password for:", emailOrMobile);
      const res = await api.post("/user/forgot/reset-password", { emailOrMobile, password: newPassword });
      console.log("[Reset Password] Response:", res.data);
      showPopup("success", res.data.message || "Password reset successfully");
      setTimeout(() => {
        setShowForgotPassword(false);
        setNewPassword("");
        setConfirmPassword("");
        setOtpSent(false);
        setOtpVerified(false);
      }, 1500);
    } catch (err) {
      console.error("[Reset Password] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Password reset failed");
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
    setUserData({ firstName: "", lastName: "", gender: "", emailOrMobile: "", twoFactorEnabled: false });
    setShowForgotPassword(false);
    setShow2FASetup(false);
    setQrCode("");
    setTwoFactorToken(["", "", "", "", "", ""]);
    setShow2FAVerification(false);
    setTimer(120);
    setCanResend(false);
    showPopup("success", "Logged out successfully");
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleTwoFactorTokenChange = (index, value) => {
    const newToken = [...twoFactorToken];
    newToken[index] = value.slice(-1);
    setTwoFactorToken(newToken);
    if (value && index < 5) {
      document.getElementById(`2fa-input-${index + 1}`).focus();
    }
  };

  const handleSaveProfile = async () => {
    if (!editData.firstName || !editData.emailOrMobile) {
      showPopup("error", "First name and email/mobile are required");
      return;
    }
    setLoading(true);
    try {
      console.log("[Save Profile] Updating profile for:", emailOrMobile);
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
        emailOrMobile: userData.emailOrMobile,
        twoFactorEnabled: userData.twoFactorEnabled
      });
      setIsEditing(false);
      showPopup("success", "Profile updated successfully");
    } catch (err) {
      console.error("[Save Profile] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setLoading(true);
    try {
      console.log("[Deactivate Account] Deactivating for:", userData.emailOrMobile);
      const res = await api.post("/user/deactivate", { emailOrMobile: userData.emailOrMobile });
      console.log("[Deactivate Account] Response:", res.data);
      handleLogout();
      showPopup("success", "Account deactivated successfully");
    } catch (err) {
      console.error("[Deactivate Account] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Failed to deactivate account");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    setLoading(true);
    try {
      console.log("[Delete Account] Deleting for:", userData.emailOrMobile);
      const res = await api.post("/user/delete", { emailOrMobile: userData.emailOrMobile });
      console.log("[Delete Account] Response:", res.data);
      handleLogout();
      showPopup("success", "Account deleted successfully");
    } catch (err) {
      console.error("[Delete Account] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      console.log("[Setup 2FA] Generating QR code for:", userData.emailOrMobile);
      const res = await api.post("/user/send-2fa-otp", { emailOrMobile: userData.emailOrMobile });
      console.log("[Setup 2FA] Response:", res.data);
      setQrCode(res.data.qrCode);
      setShow2FASetup(true);
      showPopup("success", "Scan the QR code with Google Authenticator");
    } catch (err) {
      console.error("[Setup 2FA] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorToken.join("").trim()) {
      showPopup("error", "2FA code is required");
      return;
    }
    setLoading(true);
    try {
      console.log("[Verify 2FA] Verifying for:", userData.emailOrMobile, "Token:", twoFactorToken.join(""));
      const res = await api.post("/user/verify-2fa", { emailOrMobile: userData.emailOrMobile, token: twoFactorToken.join("") });
      console.log("[Verify 2FA] Response:", res.data);
      setUserData({ ...userData, twoFactorEnabled: true });
      setShow2FASetup(false);
      setShow2FAVerification(false);
      setTwoFactorToken(["", "", "", "", "", ""]);
      if (!isLoggedIn) {
        setIsLoggedIn(true);
      }
      showPopup("success", res.data.message || "2FA verified successfully");
    } catch (err) {
      console.error("[Verify 2FA] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Invalid 2FA code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    try {
      console.log("[Disable 2FA] Disabling for:", userData.emailOrMobile);
      const res = await api.post("/user/disable-2fa", { emailOrMobile: userData.emailOrMobile });
      console.log("[Disable 2FA] Response:", res.data);
      setUserData({ ...userData, twoFactorEnabled: false });
      setShow2FASetup(false);
      setQrCode("");
      showPopup("success", res.data.message || "2FA disabled successfully");
    } catch (err) {
      console.error("[Disable 2FA] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Failed to disable 2FA");
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
        { label: "Two-Factor Authentication", path: "/2fa", onClick: () => setShow2FASetup(true) },
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
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="text-xl font-bold italic">Shopymol</div>
            <div className="text-xs text-yellow-300">Explore Plus</div>
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-4 hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full p-2 pl-4 pr-10 text-black rounded-lg"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 hover:bg-blue-700 p-2 rounded">
            <span className="hidden md:block">{userData?.firstName || "User"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="hidden md:block hover:bg-blue-700 p-2 rounded">
            Become a Seller
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
                <div className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer rounded">
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  {item.subItems && <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
                {item.subItems && (
                  <div className="ml-8 space-y-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <div
                        key={subIndex}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded"
                        onClick={subItem.onClick}
                      >
                        <span className="text-sm text-gray-600">{subItem.label}</span>
                        {subItem.amount && <span className="text-sm font-medium">{subItem.amount}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-8 pt-4 border-t">
            <div className="text-sm text-gray-600 mb-2">Frequently Visited:</div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer">Track Order</div>
              <div className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer">Help Center</div>
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

  const TwoFASetupSection = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Two-Factor Authentication</h1>
        <button
          onClick={() => setShow2FASetup(false)}
          className="text-gray-600 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {userData.twoFactorEnabled ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Two-Factor Authentication is enabled.</p>
          <button
            onClick={handleDisable2FA}
            disabled={loading}
            className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Disable 2FA</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Scan this QR code with Google Authenticator to enable 2FA.</p>
          {qrCode && <img src={qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48" />}
          <div className="flex justify-center space-x-2 mb-2">
            {twoFactorToken.map((digit, index) => (
              <input
                key={index}
                id={`2fa-input-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleTwoFactorTokenChange(index, e.target.value)}
                maxLength={1}
                className="w-10 h-10 border-2 border-gray-300 rounded text-center text-lg focus:outline-none focus:border-blue-500"
              />
            ))}
          </div>
          <button
            onClick={handleVerify2FA}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Verify 2FA Code</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  const TwoFAVerificationPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-80">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-blue-700">2FA Verification</h2>
          <button
            onClick={() => {
              setShow2FAVerification(false);
              setTwoFactorToken(["", "", "", "", "", ""]);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-2">Enter the code from Google Authenticator</p>
        <div className="flex justify-center space-x-2 mb-2">
          {twoFactorToken.map((digit, index) => (
            <input
              key={index}
              id={`2fa-input-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleTwoFactorTokenChange(index, e.target.value)}
              maxLength={1}
              className="w-10 h-10 border-2 border-gray-300 rounded text-center text-lg focus:outline-none focus:border-blue-500"
            />
          ))}
        </div>
        <button
          onClick={handleVerify2FA}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Verify</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const PersonalInfoSection = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
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
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-1.5 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 flex items-center space-x-2"
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

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              key="firstName-input"
              type="text"
              value={isEditing ? editData.firstName : userData?.firstName || ""}
              onChange={(e) => isEditing && setEditData({ ...editData, firstName: e.target.value })}
              className="w-full p-2 border-2 rounded-lg border-gray-200 bg-gray-50"
              placeholder="First Name"
              readOnly={!isEditing}
            />
          </div>
          <div>
            <input
              key="lastName-input"
              type="text"
              value={isEditing ? editData.lastName : userData?.lastName || ""}
              onChange={(e) => isEditing && setEditData({ ...editData, lastName: e.target.value })}
              className="w-full p-2 border-2 rounded-lg border-gray-200 bg-gray-50"
              placeholder="Last Name"
              readOnly={!isEditing}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Gender</label>
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            {isEditing && (
              <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
            )}
          </div>
          <input
            key="email-input"
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
            className="w-full p-2 border-2 rounded-lg border-gray-200 bg-gray-50"
            readOnly={!isEditing}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            {isEditing && (
              <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
            )}
          </div>
          <input
            key="mobile-input"
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
            className="w-full p-2 border-2 rounded-lg border-gray-200 bg-gray-50"
            readOnly={!isEditing}
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">FAQs</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">What happens when I update my email address (or mobile number)?</p>
              <p className="text-sm text-gray-600">
                Your login email id (or mobile number) changes, likewise. You'll receive all your account related 
                communication on your updated email address (or mobile number).
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">When will my Shopymol account be updated with the new email address (or mobile number)?</p>
              <p className="text-sm text-gray-600">
                It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">What happens to my existing Shopymol account when I update my email address (or mobile number)?</p>
              <p className="text-sm text-gray-600">
                Updating your email address (or mobile number) doesn't invalidate your account. Your account remains fully 
                functional. You'll continue seeing your Order history, saved information and personal details.
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">Does my Seller account get affected when I update my email address?</p>
              <p className="text-sm text-gray-600">
                Shopymol has a 'single sign-on' policy. Any changes will reflect in your Seller account also.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex space-x-4">
            <button
              onClick={handleDeactivateAccount}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              Deactivate Account
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
          <div className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full mx-2 sm:mx-4 transform transition-all duration-300 ${popup.show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${popup.type === "success" ? "bg-green-100" : popup.type === "info" ? "bg-blue-100" : "bg-red-100"}`}>
                  {popup.type === "success" ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" /> : popup.type === "info" ? <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" /> : <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />}
                </div>
                <h3 className={`font-semibold text-base sm:text-lg ${popup.type === "success" ? "text-green-800" : popup.type === "info" ? "text-blue-800" : "text-red-800"}`}>{popup.type === "success" ? "Success!" : popup.type === "info" ? "Info" : "Error!"}</h3>
              </div>
              <button onClick={() => setPopup({ show: false, type: "", message: "" })} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">{popup.message}</p>
            <div className={`w-full h-1 rounded-full ${popup.type === "success" ? "bg-green-200" : popup.type === "info" ? "bg-blue-200" : "bg-red-200"}`}>
              <div className={`h-full rounded-full animate-pulse ${popup.type === "success" ? "bg-green-500" : popup.type === "info" ? "bg-blue-500" : "bg-red-500"}`} style={{ width: "100%" }}></div>
            </div>
          </div>
        </div>
      )}

      {showOtpPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-80">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-blue-700">{showForgotPassword ? "Reset Password OTP" : "Login OTP"}</h2>
              <button onClick={() => { setShowOtpPopup(false); setOtp(["", "", "", "", "", ""]); }} className="text-blue-500 hover:text-blue-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Enter OTP Sent to {emailOrMobile}
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
            {timer > 0 && (
              <p className="text-xs text-blue-500 mb-2 text-center">Resend OTP in {formatTime(timer)}</p>
            )}
            {canResend && (
              <button
                onClick={showForgotPassword ? handleForgotPasswordOTP : handleResendOTP}
                disabled={loading}
                className="w-full text-xs text-orange-500 hover:text-orange-700 mt-2"
              >
                Resend OTP
              </button>
            )}
            <button
              onClick={showForgotPassword ? handleVerifyForgotPasswordOTP : handleVerifyOTP}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify OTP</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {show2FAVerification && <TwoFAVerificationPopup />}

      {!isLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {showForgotPassword ? "Reset Password" : "Login to Shopymol"}
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                {showForgotPassword
                  ? "Enter your email or mobile number to reset your password"
                  : "Login with OTP or Password"}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
              {!showForgotPassword ? (
                <>
                  <div className="flex mb-4">
                    <button
                      onClick={() => setLoginMethod("otp")}
                      className={`flex-1 py-2 text-sm sm:text-base font-medium ${
                        loginMethod === "otp" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
                      }`}
                    >
                      OTP Login
                    </button>
                    <button
                      onClick={() => setLoginMethod("password")}
                      className={`flex-1 py-2 text-sm sm:text-base font-medium ${
                        loginMethod === "password" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
                      }`}
                    >
                      Password Login
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email or Mobile Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={emailOrMobile}
                          onChange={(e) => setEmailOrMobile(e.target.value)}
                          className="w-full p-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-blue-500"
                          placeholder="Enter email or mobile"
                        />
                        <Mail className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {loginMethod === "password" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-blue-500"
                            placeholder="Enter password"
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
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{loginMethod === "otp" ? "Send OTP" : "Login"}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowForgotPassword(true)}
                      className="w-full text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {!otpVerified ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email or Mobile Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={emailOrMobile}
                            onChange={(e) => setEmailOrMobile(e.target.value)}
                            className="w-full p-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-blue-500"
                            placeholder="Enter email or mobile"
                          />
                          <Mail className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      <button
                        onClick={handleForgotPasswordOTP}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send OTP</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-blue-500"
                            placeholder="Enter new password"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-blue-500"
                            placeholder="Confirm new password"
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
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Reset Password</span>
                          </>
                        )}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1">
            <NavBar />
            <div className="p-4 sm:p-6 md:p-8">
              <div className="max-w-4xl mx-auto">
                {show2FASetup ? <TwoFASetupSection /> : <PersonalInfoSection />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;