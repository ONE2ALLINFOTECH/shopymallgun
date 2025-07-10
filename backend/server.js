// backend/server.js or backend/index.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Route Imports
const categoryRoutes = require("./routes/category");
const subcategoryRoutes = require("./routes/subcategory");
const subsubcategoryRoutes = require("./routes/subsubcategory");
const brandRoutes = require("./routes/brand");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subcategoryRoutes);
app.use("/api/subsubcategory", subsubcategoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/user", require("./routes/userRoutes"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
