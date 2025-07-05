import React, { useState } from "react";
import "./AdminLogin.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
const [success, setSuccess] = useState(false);
const [errorPopup, setErrorPopup] = useState("");

  const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess(false);

  try {
    const { data } = await axios.post("http://localhost:5000/api/admin/login", {
      email,
      password,
    });

    localStorage.setItem("adminToken", data.token);
    setSuccess(true);

    setTimeout(() => {
      navigate("/admin/Dashboardcontent");
    }, 1500);

  } catch (err) {
  const message = err.response?.data?.message || "Login failed";
  setErrorPopup(message);

  // Automatically hide error after 2s
  setTimeout(() => {
    setErrorPopup("");
  }, 2000);
}
}


  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="brand-logo-1">
            {/* Replace below with your actual logo */}
            <img
              src="/wallet final logo.png"
              alt="Company Logo"
              className="logo-img"
            />
          </div>
          <h1 className="login-title">Admin Login</h1>
{success && (
  <div className="success-popup">
    <div className="popup-content">
      <div className="checkmark">&#10003;</div>
      <p>Login Successful!</p>
    </div>
  </div>
)}
{errorPopup && (
  <div className="error-popup">
    <div className="popup-content error-style">
      <div className="error-icon">❗</div>
      <p>{errorPopup}</p>
    </div>
  </div>
)}

          <form onSubmit={handleSubmit} className="login-form" >
            <div className="input-group">
              <input
                type="email"
                id="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
              <label htmlFor="email">Email Address</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                id="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <label htmlFor="password">Password</label>
            </div>

            <button type="submit" className="btn-primary">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
