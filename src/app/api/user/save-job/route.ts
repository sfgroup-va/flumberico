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
    const { jobId, action } = body; // action: 'save' or 'unsave'

    if (!jobId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, action' },
        { status: 400 }
      );
    }

    // Check user's subscription tier for save limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    });

    const subscriptionTier = user?.subscriptionTier || 'free';
    let saveLimit = 10; // Free tier default

    if (subscriptionTier === 'pro') {
      saveLimit = 999999; // Unlimited for Pro tier
    }

    if (action === 'save') {
      // Check current save count for free tier
      if (subscriptionTier === 'free') {
        const currentSaves = await prisma.savedJob.count({
          where: { userId }
        });

        if (currentSaves >= saveLimit) {
          return NextResponse.json(
            {
              error: 'Save limit reached',
              message: `Free tier users can save up to ${saveLimit} jobs. Upgrade to Pro for unlimited saves.`,
              limitReached: true
            },
            { status: 403 }
          );
        }
      }

      // Save the job
      await prisma.savedJob.upsert({
        where: {
          userId_jobId: {
            userId: userId,
            jobId: jobId
          }
        },
        update: {
          savedAt: new Date()
        },
        create: {
          userId: userId,
          jobId: jobId,
          savedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        action: 'saved',
        savesCount: Math.min(
          await prisma.savedJob.count({ where: { userId } }),
          saveLimit
        )
      });

    } else if (action === 'unsave') {
      // Unsave the job
      await prisma.savedJob.deleteMany({
        where: {
          userId: userId,
          jobId: jobId
        }
      });

      return NextResponse.json({
        success: true,
        action: 'unsaved',
        savesCount: await prisma.savedJob.count({ where: { userId } })
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "save" or "unsave"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error saving/unsaving job:', error);
    return NextResponse.json(
      { error: 'Failed to save/unsave job' },
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

    // Get user's saved jobs with job details
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logo: true,
                industry: true
              }
            }
          }
        }
      },
      orderBy: { savedAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Format response
    const formattedJobs = savedJobs.map(savedJob => ({
      ...savedJob.job,
      savedAt: savedJob.savedAt,
      isSaved: true
    }));

    return NextResponse.json({
      savedJobs: formattedJobs,
      hasMore: savedJobs.length === limit
    });

  } catch (error) {
    console.error('Error getting saved jobs:', error);
    return NextResponse.json(
      { error: 'Failed to get saved jobs' },
      { status: 500 }
    );
  }
}