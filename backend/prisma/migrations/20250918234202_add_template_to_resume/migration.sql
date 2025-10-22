-- CreateEnum
CREATE TYPE "public"."TemplateId" AS ENUM ('abdul', 'noah', 'nisha', 'habib', 'parth', 'ryan', 'yao');

-- AlterTable
ALTER TABLE "public"."Resume" ADD COLUMN     "templateId" "public"."TemplateId";
