// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS Configuration (allow your frontend)
app.use(cors({
  origin: "https://shopymallgun.vercel.app", // your frontend URL
  credentials: true, // if using cookies or Authorization headers
}));

// ✅ Middlewares
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/category", require("./routes/category"));
app.use("/api/subcategory", require("./routes/subcategory"));
app.use("/api/subsubcategory", require("./routes/subsubcategory"));
app.use("/api/brand", require("./routes/brand"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// ✅ Root route check
app.get("/", (req, res) => {
  res.send("🌐 ShopyMall Backend is Running");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
