/*
  Warnings:

  - You are about to drop the column `email` on the `job_applications` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `job_applications` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `job_applications` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `job_applications` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `job_applications` table. All the data in the column will be lost.
  - You are about to drop the column `portfolio` on the `job_applications` table. All the data in the column will be lost.
  - You are about to drop the column `parsedSkills` on the `resume_dna` table. All the data in the column will be lost.
  - You are about to drop the column `desiredSalary` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `jobType` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `remotePreference` on the `user_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "job_applications" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "linkedin",
DROP COLUMN "phone",
DROP COLUMN "portfolio",
ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "applicationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "jobType" TEXT,
ADD COLUMN     "requiredSkills" TEXT;

-- AlterTable
ALTER TABLE "resume_dna" DROP COLUMN "parsedSkills",
ADD COLUMN     "skills" TEXT[];

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "desiredSalary",
DROP COLUMN "experience",
DROP COLUMN "jobType",
DROP COLUMN "remotePreference",
ADD COLUMN     "expectedSalaryMax" INTEGER,
ADD COLUMN     "expectedSalaryMin" INTEGER,
ADD COLUMN     "experienceYears" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "preferredJobTypes" TEXT[],
ADD COLUMN     "preferredLocationType" TEXT NOT NULL DEFAULT 'remote';

-- CreateTable
CREATE TABLE "saved_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "industry" TEXT,
    "website" TEXT,
    "size" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interval" TEXT NOT NULL DEFAULT 'month',
    "features" JSONB NOT NULL,
    "limits" JSONB NOT NULL,
    "stripePriceId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_userId_jobId_key" ON "saved_jobs"("userId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_planId_key" ON "subscription_plans"("planId");

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
