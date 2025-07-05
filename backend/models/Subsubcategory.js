const mongoose = require("mongoose");
const subsubcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
  },
  { timestamps: true } // ✅ Yeh line jaruri hai
);
module.exports = mongoose.model("Subsubcategory", subsubcategorySchema);
