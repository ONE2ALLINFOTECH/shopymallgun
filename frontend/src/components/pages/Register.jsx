import React, { useState, useEffect } from "react";
import { Mail, Phone, Eye, EyeOff, Lock, Shield, CheckCircle, Send, RefreshCw, Clock, AlertCircle, X } from "lucide-react";
import "./common.css";
import api from "../api/api";

const Register = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  const generateCaptcha = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    let interval;
    if (isOTPSent && !isOTPVerified && timer > 0) {
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
  }, [isOTPSent, isOTPVerified, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: "", message: "" }), 3000);
  };

  const handleVerifyCaptcha = () => {
    if (!userCaptchaInput.trim()) {
      setErrors({ captcha: "CAPTCHA is required" });
      return;
    }
    if (userCaptchaInput !== captcha) {
      setErrors({ captcha: "Invalid CAPTCHA" });
      generateCaptcha();
      setUserCaptchaInput("");
      return;
    }
    setErrors({});
    setIsCaptchaVerified(true);
    showPopup("success", "CAPTCHA verified successfully");
  };

  const handleSendOTP = async () => {
    if (!emailOrMobile.trim()) {
      setErrors({ emailOrMobile: "Email or mobile number is required" });
      return;
    }
    if (!isCaptchaVerified) {
      setErrors({ captcha: "Please verify CAPTCHA first" });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const normalizedEmailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
      const res = await api.post("/user/send-otp", { emailOrMobile: normalizedEmailOrMobile });
      showPopup("success", res.data.message);
      setIsOTPSent(true);
      setTimer(120);
      setCanResend(false);
      localStorage.setItem("emailOrMobile", normalizedEmailOrMobile);
    } catch (err) {
      console.error("Send OTP error:", err.response || err);
      showPopup("error", err.response?.data?.error || "Failed to send OTP");
      if (err.response?.data?.error === "Your profile already exists") {
        setEmailOrMobile("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setErrors({});
    try {
      const normalizedEmailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
      const res = await api.post("/user/send-otp", { emailOrMobile: normalizedEmailOrMobile });
      showPopup("success", "OTP resent successfully!");
      setTimer(120);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      console.error("Resend OTP error:", err.response || err);
      showPopup("error", err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const normalizedEmailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
      const res = await api.post("/user/verify-otp", { emailOrMobile: normalizedEmailOrMobile, otp });
      showPopup("success", res.data.message);
      setIsOTPVerified(true);
    } catch (err) {
      console.error("Verify OTP error:", err.response || err);
      showPopup("error", err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const newErrors = {};
    if (!password.trim()) newErrors.password = "Password is required";
    if (!confirmPassword.trim()) newErrors.confirmPassword = "Confirm password is required";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const normalizedEmailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
      const res = await api.post("/user/register", { emailOrMobile: normalizedEmailOrMobile, password });
      showPopup("success", res.data.message);
      setTimeout(() => {
        window.location.href = "/profile-info";
      }, 1500);
    } catch (err) {
      console.error("Register error:", err.response || err);
      showPopup("error", err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const isEmail = emailOrMobile.includes("@");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all duration-300 ${popup.show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${popup.type === "success" ? "bg-green-100" : "bg-red-100"}`}>
                {popup.type === "success" ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />}
                <h3 className={`font-semibold text-lg ${popup.type === "success" ? "text-green-800" : "text-red-800"}`}>{popup.type === "success" ? "Success!" : "Error!"}</h3>
              </div>
              <button onClick={() => setPopup({ show: false, type: "", message: "" })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-4">{popup.message}</p>
          </div>
        </div>
      )}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Secure registration with OTP verification</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCaptchaVerified ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}>{isCaptchaVerified ? <CheckCircle className="w-5 h-5" /> : "1"}</div>
            <div className={`flex-1 h-0.5 mx-4 ${isCaptchaVerified ? "bg-green-500" : "bg-gray-300"}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOTPSent ? "bg-green-500 text-white" : isCaptchaVerified ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"}`}>{isOTPSent ? <CheckCircle className="w-5 h-5" /> : "2"}</div>
            <div className={`flex-1 h-0.5 mx-4 ${isOTPSent ? "bg-green-500" : "bg-gray-300"}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOTPVerified ? "bg-green-500 text-white" : isOTPSent ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"}`}>{isOTPVerified ? <CheckCircle className="w-5 h-5" /> : "3"}</div>
            <div className={`flex-1 h-0.5 mx-4 ${isOTPVerified ? "bg-green-500" : "bg-gray-300"}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOTPVerified ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"}`}>4</div>
          </div>
          <div className="space-y-6">
            {!isCaptchaVerified && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Verify CAPTCHA</label>
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded font-mono text-lg">{captcha}</div>
                  <input
                    type="text"
                    value={userCaptchaInput}
                    onChange={(e) => setUserCaptchaInput(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.captcha ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                    placeholder="Enter CAPTCHA"
                  />
                  <button
                    onClick={handleVerifyCaptcha}
                    disabled={loading}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold transition-all"
                  >
                    Verify
                  </button>
                </div>
                {errors.captcha && <div className="flex items-center mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4 mr-1" />{errors.captcha}</div>}
              </div>
            )}
            {isCaptchaVerified && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{isEmail ? <Mail className="w-5 h-5 text-gray-400" /> : <Phone className="w-5 h-5 text-gray-400" />}</div>
                    <input
                      type="text"
                      value={emailOrMobile}
                      onChange={(e) => setEmailOrMobile(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.emailOrMobile ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                      placeholder="Enter email or mobile number"
                      disabled={isOTPSent}
                    />
                    {isOTPSent && <div className="absolute inset-y-0 right-0 pr-3 flex items-center"><CheckCircle className="w-5 h-5 text-green-500" /></div>}
                    {errors.emailOrMobile && <div className="flex items-center mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4 mr-1" />{errors.emailOrMobile}</div>}
                  </div>
                </div>
                {!isOTPSent && (
                  <button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"}`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send OTP</span>
                      </>
                    )}
                  </button>
                )}
                {isOTPSent && !isOTPVerified && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Shield className="w-5 h-5 text-gray-400" /></div>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-mono text-center tracking-widest ${errors.otp ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                          placeholder="Enter 6-digit OTP"
                          maxLength="6"
                        />
                      </div>
                      {errors.otp && <div className="flex items-center mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4 mr-1" />{errors.otp}</div>}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-500">OTP sent to {emailOrMobile}</p>
                        {timer > 0 && (
                          <div className="flex items-center space-x-1 text-sm text-blue-600">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(timer)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleVerifyOTP}
                        disabled={loading || otp.length !== 6}
                        className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${loading || otp.length !== 6 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"}`}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Verify OTP</span>
                          </>
                        )}
                      </button>
                      {canResend && (
                        <button
                          onClick={handleResendOTP}
                          disabled={loading}
                          className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Resend</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {isOTPVerified && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-gray-400" /></div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                          placeholder="Create password"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">{showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}</button>
                      </div>
                      {errors.password && <div className="flex items-center mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4 mr-1" />{errors.password}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-gray-400" /></div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.confirmPassword ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                          placeholder="Confirm password"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">{showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}</button>
                      </div>
                      {errors.confirmPassword && <div className="flex items-center mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4 mr-1" />{errors.confirmPassword}</div>}
                    </div>
                    <button
                      onClick={handleRegister}
                      disabled={loading}
                      className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"}`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Register & Continue</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;