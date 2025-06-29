import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  rating: { type: Number, required: true }
}, { _id: false });

const publicTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  thumbnail: String,
  canvasJson: { type: Object, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  creatorName: String,
  creatorPic: String,
  tags: [String],
  fields: [String],
  ratings: [ratingSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("PublicTemplate", publicTemplateSchema);
