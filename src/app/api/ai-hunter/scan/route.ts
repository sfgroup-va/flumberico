import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { JobMatchingEngine } from '@/lib/job-matcher';
import { QueueManager } from '@/lib/queue';

export async function POST(request: NextRequest) {
  let session;
  try {
    // Check authentication
    session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user data with targeting matrix and resume DNA
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        targetingMatrix: true,
        resumeDNA: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if AI Hunter is active and user is Pro
    if (!user.isActiveHunter || user.subscriptionTier !== 'pro') {
      return NextResponse.json(
        { error: 'AI Hunter is not active. Please upgrade to Pro and activate AI Hunter.' },
        { status: 403 }
      );
    }

    // Check if user has completed onboarding
    if (!user.profile?.onboardingCompleted) {
      return NextResponse.json(
        { error: 'Please complete your onboarding first.' },
        { status: 400 }
      );
    }

    // Check if user has targeting matrix and resume DNA
    if (!user.targetingMatrix || !user.resumeDNA) {
      return NextResponse.json(
        { error: 'Missing required profile data. Please complete your profile setup.' },
        { status: 400 }
      );
    }

    // Check daily application limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayApplications = await prisma.jobApplication.count({
      where: {
        userId,
        aiGenerated: true,
        appliedAt: {
          gte: today,
        },
      },
    });

    if (todayApplications >= user.hunterJobLimit) {
      return NextResponse.json(
        {
          error: `Daily application limit reached (${user.hunterJobLimit}). You've applied to ${todayApplications} jobs today.`,
          limitReached: true,
          currentCount: todayApplications,
          limit: user.hunterJobLimit,
        },
        { status: 429 }
      );
    }

    // Update last scan time
    await prisma.user.update({
      where: { id: userId },
      data: { lastHunterScanAt: new Date() },
    });

    // Log the scan start
    await prisma.hunterLog.create({
      data: {
        userId,
        action: 'scan_started',
        details: {
          timestamp: new Date().toISOString(),
          dailyApplicationsCount: todayApplications,
          remainingQuota: user.hunterJobLimit - todayApplications,
        },
        success: true,
      },
    });

    // Create matching criteria
    const criteria = {
      userId,
      jobTitles: user.targetingMatrix.jobTitles,
      locations: user.targetingMatrix.locations,
      mustHaveSkills: user.targetingMatrix.mustHaveSkills,
      niceToHaveSkills: user.targetingMatrix.niceToHaveSkills || [],
      salaryMin: user.targetingMatrix.salaryMin || undefined,
      salaryMax: user.targetingMatrix.salaryMax || undefined,
      remoteOnly: user.targetingMatrix.remoteOnly,
      excludeCompanies: user.targetingMatrix.excludeCompanies || [],
    };

    // Find matches using the Job Matching Engine
    const startTime = Date.now();
    const matches = await JobMatchingEngine.findMatchesForUser(criteria);
    const processingTime = Date.now() - startTime;

    // Filter matches by minimum score (only apply to high-quality matches)
    const highQualityMatches = matches.filter(match => match.matchScore >= 70);

    // Limit to remaining daily quota
    const remainingQuota = user.hunterJobLimit - todayApplications;
    const matchesToApply = highQualityMatches.slice(0, remainingQuota);

    // Log the scan results
    await prisma.hunterLog.create({
      data: {
        userId,
        action: 'job_found',
        details: {
          totalMatches: matches.length,
          highQualityMatches: highQualityMatches.length,
          matchesToApply: matchesToApply.length,
          averageScore: matches.length > 0
            ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length)
            : 0,
          processingTime,
        },
        success: true,
        processingTime,
      },
    });

    // Add jobs to the queue for automated application
    for (const match of matchesToApply) {
      // Create the application record first (status: scouted)
      const application = await prisma.jobApplication.create({
        data: {
          userId,
          jobId: match.jobId,
          status: 'scouted',
          aiGenerated: true,
          matchScore: match.matchScore,
          matchReasoning: match.matchReasons.join('. '),
          applicationSource: 'ai_hunter',
        },
      });

      // Log the match
      await prisma.hunterLog.create({
        data: {
          userId,
          action: 'match_scored',
          jobId: match.jobId,
          details: {
            matchScore: match.matchScore,
            matchReasons: match.matchReasons,
            applicationId: application.id,
          },
          success: true,
        },
      });

      // Add to queue for cover letter generation and application
      await QueueManager.addCoverLetterJob({
        userId,
        jobId: match.jobId,
        jobTitle: match.jobTitle,
        companyName: match.companyName,
      });

      // Add application to queue with delay for stealth
      const stealthDelay = Math.floor(Math.random() * 300) + 180; // 3-8 minutes
      await QueueManager.addJobApplicationJob({
        userId,
        jobId: match.jobId,
        matchData: {
          jobTitle: match.jobTitle,
          companyName: match.companyName,
          matchScore: match.matchScore,
          applicationUrl: match.applicationUrl,
          applicationEmail: match.applicationEmail,
        },
      }, stealthDelay * 1000);
    }

    // Update user's daily application count
    await prisma.user.update({
      where: { id: userId },
      data: {
        hunterJobCount: todayApplications + matchesToApply.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: `AI Hunter scan completed. Found ${matches.length} matches, applying to ${matchesToApply.length} high-quality opportunities.`,
      scanResults: {
        totalMatches: matches.length,
        highQualityMatches: highQualityMatches.length,
        applicationsQueued: matchesToApply.length,
        processingTime: `${processingTime}ms`,
        remainingQuota: user.hunterJobLimit - todayApplications - matchesToApply.length,
        nextScanAvailable: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      },
      topMatches: matchesToApply.slice(0, 5).map(match => ({
        jobTitle: match.jobTitle,
        companyName: match.companyName,
        matchScore: match.matchScore,
        matchReasons: match.matchReasons,
        location: match.location,
        type: match.type,
        salary: match.salary,
      })),
    });

  } catch (error) {
    console.error('AI Hunter scan error:', error);

    // Log the error
    if (session?.user?.id) {
      await prisma.hunterLog.create({
        data: {
          userId: session.user.id,
          action: 'scan_error',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          },
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      }).catch(console.error); // Don't let logging errors break the response
    }

    return NextResponse.json(
      {
        error: 'Failed to complete AI Hunter scan',
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : 'Unknown error')
          : undefined,
      },
      { status: 500 }
    );
  }
}

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

    // Get user data
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

    // Get today's application count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayApplications = await prisma.jobApplication.count({
      where: {
        userId,
        aiGenerated: true,
        appliedAt: {
          gte: today,
        },
      },
    });

    // Get recent hunter logs
    const recentLogs = await prisma.hunterLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        action: true,
        details: true,
        success: true,
        errorMessage: true,
        processingTime: true,
        createdAt: true,
      },
    });

    // Calculate next scan availability
    const nextScanAvailable = user.lastHunterScanAt
      ? new Date(user.lastHunterScanAt.getTime() + 30 * 60 * 1000)
      : new Date();

    const canScan = user.isActiveHunter &&
      user.subscriptionTier === 'pro' &&
      Date.now() >= nextScanAvailable.getTime() &&
      todayApplications < user.hunterJobLimit;

    return NextResponse.json({
      status: {
        isActive: user.isActiveHunter,
        subscription: user.subscriptionTier,
        canScan,
        lastScanAt: user.lastHunterScanAt,
        nextScanAvailable: nextScanAvailable.toISOString(),
        timeUntilNextScan: Math.max(0, nextScanAvailable.getTime() - Date.now()),
      },
      quota: {
        dailyLimit: user.hunterJobLimit,
        usedToday: todayApplications,
        remaining: Math.max(0, user.hunterJobLimit - todayApplications),
        resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      },
      recentActivity: recentLogs.map(log => ({
        action: log.action,
        success: log.success,
        details: log.details,
        processingTime: log.processingTime,
        timestamp: log.createdAt,
        error: log.errorMessage,
      })),
    });

  } catch (error) {
    console.error('AI Hunter status error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI Hunter status' },
      { status: 500 }
    );
  }
}