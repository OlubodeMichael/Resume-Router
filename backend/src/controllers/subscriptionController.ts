import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../utils/appError";

export const createSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const { userId, planId } = req.body;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: planId, quantity: 1 }],
        mode: "subscription",
        success_url: `${process.env.FRONTEND_URL}/dashboard`,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
    });
    
});