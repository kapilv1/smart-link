const express = require("express");
const bcrypt = require("bcryptjs");

const { connectDB, initializeDatabase } = require("../config/db");
const { getSafeUser, toObjectId } = require("../utils/userUtils");
const getUserFromHeader = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/request-signup", async (req, res) => {
  try {
    await initializeDatabase();

    const { username, email, password, confirmPassword } = req.body;

    if (
      !username?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !confirmPassword?.trim()
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await connectDB();

    const existingUser = await db.collection("users").findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const existingPending = await db.collection("signupRequests").findOne({
      email: cleanEmail,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (existingPending) {
      return res.json({
        message: "Signup request already waiting for manager.",
        requestId: existingPending._id.toString(),
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const request = {
      username: username.trim(),
      email: cleanEmail,
      password: hashedPassword,
      status: "pending",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("signupRequests").insertOne(request);

    res.status(201).json({
      message: "Signup request sent. Waiting for manager response.",
      requestId: result.insertedId.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/signup-status/:requestId", async (req, res) => {
  try {
    await initializeDatabase();

    const requestId = toObjectId(req.params.requestId);

    if (!requestId) {
      return res.status(400).json({ error: "Invalid request ID" });
    }

    const db = await connectDB();

    const request = await db.collection("signupRequests").findOne({
      _id: requestId,
    });

    if (!request) {
      return res.json({
        status: "expired",
        message: "Signup request expired. Please try again.",
      });
    }

    res.json({
      status: request.status,
      message:
        request.status === "pending"
          ? "Waiting for manager response..."
          : request.status === "approved"
          ? "Signup approved. Please sign in."
          : "Signup dismissed by manager.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    await initializeDatabase();

    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = await connectDB();

    const user = await db.collection("users").findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ error: "Your account is blocked" });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: getSafeUser(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/change-password", getUserFromHeader, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (
      !currentPassword?.trim() ||
      !newPassword?.trim() ||
      !confirmNewPassword?.trim()
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "New passwords do not match" });
    }

    const db = await connectDB();

    const passwordMatched = await bcrypt.compare(
      currentPassword,
      req.user.password
    );

    if (!passwordMatched) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").updateOne(
      { _id: req.user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;