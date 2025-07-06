/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Skill_userId_key" ON "Skill"("userId");
