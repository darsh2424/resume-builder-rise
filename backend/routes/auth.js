const express = require("express");
const router = express.Router();
const User = require("../models/User");

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

  res.json(user);
});

module.exports = router;
