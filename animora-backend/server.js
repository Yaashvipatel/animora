const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sanitizeRequest = require("./middleware/sanitizeRequest");
const connectDB = require("./config/db");

dotenv.config();

// Fail fast on missing required config instead of limping along with undefined secrets.
["MONGO_URI", "JWT_SECRET"].forEach(function (key) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}. See .env.example.`);
    process.exit(1);
  }
});

const app = express();

app.set("trust proxy", 1);

// ✅ Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(sanitizeRequest); // strips $/. operators from user input to prevent NoSQL injection

// ✅ Rate limiting — generous globally, tighter on auth endpoints (brute force protection)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(generalLimiter);

// ✅ DB connect
connectDB();

app.get("/", function (req, res) {
  res.json({ status: "ok", message: "Animora Backend Running ✅" });
});

// ✅ Routes
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/adoption", require("./routes/adoptionRoutes"));
app.use("/api/rescue", require("./routes/rescueRoutes"));

// Seed routes are only useful for local/demo setup — never mount them in production.
if (process.env.NODE_ENV !== "production") {
  app.use("/api/seed", require("./routes/doctorSeedRoutes"));
  app.use("/api/seed", require("./routes/productSeedRoutes"));
  app.use("/api/seed", require("./routes/seedRoutes"));
}

// ✅ 404 handler — must come after all routes
app.use(function (req, res) {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Centralized error handler — never leak stack traces to the client
app.use(function (err, req, res, next) {
  console.error("Unhandled error:", err);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON in request body" });
  }

  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === "production" ? "Something went wrong. Please try again." : err.message
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, function () {
  console.log("Server running on port " + PORT);
});

module.exports = app;
