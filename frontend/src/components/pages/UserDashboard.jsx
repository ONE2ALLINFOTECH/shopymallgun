import React, { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Shield, CreditCard, LogOut, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import "./common.css"
import api from "../api/api"

const UserDashboard = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInputModal, setShowInputModal] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // No prompt, we'll use our custom modal
  }, []);

  const fetchProfile = async (input) => {
    setLoading(true);
    setError("");
    try {
      // Replace with your actual API call
      const res = await api.get(`/user/profile?emailOrMobile=${input}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError("Could not fetch profile. Please try again.");
      setShowErrorModal(true);
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      setEmailOrMobile(inputValue.trim());
      setShowInputModal(false);
      fetchProfile(inputValue.trim());
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    setShowInputModal(true);
    setError("");
    setInputValue("");
  };

  const handleLogout = () => {
    setProfile(null);
    setEmailOrMobile("");
    setShowInputModal(true);
    setInputValue("");
  };

  // Input Modal Component
  const InputModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">Enter your email or mobile number to access your dashboard</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Mobile Number
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
                placeholder="Enter your email or mobile number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                autoFocus
              />
            </div>
            
            <button
              onClick={handleInputSubmit}
              disabled={!inputValue.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Access Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Error Modal Component
  const ErrorModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Show Input Modal
  if (showInputModal) {
    return <InputModal />;
  }

  // Show Error Modal
  if (showErrorModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <ErrorModal />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Profile</h2>
            <p className="text-gray-600">Please wait while we fetch your information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !showErrorModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">User Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile.firstName}!</p>
        </div>

        {/* Main Dashboard Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-blue-100">{profile.emailOrMobile}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    {profile.emailOrMobile.includes('@') ? (
                      <Mail className="w-4 h-4 text-gray-500 mr-3" />
                    ) : (
                      <Phone className="w-4 h-4 text-gray-500 mr-3" />
                    )}
                    <div>
                      <p className="text-sm text-gray-500">
                        {profile.emailOrMobile.includes('@') ? 'Email' : 'Mobile'}
                      </p>
                      <p className="font-medium">{profile.emailOrMobile}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium capitalize">{profile.gender}</p>
                    </div>
                  </div>

                  <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-500 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{profile.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Verification Status
                </h3>
                
                <div className="space-y-3">
                  <div className={`p-4 rounded-lg border-2 ${
                    profile.aadhaarVerified 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <p className="font-medium">Aadhaar Verification</p>
                          <p className="text-sm text-gray-500">Government ID verification</p>
                        </div>
                      </div>
                      {profile.aadhaarVerified ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    profile.panVerified 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <p className="font-medium">PAN Verification</p>
                          <p className="text-sm text-gray-500">Tax identification verification</p>
                        </div>
                      </div>
                      {profile.panVerified ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Summary */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Verification Summary</h4>
                  <div className="flex items-center text-sm text-blue-600">
                    <div className="w-full bg-blue-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((profile.aadhaarVerified ? 1 : 0) + (profile.panVerified ? 1 : 0)) * 50}%` 
                        }}
                      ></div>
                    </div>
                    <span className="font-medium">
                      {((profile.aadhaarVerified ? 1 : 0) + (profile.panVerified ? 1 : 0)) * 50}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;