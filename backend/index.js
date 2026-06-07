require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://smart-link-henna.vercel.app",
  "https://smart-link-complated-coom.vercel.app",
  "https://smart-link-complated.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-user-id"]
  })
);

app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  });

  isConnected = true;
  console.log("MongoDB connected");
}

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["manager", "customer"],
      default: "customer"
    }
  },
  { timestamps: true }
);

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const linkSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    searchEngine: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

linkSchema.index(
  { profileId: 1, type: 1, searchEngine: 1 },
  { unique: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
const Link = mongoose.models.Link || mongoose.model("Link", linkSchema);

async function createDefaultManager() {
  const existingManager = await User.findOne({ username: "peter" });
  if (existingManager) return;

  const hashedPassword = await bcrypt.hash("123", 10);

  await User.create({
    username: "peter",
    password: hashedPassword,
    role: "manager"
  });
}

async function ensureDB(req, res, next) {
  try {
    await connectDB();
    await createDefaultManager();
    next();
  } catch (err) {
    console.error("MongoDB error:", err.message);
    res.status(500).json({ error: "MongoDB connection failed", details: err.message });
  }
}

app.use(ensureDB);

function getSafeUser(user) {
  return {
    id: user._id,
    username: user.username,
    role: user.role
  };
}

async function getUserFromHeader(req, res, next) {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({ error: "Login required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: "Invalid user" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Auth error" });
  }
}

app.get("/", (_req, res) => {
  res.send("Backend is running");
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.get("/api/test-mongo", async (_req, res) => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  res.json({ collections });
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username?.trim() || !password?.trim() || !confirmPassword?.trim()) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const cleanUsername = username.trim().toLowerCase();

    const existingUser = await User.findOne({ username: cleanUsername });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: cleanUsername,
      password: hashedPassword,
      role: "customer"
    });

    res.status(201).json({
      message: "Signup successful",
      user: getSafeUser(user)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await User.findOne({
      username: username.trim().toLowerCase()
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    res.json({
      message: "Login successful",
      user: getSafeUser(user)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/profiles", getUserFromHeader, async (req, res) => {
  try {
    const filter = req.user.role === "manager" ? {} : { userId: req.user._id };
    const profiles = await Profile.find(filter).sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/profiles", getUserFromHeader, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Profile name is required" });
    }

    const profile = await Profile.create({
      name: name.trim(),
      userId: req.user._id
    });

    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/profiles/:profileId/links", getUserFromHeader, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (
      req.user.role !== "manager" &&
      profile.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "No permission for this profile" });
    }

    const links = await Link.find({ profileId: profile._id }).sort({
      createdAt: -1
    });

    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/profiles/:profileId/links", getUserFromHeader, async (req, res) => {
  try {
    const { links } = req.body;

    if (!Array.isArray(links)) {
      return res.status(400).json({ error: "links must be an array" });
    }

    const profile = await Profile.findById(req.params.profileId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (
      req.user.role !== "manager" &&
      profile.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "No permission for this profile" });
    }

    const docs = links.map((link) => ({
      profileId: profile._id,
      url: link.url,
      type: link.type,
      searchEngine: link.searchEngine
    }));

    const result = await Link.insertMany(docs, { ordered: false }).catch((err) => {
      if (err.code === 11000 || err.writeErrors) {
        return err.insertedDocs || [];
      }
      throw err;
    });

    res.status(201).json({
      message: "Links saved",
      savedCount: Array.isArray(result) ? result.length : 0,
      savedLinks: Array.isArray(result) ? result : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/profiles/:profileId/check-links", getUserFromHeader, async (req, res) => {
  try {
    const { links } = req.body;

    if (!Array.isArray(links)) {
      return res.status(400).json({ error: "links must be an array" });
    }

    const profile = await Profile.findById(req.params.profileId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (
      req.user.role !== "manager" &&
      profile.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "No permission for this profile" });
    }

    const unavailable = [];
    const available = [];

    for (const link of links) {
      const exists = await Link.findOne({
        profileId: profile._id,
        type: link.type,
        searchEngine: link.searchEngine
      });

      if (exists) unavailable.push(link);
      else available.push(link);
    }

    res.json({ available, unavailable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`API running at port ${PORT}`);
  });
}

module.exports = app;