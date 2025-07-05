const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  description: String,
  image: String,
  status: { type: String, default: "active" },
  isFeatured: { type: Boolean, default: false },
  sortOrder: Number,
  metaTitle: String,
  metaDescription: String,
}, { timestamps: true });

module.exports = mongoose.model("Subcategory", subcategorySchema);
