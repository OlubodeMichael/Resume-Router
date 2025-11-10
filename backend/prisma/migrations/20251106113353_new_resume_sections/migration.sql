-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "awardsHonors" JSONB,
ADD COLUMN     "certifications" JSONB,
ADD COLUMN     "courses" JSONB,
ADD COLUMN     "languages" JSONB,
ADD COLUMN     "leadership" JSONB,
ADD COLUMN     "links" JSONB,
ADD COLUMN     "objective" TEXT,
ADD COLUMN     "publications" JSONB,
ADD COLUMN     "references" JSONB,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "volunteer" JSONB,
ADD COLUMN     "workAuth" JSONB;
