import React, { useState, useEffect } from "react";
import { 
  Mail, Phone, Shield, CheckCircle, AlertCircle, X, Send, Clock, 
  LogOut, RefreshCw, User, Package, CreditCard, Heart, Settings,
  Edit3, Home, Star, Bell, Gift, HelpCircle, ShoppingCart, Search,
  ChevronRight, Menu
} from "lucide-react";
import api from "../api/api";

const UserDashboard = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let interval;
    if (!isVerified && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev <= 1 ? (setCanResend(true), 0) : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVerified, timer]);

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
      const res = await api.post("/user/send-otp", { emailOrMobile, isRegistration: false });
      showPopup("success", res.data.message);
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
      const res = await api.post("/user/send-otp", { emailOrMobile, isRegistration: false });
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

  const handleLogout = () => {
    setIsVerified(false);
    setEmailOrMobile("");
    setOtp("");
    setUserData(null);
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
      icon: Package, 
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
            <div className="text-xl font-bold italic">Flipkart</div>
            <div className="text-xs text-yellow-300">Explore Plus</div>
          </div>
        </div>
        
        <div className="flex-1 max-w-lg mx-4 hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full p-2 pl-4 pr-10 text-black rounded-sm"
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
          <button className="hidden md:block hover:bg-blue-700 p-2 rounded">
            More
          </button>
          <button className="flex items-center space-x-1 hover:bg-blue-700 p-2 rounded">
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden md:block">Cart</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white text-gray-700 px-4 py-2 hidden md:block">
        <div className="flex space-x-6 text-sm">
          <span className="hover:text-blue-600 cursor-pointer">Electronics</span>
          <span className="hover:text-blue-600 cursor-pointer">TVs & Appliances</span>
          <span className="hover:text-blue-600 cursor-pointer">Men</span>
          <span className="hover:text-blue-600 cursor-pointer">Women</span>
          <span className="hover:text-blue-600 cursor-pointer">Baby & Kids</span>
          <span className="hover:text-blue-600 cursor-pointer">Home & Furniture</span>
          <span className="hover:text-blue-600 cursor-pointer">Sports, Books & More</span>
          <span className="hover:text-blue-600 cursor-pointer">Flights</span>
          <span className="hover:text-blue-600 cursor-pointer">Offer Zone</span>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block fixed md:relative inset-0 md:inset-auto z-40 md:z-auto`}>
      <div className="bg-black bg-opacity-50 md:bg-transparent absolute inset-0 md:relative" onClick={() => setSidebarOpen(false)}>
        <div className="bg-white w-64 h-full p-4 shadow-lg md:shadow-none" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              G
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
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <button className="text-blue-600 hover:text-blue-800">
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <input
              type="text"
              value={userData.firstName}
              className="w-full p-2 border rounded"
              placeholder="First Name"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              value={userData.lastName}
              className="w-full p-2 border rounded"
              placeholder="Last Name"
              readOnly
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Your Gender</label>
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
              Male
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
              Female
            </label>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Email Address</label>
            <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
          </div>
          <input
            type="email"
            value={userData.email}
            className="w-full p-2 border rounded bg-gray-50"
            readOnly
          />
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Mobile Number</label>
            <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
          </div>
          <input
            type="text"
            value={`+91${userData.emailOrMobile}`}
            className="w-full p-2 border rounded bg-gray-50"
            readOnly
          />
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">FAQs</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">What happens when I update my email address (or mobile number)?</p>
              <p className="text-sm text-gray-600">
                Your login email id (or mobile number) changes, likewise. You'll receive all your account related 
                communication on your updated email address (or mobile number).
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">When will my Flipkart account be updated with the new email address (or mobile number)?</p>
              <p className="text-sm text-gray-600">
                It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">What happens to my existing Flipkart account when I update my email address (or mobile number)?</p>
              <p className="text-sm text-gray-600">
                Updating your email address (or mobile number) doesn't invalidate your account. Your account remains fully 
                functional. You'll continue seeing your Order history, saved information and personal details.
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">Does my Seller account get affected when I update my email address?</p>
              <p className="text-sm text-gray-600">
                Flipkart has a 'single sign-on' policy. Any changes will reflect in your Seller account also.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-6">
          <div className="flex space-x-4">
            <button className="text-blue-600 hover:text-blue-800">
              Deactivate Account
            </button>
            <button className="text-red-600 hover:text-red-800">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      
      {/* Popup */}
      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {popup.type === "success" ? (
                  <CheckCircle className="text-green-600 mr-2 w-6 h-6" />
                ) : (
                  <AlertCircle className="text-red-600 mr-2 w-6 h-6" />
                )}
                <span className={`font-semibold ${popup.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {popup.type === "success" ? "Success!" : "Error!"}
                </span>
              </div>
              <button onClick={() => setPopup({ show: false, type: "", message: "" })}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700">{popup.message}</p>
          </div>
        </div>
      )}

      {!isVerified ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-center">Login to Your Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email or Mobile Number</label>
                <input
                  type="text"
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email or mobile number"
                />
              </div>
              
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
              
              <div>
                <label className="block text-sm font-medium mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>OTP sent to {emailOrMobile}</span>
                  {timer > 0 && <span>{formatTime(timer)}</span>}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                
                {canResend && (
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="flex-1 bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend
                      </>
                    )}
                  </button>
                )}
              </div>
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