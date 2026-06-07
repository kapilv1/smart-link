const express = require("express");

const { connectDB } = require("../config/db");
const getUserFromHeader = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getUserFromHeader, async (req, res) => {
  try {
    const db = await connectDB();

    const filter = req.user.role === "manager" ? {} : { userId: req.user._id };

    const profiles = await db
      .collection("profiles")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", getUserFromHeader, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Profile name is required" });
    }

    const db = await connectDB();

    const profile = {
      name: name.trim(),
      userId: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("profiles").insertOne(profile);

    res.status(201).json({
      ...profile,
      _id: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;