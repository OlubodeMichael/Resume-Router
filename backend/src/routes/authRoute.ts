import express, { RequestHandler } from "express";
import { register, login, protect, me } from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Protected route example
router.get("/me", protect as RequestHandler, me);

export default router;