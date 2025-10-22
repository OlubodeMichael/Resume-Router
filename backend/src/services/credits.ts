import { prisma } from "../../lib/prisma";

export async function spendCreditsAtomic(
  userId: string,
  cost: number,
  opKey: string,
  feature = "spend"
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const prior = await tx.creditLedger.findFirst({ where: { opKey } });
    if (prior) return true;

    const updated = await tx.$queryRaw<{ credits: number }[]>`
      UPDATE "User"
      SET "credits" = "credits" - ${cost}
      WHERE "id" = ${userId} AND "credits" >= ${cost}
      RETURNING "credits";
    `;
    if (updated.length === 0) return false;

    await tx.creditLedger.create({
      data: { userId, delta: -cost, reason: `spend:${feature}`, opKey },
    });

    return true;
  });
}

export async function refundCredits(
  userId: string,
  amount: number,
  opKey: string,
  reason = "refund"
) {
  await prisma.$transaction(async (tx) => {
    await tx.creditLedger.create({
      data: { userId, delta: amount, reason, opKey },
    });
    await tx.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    });
  });
}
