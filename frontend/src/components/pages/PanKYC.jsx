import React, { useState } from "react";
import { Shield, CheckCircle, AlertCircle, CreditCard, Phone, Mail } from "lucide-react";
import "./common.css"
import api from "../api/api"
const PanKYC = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Email or Mobile validation
    if (!emailOrMobile.trim()) {
      newErrors.emailOrMobile = "Email or Mobile is required";
    } else if (!/^\d{10}$/.test(emailOrMobile) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrMobile)) {
      newErrors.emailOrMobile = "Please enter a valid email or 10-digit mobile number";
    }
    
    // PAN validation
    if (!panNumber.trim()) {
      newErrors.panNumber = "PAN Number is required";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      newErrors.panNumber = "Please enter a valid PAN number (e.g., ABCDE1234F)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyPAN = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
     const res = await api.post("/user/pan/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailOrMobile,
          panNumber,
        }),
      });
      
      const data = await res.json();
      
      // Success popup
      const successPopup = document.createElement('div');
      successPopup.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center transform animate-slideUp shadow-2xl">
            <div class="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">Verification Successful!</h3>
            <p class="text-gray-600 mb-4">${data.message}</p>
            <div class="flex items-center justify-center gap-2 text-green-600 font-semibold">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Redirecting to success page...</span>
            </div>
          </div>
        </div>
      `;
      
      // Add animations
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(successPopup);
      
      setTimeout(() => {
        document.body.removeChild(successPopup);
        document.head.removeChild(style);
        window.location.href = "/kyc-success";
      }, 3000);
      
    } catch (err) {
      // Error notification
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div class="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          PAN verification failed. Please try again.
        </div>
      `;
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'emailOrMobile') {
      setEmailOrMobile(value);
    } else if (field === 'panNumber') {
      setPanNumber(value.toUpperCase());
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const getInputIcon = (field) => {
    if (field === 'emailOrMobile') {
      return /^\d/.test(emailOrMobile) ? <Phone className="w-5 h-5 text-blue-500" /> : <Mail className="w-5 h-5 text-blue-500" />;
    }
    return <CreditCard className="w-5 h-5 text-purple-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">PAN Verification</h1>
          <p className="text-gray-600">Secure verification powered by Cashfree</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            
            {/* Email/Mobile Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Registered Email or Mobile
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {getInputIcon('emailOrMobile')}
                </div>
                <input
                  type="text"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                    errors.emailOrMobile 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
                  }`}
                  placeholder="Enter email or 10-digit mobile"
                  value={emailOrMobile}
                  onChange={(e) => handleInputChange('emailOrMobile', e.target.value)}
                />
                {errors.emailOrMobile && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.emailOrMobile}
                  </div>
                )}
              </div>
            </div>

            {/* PAN Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PAN Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                </div>
                <input
                  type="text"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 uppercase font-mono tracking-wider ${
                    errors.panNumber 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-purple-500 focus:bg-purple-50'
                  }`}
                  placeholder="ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  maxLength="10"
                />
                {errors.panNumber && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.panNumber}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleVerifyPAN}
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Verify PAN
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Your data is encrypted and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanKYC;