import React, { useState } from 'react';
import api from '../api/api';

const PanVerify = () => {
  const [pan, setPan] = useState('');

  const handleVerify = async () => {
    try {
      const res = await api.post('/user/verify-pan', { pan_number: pan });
      if (res.data.status === "success") {
        alert("PAN Verified");
        window.location.href = "/profile"; // Go to profile
      } else {
        alert("Invalid PAN");
      }
    } catch (err) {
      alert("PAN Verification Failed");
    }
  };

  return (
    <div className="container p-5">
      <h2>PAN Verification</h2>
      <input type="text" placeholder="Enter PAN Number" value={pan} onChange={(e) => setPan(e.target.value)} />
      <button onClick={handleVerify}>Verify PAN</button>
    </div>
  );
};

export default PanVerify;
