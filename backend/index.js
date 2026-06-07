require("dotenv").config();
const dns = require("dns");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://smart-link-complated-coom.vercel.app",
  "https://smart-link-complated.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-user-id"]
  })
);

app.options("*", cors());
app.use(express.json());

// MongoDB connection with caching
let cachedClient = null;

function getMongoConfig() {
  const {
    MONGODB_URI,
    MONGODB_USER,
    MONGODB_PASSWORD,
    MONGODB_HOSTS,
    MONGODB_DB = "link-filter",
    MONGODB_REPLICA_SET = "atlas-e71amo-shard-0"
  } = process.env;

  if (MONGODB_URI) return { uri: MONGODB_URI, options: { serverSelectionTimeoutMS: 10000 } };

  if (MONGODB_USER && MONGODB_PASSWORD && MONGODB_HOSTS) {
    return {
      uri: `mongodb://${MONGODB_HOSTS}/${MONGODB_DB}`,
      options: {
        user: MONGODB_USER,
        pass: MONGODB_PASSWORD,
        authSource: "admin",
        replicaSet: MONGODB_REPLICA_SET,
        ssl: true,
        retryWrites: true,
        w: "majority",
        serverSelectionTimeoutMS: 10000
      }
    };
  }

  return { uri: "mongodb://127.0.0.1:27017/link-filter", options: { serverSelectionTimeoutMS: 10000 } };
}

async function connectDB() {
  if (cachedClient) return cachedClient;

  const { uri, options } = getMongoConfig();

  const conn = await mongoose.connect(uri, options);
  cachedClient = conn;
  console.log("MongoDB connected");
  return conn;
}

// Schemas & Models (same as your code)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["manager", "customer"], default: "customer" }
}, { timestamps: true });

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const linkSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
  url: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  searchEngine: { type: String, required: true, trim: true }
}, { timestamps: true });

linkSchema.index({ profileId: 1, type: 1, searchEngine: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
const Profile = mongoose.model("Profile", profileSchema);
const Link = mongoose.model("Link", linkSchema);

// Default manager creation
async function createDefaultManager() {
  await connectDB();
  const existingManager = await User.findOne({ username: "peter" });
  if (existingManager) return;
  const hashedPassword = await bcrypt.hash("123", 10);
  await User.create({ username: "peter", password: hashedPassword, role: "manager" });
}

// Middleware helpers
function getSafeUser(user) {
  return { id: user._id, username: user.username, role: user.role };
}

async function getUserFromHeader(req, res, next) {
  try {
    await connectDB();
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Login required" });
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: "Invalid user" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Auth error" });
  }
}

// Routes
app.get("/", (_req, res) => res.send("Backend is running"));

app.get("/api/health", async (_req, res) => {
  await connectDB();
  const dbState = mongoose.connection.readyState;
  const database = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";
  res.json({ status: "ok", database });
});

// ... Keep your auth, profile, link routes unchanged ...

// Local dev server
if (process.env.NODE_ENV !== "production") {
  (async () => {
    await connectDB();
    await createDefaultManager();
    app.listen(PORT, () => console.log(`API running at port ${PORT}`));
  })();
}

module.exports = app;