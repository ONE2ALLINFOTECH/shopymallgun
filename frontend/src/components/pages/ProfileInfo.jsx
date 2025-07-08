import React, { useState } from "react";
import { User, CheckCircle, AlertCircle, X } from "lucide-react";
import "./common.css";
import api from "../api/api";

const ProfileInfo = () => {
  const [emailOrMobile, setEmailOrMobile] = useState(localStorage.getItem("emailOrMobile") || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: "", message: "" }), 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!emailOrMobile.trim()) newErrors.emailOrMobile = "Email or mobile is required";
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const normalizedEmailOrMobile = emailOrMobile.includes("@") ? emailOrMobile.toLowerCase().trim() : emailOrMobile.trim();
      const res = await api.post("/user/profile-info", {
        emailOrMobile: normalizedEmailOrMobile,
        firstName,
        lastName,
        gender,
        address,
      });
      showPopup("success", res.data.message);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      console.error("Save profile error:", err.response || err);
      showPopup("error", err.response?.data?.error || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

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
              <button onClick={() => setPopup({ show: false, type: "", message: "" })} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Enter your personal details</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Mobile Number</label>
              <input
                type="text"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.emailOrMobile ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                placeholder="Enter email or mobile number"
                disabled
              />
              {errors.emailOrMobile && <div className="flex items-center mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4 mr-1" />{errors.emailOrMobile}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.firstName ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                placeholder="Enter first name"
              />
              {errors.firstName && <div className="flex items-center mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4 mr-1" />{errors.firstName}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.lastName ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                placeholder="Enter last name"
              />
              {errors.lastName && <div className="flex items-center mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4 mr-1" />{errors.lastName}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.gender ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <div className="flex items-center mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4 mr-1" />{errors.gender}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.address ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                placeholder="Enter address"
                rows="4"
              />
              {errors.address && <div className="flex items-center mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4 mr-1" />{errors.address}</div>}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"}`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;