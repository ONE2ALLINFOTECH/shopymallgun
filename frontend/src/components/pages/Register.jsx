import React, { useState, useEffect } from "react";
import { Mail, Phone, Eye, EyeOff, Lock, Shield, CheckCircle, Send, X, AlertCircle, RefreshCw, Clock, Mic } from "lucide-react";

const Register = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

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

  // Auto verify OTP when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && isOTPSent && !isOTPVerified) {
      handleVerifyOTP();
    }
  }, [otp, isOTPSent, isOTPVerified]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setIsCaptchaVerified(false);
    setCaptchaInput("");
  };

  const speakCaptcha = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(captchaText.split("").join(" "));
      utterance.rate = 0.4;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      showPopup("error", "Text-to-speech not supported in your browser");
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup({ show: false, type: "", message: "" });
    }, 3000);
  };

  const handleCaptchaVerify = () => {
    if (captchaInput === captchaText) {
      setIsCaptchaVerified(true);
      showPopup("success", "CAPTCHA verified successfully!");
    } else {
      setIsCaptchaVerified(false);
      showPopup("error", "CAPTCHA verification failed. Please try again.");
      generateCaptcha();
    }
  };

const handleSendOTP = async () => {
  if (!emailOrMobile.trim()) {
    setErrors({ emailOrMobile: "Email or mobile number is required" });
    return;
  }
  if (!isCaptchaVerified) {
    showPopup("error", "Please verify CAPTCHA first");
    return;
  }
  setLoading(true);
  setErrors({});
  try {
    const res = await fetch("/api/user/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailOrMobile, isRegistration: true }),
    });
    const data = await res.json();
    if (res.ok) {
      showPopup("success", data.message);
      setIsOTPSent(true);
      setShowOTPPopup(true);
      setTimer(120);
      setCanResend(false);
    } else {
      showPopup("error", data.error || "Failed to send OTP");
    }
  } catch (err) {
    showPopup("error", "Failed to send OTP");
  } finally {
    setLoading(false);
  }
};

const handleResendOTP = async () => {
  setLoading(true);
  setErrors({});
  try {
    const res = await fetch("/api/user/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailOrMobile, isRegistration: true }),
    });
    const data = await res.json();
    if (res.ok) {
      showPopup("success", "OTP resent successfully!");
      setTimer(120);
      setCanResend(false);
      setOtp("");
    } else {
      showPopup("error", data.error || "Failed to resend OTP");
    }
  } catch (err) {
    showPopup("error", "Failed to resend OTP");
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
      const res = await fetch("/api/user/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailOrMobile, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        showPopup("success", data.message);
        setIsOTPVerified(true);
        setShowOTPPopup(false);
      } else {
        showPopup("error", data.error || "OTP verification failed");
      }
    } catch (err) {
      showPopup("error", "OTP verification failed");
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
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailOrMobile, password }),
      });
      const data = await res.json();
      if (res.ok) {
        showPopup("success", data.message);
        setTimeout(() => {
          window.location.href = "/profile-info";
        }, 1500);
      } else {
        showPopup("error", data.error || "Registration failed");
      }
    } catch (err) {
      showPopup("error", "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const isEmail = emailOrMobile.includes("@");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-2 sm:p-4">
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

      {/* OTP Popup */}
      {showOTPPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Login</h2>
              <button
                onClick={() => setShowOTPPopup(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-6 text-sm">
                Enter OTP Sent to {emailOrMobile.includes("@") ? emailOrMobile.replace(/(.{3}).*@/, "$1***@") : emailOrMobile.replace(/(.{3}).*(.{2})/, "$1****$2")}
              </p>
              
              <div className="mb-4">
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="text"
                      value={otp[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value.slice(-1);
                        if (!/^\d*$/.test(value)) return;
                        const newOtp = otp.split("");
                        newOtp[index] = value;
                        setOtp(newOtp.join(""));
                        if (value && index < 5) {
                          const nextInput = e.target.parentElement.children[index + 1];
                          if (nextInput) nextInput.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                          const prevInput = e.target.parentElement.children[index - 1];
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      className="w-12 h-12 text-center border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-medium"
                      maxLength={1}
                    />
                  ))}
                </div>
                {errors.otp && <p className="text-red-500 text-sm mt-2 text-center">{errors.otp}</p>}
              </div>

              <div className="text-center mb-6">
                {canResend ? (
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {loading ? "Resending..." : "Resend otp in 46"}
                  </button>
                ) : (
                  <span className="text-gray-500 text-sm">
                    Resend otp in {formatTime(timer)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Account</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base px-2">Secure registration with OTP verification</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 backdrop-blur-sm">
          <div className="flex items-center mb-6 sm:mb-8 overflow-x-auto">
            <div className="flex items-center whitespace-nowrap">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${isOTPSent ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}>
                {isOTPSent ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : "1"}
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">Contact</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 min-w-4 ${isOTPSent ? "bg-green-500" : "bg-gray-300"}`} />
            <div className="flex items-center whitespace-nowrap">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${isOTPVerified ? "bg-green-500 text-white" : isOTPSent ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"}`}>
                {isOTPVerified ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : "2"}
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">Verify</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 min-w-4 ${isOTPVerified ? "bg-green-500" : "bg-gray-300"}`} />
            <div className="flex items-center whitespace-nowrap">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${isOTPVerified ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"}`}>3</div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">Password</span>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isEmail ? <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                </div>
                <input
                  type="text"
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  className={`w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${errors.emailOrMobile ? "border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                  placeholder="Enter email or mobile number"
                  disabled={isOTPSent}
                />
                {isOTPSent && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.emailOrMobile && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.emailOrMobile}</p>}
            </div>

            {!isOTPSent && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CAPTCHA Verification</label>
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3 overflow-x-auto">
                    <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2 font-mono text-base sm:text-lg font-bold tracking-wider text-gray-700 select-none whitespace-nowrap">{captchaText}</div>
                    <button 
                      onClick={generateCaptcha} 
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      title="Refresh CAPTCHA"
                    >
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button 
                      onClick={speakCaptcha} 
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      title="Listen to CAPTCHA"
                    >
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <div className="flex space-x-2 sm:space-x-3">
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Enter CAPTCHA"
                      disabled={isCaptchaVerified}
                    />
                    <button
                      onClick={handleCaptchaVerify}
                      disabled={!captchaInput.trim() || isCaptchaVerified}
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base whitespace-nowrap ${
                        isCaptchaVerified 
                          ? "bg-green-500 text-white cursor-not-allowed" 
                          : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      {isCaptchaVerified ? "Verified" : "Verify"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={loading || !isCaptchaVerified}
                  className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Send OTP
                    </div>
                  )}
                </button>
              </div>
            )}

            {isOTPVerified && (
              <div className="space-y-4 sm:space-y-6">
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
                      className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${errors.password ? "border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>}
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
                      className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${errors.confirmPassword ? "border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-600 text-xs sm:text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;