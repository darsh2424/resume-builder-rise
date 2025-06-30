import express from "express";
import PersonalTemplate from "../models/PersonalTemplate.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// GET all personal templates
router.get("/", requireAuth, async (req, res) => {
  try {
    const list = await PersonalTemplate.find({ userId: req.user.id }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).send("Failed to fetch templates");
  }
});

// GET a single personal template
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const doc = await PersonalTemplate.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!doc) return res.status(404).send("Template not found");
    res.json(doc);
  } catch (err) {
    res.status(400).send("Invalid ID");
  }
});

// CREATE new personal template
router.post("/", requireAuth, async (req, res) => {
  try {
    const { canvasJson, title, fields } = req.body;
    if (!canvasJson || !title) return res.status(400).send("Missing required fields");

    const doc = new PersonalTemplate({
      userId: req.user.id,
      title,
      canvasJson,
      fields: fields || []
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).send("Failed to save template");
  }
});

// UPDATE personal template
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const doc = await PersonalTemplate.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).send("Template not found");
    res.json(doc);
  } catch (err) {
    res.status(400).send("Invalid update request");
  }
});

export default router;