import express from "express";
import morgan from "morgan";
import cors from "cors";
import passport from "../config/passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoute from "./routes/authRoute";
import usersRoute from "./routes/usersRoute";
import profileRoute from "./routes/profileRoute";
import personalInfoRoute from "./routes/personalInfoRoute";
import jobRoute from "./routes/JobRoute";
import resumeRoute from "./routes/resumeRoute";
import paymentRoute from "./routes/payment";

import { stripeWebhook } from "./webhooks/stripeWebhook"; // import the handler
import { RequestHandler } from "express";
import { Request, Response, NextFunction } from "express";
import expressRaw from "express"; // same express, just to call .raw

const app = express();

app.use(helmet());

// Rate limit (❗️exclude webhook path)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please try again later.",
});
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/stripe/webhook") return next();
  return limiter(req, res, next);
});

// CORS (webhook doesn’t need CORS, but it won’t hurt)
app.use(cors({
  origin: [
    "https://resumerouter.app",
    "https://www.resumerouter.app",
    "http://localhost:3000",
  ],
  credentials: true,
}));

/**
 * 🔐 STRIPE WEBHOOK: mount FIRST with raw body, no auth, no JSON parser
 * Path must match what you configured in Stripe (singular: /api/payment/stripe/webhook)
 */
app.use(morgan("dev"));
app.post(
  "/api/payment/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req: Request, res: Response, next: NextFunction) => {
    // Store the raw body for signature verification
    (req as any).rawBody = req.body;
    stripeWebhook(req, res);
  }
);

// Now it’s safe to enable JSON for all other routes
app.use(express.json());

app.use(cookieParser());

// Session / Passport
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// Normal app routes
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/profile", profileRoute);
app.use("/api/personal-info", personalInfoRoute);
app.use("/api/job-description", jobRoute);
app.use("/api/resumes", resumeRoute);
app.use("/api/payment", paymentRoute);       // includes /checkout etc. (NO webhook here)

export default app;
