import React, { useState, useEffect } from "react";
import {
  Mail, Shield, CheckCircle, AlertCircle, X, Send, Clock, LogOut, RefreshCw,
  User, Package, CreditCard, Heart, Edit3, ShoppingCart, Search, ChevronRight, Menu,
  Lock, Eye, EyeOff
} from "lucide-react";

// Mock API - Replace with your actual API
const api = {
  post: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (url === "/user/send-otp") {
      return { data: { message: "OTP sent successfully to your email/mobile" } };
    } else if (url === "/user/verify-otp") {
      return { data: { message: "OTP verified successfully" } };
    } else if (url === "/user/login") {
      if (data.password === "wrong") {
        throw { response: { data: { error: "Invalid password" } } };
      }
      return { data: { message: "Login successful" } };
    } else if (url === "/user/forgot/reset-password") {
      return { data: { message: "Password reset successfully" } };
    } else if (url === "/user/update-profile") {
      return { data: { message: "Profile updated successfully", ...data } };
    } else if (url === "/user/deactivate-account") {
      return { data: { message: "Account deactivated successfully" } };
    } else if (url === "/user/delete-account") {
      return { data: { message: "Account deletion requested" } };
    }
    return { data: { message: "Success" } };
  },
  get: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const emailOrMobile = url.split('=')[1];
    return {
      data: {
        firstName: "John",
        lastName: "Doe",
        email: emailOrMobile.includes('@') ? emailOrMobile : "john.doe@example.com",
        emailOrMobile: emailOrMobile,
        gender: "Male"
      }
    };
  }
};

