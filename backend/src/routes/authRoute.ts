import express, { RequestHandler } from "express";
import { register, login, protect, googleAuth, googleCallback, verifyAuth, authFailed} from "../controllers/authController";

const router = express.Router();

// Register and Login routes
router.post("/register", register);
router.post("/login", login);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// Verify authentication
router.get("/verify", verifyAuth as RequestHandler);
router.get("/failed", authFailed as RequestHandler);

export default router;