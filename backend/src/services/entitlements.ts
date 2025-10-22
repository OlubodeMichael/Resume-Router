import { prisma } from "../../lib/prisma";
import { PlanTier } from "../types";

export async function getCreditBalance(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}

export async function hasActivePass(userId: string) {
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "trialing"] },
      currentPeriodEnd: { gt: new Date() },
    },
    orderBy: { currentPeriodEnd: "desc" },
  });
  return !!sub;
}


export async function getPlanTier(userId: string): Promise<PlanTier> {
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "trialing"] },
      currentPeriodEnd: { gt: new Date() },
    },
    orderBy: { currentPeriodEnd: "desc" },
  });
  
  if (sub) {
    return "pass";
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  return (user?.credits ?? 0) > 0 ? "credits" : "free";
}