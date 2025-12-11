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
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing required field: jobId' },
        { status: 400 }
      );
    }

    // Check if job is saved
    const savedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: userId,
          jobId: jobId
        }
      }
    });

    return NextResponse.json({
      isSaved: !!savedJob,
      savedAt: savedJob?.savedAt
    });

  } catch (error) {
    console.error('Error checking saved status:', error);
    return NextResponse.json(
      { error: 'Failed to check saved status' },
      { status: 500 }
    );
  }
}