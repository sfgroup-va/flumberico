/*
  Warnings:

  - You are about to drop the column `experienceLevel` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `jobType` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `requiredSkills` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `rewrittenDescription` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `skillsRequired` on the `jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "experienceLevel",
DROP COLUMN "jobType",
DROP COLUMN "requiredSkills",
DROP COLUMN "requirements",
DROP COLUMN "rewrittenDescription",
DROP COLUMN "skillsRequired",
ADD COLUMN     "aiEnhancedDescription" TEXT,
ADD COLUMN     "aiExperienceLevel" TEXT,
ADD COLUMN     "aiExtractedSkills" TEXT[],
ADD COLUMN     "aiJobType" TEXT,
ADD COLUMN     "aiMatchKeywords" TEXT[],
ADD COLUMN     "aiRequirements" JSONB,
ADD COLUMN     "aiSalaryInsight" TEXT;
