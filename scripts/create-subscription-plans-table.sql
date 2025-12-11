-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS "subscription_plans" (
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

-- Create unique index on planId
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plans_planId_key" ON "subscription_plans"("planId");

-- Insert default subscription plans
INSERT INTO "subscription_plans" ("id", "planId", "name", "price", "currency", "interval", "features", "limits", "stripePriceId", "active", "createdAt", "updatedAt")
VALUES
    (
        'cmhpm1q6g0000l697x7w8h8y2',
        'free',
        'Free',
        0,
        'USD',
        'month',
        '["Basic job browsing", "Manual applications", "5 application tracking", "Basic resume upload", "Standard support"]',
        '{"jobApplications": 5, "aiHunterScans": 0, "resumeOptimizations": 1, "prioritySupport": false}',
        NULL,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'cmhpm1q7h0001l697y1k6w4t8',
        'pro',
        'Pro',
        2900,
        'USD',
        'month',
        '["Unlimited job browsing", "AI Hunter automatic applications", "Unlimited application tracking", "Advanced resume optimization", "AI-powered job matching", "Priority support", "Advanced analytics dashboard"]',
        '{"jobApplications": -1, "aiHunterScans": -1, "resumeOptimizations": -1, "prioritySupport": true}',
        'price_1SQBQfK5eCQZVENIeOfH9374',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
ON CONFLICT ("planId") DO NOTHING;