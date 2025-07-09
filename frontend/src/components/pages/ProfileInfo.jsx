import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowRight, CheckCircle, XCircle, X } from "lucide-react";
import "./common.css"
import api from "../api/api"


const ProfileInfo = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("success"); // "success" or "error"
  const [popupMessage, setPopupMessage] = useState("");

  const showNotification = (type, message) => {
    setPopupType(type);
    setPopupMessage(message);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    if (popupType === "success") {
      window.location.href = "/aadhaar"; // Go to Aadhaar KYC
    }
  };
const handleSaveProfile = async () => {
  setIsLoading(true);
  try {
    const res = await api.post("/user/profile-info", {
      emailOrMobile,
      firstName,
      lastName,
      gender,
      address,
    });

    if (res.status === 200) {
      showNotification("success", res.data.message);
    } else {
      showNotification("error", res.data.message || "Failed to save profile");
    }
  } catch (err) {
    showNotification("error", "Failed to save profile");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Please fill in your details to continue with KYC verification</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            {/* Email/Mobile Field */}
         <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registered Email or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your email or mobile number"
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                />
              </div>
            </div> 

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Gender Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                 
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                  placeholder="Enter your complete address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Profile Completion</span>
                <span>Step 1 of 2</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-1/2 transition-all duration-300"></div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className={`w-full py-4 px-6 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="w-5 h-5 mr-2" />
                  Save & Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Next Step Preview */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-md border border-gray-200">
            <span className="text-sm text-gray-600">Next: Aadhaar KYC Verification</span>
            <ArrowRight className="w-4 h-4 ml-2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Beautiful Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Close Button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Icon */}
              <div className="mx-auto mb-4">
                {popupType === "success" ? (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {popupType === "success" ? "Success!" : "Error!"}
              </h3>

              {/* Message */}
              <p className="text-gray-600 mb-6">
                {popupMessage}
              </p>

              {/* Action Button */}
              <button
                onClick={closePopup}
                className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 ${
                  popupType === "success"
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-300'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-300'
                }`}
              >
                {popupType === "success" ? "Continue to Aadhaar KYC" : "Try Again"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;