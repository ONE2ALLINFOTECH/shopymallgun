import React, { useState } from 'react';
import api from '../api/api';

const AadhaarInput = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [aadhaarTxnId, setTxnId] = useState('');

  const sendOtp = async () => {
    try {
      const res = await api.post('/user/aadhaar/send-otp', {
        aadhaar_number: aadhaarNumber,
        consent: "Y",
        reason: "KYC for onboarding",
      });
      if (res.data?.reference_id) {
        setTxnId(res.data.reference_id);
        setOtpSent(true);
        alert("OTP Sent!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await api.post('/user/aadhaar/verify-otp', {
        aadhaar_number: aadhaarNumber,
        otp: otp,
        reference_id: aadhaarTxnId,
      });
      if (res.data.status === "success") {
        alert("Aadhaar Verified!");
        window.location.href = "/pan"; // Move to PAN step
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      alert("Verification Failed");
    }
  };

  return (
    <div className="container p-5">
      <h2>Aadhaar Verification</h2>
      {!otpSent ? (
        <>
          <input type="text" placeholder="Enter Aadhaar" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      ) : (
        <>
          <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}
    </div>
  );
};

export default AadhaarInput;
