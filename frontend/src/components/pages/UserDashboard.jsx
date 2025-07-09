import React, { useState, useEffect } from "react";
import { Mail, Phone, Shield, CheckCircle, AlertCircle, X, Send, Clock } from "lucide-react";
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

  useEffect(() => {
    let interval;
    if (!isVerified && timer > 0) {
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
  }, [isVerified, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup({ show: false, type: "", message: "" });
    }, 3000);
  };

  const handleSendOTP = async () => {
    if (!emailOrMobile.trim()) {
      showPopup("error", "Email or mobile number is required");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/user/send-otp", { emailOrMobile, isRegistration: false }); // Add isRegistration: false
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
      const res = await api.post("/user/send-otp", { emailOrMobile, isRegistration: false }); // Add isRegistration: false
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

  const isEmail = emailOrMobile.includes("@");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-2 sm:p-4">
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
          <div
            className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full mx-2 sm:mx-4 transform transition-all duration-300 ${
              popup.show ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    popup.type === "success" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {popup.type === "success" ? (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  )}
                </div>
                <h3
                  className={`font-semibold text-base sm:text-lg ${
                    popup.type === "success" ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {popup.type === "success" ? "Success!" : "Error!"}
                </h3>
              </div>
              <button
                onClick={() => setPopup({ show: false, type: "", message: "" })}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">{popup.message}</p>
            <div
              className={`w-full h-1 rounded-full ${
                popup.type === "success" ? "bg-green-200" : "bg-red-200"
              }`}
            >
              <div
                className={`h-full rounded-full animate-pulse ${
                  popup.type === "success" ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Dashboard
          </h1>
        </div>

        {!isVerified ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 backdrop-blur-sm">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isEmail ? (
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    ) : (
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    )}
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
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-1 sm:space-y-0">
                  <p className="text-xs sm:text-sm text-gray-500 break-all">
                    OTP sent to {emailOrMobile}
                  </p>
                  {timer > 0 && (
                    <div className="flex items-center space-x-1 text-xs sm:text-sm text-blue-600">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatTime(timer)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
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
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 backdrop-blur-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Profile Details</h2>
            <div className="space-y-4">
              <p>
                <strong>Email/Mobile:</strong> {userData?.emailOrMobile}
              </p>
              <p>
                <strong>First Name:</strong> {userData?.firstName}
              </p>
              <p>
                <strong>Last Name:</strong> {userData?.lastName}
              </p>
              <p>
                <strong>Gender:</strong> {userData?.gender}
              </p>
              <p>
                <strong>Address:</strong> {userData?.address}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;