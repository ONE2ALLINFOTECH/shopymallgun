import React, { useState } from "react";
import axios from "axios";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOTP = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/user/forgot/send-otp", {
        emailOrMobile: email,
      });
      alert(res.data.message);
      setOtpSent(true);
    } catch {
      alert("Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/user/forgot/verify-otp", {
        emailOrMobile: email,
        otp,
      });
      alert(res.data.message);
      setOtpVerified(true);
    } catch {
      alert("OTP verification failed");
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) return alert("Passwords don't match");

    try {
      const res = await axios.post("http://localhost:5000/api/user/forgot/reset-password", {
        emailOrMobile: email,
        password,
      });
      alert(res.data.message);
      window.location.href = "/";
    } catch {
      alert("Password reset failed");
    }
  };

  return (
    <div className="container mt-5 col-md-6">
      <h4>Reset Password via Email OTP</h4>

      <input
        className="form-control mt-3"
        type="email"
        placeholder="Enter registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {!otpSent && (
        <button onClick={handleSendOTP} className="btn btn-primary mt-3">
          Send OTP
        </button>
      )}

      {otpSent && !otpVerified && (
        <>
          <input
            className="form-control mt-3"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOTP} className="btn btn-success mt-3">
            Verify OTP
          </button>
        </>
      )}

      {otpVerified && (
        <>
          <input
            type="password"
            className="form-control mt-3"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            className="form-control mt-3"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={handleResetPassword} className="btn btn-dark mt-3">
            Reset Password
          </button>
        </>
      )}
    </div>
  );
};

export default ForgetPassword;
