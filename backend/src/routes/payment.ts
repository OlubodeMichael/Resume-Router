import { Router } from "express";
import { startCheckout } from "../controllers/checkoutController"
import { stripeWebhook } from "../webhooks/stripeWebhook"
import { catchAsync } from "../../utils/catchAsync"
import { protect } from "../controllers/authController"
import express from "express";
import { Response } from "express";

const router = Router();

// Normal JSON body for app routes
router.post("/checkout", protect, startCheckout);

export default router;
