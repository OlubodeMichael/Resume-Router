import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { createCheckoutSession, ensureStripeCustomer } from "../services/stripeService";
import { catchAsync } from "../../utils/catchAsync";

export const startCheckout = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const plan = (req.body.plan as "credits" | "pass3") || "credits";
  const isCredits = plan === "credits";

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
  const customerId = user?.stripeCustomerId ?? await ensureStripeCustomer(userId);

  const { handled, url } = await createCheckoutSession({
    userId,
    stripeCustomerId: customerId,
    isCredits,
    successUrl: `${process.env.FRONTEND_URL}/dashboard`,
    cancelUrl: `${process.env.FRONTEND_URL}/dashboard`,
  });

  res.json({ handled, url });
});
