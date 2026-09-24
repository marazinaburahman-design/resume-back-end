const express=require("express");
const cors=require("cors");
const cookieParser=require("cookie-parser");
const rateLimit=require("express-rate-limit");

const authRoutes=require("./routes/authRoutes");
const analysisRoutes=require("./routes/analysisRoutes");
const healthRoutes=require("./routes/healthRoutes");
const {notFound,errorHandler}=require("./middleware/errorMiddleware");

const app=express();

const isDevelopment=(process.env.NODE_ENV||"development")!=="production";

app.use(cors({
  origin:process.env.CLIENT_URL||"http://localhost:5173",
  credentials:true
}));
app.use(express.json({limit:"1mb"}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

/*
 * Rate limiting:
 * The old version put a 100-request/15-minute limiter on ALL /api routes.
 * During Vite development, page reloads and React effects can easily consume
 * that shared limit and make even /login return 429.
 *
 * Development uses a high, configurable limit. Production keeps a stricter
 * limit. Authentication has its own limiter so repeated bad login attempts
 * are still protected without blocking normal /me requests.
 */
const apiLimiter=rateLimit({
  windowMs:15*60*1000,
  limit:Number(process.env.API_RATE_LIMIT||(isDevelopment?1000:100)),
  standardHeaders:"draft-7",
  legacyHeaders:false,
  message:{message:"Too many API requests. Please try again later."}
});

const authLimiter=rateLimit({
  windowMs:15*60*1000,
  limit:Number(process.env.AUTH_RATE_LIMIT||(isDevelopment?100:20)),
  standardHeaders:"draft-7",
  legacyHeaders:false,
  skipSuccessfulRequests:true,
  message:{message:"Too many failed authentication attempts. Please try again later."}
});

app.use("/api",apiLimiter);

app.use("/api/health",healthRoutes);
app.use("/api/auth/register",authLimiter);
app.use("/api/auth/login",authLimiter);
app.use("/api/auth",authRoutes);
app.use("/api/analyses",analysisRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports=app;
