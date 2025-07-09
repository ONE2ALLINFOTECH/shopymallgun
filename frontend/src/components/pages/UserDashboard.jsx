import React, { useState, useEffect } from "react";
import { Mail, Phone, Shield, CheckCircle, AlertCircle, X, Send, Clock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
    localStorage.removeItem("userToken"); // Example: remove token
    navigate("/login");
    showPopup("success", "Logged out successfully");
  };

  const isEmail = emailOrMobile.includes("@");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
            G
          </div>
          <h2 className="ml-2 text-lg font-semibold">Gunjan Bansal</h2>
        </div>
        <nav className="space-y-2">
          <button className="w-full text-left p-2 hover:bg-gray-200 rounded">My Orders</button>
          <button className="w-full text-left p-2 hover:bg-gray-200 rounded">Account Settings</button>
          <button className="w-full text-left p-2 hover:bg-gray-200 rounded">Payments</button>
          <button className="w-full text-left p-2 hover:bg-gray-200 rounded">My Stuff</button>
          <button className="w-full text-left p-2 hover:bg-gray-200 rounded">My Wishlist</button>
          <button
            onClick={handleLogout}
            className="w-full text-left p-2 hover:bg-red-200 rounded text-red-600 flex items-center mt-4"
          >
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {popup.show && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {popup.type === "success" ? (
                    <CheckCircle className="text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="text-red-600 mr-2" />
                  )}
                  <span className={popup.type === "success" ? "text-green-600" : "text-red-600"}>
                    {popup.type === "success" ? "Success!" : "Error!"}
                  </span>
                </div>
                <button onClick={() => setPopup({ show: false, type: "", message: "" })}><X /></button>
              </div>
              <p className="mt-2">{popup.message}</p>
            </div>
          </div>
        )}

        {!isVerified ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold">Email or Mobile Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter email or mobile number"
                  />
                </div>
              </div>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
              <div>
                <label className="block text-sm font-semibold">Enter OTP</label>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm">OTP sent to {emailOrMobile}</p>
                  {timer > 0 && <p className="text-sm">{formatTime(timer)}</p>}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                {canResend && (
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="flex-1 bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
                  >
                    {loading ? "Resending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {userData?.firstName || "N/A"} {userData?.lastName || "N/A"}</p>
              <p><strong>Email/Mobile:</strong> {userData?.emailOrMobile || "N/A"}</p>
              <p><strong>Gender:</strong> {userData?.gender || "N/A"}</p>
              <button className="mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Edit</button>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold">FAQs</h3>
              <p>What happens when I update my email address or mobile number?</p>
              <p>It updates as soon as you confirm the verification code.</p>
            </div>
            <div className="mt-6">
              <button className="text-red-600">Deactivate Account</button>
              <button className="text-red-600 ml-4">Delete Account</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;