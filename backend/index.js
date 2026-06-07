require("dotenv").config();

const express = require("express");
const cors = require("cors");

const corsOptions = require("./config/cors");
const { initializeDatabase } = require("./config/db");
const managerRoutes = require("./routes/managerRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const linkRoutes = require("./routes/linkRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Backend is running");
});

app.get("/api/health", async (_req, res) => {
  try {
    await initializeDatabase();

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: err.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/profiles", linkRoutes);
app.use("/api/manager", managerRoutes);
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    await initializeDatabase();
    console.log(`API running at port ${PORT}`);
  });
}

module.exports = app;