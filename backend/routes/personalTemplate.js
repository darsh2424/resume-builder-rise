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

// GET single template
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const doc = await PersonalTemplate.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).lean();
    if (!doc) return res.status(404).send("Template not found");
    res.json(doc);
  } catch (err) {
    res.status(400).send("Invalid ID");
  }
});

// CREATE new template
router.post("/", requireAuth, async (req, res) => {
  try {

    const doc = new PersonalTemplate({
      userId: req.user.id,
      ...req.body
    });
    await doc.save();

    res.status(201).json(doc);
  } catch (err) {
    console.error("Error saving template:", err); 
    res.status(500).json({
      error: "Failed to save template",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// UPDATE template
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

// DELETE template
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const doc = await PersonalTemplate.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!doc) return res.status(404).send("Template not found");
    res.json({ message: "Template deleted successfully" });
  } catch (err) {
    res.status(400).send("Invalid delete request");
  }
});

export default router;