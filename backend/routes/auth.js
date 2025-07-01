import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();
router.post("/google-login", async (req, res) => {
  const { name, email, photoURL } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Invalid data" });
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      username: name.toLowerCase().replace(/\s+/g, ""),
      name,
      email,
      password: Math.random().toString(36).substring(2, 12),
      photo: photoURL
    });
    await user.save();
  }

  const { password, ...rest } = user.toObject();
  res.json(rest);
});

router.get("/username/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch {
    res.status(500).send("Server error");
  }
});

export default router;