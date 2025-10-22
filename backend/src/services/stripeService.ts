import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function getActiveSubForProduct(stripeCustomerId: string, productId: string) {
  const subs = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "all",
    expand: ["data.items.price.product"],
    limit: 50,
  });
  return subs.data.find(s =>
    ["active", "trialing", "past_due", "unpaid"].includes(s.status) &&
    s.items.data.some(it => (it.price.product as Stripe.Product).id === productId)
  );
}

export async function createCheckoutSession(params: {
  userId: string;
  stripeCustomerId: string;
  isCredits: boolean;
  successUrl: string;
  cancelUrl: string;
}) {
  const priceId = params.isCredits
    ? process.env.STRIPE_PRICE_CREDITS_1000!
    : process.env.STRIPE_PRICE_PASS_3MO!;

  // Prevent duplicate pass
  if (!params.isCredits) {
    const passProductId = process.env.STRIPE_PRODUCT_PASS_3MO;
    if (passProductId) {
      const existing = await getActiveSubForProduct(params.stripeCustomerId, passProductId);
      if (existing) {
        const portal = await stripe.billingPortal.sessions.create({
          customer: params.stripeCustomerId,
          return_url: params.successUrl,
        });
        return { handled: true, url: portal.url! };
      }
    }
  }

  const mode: Stripe.Checkout.SessionCreateParams.Mode = params.isCredits ? "payment" : "subscription";
  const session = await stripe.checkout.sessions.create(
    {
      mode,
      customer: params.stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      payment_method_types: ["card"],
      metadata: {
        userId: params.userId,
        plan: params.isCredits ? "credits" : "pass3"
      }
    },
    {
      idempotencyKey: `checkout:${params.userId}:${priceId}:${mode}:${Date.now()}`,
    }
  );

  return { handled: false, url: session.url! };
}

export async function ensureStripeCustomer(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  if (user.stripeCustomerId && user.stripeCustomerId !== "") return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { appUserId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}