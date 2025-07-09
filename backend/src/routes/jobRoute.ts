import express, { RequestHandler } from "express";
import { createJobDescription, parseJobDescription } from "../controllers/Job/job.controller"
import { protect } from "../controllers/user/authController";

const router = express.Router();

router.post("/", protect as RequestHandler, createJobDescription as RequestHandler);
router.post("/:id/parse", protect as RequestHandler, parseJobDescription as RequestHandler);

export default router;