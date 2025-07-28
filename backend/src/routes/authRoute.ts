import express, { RequestHandler } from "express";
import { register, login, logout, protect, googleAuth, googleCallback, verifyAuth, authFailed} from "../controllers/authController";

const router = express.Router();

// Register and Login routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// Verify authentication
router.get("/verify", verifyAuth as RequestHandler);
router.get("/failed", authFailed as RequestHandler);

export default router;