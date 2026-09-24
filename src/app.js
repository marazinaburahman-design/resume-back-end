const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const healthRoutes = require("./routes/healthRoutes");
const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

const isDevelopment =
  (process.env.NODE_ENV || "development") !== "production";

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "https://resume-front-end-ebon.vercel.app",
    credentials: true,
  })
);

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

/* =========================================================
   ROOT ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    message: "ResumeAI API is running",
    environment: isDevelopment ? "development" : "production",
  });
});

/* =========================================================
   RATE LIMITING
========================================================= */

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: Number(
    process.env.API_RATE_LIMIT ||
      (isDevelopment ? 1000 : 100)
  ),

  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    message:
      "Too many API requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: Number(
    process.env.AUTH_RATE_LIMIT ||
      (isDevelopment ? 100 : 20)
  ),

  standardHeaders: "draft-7",
  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: {
    message:
      "Too many failed authentication attempts. Please try again later.",
  },
});

/* =========================================================
   API RATE LIMIT
========================================================= */

app.use("/api", apiLimiter);

/* =========================================================
   HEALTH
========================================================= */

app.use("/api/health", healthRoutes);

/* =========================================================
   AUTH
========================================================= */

app.use(
  "/api/auth/register",
  authLimiter
);

app.use(
  "/api/auth/login",
  authLimiter
);

app.use(
  "/api/auth",
  authRoutes
);

/* =========================================================
   ANALYSIS
========================================================= */

app.use(
  "/api/analyses",
  analysisRoutes
);

/* =========================================================
   404
========================================================= */

app.use(notFound);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(errorHandler);

module.exports = app;