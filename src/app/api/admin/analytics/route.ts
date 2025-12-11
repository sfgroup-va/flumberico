import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // default to 30 days
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get comprehensive analytics data
    const [
      totalUsers,
      activeHunters,
      totalApplications,
      aiGeneratedApplications,
      applicationBreakdown,
      totalJobs,
      approvedJobs,
      subscriptionStats,
      revenueStats,
      performanceStats
    ] = await Promise.all([
      // User statistics
      prisma.user.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
          isActiveHunter: true
        }
      }),

      // Application statistics
      prisma.jobApplication.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.jobApplication.count({
        where: {
          createdAt: { gte: startDate },
          aiGenerated: true
        }
      }),
      prisma.jobApplication.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: {
          _all: true
        }
      }),

      // Job statistics
      prisma.job.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.job.count({
        where: {
          createdAt: { gte: startDate },
          approved: true
        }
      }),

      // Subscription statistics
      prisma.user.groupBy({
        by: ['subscriptionTier'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: {
          id: true
        }
      }),

      // Revenue estimation
      prisma.user.aggregate({
        where: {
          subscriptionTier: 'pro',
          createdAt: { gte: startDate }
        },
        _count: {
          id: true
        }
      }),

      // Performance metrics
      getPerformanceMetrics(startDate, days)
    ]);

    // Calculate derived metrics
    const totalUsersCount = totalUsers || 0;
    const activeHuntersCount = activeHunters || 0;
    const activationRate = totalUsersCount > 0 ? (activeHuntersCount / totalUsersCount) * 100 : 0;

    const totalApplicationsCount = totalApplications || 0;
    const aiGeneratedApplicationsCount = aiGeneratedApplications || 0;
    const aiGenerationRate = totalApplicationsCount > 0 ? (aiGeneratedApplicationsCount / totalApplicationsCount) * 100 : 0;

    const totalJobsCount = totalJobs || 0;
    const approvedJobsCount = approvedJobs || 0;
    const jobApprovalRate = totalJobsCount > 0 ? (approvedJobsCount / totalJobsCount) * 100 : 0;

    // Process application status breakdown
    const applicationStatusBreakdown = (applicationBreakdown as any[]).reduce((acc, item) => {
      acc[item.status] = item._count._all || 0;
      return acc;
    }, {} as Record<string, number>);

    // Process subscription breakdown
    const subscriptionBreakdown = (subscriptionStats as any[]).reduce((acc, item) => {
      acc[item.subscriptionTier] = item._count.id || 0;
      return acc;
    }, {} as Record<string, number>);

    // Calculate success rates
    const interviewRate = totalApplicationsCount > 0
      ? ((applicationStatusBreakdown.interview || 0) / totalApplicationsCount) * 100
      : 0;

    const offerRate = totalApplicationsCount > 0
      ? ((applicationStatusBreakdown.offer || 0) / totalApplicationsCount) * 100
      : 0;

    // Revenue calculation (assuming $29/month for Pro)
    const proSubscriptions = revenueStats._count.id || 0;
    const estimatedMonthlyRevenue = proSubscriptions * 29;
    const estimatedPeriodRevenue = estimatedMonthlyRevenue * (days / 30);

    return NextResponse.json({
      period: `${days} days`,
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      },
      users: {
        total: totalUsersCount,
        new: totalUsersCount,
        activeHunters: activeHuntersCount,
        activationRate: Math.round(activationRate * 100) / 100
      },
      applications: {
        total: totalApplicationsCount,
        new: totalApplicationsCount,
        aiGenerated: aiGeneratedApplicationsCount,
        aiGenerationRate: Math.round(aiGenerationRate * 100) / 100,
        breakdown: applicationStatusBreakdown,
        interviewRate: Math.round(interviewRate * 100) / 100,
        offerRate: Math.round(offerRate * 100) / 100
      },
      jobs: {
        total: totalJobsCount,
        new: totalJobsCount,
        approved: approvedJobsCount,
        approvalRate: Math.round(jobApprovalRate * 100) / 100
      },
      subscriptions: {
        breakdown: subscriptionBreakdown,
        proCount: proSubscriptions
      },
      revenue: {
        estimatedMonthly: estimatedMonthlyRevenue,
        estimatedPeriod: estimatedPeriodRevenue,
        currency: 'USD'
      },
      performance: performanceStats,
      growth: await calculateGrowthMetrics(startDate, days)
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getPerformanceMetrics(startDate: Date, days: number) {
  // Get recent job applications and their outcomes
  const recentApplications = await prisma.jobApplication.findMany({
    where: {
      createdAt: { gte: startDate }
    },
    include: {
      job: {
        select: {
          salary: true,
          companyName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  // Calculate average salary of applied jobs
  const appliedJobs = recentApplications.filter(app => app.job.salary);
  const avgSalary = appliedJobs.length > 0
    ? appliedJobs.reduce((sum, app) => sum + (app.job.salary ?? 0), 0) / appliedJobs.length
    : 0;

  // Top companies by applications
  const companyApplications = recentApplications.reduce((acc, app) => {
    const company = app.job.companyName;
    acc[company] = (acc[company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyApplications)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([company, count]) => ({ company, count }));

  return {
    averageSalaryApplied: Math.round(avgSalary),
    topCompanies,
    totalRecentApplications: recentApplications.length
  };
}

async function calculateGrowthMetrics(startDate: Date, currentPeriodDays: number) {
  // Calculate growth compared to previous period
  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - currentPeriodDays);

  const [
    currentUsers,
    previousUsers,
    currentApplications,
    previousApplications
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: startDate } } }),
    prisma.user.count({ where: { createdAt: { gte: previousStartDate, lt: startDate } } }),
    prisma.jobApplication.count({ where: { createdAt: { gte: startDate } } }),
    prisma.jobApplication.count({ where: { createdAt: { gte: previousStartDate, lt: startDate } } })
  ]);

  const userGrowth = previousUsers > 0
    ? ((currentUsers - previousUsers) / previousUsers) * 100
    : 0;

  const applicationGrowth = previousApplications > 0
    ? ((currentApplications - previousApplications) / previousApplications) * 100
    : 0;

  return {
    userGrowth: Math.round(userGrowth * 100) / 100,
    applicationGrowth: Math.round(applicationGrowth * 100) / 100,
    previousPeriod: {
      users: previousUsers,
      applications: previousApplications
    }
  };
}