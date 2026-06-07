// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection caching for serverless
let cachedClient = null;

async function connectDB() {
  if (cachedClient) return cachedClient;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing!');
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  cachedClient = client;
  console.log('MongoDB connected successfully!');
  return client;
}
app.get("/", (_req, res) => {
  res.send("Backend is running");
});

app.get("/api/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const database =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.json({ status: "ok", database });
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

    const result = await Link.insertMany(docs, {
      ordered: false
    }).catch((err) => {
      if (err.code === 11000 || err.writeErrors) {
        return err.insertedDocs || [];
      }

      throw err;
    });

    const savedLinks = Array.isArray(result) ? result : [];

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

      if (exists) {
        unavailable.push(link);
      } else {
        available.push(link);
      }
    }

    res.json({
      available,
      unavailable
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Sample route
app.get('/api/hello', async (req, res) => {
  try {
    const client = await connectDB();
    // Example MongoDB usage if needed
    // const db = client.db('myDatabase');
    res.json({ message: 'Hello from backend!' });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ error: 'MongoDB connection failed' });
  }
});
app.get('/api/test-mongo', async (req, res) => {
  try {
    const client = await connectDB();
    const db = client.db('myDatabase'); // Replace with your DB name
    const collections = await db.listCollections().toArray();
    res.json({ collections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Local server start (for development)
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}

// Export for serverless (Vercel)
module.exports = app;