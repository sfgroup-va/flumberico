/*
  Warnings:

  - Added the required column `email` to the `job_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `job_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `job_applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "portfolio" TEXT;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "salaryMax" INTEGER,
ADD COLUMN     "salaryMin" INTEGER,
ALTER COLUMN "salary" DROP NOT NULL;
