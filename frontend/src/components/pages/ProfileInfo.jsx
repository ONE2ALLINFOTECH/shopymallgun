import React, { useState } from "react";
import { CheckCircle, User, Home, AlertCircle, X } from "lucide-react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const ProfileInfo = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    address: "",
  });
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup({ show: false, type: "", message: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!emailOrMobile.trim()) newErrors.emailOrMobile = "Email or mobile is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await api.post("/user/profile-info", { ...formData, emailOrMobile });
      showPopup("success", res.data.message);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      showPopup("error", err.response?.data?.error || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

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

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base px-2">Provide your personal details to continue</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Mobile</label>
              <input
                type="text"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${errors.emailOrMobile ? "border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                placeholder="Enter your email or mobile"
              />
              {errors.emailOrMobile && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.emailOrMobile}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${errors.firstName ? "border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${errors.lastName ? "border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${errors.gender ? "border-red-500" : "border-gray-200 focus:border-blue-500"}`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.gender}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all text-sm sm:text-base ${errors.address ? "border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                placeholder="Enter address"
                rows="4"
              />
              {errors.address && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.address}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;