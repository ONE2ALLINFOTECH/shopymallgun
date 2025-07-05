const cloudinary = require("cloudinary").v2; // ✅ ONLY this way

cloudinary.config({
  cloud_name: "drauq8fpi",       // 🧠 Replace this
  api_key: "235935837452662",             // 🧠 Replace this
  api_secret: "9TGwm1tznUnNryVLkI9_dSM0o40",       // 🧠 Replace this
});

module.exports = cloudinary;
