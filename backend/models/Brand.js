const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String }, // Optional: for future use
  subsubcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subsubcategory" },
});

module.exports = mongoose.model("Brand", brandSchema);
