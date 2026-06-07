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

// MongoDB connection
// Prefer MONGODB_URI (matches `server.js`); fall back to legacy MONGO_URI if present
const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.error('MONGODB_URI environment variable is missing!');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectDB();

// Sample route to test backend → frontend connection
app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});