const UserDashboard = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginMethod, setLoginMethod] = useState("otp");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", gender: "" });

  useEffect(() => {
    let interval;
    if (!isVerified && timer > 0 && loginMethod === "otp" && otp) {
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
    return () => clearInterval(interval);
  }, [isVerified, timer, loginMethod, otp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const showPopup = (type, message) => {
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
      const res = await api.post("/user/send-otp", { emailOrMobile });
      showPopup("success", res.data.message);
      setOtp("");
      setTimer(120);
      setCanResend(false);
    } catch (err) {
      showPopup("error", err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      showPopup("error", "OTP is required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/user/verify-otp", { emailOrMobile, otp });
      const res = await api.get(`/user/profile?emailOrMobile=${emailOrMobile}`);
      setUserData(res.data);
      setIsVerified(true);
      showPopup("success", "OTP verified successfully");
    } catch (err) {
      showPopup("error", err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const res = await api.post("/user/send-otp", { emailOrMobile });
      showPopup("success", "OTP resent successfully");
      setTimer(120);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      showPopup("error", err.response?.data?.error || "Failed to resend OTP");
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
      const res = await api.post("/user/login", { emailOrMobile, password });
      const profileRes = await api.get(`/user/profile?emailOrMobile=${emailOrMobile}`);
      setUserData(profileRes.data);
      setIsVerified(true);
      showPopup("success", res.data.message);
    } catch (err) {
      showPopup("error", err.response?.data?.error || "Login failed");
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
      const res = await api.post("/user/forgot/reset-password", { emailOrMobile, password: newPassword });
      showPopup("success", res.data.message);
      setTimeout(() => {
        setShowForgotPassword(false);
        setNewPassword("");
        setConfirmPassword("");
        setIsVerified(true);
      }, 1500);
    } catch (err) {
      showPopup("error", err.response?.data?.error || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      gender: userData.gender
    });
  };

  const handleSaveProfile = async () => {
    if (!editData.firstName.trim() || !editData.lastName.trim()) {
      showPopup("error", "First name and last name are required");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/user/update-profile", {
        emailOrMobile,
        firstName: editData.firstName,
        lastName: editData.lastName,
        gender: editData.gender
      });
      setUserData(res.data);
      setIsEditing(false);
      showPopup("success", res.data.message);
    } catch (err) {
      showPopup("error", err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setLoading(true);
    try {
      const res = await api.post("/user/deactivate-account", { emailOrMobile });
      showPopup("success", res.data.message);
      setTimeout(handleLogout, 1500);
    } catch (err) {
      showPopup("error", err.response?.data?.error || "Failed to deactivate account");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const res = await api.post("/user/delete-account", { emailOrMobile });
      showPopup("success", res.data.message);
      setTimeout(handleLogout, 1500);
    } catch (err) {
      showPopup("error", err.response?.data?.error || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsVerified(false);
    setEmailOrMobile("");
    setOtp("");
    setPassword("");
    setUserData(null);
    setSidebarOpen(false);
    setLoginMethod("otp");
    setShowForgotPassword(false);
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
    showPopup("success", "Logged out successfully");
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
        { label: "PAN Card Information", path: "/pan" }
      ]
    },
    {
      icon: CreditCard,
      label: "PAYMENTS",
      path: "/payments",
      subItems: [
        { label: "Gift Cards", path: "/gift-cards", amount: "₹0" },
        { label: "Saved UPI", path: "/upi" },
        { label: "Saved Cards", path: "/cards" }
      ]
    },
    {
      icon: Heart,
      label: "MY STUFF",
      path: "/my-stuff",
      subItems: [
        { label: "My Coupons", path: "/coupons" },
        { label: "My Reviews & Ratings", path: "/reviews" },
        { label: "All Notifications", path: "/notifications" },
        { label: "My Wishlist", path: "/wishlist" }
      ]
    }
  ];

  const NavBar = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="text-xl sm:text-2xl font-bold italic">Flipkart</div>
            <div className="text-xs sm:text-sm text-yellow-300">Explore Plus</div>
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-4 hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full p-2 pl-4 pr-10 text-black rounded-lg sm:rounded-xl"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button className="flex items-center space-x-1 hover:bg-blue-700 p-2 rounded-lg transition-all">
            <span className="hidden sm:block text-sm">{userData?.firstName || "User"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="hidden md:block hover:bg-blue-700 p-2 rounded-lg text-sm transition-all">
            Become a Seller
          </button>
          <button className="hidden md:block hover:bg-blue-700 p-2 rounded-lg text-sm transition-all">
            More
          </button>
          <button className="flex items-center space-x-1 hover:bg-blue-700 p-2 rounded-lg transition-all">
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:block text-sm">Cart</span>
          </button>
        </div>
      </div>

      <div className="bg-white text-gray-700 px-4 py-2 hidden md:block">
        <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
          {["Electronics", "TVs & Appliances", "Men", "Women", "Baby & Kids", "Home & Furniture", "Sports, Books & More", "Flights", "Offer Zone"].map((item) => (
            <span key={item} className="hover:text-blue-600 cursor-pointer">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block fixed md:relative inset-0 md:inset-auto z-40 md:z-auto`}>
      <div className="bg-black bg-opacity-50 md:bg-transparent absolute inset-0 md:relative" onClick={() => setSidebarOpen(false)}>
        <div className="bg-white w-64 h-full p-4 sm:p-6 shadow-xl md:shadow-none" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center mb-4 sm:mb-6 pb-4 border-b">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
              {userData?.firstName?.[0] || "U"}
            </div>
            <div className="ml-3">
              <p className="text-xs sm:text-sm text-gray-600">Hello,</p>
              <p className="font-semibold text-sm sm:text-base">{userData?.firstName || "User"} {userData?.lastName || ""}</p>
            </div>
          </div>

          <nav className="space-y-1 sm:space-y-2">
            {sidebarItems.map((item, index) => (
              <div key={index}>
                <div
                  onClick={() => console.log(`Navigated to ${item.path}`)}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-all"
                >
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
                        onClick={() => console.log(`Navigated to ${subItem.path}`)}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-all"
                      >
                        <span className="text-xs sm:text-sm text-gray-600">{subItem.label}</span>
                        {subItem.amount && <span className="text-xs sm:text-sm font-medium">{subItem.amount}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-6 sm:mt-8 pt-4 border-t">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Frequently Visited:</div>
            <div className="space-y-1">
              <div className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 cursor-pointer">Track Order</div>
              <div className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 cursor-pointer">Help Center</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-4 sm:mt-6 flex items-center justify-center space-x-2 p-2 sm:p-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg sm:rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  const PersonalInfoSection = () => (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-6 border-b pb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Personal Information</h2>
        {!isEditing && (
          <button
            onClick={handleEditProfile}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  className="w-full p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  className="w-full p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Gender</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={editData.gender === "Male"}
                    onChange={() => setEditData({ ...editData, gender: "Male" })}
                    className="mr-2"
                  />
                  <span className="text-sm">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={editData.gender === "Female"}
                    onChange={() => setEditData({ ...editData, gender: "Female" })}
                    className="mr-2"
                  />
                  <span className="text-sm">Female</span>
                </label>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 sm:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg sm:rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={userData.firstName}
                  className="w-full p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500 bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={userData.lastName}
                  className="w-full p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500 bg-gray-50"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Gender</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={userData.gender === "Male"}
                    className="mr-2"
                    disabled
                  />
                  <span className="text-sm">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={userData.gender === "Female"}
                    className="mr-2"
                    disabled
                  />
                  <span className="text-sm">Female</span>
                </label>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              </div>
              <input
                type="email"
                value={userData.email}
                className="w-full p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500 bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Mobile Number</label>
                <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              </div>
              <input
                type="text"
                value={`+91${userData.emailOrMobile}`}
                className="w-full p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500 bg-gray-50"
                readOnly
              />
            </div>
          </div>
        )}
        <div className="border-t pt-4">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">FAQs</h3>
          <div className="space-y-4">
            {[
              {
                q: "What happens when I update my email address (or mobile number)?",
                a: "Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number)."
              },
              {
                q: "When will my Flipkart account be updated with the new email address (or mobile number)?",
                a: "It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes."
              },
              {
                q: "What happens to my existing Flipkart account when I update my email address (or mobile number)?",
                a: "Updating your email address (or mobile number) doesn't invalidate your account. Your account remains fully functional. You'll continue seeing your Order history, saved information and personal details."
              },
              {
                q: "Does my Seller account get affected when I update my email address?",
                a: "Flipkart has a 'single sign-on' policy. Any changes will reflect in your Seller account also."
              }
            ].map((faq, index) => (
              <div key={index}>
                <p className="font-medium text-sm sm:text-base mb-2">{faq.q}</p>
                <p className="text-xs sm:text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t pt-4 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleDeactivateAccount}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-blue-900 transition-all transform hover:scale-105 disabled:opacity-50"
            >
              Deactivate Account
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-800 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-red-700 hover:to-red-900 transition-all transform hover:scale-105 disabled:opacity-50"
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

      {!isVerified ? (
        <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 backdrop-blur-sm">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {showForgotPassword ? "Reset Password" : "Login to Your Account"}
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base px-2">
                {showForgotPassword ? "Create a new password" : "Choose your preferred login method"}
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500"
                    placeholder="Enter email or mobile number"
                  />
                </div>
              </div>

              {showForgotPassword ? (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500"
                        placeholder="Enter new password"
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
                        placeholder="Confirm new password"
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
                          <span>Reset Password</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowForgotPassword(false)}
                      className="px-4 py-2.5 sm:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg sm:rounded-xl font-semibold transition-all transform hover:scale-105"
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setLoginMethod("otp")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${loginMethod === "otp" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                    >
                      Login with OTP
                    </button>
                    <button
                      onClick={() => setLoginMethod("password")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${loginMethod === "password" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                    >
                      Login with Password
                    </button>
                  </div>

                  {loginMethod === "otp" && (
                    <>
                      {!otp ? (
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
                              <span>Send OTP</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base border-gray-200 focus:border-blue-500"
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                              />
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-1 sm:space-y-0">
                                <p className="text-xs sm:text-sm text-gray-500 break-all">OTP sent to {emailOrMobile}</p>
                                {timer > 0 && (
                                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-blue-600">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>{formatTime(timer)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-3 sm:mt-4">
                              <button
                                onClick={handleVerifyOTP}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50"
                              >
                                {loading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Verify OTP</span>
                                  </>
                                )}
                              </button>
                              {canResend && (
                                <button
                                  onClick={handleResendOTP}
                                  disabled={loading}
                                  className="px-4 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                  {loading ? (
                                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                                  ) : (
                                    <>
                                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span>Resend</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
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
                            placeholder="Enter your password"
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
                          onClick={() => { setShowForgotPassword(true); setOtp(""); }}
                          className="px-4 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                        >
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Forgot Password</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-2 sm:p-4 md:p-6">
            <PersonalInfoSection />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;