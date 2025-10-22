// src/webhooks/stripeWebhook.ts
import Stripe from "stripe";
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function stripeWebhook(req: Request, res: Response) {
  // 1) verify signature using raw body (req.body is a Buffer thanks to express.raw)
  let event: Stripe.Event;
  try {
    const sig = req.headers["stripe-signature"] as string;
    event = stripe.webhooks.constructEvent(req.body as any, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", (err as Error).message);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  // 2) dedupe deliveries by event.id
  const already = await prisma.webhookEvent.findFirst({ where: { stripeEventId: event.id } });
  if (already) return res.json({ received: true });
  await prisma.webhookEvent.create({ data: { stripeEventId: event.id } });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // find user by metadata (preferred) or by customer id
      const customerId = session.customer as string;
      const user =
        session.metadata?.userId
          ? await prisma.user.findUnique({ where: { id: session.metadata.userId } })
          : await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });

      if (!user) return res.json({ received: true }); // no-op if we can't map

      if (session.mode === "payment") {
        // 👉 ONE-TIME CREDITS PURCHASE
        const paymentIntentId = session.payment_intent as string;
        const creditsToAdd = 1000; // for your $15 pack

        await prisma.$transaction(async (tx) => {
          // dedupe on PI id so we never double-credit
          const exists = await tx.creditLedger.findFirst({
            where: { stripePaymentIntentId: paymentIntentId },
          });
          if (exists) return;

          // ledger + cache increment
          await tx.creditLedger.create({
            data: {
              userId: user.id,
              delta: creditsToAdd,
              reason: "purchase",
              stripePaymentIntentId: paymentIntentId,
            },
          });

          await tx.user.update({
            where: { id: user.id },
            data: { credits: { increment: creditsToAdd } },
          });
        });
      }

      if (session.mode === "subscription") {
        // 👉 PASS (3 months) — upsert subscription
        const subId = session.subscription as string;
        const sub = await stripe.subscriptions.retrieve(subId, { expand: ["items.price.product"] });

        // cancel at period end to make it non-renewing, per your plan
        if (session.metadata?.plan === "pass3" && !sub.cancel_at_period_end) {
          await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
        }

        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: sub.id },
          update: {
            status: sub.status,
            currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
            priceId: sub.items.data[0].price.id,
            productId: (sub.items.data[0].price.product as Stripe.Product).id,
          },
          create: {
            userId: user.id,
            stripeSubscriptionId: sub.id,
            status: sub.status,
            currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
            priceId: sub.items.data[0].price.id,
            productId: (sub.items.data[0].price.product as Stripe.Product).id,
          },
        });
      }
    }

    // other events: keep as-is (subscription.updated/deleted)
    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.json({ received: true }); // we already deduped event.id
  }
}
