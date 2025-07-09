import React, { useState, useEffect } from "react";
import { Mail, Shield, CheckCircle, AlertCircle, X, Send, Clock, Lock, RefreshCw, Eye, EyeOff } from "lucide-react";

// Mock API - Replace with your actual API
const api = {
  post: async (url, data) => {
    // Simulate API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (url === "/user/forgot/send-otp") {
      return { data: { message: "OTP sent successfully to your email/mobile" } };
    } else if (url === "/user/forgot/verify-otp") {
      return { data: { message: "OTP verified successfully" } };
    } else if (url === "/user/login") {
      if (data.password === "wrong") {
        throw { response: { data: { error: "Invalid password" } } };
      }
      return { data: { message: "Login successful" } };
    } else if (url === "/user/forgot/reset-password") {
      return { data: { message: "Password reset successfully" } };
    }
    
    return { data: { message: "Success" } };
  }
};

const ForgetPassword = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loginMethod, setLoginMethod] = useState("otp"); // "otp" or "password"
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);

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
    return () => clearInterval(interval);
  }, [otpSent, otpVerified, timer]);

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
      const res = await api.post("/user/forgot/send-otp", { emailOrMobile });
      showPopup("success", res.data.message);
      setOtpSent(true);
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
      const res = await api.post("/user/forgot/verify-otp", { emailOrMobile, otp });
      showPopup("success", res.data.message);
      setOtpVerified(true);
      setIsLoggedIn(true);
    } catch (err) {
      showPopup("error", err.response?.data?.error || "OTP verification failed");
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
      showPopup("success", res.data.message);
      setIsLoggedIn(true);
    } catch (err) {
      showPopup("error", err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const res = await api.post("/user/forgot/send-otp", { emailOrMobile });
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
      }, 1500);
    } catch (err) {
      showPopup("error", err.response?.data?.error || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmailOrMobile("");
    setOtp("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpSent(false);
    setOtpVerified(false);
    setIsLoggedIn(false);
    setShowForgotPassword(false);
    setTimer(120);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-2 sm:p-4">
      {/* Popup */}
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

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isLoggedIn ? "Welcome Back!" : showForgotPassword ? "Reset Password" : "Login"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base px-2">
            {isLoggedIn ? "You have successfully logged in" : showForgotPassword ? "Create a new password" : "Choose your preferred login method"}
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 backdrop-blur-sm">
          {isLoggedIn ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Login Successful!</h2>
              <p className="text-gray-600">You have been successfully logged in to your account.</p>
              <button
                onClick={resetForm}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Login Again
              </button>
              <button
                onClick={() => setShowForgotPassword(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
              >
                Reset Password
              </button>
            </div>
          ) : showForgotPassword ? (
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

              {/* Login Method Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLoginMethod("otp")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                    loginMethod === "otp" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Login with OTP
                </button>
                <button
                  onClick={() => setLoginMethod("password")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                    loginMethod === "password" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Login with Password
                </button>
              </div>

              {/* OTP Method */}
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
                        </div>
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
                  )}
                </>
              )}

              {/* Password Method */}
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
                      onClick={() => setShowForgotPassword(true)}
                      className="px-4 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Forgot Password</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;