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

    // Fetch user profile with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        resumeDNA: true,
        targetingMatrix: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      isActiveHunter: user.isActiveHunter,
      profile: user.profile,
      resumeDNA: user.resumeDNA,
      targetingMatrix: user.targetingMatrix,
      totalApplications: user._count.applications
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}