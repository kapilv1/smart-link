require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "https://smart-link-ia4j.vercel.app",
  "https://smart-link-complated.vercel.app",
  "https://vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-user-id"]
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

let cachedClient = null;
let cachedDb = null;
let initialized = false;

async function connectDB() {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing!");
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });

  await client.connect();

  cachedClient = client;
  cachedDb = client.db(process.env.MONGODB_DB || "link-filter");

  console.log("MongoDB connected successfully!");

  return cachedDb;
}

async function initializeDatabase() {
  if (initialized) return;

  const db = await connectDB();

  await db.collection("users").createIndex({ username: 1 }, { unique: true });

  await db.collection("links").createIndex(
    { profileId: 1, type: 1, searchEngine: 1 },
    { unique: true }
  );

  const existingManager = await db.collection("users").findOne({
    username: "peter"
  });

  if (!existingManager) {
    const hashedPassword = await bcrypt.hash("123", 10);

    await db.collection("users").insertOne({
      username: "peter",
      password: hashedPassword,
      role: "manager",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  initialized = true;
}

function getSafeUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    role: user.role
  };
}

function toObjectId(id) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

async function getUserFromHeader(req, res, next) {
  try {
    await initializeDatabase();

    const userId = req.headers["x-user-id"];
    const objectId = toObjectId(userId);

    if (!objectId) {
      return res.status(401).json({ error: "Login required" });
    }

    const db = await connectDB();

    const user = await db.collection("users").findOne({
      _id: objectId
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid user" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Auth error" });
  }
}

app.get("/", (_req, res) => {
  res.send("Backend is running");
});

app.get("/api/health", async (_req, res) => {
  try {
    await initializeDatabase();

    res.json({
      status: "ok",
      database: "connected"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: err.message
    });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    await initializeDatabase();

    const { username, password, confirmPassword } = req.body;

    if (!username?.trim() || !password?.trim() || !confirmPassword?.trim()) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const db = await connectDB();
    const cleanUsername = username.trim().toLowerCase();

    const existingUser = await db.collection("users").findOne({
      username: cleanUsername
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username: cleanUsername,
      password: hashedPassword,
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("users").insertOne(newUser);

    res.status(201).json({
      message: "Signup successful",
      user: getSafeUser({ ...newUser, _id: result.insertedId })
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    await initializeDatabase();

    const { username, password } = req.body;

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({
        error: "Username and password are required"
      });
    }

    const db = await connectDB();

    const user = await db.collection("users").findOne({
      username: username.trim().toLowerCase()
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid username or password"
      });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      return res.status(400).json({
        error: "Invalid username or password"
      });
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
    const db = await connectDB();

    const filter =
      req.user.role === "manager" ? {} : { userId: req.user._id };

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

app.post("/api/profiles", getUserFromHeader, async (req, res) => {
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
      updatedAt: new Date()
    };

    const result = await db.collection("profiles").insertOne(profile);

    res.status(201).json({
      ...profile,
      _id: result.insertedId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/profiles/:profileId/links", getUserFromHeader, async (req, res) => {
  try {
    const profileId = toObjectId(req.params.profileId);

    if (!profileId) {
      return res.status(400).json({ error: "Invalid profile ID" });
    }

    const db = await connectDB();

    const profile = await db.collection("profiles").findOne({
      _id: profileId
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (
      req.user.role !== "manager" &&
      profile.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "No permission for this profile" });
    }

    const links = await db
      .collection("links")
      .find({ profileId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/profiles/:profileId/links", getUserFromHeader, async (req, res) => {
  try {
    const { links } = req.body;
    const profileId = toObjectId(req.params.profileId);

    if (!profileId) {
      return res.status(400).json({ error: "Invalid profile ID" });
    }

    if (!Array.isArray(links)) {
      return res.status(400).json({ error: "links must be an array" });
    }

    const db = await connectDB();

    const profile = await db.collection("profiles").findOne({
      _id: profileId
    });

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
      profileId,
      url: link.url,
      type: link.type,
      searchEngine: link.searchEngine,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    let savedLinks = [];

    try {
      const result = await db.collection("links").insertMany(docs, {
        ordered: false
      });

      savedLinks = docs.filter((_, index) => result.insertedIds[index]);
    } catch (err) {
      if (err.code !== 11000 && !err.writeErrors) {
        throw err;
      }

      savedLinks = err.insertedDocs || [];
    }

    res.status(201).json({
      message: "Links saved",
      savedCount: savedLinks.length,
      savedLinks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/profiles/:profileId/check-links", getUserFromHeader, async (req, res) => {
  try {
    const { links } = req.body;
    const profileId = toObjectId(req.params.profileId);

    if (!profileId) {
      return res.status(400).json({ error: "Invalid profile ID" });
    }

    if (!Array.isArray(links)) {
      return res.status(400).json({ error: "links must be an array" });
    }

    const db = await connectDB();

    const profile = await db.collection("profiles").findOne({
      _id: profileId
    });

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
      const exists = await db.collection("links").findOne({
        profileId,
        type: link.type,
        searchEngine: link.searchEngine
      });

      if (exists) {
        unavailable.push(link);
      } else {
        available.push(link);
      }
    }

    res.json({ available, unavailable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    await initializeDatabase();
    console.log(`API running at port ${PORT}`);
  });
}

module.exports = app;