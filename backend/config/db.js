const bcrypt = require("bcryptjs");
const { MongoClient, ServerApiVersion } = require("mongodb");

let cachedClient = null;
let cachedDb = null;
let initialized = false;

async function connectDB() {
  if (cachedClient && cachedDb) return cachedDb;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is missing!");

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
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

  await db.collection("users").dropIndex("username_1").catch(() => {});
  await db.collection("users").dropIndex("email_1").catch(() => {});

  await db.collection("users").updateMany(
    { email: null },
    { $unset: { email: "" } }
  );

  await db.collection("users").createIndex(
    { email: 1 },
    {
      unique: true,
      partialFilterExpression: { email: { $type: "string" } },
    }
  );

  await db.collection("links").createIndex(
    { profileId: 1, type: 1, searchEngine: 1 },
    { unique: true }
  );

  await db.collection("signupRequests").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );

  const existingManager = await db.collection("users").findOne({
    email: "manager@test.com",
  });

  if (!existingManager) {
    const hashedPassword = await bcrypt.hash("123", 10);

    await db.collection("users").insertOne({
      username: "peter",
      email: "manager@test.com",
      password: hashedPassword,
      role: "manager",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  initialized = true;
}

module.exports = {
  connectDB,
  initializeDatabase,
};