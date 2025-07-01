import mongoose from "mongoose";

const personalTemplateSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "User" },
  title: { type: String, required: true },
  canvasJson: { type: Object, required: true },
  fields: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("PersonalTemplate", personalTemplateSchema);