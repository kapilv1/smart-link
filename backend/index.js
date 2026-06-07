


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
