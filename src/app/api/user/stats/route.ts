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

    // Count applications by status
    const [
      totalApplications,
      interviewsScheduled,
      offersReceived,
      applicationsByStatus
    ] = await Promise.all([
      prisma.jobApplication.count({
        where: { userId }
      }),
      prisma.jobApplication.count({
        where: {
          userId,
          status: 'interview'
        }
      }),
      prisma.jobApplication.count({
        where: {
          userId,
          status: 'offer'
        }
      }),
      prisma.jobApplication.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          status: true
        }
      })
    ]);

    // Calculate success rate (interviews + offers) / total applications
    const successfulApplications = interviewsScheduled + offersReceived;
    const successRate = totalApplications > 0
      ? Math.round((successfulApplications / totalApplications) * 100)
      : 0;

    return NextResponse.json({
      totalApplications,
      interviewsScheduled,
      offersReceived,
      successRate,
      applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>)
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}