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
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://resume-front-7sdusn3v7-abdur-rahman7.vercel.app",
];

/*
 * Also allow CLIENT_URL from Vercel if it is configured.
 * This lets you change the frontend URL without changing code.
 */
if (
  process.env.CLIENT_URL &&
  !allowedOrigins.includes(process.env.CLIENT_URL)
) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      /*
       * Requests without an Origin header can happen from
       * tools such as Postman or server-to-server requests.
       */
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },

    credentials: true,
  })
);

/* =========================================================
   BODY PARSING
========================================================= */

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================================================
   COOKIE PARSER
========================================================= */

app.use(cookieParser());

/* =========================================================
   ROOT ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    message: "ResumeAI API is running",
    environment: isDevelopment
      ? "development"
      : "production",
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

  /*
   * Only count failed authentication attempts.
   */
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
   HEALTH ROUTES
========================================================= */

app.use("/api/health", healthRoutes);

/* =========================================================
   AUTH ROUTES
========================================================= */

/*
 * Rate-limit registration.
 */
app.use(
  "/api/auth/register",
  authLimiter
);

/*
 * Rate-limit login.
 */
app.use(
  "/api/auth/login",
  authLimiter
);

/*
 * Main authentication routes.
 *
 * Expected endpoints:
 *
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */
app.use(
  "/api/auth",
  authRoutes
);

/* =========================================================
   ANALYSIS ROUTES
========================================================= */

app.use(
  "/api/analyses",
  analysisRoutes
);

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