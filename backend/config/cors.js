const allowedOrigins = [
  "https://smart-link-ia4j.vercel.app",
  "https://smart-link-complated.vercel.app",
  "https://vercel.app",
  "https://smart-link-henna.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
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
  allowedHeaders: ["Content-Type", "x-user-id"],
};

module.exports = corsOptions;