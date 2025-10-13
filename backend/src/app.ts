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
import profileRoute from "./routes/profileRoute"
import personalInfoRoute from "./routes/personalInfoRoute"
import jobRoute from "./routes/JobRoute"
import resumeRoute from "./routes/resumeRoute"





const app = express();
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, 
  standardHeaders: true,     // adds RateLimit-* headers
  legacyHeaders: false,
  message: 'Too many requests. Please try again later.',
});

app.use( "api/", limiter);


app.use(cors({
    origin: [
        "https://resumerouter.app",
        "https://www.resumerouter.app",
        "http://localhost:3000", // For local development
      ],
    credentials: true,
}));

app.use(express.json());

app.use(morgan("dev"));
app.use(cookieParser());

// Session middleware for Passport.js
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/profile", profileRoute);
app.use("/api/personal-info", personalInfoRoute);
app.use("/api/job-description", jobRoute);
app.use("/api/resumes", resumeRoute);

export default app;