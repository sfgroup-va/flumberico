-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "applicationSource" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "matchReasoning" TEXT,
ADD COLUMN     "matchScore" INTEGER,
ADD COLUMN     "stealthDelay" INTEGER;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "requirements" JSONB,
ADD COLUMN     "skillsRequired" TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hunterJobCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hunterJobLimit" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "lastHunterScanAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "hunter_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "jobId" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "processingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hunter_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_jobs" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "jobData" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "errorMessage" TEXT,
    "result" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_jobs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hunter_logs" ADD CONSTRAINT "hunter_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
