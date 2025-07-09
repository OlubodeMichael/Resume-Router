-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "jobDescriptionId" TEXT;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
