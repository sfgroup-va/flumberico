import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    // Get real-time statistics
    const [
      totalJobs,
      approvedJobs,
      pendingJobs,
      processedWithAI,
      totalUsers,
      activeUsers,
      totalApplications,
      recentApplications
    ] = await Promise.all([
      // Total jobs count
      prisma.job.count(),

      // Approved jobs count
      prisma.job.count({
        where: { approved: true }
      }),

      // Pending jobs count
      prisma.job.count({
        where: { approved: false }
      }),

      // Jobs processed with AI (jobs with requirements or aiEnhancedDescription)
      prisma.job.count({
        where: {
          OR: [
            { aiRequirements: { not: Prisma.AnyNull } },
            { aiEnhancedDescription: { not: null } },
            { aiExtractedSkills: { isEmpty: false } }
          ]
        }
      }),

      // Total users
      prisma.user.count(),

      // Active users (with AI Hunter enabled or recent activity)
      prisma.user.count({
        where: {
          OR: [
            { isActiveHunter: true },
            {
              lastHunterScanAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
              }
            }
          ]
        }
      }),

      // Total applications
      prisma.jobApplication.count(),

      // Recent applications (last 24 hours)
      prisma.jobApplication.count({
        where: {
          appliedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    // Get recent activity logs
    const recentActivity = await prisma.hunterLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Get subscription stats
    const subscriptionStats = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: {
        subscriptionTier: true
      }
    });

    // Get application status distribution
    const applicationStats = await prisma.jobApplication.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Get recent jobs (last 10)
    const recentJobs = await prisma.job.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        companyName: true,
        location: true,
        approved: true,
        createdAt: true
      }
    });

    const stats = {
      jobs: {
        total: totalJobs,
        approved: approvedJobs,
        pending: pendingJobs,
        processedWithAI: processedWithAI,
        approvalRate: totalJobs > 0 ? Math.round((approvedJobs / totalJobs) * 100) : 0
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        subscriptions: subscriptionStats.reduce((acc, stat) => {
          acc[stat.subscriptionTier] = stat._count.subscriptionTier;
          return acc;
        }, {} as Record<string, number>)
      },
      applications: {
        total: totalApplications,
        recent: recentApplications,
        statusDistribution: applicationStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {} as Record<string, number>)
      },
      recentActivity: recentActivity.map(log => ({
        id: log.id,
        action: log.action,
        success: log.success,
        details: log.details,
        userName: log.user?.name || 'Unknown',
        userEmail: log.user?.email || 'Unknown',
        createdAt: log.createdAt
      })),
      recentJobs: recentJobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.companyName,
        location: job.location,
        approved: job.approved,
        createdAt: job.createdAt
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}