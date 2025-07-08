import express, { RequestHandler } from "express";
import { createJobDescription } from "../controllers/Job/job.controller"
import { protect } from "../controllers/user/authController";

const router = express.Router();

router.post("/", protect as RequestHandler, createJobDescription as RequestHandler);

export default router;