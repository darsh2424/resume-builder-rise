import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: { type: String, unique: true },
  password: String,
  photo: String
});

export default mongoose.model("User", userSchema);
