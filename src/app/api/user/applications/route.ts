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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const userId = session.user.id;

    // Fetch user applications with job details
    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            title: true,
            companyName: true,
            location: true,
            type: true,
            salary: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.jobApplication.count({
      where: { userId }
    });

    return NextResponse.json({
      applications,
      total,
      hasMore: offset + limit < total
    });

  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}