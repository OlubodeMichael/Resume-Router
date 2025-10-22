/*
  Warnings:

  - A unique constraint covering the columns `[opKey]` on the table `CreditLedger` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."CreditLedger" DROP CONSTRAINT "CreditLedger_userId_fkey";

-- AlterTable
ALTER TABLE "public"."CreditLedger" ADD COLUMN     "opKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CreditLedger_opKey_key" ON "public"."CreditLedger"("opKey");

-- AddForeignKey
ALTER TABLE "public"."CreditLedger" ADD CONSTRAINT "CreditLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
