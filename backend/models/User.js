const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: { type: String, unique: true },
  password: String,
  photo: String
});

module.exports = mongoose.model("User", userSchema);
