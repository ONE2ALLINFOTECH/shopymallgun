import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, LogOut, CheckCircle, Loader2, AlertCircle, X } from "lucide-react";
import "./common.css";
import api from "../api/api";

const UserDashboard = () => {
  const [emailOrMobile, setEmailOrMobile] = useState(localStorage.getItem("emailOrMobile") || "");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: "", message: "" }), 3000);
  };

  const fetchProfile = async () => {
    if (!emailOrMobile) {
      setError("No email or mobile found. Please register again.");
      showPopup("error", "No email or mobile found. Please register again.");
      return;
    }
    setLoading(true);
    try {
      const normalizedEmailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
      const res = await api.get(`/user/profile?emailOrMobile=${encodeURIComponent(normalizedEmailOrMobile)}`);
      console.log("Profile fetched from MongoDB Atlas:", res.data);
      setProfile(res.data.data);
      setError("");
      showPopup("success", "Profile loaded successfully!");
    } catch (err) {
      console.error("Fetch profile error:", err.response || err);
      setError(err.response?.data?.error || "Failed to fetch profile");
      showPopup("error", err.response?.data?.error || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("emailOrMobile");
    setEmailOrMobile("");
    setProfile(null);
    showPopup("success", "Logged out successfully!");
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Dashboard</h1>
          <p className="text-gray-600">Your profile information</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-600">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
              <button
                onClick={() => (window.location.href = "/register")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold transition-all"
              >
                Go to Register
              </button>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {isEmail ? <Mail className="w-5 h-5 text-blue-600" /> : <Phone className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{isEmail ? "Email" : "Mobile"}</p>
                  <p className="text-lg font-semibold text-gray-800">{profile.emailOrMobile}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-semibold text-gray-800">{profile.firstName} {profile.lastName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-lg font-semibold text-gray-800">{profile.gender || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-lg font-semibold text-gray-800">{profile.address || "Not specified"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>No profile data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;