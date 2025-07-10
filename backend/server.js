const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Step 1: Allow your exact frontend domain (Vercel)
const allowedOrigins = [
  "https://shopymallgun.vercel.app",
  "https://shopymallgun-mewka3g9v-one2allinfotechs-projects.vercel.app", // ✅ Add your deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed from this origin: " + origin));
    }
  },
  credentials: true,
}));

// ✅ Step 2: Body parser
app.use(express.json());

// ✅ Step 3: MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Step 4: Routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/category", require("./routes/category"));
app.use("/api/subcategory", require("./routes/subcategory"));
app.use("/api/subsubcategory", require("./routes/subsubcategory"));
app.use("/api/brand", require("./routes/brand"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// ✅ Step 5: Root Test Route
app.get("/", (req, res) => {
  res.send("🚀 ShopyMall Backend is Running");
});

// ✅ Step 6: Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
