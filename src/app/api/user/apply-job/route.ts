import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { jobId, method = 'manual' } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const subscriptionTier = user.subscriptionTier || 'free';

    // Check if user can use this method
    if (method === 'automated' && subscriptionTier === 'free') {
      return NextResponse.json(
        {
          error: 'Upgrade required',
          message: 'Automated applications require Pro subscription',
          upgradeRequired: true
        },
        { status: 403 }
      );
    }

    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        userId: userId,
        jobId: jobId
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Already applied to this job' },
        { status: 409 }
      );
    }

    // Create application record
    const application = await prisma.jobApplication.create({
      data: {
        userId: userId,
        jobId: jobId,
        method: method,
        status: method === 'automated' ? 'submitted' : 'pending',
        appliedAt: new Date(),
        submittedAt: method === 'automated' ? new Date() : null
      }
    });

    // Update job application count
    await prisma.job.update({
      where: { id: jobId },
      data: {
        applicationCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        jobId: application.jobId,
        method: application.method,
        status: application.status,
        appliedAt: application.appliedAt
      },
      jobInfo: {
        title: job.title,
        company: job.companyName,
        applicationUrl: job.applicationUrl
      }
    });

  } catch (error) {
    console.error('Error applying for job:', error);
    return NextResponse.json(
      { error: 'Failed to apply for job' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Get user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    });

    const subscriptionTier = user?.subscriptionTier || 'free';
    let dailyLimit = 5; // Free tier limited to 5 applications per day

    if (subscriptionTier === 'pro') {
      dailyLimit = 999999; // Pro tier has no daily limit
    }

    // Get today's application count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayApplications = await prisma.jobApplication.count({
      where: {
        userId: userId,
        appliedAt: {
          gte: today
        }
      }
    });

    const remainingDaily = Math.max(0, dailyLimit - todayApplications);

    // Build where clause
    const whereClause: any = { userId };
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Get user's applications
    const applications = await prisma.jobApplication.findMany({
      where: whereClause,
      include: {
        job: true
      },
      orderBy: { appliedAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Format response
    const formattedApplications = applications.map(app => ({
      id: app.id,
      job: {
        ...app.job,
        company: {
          name: app.job.companyName,
          logo: app.job.companyLogoUrl,
          industry: null
        }
      },
      method: app.method,
      status: app.status,
      appliedAt: app.appliedAt,
      submittedAt: app.submittedAt,
      coverLetter: app.coverLetter,
      aiGenerated: app.aiGenerated
    }));

    return NextResponse.json({
      applications: formattedApplications,
      hasMore: applications.length === limit,
      dailyStats: {
        limit: dailyLimit,
        used: todayApplications,
        remaining: remainingDaily,
        isUnlimited: subscriptionTier === 'pro'
      },
      subscriptionTier
    });

  } catch (error) {
    console.error('Error getting applications:', error);
    return NextResponse.json(
      { error: 'Failed to get applications' },
      { status: 500 }
    );
  }
}