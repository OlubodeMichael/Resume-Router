import express from "express";
import { userMetrics, revenueMetrics, resumeMetrics } from "../controllers/adminController";
import { protect } from "../controllers/authController";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.get("/metrics/users", protect, requireRole("ADMIN"), userMetrics);
router.get("/metrics/revenue", protect, requireRole("ADMIN"), revenueMetrics);
router.get("/metrics/resumes", protect, requireRole("ADMIN"), resumeMetrics);

export default router;

