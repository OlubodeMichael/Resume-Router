/*
  Warnings:

  - Changed the type of `skills` on the `Profile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- First, add a temporary column for the new JSON data
ALTER TABLE "Profile" ADD COLUMN "skills_new" JSONB;

-- Convert existing text array data to JSON format
-- Each string becomes a Skill object with name and default level
UPDATE "Profile" 
SET "skills_new" = (
  SELECT json_agg(
    json_build_object(
      'name', skill,
      'level', 'Intermediate'
    )
  )
  FROM unnest("skills") AS skill
)
WHERE "skills" IS NOT NULL AND array_length("skills", 1) > 0;

-- Set empty array for profiles with no skills
UPDATE "Profile" 
SET "skills_new" = '[]'::jsonb
WHERE "skills" IS NULL OR array_length("skills", 1) IS NULL;

-- Drop the old column and rename the new one
ALTER TABLE "Profile" DROP COLUMN "skills";
ALTER TABLE "Profile" RENAME COLUMN "skills_new" TO "skills";

-- Make the column NOT NULL
ALTER TABLE "Profile" ALTER COLUMN "skills" SET NOT NULL;
