import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '30'; // days

    const days = parseInt(timeframe);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get user's AI Hunter status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isActiveHunter: true,
        subscriptionTier: true,
        lastHunterScanAt: true,
        hunterJobLimit: true,
        hunterJobCount: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get application analytics
    const [
      totalApplications,
      aiGeneratedApplications,
      statusBreakdown,
      dailyApplications,
      successMetrics,
      topCompanies,
      matchScoreDistribution,
      recentLogs
    ] = await Promise.all([
      // Total applications in timeframe
      prisma.jobApplication.count({
        where: {
          userId,
          appliedAt: { gte: startDate },
        },
      }),

      // AI-generated applications
      prisma.jobApplication.count({
        where: {
          userId,
          aiGenerated: true,
          appliedAt: { gte: startDate },
        },
      }),

      // Status breakdown
      prisma.jobApplication.groupBy({
        by: ['status'],
        where: {
          userId,
          appliedAt: { gte: startDate },
        },
        _count: {
          id: true,
        },
      }),

      // Daily application trend
      prisma.$queryRaw<Array<{
        date: string;
        total_applications: number;
        ai_applications: number;
        avg_match_score: number;
      }>>`
        SELECT
          DATE("appliedAt") as date,
          COUNT(*) as total_applications,
          COUNT(CASE WHEN "aiGenerated" = true THEN 1 END) as ai_applications,
          AVG(CASE WHEN "matchScore" IS NOT NULL THEN "matchScore" END) as avg_match_score
        FROM job_applications
        WHERE "userId" = ${userId}
          AND "appliedAt" >= ${startDate}
        GROUP BY DATE("appliedAt")
        ORDER BY date DESC
        LIMIT 30
      `,

      // Success metrics (interviews, offers)
      prisma.jobApplication.groupBy({
        by: ['status'],
        where: {
          userId,
          appliedAt: { gte: startDate },
          status: { in: ['interview', 'offer'] },
        },
        _count: {
          id: true,
        },
      }),

      // Top companies applied to
      prisma.$queryRaw<Array<{
        company_name: string;
        application_count: number;
        avg_match_score: number;
        last_applied: Date;
      }>>`
        SELECT
          j."companyName",
          COUNT(*) as application_count,
          AVG(ja."matchScore") as avg_match_score,
          MAX(ja."appliedAt") as last_applied
        FROM job_applications ja
        JOIN jobs j ON ja."jobId" = j.id
        WHERE ja."userId" = ${userId}
          AND ja."appliedAt" >= ${startDate}
        GROUP BY j."companyName"
        ORDER BY application_count DESC
        LIMIT 10
      `,

      // Match score distribution for AI applications
      prisma.jobApplication.groupBy({
        by: ['matchScore'],
        where: {
          userId,
          aiGenerated: true,
          appliedAt: { gte: startDate },
          matchScore: { not: null },
        },
        _count: {
          id: true,
        },
      }),

      // Recent hunter activity logs
      prisma.hunterLog.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          action: true,
          success: true,
          details: true,
          processingTime: true,
          createdAt: true,
          errorMessage: true,
        },
      }),
    ]);

    // Calculate conversion rates
    const totalApps = totalApplications || 1; // Prevent division by zero
    const interviewsScheduled = successMetrics.find(m => m.status === 'interview')?._count.id || 0;
    const offersReceived = successMetrics.find(m => m.status === 'offer')?._count.id || 0;

    // Calculate match score distribution
    const scoreRanges = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '50-59': 0,
      'Below 50': 0,
    };

    matchScoreDistribution.forEach(item => {
      const score = item.matchScore as number;
      if (score >= 90) scoreRanges['90-100'] += item._count.id;
      else if (score >= 80) scoreRanges['80-89'] += item._count.id;
      else if (score >= 70) scoreRanges['70-79'] += item._count.id;
      else if (score >= 60) scoreRanges['60-69'] += item._count.id;
      else if (score >= 50) scoreRanges['50-59'] += item._count.id;
      else scoreRanges['Below 50'] += item._count.id;
    });

    // Process hunter activity logs
    const hunterActivity = recentLogs.reduce((acc, log) => {
      if (!acc[log.action]) {
        acc[log.action] = {
          count: 0,
          successCount: 0,
          avgProcessingTime: 0,
          lastOccurrence: log.createdAt,
        };
      }
      acc[log.action].count++;
      if (log.success) acc[log.action].successCount++;
      if (log.processingTime) {
        acc[log.action].avgProcessingTime += log.processingTime;
      }
      acc[log.action].lastOccurrence = log.createdAt;
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages for hunter activity
    Object.values(hunterActivity).forEach((activity: any) => {
      if (activity.count > 0) {
        activity.successRate = Math.round((activity.successCount / activity.count) * 100);
        activity.avgProcessingTime = Math.round(activity.avgProcessingTime / activity.count);
      }
    });

    // Get today's quota usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayApplications = await prisma.jobApplication.count({
      where: {
        userId,
        aiGenerated: true,
        appliedAt: { gte: today },
      },
    });

    return NextResponse.json({
      overview: {
        isActiveHunter: user.isActiveHunter,
        subscriptionTier: user.subscriptionTier,
        lastScanAt: user.lastHunterScanAt,
        timeframe: `${days} days`,
        totalApplications,
        aiGeneratedApplications,
        manualApplications: totalApplications - aiGeneratedApplications,
        aiAutomationRate: Math.round((aiGeneratedApplications / totalApps) * 100),
      },
      performance: {
        interviewRate: Math.round((interviewsScheduled / totalApps) * 100),
        offerRate: Math.round((offersReceived / totalApps) * 100),
        responseRate: Math.round(((interviewsScheduled + offersReceived) / totalApps) * 100),
        interviewsScheduled,
        offersReceived,
        averageMatchScore: Math.round(
          dailyApplications.reduce((sum, day) => sum + ((day.avg_match_score || 0) / 100), 0) /
          Math.max(1, dailyApplications.length) * 100
        ),
      },
      quota: {
        dailyLimit: -1, // Unlimited quota
        usedToday: todayApplications,
        remaining: -1, // Unlimited remaining
        resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      },
      trends: {
        dailyApplications: dailyApplications.map(day => ({
          date: day.date,
          total: Number(day.total_applications),
          aiGenerated: Number(day.ai_applications),
          manual: Number(day.total_applications) - Number(day.ai_applications),
          avgMatchScore: Math.round(Number(day.avg_match_score) || 0),
        })),
        matchScoreDistribution: scoreRanges,
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
      },
      insights: {
        topCompanies: topCompanies.map(company => ({
          name: company.company_name,
          applications: Number(company.application_count),
          avgMatchScore: Math.round(Number(company.avg_match_score) || 0),
          lastApplied: company.last_applied,
        })),
        hunterActivity,
        recommendations: generateRecommendations({
          totalApplications,
          aiGeneratedApplications,
          interviewsScheduled,
          offersReceived,
          avgMatchScore: dailyApplications.reduce((sum, day) => sum + (day.avg_match_score || 0), 0) / Math.max(1, dailyApplications.length),
          aiAutomationRate: (aiGeneratedApplications / totalApps) * 100,
          subscriptionTier: user.subscriptionTier,
        }),
      },
    });

  } catch (error) {
    console.error('AI Hunter analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

function generateRecommendations(data: {
  totalApplications: number;
  aiGeneratedApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  avgMatchScore: number;
  aiAutomationRate: number;
  subscriptionTier: string;
}): string[] {
  const recommendations: string[] = [];

  // Application volume recommendations
  if (data.totalApplications < 10) {
    recommendations.push("Consider increasing your application volume to improve response rates");
  } else if (data.totalApplications > 50) {
    recommendations.push("Great application volume! Focus on quality over quantity");
  }

  // AI automation recommendations
  if (data.aiAutomationRate < 50 && data.subscriptionTier === 'pro') {
    recommendations.push("Enable AI Hunter automation to increase application efficiency");
  } else if (data.aiAutomationRate >= 80) {
    recommendations.push("Excellent AI automation! Monitor quality of matches");
  }

  // Match score recommendations
  if (data.avgMatchScore < 70) {
    recommendations.push("Review and refine your job targeting criteria for better matches");
  } else if (data.avgMatchScore >= 85) {
    recommendations.push("Outstanding match scores! Your targeting criteria is well-optimized");
  }

  // Response rate recommendations
  const responseRate = ((data.interviewsScheduled + data.offersReceived) / Math.max(1, data.totalApplications)) * 100;
  if (responseRate < 10) {
    recommendations.push("Consider updating your resume and cover letter templates");
  } else if (responseRate >= 25) {
    recommendations.push("Excellent response rate! Your applications are well-targeted");
  }

  // Interview-to-offer conversion
  if (data.interviewsScheduled > 0) {
    const offerRate = (data.offersReceived / data.interviewsScheduled) * 100;
    if (offerRate < 20) {
      recommendations.push("Practice interview skills and consider technical preparation");
    } else if (offerRate >= 50) {
      recommendations.push("Strong interview performance! Continue your preparation approach");
    }
  }

  // Subscription recommendations
  if (data.subscriptionTier === 'free') {
    recommendations.push("Upgrade to Pro to unlock AI Hunter automation features");
  }

  return recommendations;
}