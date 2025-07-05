const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization; // yeh "Bearer token" aata hai

  // Agar token nahi ya galat format me hai
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  // Actual token nikaalo (Bearer ke baad jo aata hai)
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ verify karo
    req.admin = decoded; // ✅ decoded data req me daal do
    next(); // ✅ aage route me jao
  } catch (err) {
    res.status(401).json({ message: "Token failed" });
  }
};
