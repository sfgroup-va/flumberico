import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    // Get current user state
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActiveHunter: true, subscriptionTier: true }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Allow free users to activate AI Hunter (with limitations)
    // Note: In production, you might want to limit free users to 5 applications per day
    // For now, we'll allow free users to activate it for demo purposes

    // Toggle AI Hunter status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActiveHunter: !currentUser.isActiveHunter
      },
      select: {
        id: true,
        isActiveHunter: true,
        subscriptionTier: true
      }
    });

    return NextResponse.json({
      success: true,
      isActiveHunter: updatedUser.isActiveHunter,
      message: updatedUser.isActiveHunter
        ? 'AI Hunter activated successfully'
        : 'AI Hunter deactivated'
    });

  } catch (error) {
    console.error('Toggle hunter error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}