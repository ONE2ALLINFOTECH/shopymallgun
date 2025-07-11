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
  const [userData, setUserData] = useState({ firstName: "", lastName: "", gender: "", emailOrMobile: "" });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserData, setTempUserData] = useState({ firstName: "", lastName: "", gender: "", emailOrMobile: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      showPopup("error", "Email ya mobile number daal bhai!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Send OTP] OTP bhej raha hu:", emailOrMobile);
      const res = await api.post("/user/send-otp", { emailOrMobile, isRegistration: false });
      console.log("[Send OTP] Response mila:", res.data);
      if (res.data.error && res.data.error.includes("not registered")) {
        showPopup("error", "Bhai, yeh email ya number registered nahi hai, pehle register kar!");
        setOtpSent(false);
      } else {
        showPopup("success", res.data.message || "OTP bhej diya!");
        setOtpSent(true);
        setTimer(120);
        setCanResend(false);
        setShowOtpPopup(true);
      }
    } catch (err) {
      console.error("[Send OTP] Error aaya:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "OTP bhejne mein gadbad!");
      setOtpSent(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.join("").trim()) {
      showPopup("error", "OTP toh daal bhai!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Verify OTP] Verify kar raha hu:", emailOrMobile, "OTP:", otp.join(""));
      await api.post("/user/verify-otp", { emailOrMobile, otp: otp.join("") });
      const res = await api.get(`/user/profile?emailOrMobile=${emailOrMobile}`);
      console.log("[Verify OTP] Profile Data mila:", res.data);
      const newUserData = {
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        gender: res.data.gender || "", // Ensure gender is set
        emailOrMobile: res.data.emailOrMobile || emailOrMobile
      };
      setUserData(newUserData);
      setTempUserData(newUserData);
      setOtpVerified(true);
      setIsLoggedIn(true);
      setShowOtpPopup(false);
      showPopup("success", "OTP verify ho gaya!");
    } catch (err) {
      console.error("[Verify OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Sahi OTP daal bhai!");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!emailOrMobile.trim() || !password.trim()) {
      showPopup("error", "Email/mobile aur password dono daal!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Password Login] Login try kar raha hu:", emailOrMobile);
      const res = await api.post("/user/login", { emailOrMobile, password });
      console.log("[Password Login] Response mila:", res.data);
      const profileRes = await api.get(`/user/profile?emailOrMobile=${emailOrMobile}`);
      console.log("[Password Login] Profile Data mila:", profileRes.data);
      const newUserData = {
        firstName: profileRes.data.firstName || "",
        lastName: profileRes.data.lastName || "",
        gender: profileRes.data.gender || "", // Ensure gender is set
        emailOrMobile: profileRes.data.emailOrMobile || emailOrMobile
      };
      setUserData(newUserData);
      setTempUserData(newUserData);
      setIsLoggedIn(true);
      showPopup("success", res.data.message || "Login ho gaya bhai!");
    } catch (err) {
      console.error("[Password Login] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Login nahi hua, kuch galat hai!");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      console.log("[Resend OTP] OTP dobara bhej raha hu:", emailOrMobile);
      const res = await api.post("/user/send-otp", { emailOrMobile, isRegistration: false });
      console.log("[Resend OTP] Response:", res.data);
      showPopup("success", "OTP dobara bhej diya!");
      setTimer(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      console.error("[Resend OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "OTP dobara bhejne mein gadbad!");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordOTP = async () => {
    if (!emailOrMobile.trim()) {
      showPopup("error", "Email ya mobile number daal!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Forgot Password OTP] OTP bhej raha hu:", emailOrMobile);
      const res = await api.post("/user/forgot/send-otp", { emailOrMobile });
      console.log("[Forgot Password OTP] Response:", res.data);
      if (res.data.error && res.data.error.includes("not registered")) {
        showPopup("error", "Yeh email ya number registered nahi hai!");
        setOtpSent(false);
      } else {
        showPopup("success", res.data.message || "OTP bhej diya!");
        setOtpSent(true);
        setTimer(120);
        setCanResend(false);
        setShowOtpPopup(true);
      }
    } catch (err) {
      console.error("[Forgot Password OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "OTP bhejne mein gadbad!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotPasswordOTP = async () => {
    if (!otp.join("").trim()) {
      showPopup("error", "OTP daal bhai!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Verify Forgot Password OTP] Verify kar raha hu:", emailOrMobile, "OTP:", otp.join(""));
      const res = await api.post("/user/forgot/verify-otp", { emailOrMobile, otp: otp.join("") });
      console.log("[Verify Forgot Password OTP] Response:", res.data);
      showPopup("success", res.data.message || "OTP verify ho gaya!");
      setOtpVerified(true);
    } catch (err) {
      console.error("[Verify Forgot Password OTP] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Sahi OTP daal!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      showPopup("error", "Dono password fields bhar!");
      return;
    }
    if (newPassword !== confirmPassword) {
      showPopup("error", "Password match nahi kar raha!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Reset Password] Password reset kar raha hu:", emailOrMobile);
      const res = await api.post("/user/forgot/reset-password", { emailOrMobile, password: newPassword });
      console.log("[Reset Password] Response:", res.data);
      showPopup("success", res.data.message || "Password reset ho gaya!");
      setTimeout(() => {
        setShowForgotPassword(false);
        setNewPassword("");
        setConfirmPassword("");
        setOtpSent(false);
        setOtpVerified(false);
      }, 1500);
    } catch (err) {
      console.error("[Reset Password] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Password reset nahi hua!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log("[Logout] User ko logout kar raha hu:", userData?.emailOrMobile);
    setIsLoggedIn(false);
    setEmailOrMobile("");
    setOtp(["", "", "", "", "", ""]);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpSent(false);
    setOtpVerified(false);
    setUserData({ firstName: "", lastName: "", gender: "", emailOrMobile: "" });
    setTempUserData({ firstName: "", lastName: "", gender: "", emailOrMobile: "" });
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

  const handleEditToggle = () => {
    if (!isEditing) {
      setTempUserData({ ...userData });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!tempUserData.firstName.trim() || !tempUserData.lastName.trim()) {
      showPopup("error", "First name aur last name daal bhai!");
      return;
    }
    if (tempUserData.gender && !["Male", "Female"].includes(tempUserData.gender)) {
      showPopup("error", "Gender sahi daal, Male ya Female!");
      return;
    }
    setLoading(true);
    try {
      console.log("[Save Profile] Profile save kar raha hu:", userData.emailOrMobile, "Data:", tempUserData);
      const res = await api.post("/user/save-profile", {
        emailOrMobile: userData.emailOrMobile,
        firstName: tempUserData.firstName,
        lastName: tempUserData.lastName,
        gender: tempUserData.gender || ""
      });
      console.log("[Save Profile] Response:", res.data);
      setUserData({ ...tempUserData });
      setIsEditing(false);
      showPopup("success", "Profile update ho gaya!");
    } catch (err) {
      console.error("[Save Profile] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Profile update nahi hua!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      console.log("[Delete Account] Account delete kar raha hu:", userData.emailOrMobile);
      const res = await api.delete("/user/delete-account", { data: { emailOrMobile: userData.emailOrMobile } });
      console.log("[Delete Account] Response:", res.data);
      handleLogout();
      showPopup("success", "Account delete ho gaya!");
    } catch (err) {
      console.error("[Delete Account] Error:", err.response?.data || err.message);
      showPopup("error", err.response?.data?.error || "Account delete nahi hua!");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
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
                      <div key={subIndex} className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded">
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

  const PersonalInfoSection = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Personal Information</h1>
        <button onClick={handleEditToggle} className="text-blue-600 hover:text-blue-800">
          {isEditing ? "Cancel" : <Edit3 className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={isEditing ? tempUserData.firstName : userData.firstName || ""}
              onChange={(e) => isEditing && setTempUserData({ ...tempUserData, firstName: e.target.value })}
              className={`w-full p-2 border-2 rounded-lg ${isEditing ? "border-blue-500" : "border-gray-200 bg-gray-50"}`}
              placeholder="First Name"
              readOnly={!isEditing}
            />
          </div>
          <div>
            <input
              type="text"
              value={isEditing ? tempUserData.lastName : userData.lastName || ""}
              onChange={(e) => isEditing && setTempUserData({ ...tempUserData, lastName: e.target.value })}
              className={`w-full p-2 border-2 rounded-lg ${isEditing ? "border-blue-500" : "border-gray-200 bg-gray-50"}`}
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
                checked={(isEditing ? tempUserData.gender : userData.gender) === "Male"}
                onChange={() => isEditing && setTempUserData({ ...tempUserData, gender: "Male" })}
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
                checked={(isEditing ? tempUserData.gender : userData.gender) === "Female"}
                onChange={() => isEditing && setTempUserData({ ...tempUserData, gender: "Female" })}
                className="mr-2"
                disabled={!isEditing}
              />
              Female
            </label>
          </div>
          {(isEditing ? tempUserData.gender : userData.gender) === "" && (
            <p className="text-sm text-gray-500 mt-1">Gender select kar bhai (optional hai)</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
          </div>
          <input
            type="email"
            value={userData.emailOrMobile.includes("@") ? userData.emailOrMobile : ""}
            className="w-full p-2 border-2 rounded-lg border-gray-200 bg-gray-50"
            readOnly
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
          </div>
          <input
            type="text"
            value={!userData.emailOrMobile.includes("@") ? `+91${userData.emailOrMobile.replace(/^91/, "")}` : ""}
            className="w-full p-2 border-2 rounded-lg border-gray-200 bg-gray-50"
            readOnly
          />
        </div>

        {isEditing && (
          <div className="flex space-x-4">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">FAQs</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">Email ya mobile number update karne se kya hota hai?</p>
              <p className="text-sm text-gray-600">
                Tera login email ya number change ho jayega. Sab account related communication naye email ya number pe jayegi.
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">Shopymol account kab update hoga naye email ya number se?</p>
              <p className="text-sm text-gray-600">
                Jaise hi tu verification code confirm karega aur changes save karega, update ho jayega.
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">Purana account ka kya hoga jab email ya number update karunga?</p>
              <p className="text-sm text-gray-600">
                Account waisa hi rahega, bas email ya number change hoga. Order history, saved info sab safe rahega.
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">Seller account pe kya asar hoga email update karne se?</p>
              <p className="text-sm text-gray-600">
                Shopymol mein single sign-on hai, toh seller account bhi update ho jayega.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex space-x-4">
            <button className="text-blue-600 hover:text-blue-800">Deactivate Account</button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-800"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold text-red-700">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mt-2">Sacchi mein account delete karna hai? Wapas nahi hoga!</p>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                ) : (
                  "Delete"
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <NavBar />

      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
          <div className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full mx-2 sm:mx-4 transform transition-all duration-300 ${popup.show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${popup.type === "success" ? "bg-green-100" : "bg-red-100"}`}>
                  {popup.type === "success" ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" /> : <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />}
                </div>
                <h3 className={`font-semibold text-base sm:text-lg ${popup.type === "success" ? "text-green-800" : "text-red-800"}`}>{popup.type === "success" ? "Success!" : "Error!"}</h3>
              </div>
              <button onClick={() => setPopup({ show: false, type: "", message: "" })} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">{popup.message}</p>
            <div className={`w-full h-1 rounded-full ${popup.type === "success" ? "bg-green-200" : "bg-red-200"}`}>
              <div className={`h-full rounded-full animate-pulse ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`} style={{ width: "100%" }}></div>
            </div>
          </div>
        </div>
      )}

      {showOtpPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-80">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-blue-700">Login</h2>
              <button onClick={() => { setShowOtpPopup(false); setOtp(["", "", "", "", "", ""]); }} className="text-blue-500 hover:text-blue-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              OTP daal jo {emailOrMobile} pe bheja gaya
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
                onClick={handleResendOTP}
                disabled={loading}
                className="w-full text-xs text-orange-500 hover:text-orange-700 mt-2"
              >
                OTP Dobara Bhej
              </button>
            )}
          </div>
        </div>
      )}

      {!isLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {showForgotPassword ? "Password Reset Kar" : "Shopymol Mein Login Kar"}
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base px-2">
                {showForgotPassword ? "Naya password bana" : "Apna login method choose kar"}
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 backdrop-blur-sm">
              {showForgotPassword ? (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email ya Mobile Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={emailOrMobile}
                        onChange={(e) => setEmailOrMobile(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500"
                        placeholder="Email ya mobile number daal"
                      />
                    </div>
                  </div>

                  {!otpSent ? (
                    <button
                      onClick={handleForgotPasswordOTP}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>OTP Bhej</span>
                        </>
                      )}
                    </button>
                  ) : !otpVerified ? (
                    <div className="space-y-3 sm:space-y-4">
                      {/* OTP popup handled separately above */}
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Naya Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          </div>
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500"
                            placeholder="Naya password daal"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500"
                            placeholder="Password dobara daal"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                          onClick={handleResetPassword}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Password Reset Kar</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowForgotPassword(false)}
                          className="px-4 py-2.5 sm:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg sm:rounded-xl font-semibold transition-all transform hover:scale-105"
                        >
                          Wapas Login Pe Ja
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email ya Mobile Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={emailOrMobile}
                        onChange={(e) => setEmailOrMobile(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500"
                        placeholder="Email ya mobile number daal"
                      />
                    </div>
                  </div>

                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setLoginMethod("otp")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                        loginMethod === "otp" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      OTP se Login
                    </button>
                    <button
                      onClick={() => setLoginMethod("password")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                        loginMethod === "password" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Password se Login
                    </button>
                  </div>

                  {loginMethod === "otp" && (
                    <>
                      {!otpSent ? (
                        <button
                          onClick={handleSendOTP}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>OTP Bhej</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div>
                          {/* OTP popup handled separately above */}
                        </div>
                      )}
                    </>
                  )}

                  {loginMethod === "password" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500"
                            placeholder="Apna password daal"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                          onClick={handlePasswordLogin}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Login</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowForgotPassword(true)}
                          className="px-4 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                        >
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Password Bhool Gaya</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-600">Shopymol mein naya hai? </span>
                    <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold text-sm">Account Bana</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-4 md:p-6">
            <PersonalInfoSection />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;