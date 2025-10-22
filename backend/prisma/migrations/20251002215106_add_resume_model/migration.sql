/*
  Warnings:

  - You are about to drop the column `templateId` on the `Resume` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Template" AS ENUM ('abdul', 'noah', 'nisha', 'habib', 'parth', 'ryan', 'yao');

-- CreateEnum
CREATE TYPE "public"."ResumeStatus" AS ENUM ('processing', 'ready', 'failed');

-- DropIndex
DROP INDEX "public"."Resume_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Resume" DROP COLUMN "templateId",
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "jdRaw" TEXT,
ADD COLUMN     "status" "public"."ResumeStatus" NOT NULL DEFAULT 'processing',
ADD COLUMN     "template" "public"."Template",
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled',
ALTER COLUMN "content" DROP NOT NULL;

-- DropEnum
DROP TYPE "public"."TemplateId";

-- CreateIndex
CREATE INDEX "Resume_userId_updatedAt_idx" ON "public"."Resume"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Resume_status_createdAt_idx" ON "public"."Resume"("status", "createdAt");
