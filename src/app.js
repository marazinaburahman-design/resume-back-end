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

/* =========================================================
   ENVIRONMENT
========================================================= */

const isDevelopment =
  (process.env.NODE_ENV || "development") !== "production";

/* =========================================================
   ✅ TRUST PROXY (FIX #1: X-Forwarded-For Error)
========================================================= */

app.set('trust proxy', process.env.TRUST_PROXY || 1);

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://resume-front-end-ebon.vercel.app",
];

if (
  process.env.CLIENT_URL &&
  !allowedOrigins.includes(process.env.CLIENT_URL)
) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log("CORS blocked origin:", origin);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ NEW: Explicit OPTIONS handler for preflight
app.options('*', cors(corsOptions));

/* =========================================================
   BODY PARSING (FIX #2: Increase limit for PDFs)
========================================================= */

const maxFileSize = process.env.MAX_FILE_SIZE_MB || 5;

app.use(
  express.json({
    limit: `${maxFileSize}mb`,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: `${maxFileSize}mb`,
  })
);

/* =========================================================
   COOKIE PARSER
========================================================= */

app.use(cookieParser());

/* =========================================================
   ✅ TIMEOUT MIDDLEWARE (FIX #3: Request Timeouts)
========================================================= */

app.use((req, res, next) => {
  const requestTimeout = parseInt(process.env.REQUEST_TIMEOUT) || 30000;
  const socketTimeout = parseInt(process.env.SOCKET_TIMEOUT) || 35000;

  req.setTimeout(requestTimeout);
  res.setTimeout(requestTimeout);

  req.socket.setTimeout(socketTimeout);

  next();
});

/* =========================================================
   ROOT ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    message: "ResumeAI API is running",
    environment: isDevelopment ? "development" : "production",
    model: process.env.AI_MODEL,
    provider: process.env.AI_PROVIDER,
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

const analysesLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(
    process.env.ANALYSES_RATE_LIMIT ||
      (isDevelopment ? 50 : 10)
  ),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message:
      "Too many resume analysis requests. Please try again later.",
  },
});

/* =========================================================
   API RATE LIMIT
========================================================= */

app.use("/api", apiLimiter);

/* =========================================================
   HEALTH ROUTES
========================================================= */

app.use("/api/health", healthRoutes);

/* =========================================================
   AUTH ROUTES
========================================================= */

app.use("/api/auth/register", authLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth", authRoutes);

/* =========================================================
   ANALYSIS ROUTES
========================================================= */

app.use("/api/analyses", analysesLimiter, analysisRoutes);

/* =========================================================
   REQUEST LOGGING
========================================================= */

if (isDevelopment) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

/* =========================================================
   404 HANDLER
========================================================= */

app.use(notFound);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(errorHandler);

/* =========================================================
   EXPORT
========================================================= */

module.exports = app;