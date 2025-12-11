import { NextRequest, NextResponse } from 'next/server';
import { JobMatchingEngine } from '@/lib/job-matcher';
import { QueueManager } from '@/lib/queue';
import prisma from '@/lib/prisma';

// This endpoint should be called by a cron job service
// For production, use Vercel Cron Jobs, GitHub Actions, or similar

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authorized cron service
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting automated job matching process...');

    // Get all active users with AI Hunter enabled
    const activeUsers = await prisma.user.findMany({
      where: {
        isActiveHunter: true,
        subscriptionTier: 'pro',
        profile: {
          onboardingCompleted: true
        }
      },
      include: {
        targetingMatrix: true,
        resumeDNA: true,
        profile: true
      }
    });

    console.log(`Found ${activeUsers.length} active users for job matching`);

    let totalMatches = 0;
    let usersProcessed = 0;

    // Process each active user
    for (const user of activeUsers) {
      if (!user.targetingMatrix || !user.resumeDNA) {
        console.log(`Skipping user ${user.id} - missing targeting matrix or resume DNA`);
        continue;
      }

      try {
        // Create matching criteria
        const criteria = {
          userId: user.id,
          jobTitles: user.targetingMatrix.jobTitles,
          locations: user.targetingMatrix.locations,
          mustHaveSkills: user.targetingMatrix.mustHaveSkills,
          niceToHaveSkills: user.targetingMatrix.niceToHaveSkills || [],
          salaryMin: user.targetingMatrix.salaryMin || undefined,
          salaryMax: user.targetingMatrix.salaryMax || undefined,
          remoteOnly: user.targetingMatrix.remoteOnly,
          excludeCompanies: user.targetingMatrix.excludeCompanies || []
        };

        // Find matches for this user
        const matches = await JobMatchingEngine.findMatchesForUser(criteria);

        if (matches.length > 0) {
          // Add job matching task to queue
          await QueueManager.addJobMatchingJob(criteria as any);
          totalMatches += matches.length;
          console.log(`Found ${matches.length} matches for user ${user.id}`);
        }

        usersProcessed++;

      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }

    // Clean up old completed jobs
    await QueueManager.cleanupQueues();

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      usersProcessed,
      totalMatches,
      activeUsers: activeUsers.length
    };

    console.log('Job matching process completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Cron job matching error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Health check endpoint for monitoring
export async function GET() {
  try {
    // Check Redis connection and queue status
    const queueStats = await QueueManager.getQueueStats();

    // Get active user count
    const activeUserCount = await prisma.user.count({
      where: {
        isActiveHunter: true,
        subscriptionTier: 'pro',
        profile: {
          onboardingCompleted: true
        }
      }
    });

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      queueStats,
      activeUserCount,
      uptime: process.uptime()
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}