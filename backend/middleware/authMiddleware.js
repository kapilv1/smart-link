const { connectDB, initializeDatabase } = require("../config/db");
const { toObjectId } = require("../utils/userUtils");

async function getUserFromHeader(req, res, next) {
  try {
    await initializeDatabase();

    const userId = req.headers["x-user-id"];
    const objectId = toObjectId(userId);

    if (!objectId) {
      return res.status(401).json({ error: "Login required" });
    }

    const db = await connectDB();

    const user = await db.collection("users").findOne({ _id: objectId });

    if (!user) {
      return res.status(401).json({ error: "Invalid user" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ error: "Your account is blocked" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Auth error" });
  }
}

module.exports = getUserFromHeader;