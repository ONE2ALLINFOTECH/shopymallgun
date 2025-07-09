import React, { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Phone, Eye, EyeOff, Lock, Shield, CheckCircle, Send, X, AlertCircle, RefreshCw, Clock, Mic } from "lucide-react";
import "./common.css"
import api from "../api/api"
const Register = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
 
  // CAPTCHA states
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  
  // Timer states
  const [timer, setTimer] = useState(120); // 2 minutes = 120 seconds
  const [canResend, setCanResend] = useState(false);
  
  // Popup states
  const [popup, setPopup] = useState({ show: false, type: '', message: '' });

  // Timer effect
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

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate random CAPTCHA
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setIsCaptchaVerified(false);
    setCaptchaInput("");
  };

  // Speak CAPTCHA text
  const speakCaptcha = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Create new utterance with CAPTCHA text
      const utterance = new SpeechSynthesisUtterance(captchaText.split('').join(' '));
      
      // Try to find Indian English voice
      const indianVoice = voices.find(voice => 
        voice.lang.includes('en-IN') || 
        voice.name.toLowerCase().includes('indian') ||
        voice.name.toLowerCase().includes('hindi')
      );
      
      // If Indian voice not found, try to find any English voice
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en-') && voice.lang !== 'en-US'
      );
      
      // Set voice preference: Indian > Other English > Default
      if (indianVoice) {
        utterance.voice = indianVoice;
      } else if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      // Configure speech settings for slow and clear speech
      utterance.rate = 0.4; // Much slower for better clarity
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    } else {
      showPopup('error', 'Text-to-speech not supported in your browser');
    }
  };

  // Initialize CAPTCHA on component mount
  React.useEffect(() => {
    generateCaptcha();
  }, []);

  // Show popup function
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup({ show: false, type: '', message: '' });
    }, 3000);
  };

  // Verify CAPTCHA
  const handleCaptchaVerify = () => {
    if (captchaInput === captchaText) {
      setIsCaptchaVerified(true);
      showPopup('success', 'CAPTCHA verified successfully!');
    } else {
      setIsCaptchaVerified(false);
      showPopup('error', 'CAPTCHA verification failed. Please try again.');
      generateCaptcha();
    }
  };

  const handleSendOTP = async () => {
    if (!emailOrMobile.trim()) {
      setErrors({ emailOrMobile: "Email or mobile number is required" });
      return;
    }
    
    if (!isCaptchaVerified) {
      showPopup('error', 'Please verify CAPTCHA first');
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const res = await api.post("/user/send-otp", {
        emailOrMobile,
      });
      showPopup('success', res.data.message);
      setIsOTPSent(true);
      setTimer(120); // Reset timer to 2 minutes
      setCanResend(false);
    } catch (err) {
      showPopup('error', 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      const res = await api.post("/user/send-otp", {
        emailOrMobile,
      });
      showPopup('success', 'OTP resent successfully!');
      setTimer(120); // Reset timer to 2 minutes
      setCanResend(false);
      setOtp(""); // Clear previous OTP
    } catch (err) {
      showPopup('error', 'Failed to resend OTP');
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
      const res = await api.post("/user/verify-otp", {
        emailOrMobile,
        otp,
      });
      showPopup('success', res.data.message);
      setIsOTPVerified(true);
    } catch (err) {
      showPopup('error', 'OTP verification failed');
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
      const res = await api.post("/user/register", {
        emailOrMobile,
        password,
      });
      showPopup('success', res.data.message);
      // Redirect to next page: Profile Info
      setTimeout(() => {
        window.location.href = "/profile-info";
      }, 1500);
    } catch (err) {
      showPopup('error', 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isEmail = emailOrMobile.includes('@');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-2 sm:p-4">
      {/* Beautiful Popup */}
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
          <div className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full mx-2 sm:mx-4 transform transition-all duration-300 ${
            popup.show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  popup.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {popup.type === 'success' ? 
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" /> : 
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  }
                </div>
                <h3 className={`font-semibold text-base sm:text-lg ${
                  popup.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {popup.type === 'success' ? 'Success!' : 'Error!'}
                </h3>
              </div>
              <button
                onClick={() => setPopup({ show: false, type: '', message: '' })}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">{popup.message}</p>
            <div className={`w-full h-1 rounded-full ${
              popup.type === 'success' ? 'bg-green-200' : 'bg-red-200'
            }`}>
              <div className={`h-full rounded-full animate-pulse ${
                popup.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`} style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base px-2">Secure registration with OTP verification</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 backdrop-blur-sm">
          {/* Progress Steps */}
          <div className="flex items-center mb-6 sm:mb-8 overflow-x-auto">
            <div className="flex items-center whitespace-nowrap">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${
                isOTPSent ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {isOTPSent ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : '1'}
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">Contact</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 min-w-4 ${isOTPSent ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="flex items-center whitespace-nowrap">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${
                isOTPVerified ? 'bg-green-500 text-white' : 
                isOTPSent ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
              }`}>
                {isOTPVerified ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : '2'}
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">Verify</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 min-w-4 ${isOTPVerified ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="flex items-center whitespace-nowrap">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${
                isOTPVerified ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
              }`}>
                3
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">Password</span>
            </div>
          </div>

          {/* Email/Mobile Input */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isEmail ? <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                </div>
                <input
                  type="text"
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  className={`w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${
                    errors.emailOrMobile ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="Enter email or mobile number"
                  disabled={isOTPSent}
                />
                {isOTPSent && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.emailOrMobile && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.emailOrMobile}</p>
              )}
            </div>

            {/* CAPTCHA Section */}
            {!isOTPSent && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CAPTCHA Verification
                  </label>
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3 overflow-x-auto">
                    <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2 font-mono text-base sm:text-lg font-bold tracking-wider text-gray-700 select-none whitespace-nowrap">
                      {captchaText}
                    </div>
                    <button
                      onClick={generateCaptcha}
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex-shrink-0"
                      title="Refresh CAPTCHA"
                    >
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={speakCaptcha}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex-shrink-0"
                      title="Listen to CAPTCHA"
                    >
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Enter CAPTCHA"
                      maxLength={6}
                    />
                    <button
                      onClick={handleCaptchaVerify}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base w-full sm:w-auto ${
                        isCaptchaVerified 
                          ? 'bg-green-500 text-white cursor-not-allowed' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                      disabled={isCaptchaVerified}
                    >
                      {isCaptchaVerified ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" /> : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Send OTP Button */}
            {!isOTPSent && (
              <button
                onClick={handleSendOTP}
                disabled={loading || !isCaptchaVerified}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
            )}

            {/* OTP Input */}
            {isOTPSent && !isOTPVerified && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={`w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${
                        errors.otp ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.otp}</p>
                  )}
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
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base"
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
                      className="px-4 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base"
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

            {/* Password Fields */}
            {isOTPVerified && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${
                        errors.password ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Create password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
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
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Register & Continue</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6 px-2">
          <p className="text-xs sm:text-sm text-gray-500">
            By registering, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;