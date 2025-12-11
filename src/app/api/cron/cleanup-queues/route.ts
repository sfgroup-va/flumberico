import { NextRequest, NextResponse } from 'next/server';
import { QueueManager } from '@/lib/queue';
import prisma from '@/lib/prisma';

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

    console.log('Starting queue cleanup process...');

    // Clean up old completed jobs from queues
    await QueueManager.cleanupQueues();

    // Clean up old hunter logs (keep last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedLogs = await prisma.hunterLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // Clean up old queue jobs (keep last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deletedQueueJobs = await prisma.queueJob.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
        status: {
          in: ['completed', 'failed'],
        },
      },
    });

    // Update daily application counters (reset at midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const resetResult = await prisma.user.updateMany({
      where: {
        hunterJobCount: {
          gt: 0,
        },
      },
      data: {
        hunterJobCount: 0,
      },
    });

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      cleanupResults: {
        hunterLogsDeleted: deletedLogs.count,
        queueJobsDeleted: deletedQueueJobs.count,
        userCountersReset: resetResult.count,
      },
    };

    console.log('Queue cleanup completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get queue statistics and health check
    const queueStats = await QueueManager.getQueueStats();

    // Get database statistics
    const [
      totalLogs,
      totalQueueJobs,
      activeUsers,
      todayApplications,
    ] = await Promise.all([
      prisma.hunterLog.count(),
      prisma.queueJob.count(),
      prisma.user.count({
        where: {
          isActiveHunter: true,
          subscriptionTier: 'pro',
        },
      }),
      prisma.jobApplication.count({
        where: {
          aiGenerated: true,
          appliedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      queueStats,
      databaseStats: {
        totalHunterLogs: totalLogs,
        totalQueueJobs: totalQueueJobs,
        activeProUsers: activeUsers,
        todayAIApplications: todayApplications,
      },
      uptime: process.uptime(),
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}