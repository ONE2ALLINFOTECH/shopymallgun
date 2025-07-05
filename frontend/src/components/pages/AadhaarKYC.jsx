import React, { useState } from "react";
import axios from "axios";
import { Shield, Phone, Mail, CreditCard, CheckCircle, Send, Lock, AlertCircle } from "lucide-react";
import "./common.css"
const AadhaarKYC = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendAadhaarOTP = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/user/aadhaar/send-otp", {
        emailOrMobile,
        aadhaarNumber,
      });
      alert("OTP sent to Aadhaar mobile.");
      setOtpSent(true);
    } catch (err) {
      alert("Failed to send Aadhaar OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAadhaarOTP = async () => {
    setVerifying(true);
    try {
      const res = await axios.post("http://localhost:5000/api/user/aadhaar/verify-otp", {
        emailOrMobile,
        otp,
      });
      alert(res.data.message);
      window.location.href = "/pan";
    } catch (err) {
      alert("Aadhaar verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const formatAadhaarNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Format as XXXX-XXXX-XXXX
    return digits.replace(/(\d{4})(?=\d)/g, '$1-');
  };

  const isValidAadhaar = (number) => {
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber.length === 12;
  };

  const isValidEmailOrMobile = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;
    return emailRegex.test(value) || mobileRegex.test(value);
  };

  const handleAadhaarChange = (e) => {
    const formatted = formatAadhaarNumber(e.target.value);
    if (formatted.length <= 14) { // Max length with dashes
      setAadhaarNumber(formatted);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Aadhaar Verification</h1>
          <p className="text-gray-600">Secure verification powered by Cashfree</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                !otpSent ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
              }`}>
                {!otpSent ? '1' : <CheckCircle className="w-4 h-4" />}
              </div>
              <div className={`h-1 w-12 transition-all duration-300 ${
                otpSent ? 'bg-green-500' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                otpSent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email/Mobile Input */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {emailOrMobile.includes('@') ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Phone className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                    emailOrMobile && !isValidEmailOrMobile(emailOrMobile)
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="Enter your registered email or mobile"
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                />
              </div>
              {emailOrMobile && !isValidEmailOrMobile(emailOrMobile) && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Please enter a valid email or mobile number
                </div>
              )}
            </div>

            {/* Aadhaar Number Input */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aadhaar Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 font-mono ${
                    aadhaarNumber && !isValidAadhaar(aadhaarNumber)
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="XXXX-XXXX-XXXX"
                  value={aadhaarNumber}
                  onChange={handleAadhaarChange}
                />
              </div>
              {aadhaarNumber && !isValidAadhaar(aadhaarNumber) && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Aadhaar number must be 12 digits
                </div>
              )}
            </div>

            {/* Send OTP Button */}
            {!otpSent && (
              <button
                onClick={handleSendAadhaarOTP}
                disabled={loading || !isValidEmailOrMobile(emailOrMobile) || !isValidAadhaar(aadhaarNumber)}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  loading || !isValidEmailOrMobile(emailOrMobile) || !isValidAadhaar(aadhaarNumber)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
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

            {/* OTP Verification Section */}
            {otpSent && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">OTP sent successfully!</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Please check your registered mobile number
                  </p>
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200 font-mono text-center tracking-widest"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength="6"
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerifyAadhaarOTP}
                  disabled={verifying || otp.length !== 6}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    verifying || otp.length !== 6
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {verifying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Verify Aadhaar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Secure Verification</p>
                <p className="text-xs text-gray-600 mt-1">
                  Your Aadhaar information is processed securely through Shopymoll encrypted platform. 
                  We never store your complete Aadhaar details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AadhaarKYC;