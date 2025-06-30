import express from "express";
import PublicTemplate from "../models/PublicTemplate.js";
import { requireAuth } from "../middleware/requireAuth.js";


const router = express.Router();

// GET all public templates
router.get("/", async (req, res) => {
  try {
    const pubs = await PublicTemplate.find().lean();
    res.json(pubs);
  } catch (err) {
    res.status(500).send("Error fetching public templates");
  }
});

// GET one public template
router.get("/:id", async (req, res) => {
  try {
    const pub = await PublicTemplate.findById(req.params.id).lean();
    if (!pub) return res.status(404).send("Template not found");
    res.json(pub);
  } catch (err) {
    res.status(400).send("Invalid ID");
  }
});

// CREATE public template
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, thumbnail, canvasJson, fields } = req.body;
    if (!title || !canvasJson) return res.status(400).send("Missing required fields");

    const doc = new PublicTemplate({
      title,
      thumbnail,
      canvasJson,
      fields: fields || [],
      creatorId: req.user.id,
      creatorName: req.user.name,
      creatorImage: req.user.profileImage
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).send("Failed to save public template");
  }
});

// POST rating or update
router.post("/:id/rate", requireAuth, async (req, res) => {
  try {
    const { rating } = req.body;
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).send("Invalid rating value");
    }

    const pub = await PublicTemplate.findById(req.params.id);
    if (!pub) return res.status(404).send("Template not found");

    const existing = pub.ratings.find(r => r.userId.equals(req.user.id));
    if (existing) existing.rating = rating;
    else pub.ratings.push({ userId: req.user.id, rating });

    await pub.save();
    res.json(pub);
  } catch (err) {
    res.status(400).send("Error updating rating");
  }
});
export default router;
