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
    const startDate = url.searchParams.get('startDate');

    // Default to last 30 days if no start date provided
    const thirtyDaysAgo = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    }

    // Get applications in the timeframe
    const [
      totalApplicationsResult,
      interviewsScheduledResult,
      offersReceivedResult,
      aiGeneratedApplicationsResult,
      dailyApplicationData
    ] = await Promise.all([
      // Total applications in timeframe
      prisma.jobApplication.count({
        where: {
          userId,
          appliedAt: { gte: thirtyDaysAgo }
        }
      }),

      // Interviews in timeframe
      prisma.jobApplication.count({
        where: {
          userId,
          status: 'interview',
          appliedAt: { gte: thirtyDaysAgo }
        }
      }),

      // Offers in timeframe
      prisma.jobApplication.count({
        where: {
          userId,
          status: 'offer',
          appliedAt: { gte: thirtyDaysAgo }
        }
      }),

      // AI-generated applications in timeframe
      prisma.jobApplication.count({
        where: {
          userId,
          aiGenerated: true,
          appliedAt: { gte: thirtyDaysAgo }
        }
      }),

      // Daily application counts
      prisma.$queryRaw<Array<{
        date: string;
        total_applications: bigint;
        ai_applications: bigint;
        interviews: bigint;
        offers: bigint;
      }>>`
        SELECT
          DATE("appliedAt") as date,
          COUNT(*) as total_applications,
          COUNT(CASE WHEN "aiGenerated" = true THEN 1 END) as ai_applications,
          COUNT(CASE WHEN status = 'interview' THEN 1 END) as interviews,
          COUNT(CASE WHEN status = 'offer' THEN 1 END) as offers
        FROM job_applications
        WHERE "userId" = ${userId}
          AND "appliedAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("appliedAt")
        ORDER BY date DESC
      `
    ]);

    // Convert BigInt to Number
    const totalApplications = Number(totalApplicationsResult);
    const interviewsScheduled = Number(interviewsScheduledResult);
    const offersReceived = Number(offersReceivedResult);
    const aiGeneratedApplications = Number(aiGeneratedApplicationsResult);

    // Convert BigInt values in daily data to numbers
    const processedDailyData = dailyApplicationData.map(day => ({
      ...day,
      total_applications: Number(day.total_applications),
      ai_applications: Number(day.ai_applications),
      interviews: Number(day.interviews),
      offers: Number(day.offers),
    }));

    // Calculate metrics
    const applicationRate = Math.round(totalApplications / 30); // Per day
    const responseRate = totalApplications > 0
      ? Math.round(((interviewsScheduled + offersReceived) / totalApplications) * 100)
      : 0;
    const interviewRate = totalApplications > 0
      ? Math.round((interviewsScheduled / totalApplications) * 100)
      : 0;
    const aiAutomationRate = totalApplications > 0
      ? Math.round((aiGeneratedApplications / totalApplications) * 100)
      : 0;

    // Calculate user ranking (simple algorithm based on activity and success)
    let userRanking = 50; // Base ranking
    if (totalApplications > 0) {
      userRanking += Math.min(20, Math.floor(totalApplications / 5)); // Activity bonus
      userRanking += Math.min(20, Math.floor(responseRate / 5)); // Success bonus
      userRanking += Math.min(10, Math.floor(aiAutomationRate / 10)); // AI usage bonus
    }
    userRanking = Math.min(99, Math.max(1, userRanking));

    // Calculate best day and streak
    let bestDay = { date: '', applications: 0 };
    let currentStreak = 0;
    let maxStreak = 0;

    const sortedDays = processedDailyData.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedDays.forEach((day, index) => {
      if (day.total_applications > bestDay.applications) {
        bestDay = { date: day.date, applications: day.total_applications };
      }

      // Calculate streak (consecutive days with applications)
      if (day.total_applications > 0) {
        if (index === 0 ||
            new Date(day.date).getTime() - new Date(sortedDays[index - 1].date).getTime() === 86400000) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
    });

    return NextResponse.json({
      applicationRate,
      responseRate,
      interviewRate,
      aiAutomationRate,
      userRanking,
      totalApplications,
      interviewsScheduled,
      offersReceived,
      aiGeneratedApplications,
      manualApplications: totalApplications - aiGeneratedApplications,
      bestDay,
      currentStreak: maxStreak,
      dailyData: processedDailyData,
      timeframe: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: new Date().toISOString(),
        days: 30
      }
    });

  } catch (error) {
    console.error('Performance fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}