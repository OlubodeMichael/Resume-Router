import express, { RequestHandler } from "express";
import { register, login, logout, protect, googleAuth, googleCallback, verifyAuth, authFailed, forgotPassword, verifyResetCode, resetPassword, updatePassword} from "../controllers/authController";

const router = express.Router();

// Register and Login routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/update-password", updatePassword);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// Verify authentication
router.get("/verify", verifyAuth as RequestHandler);
router.get("/failed", authFailed as RequestHandler);

export default router;