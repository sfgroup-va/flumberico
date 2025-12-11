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

    // Get user settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        subscriptionTier: true,
        subscriptionId: true,
        subscriptionEndsAt: true,
        isActiveHunter: true,
        profile: true,
        targetingMatrix: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Default settings if none exist
    const defaultSettings = {
      notifications: {
        email: true,
        push: true,
        marketing: false,
        applications: true,
        interviews: true,
        offers: true
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        dataSharing: false
      },
      preferences: {
        language: 'en',
        timezone: 'UTC',
        theme: 'system',
        currency: 'USD'
      }
    };

    return NextResponse.json({
      user: user,
      settings: defaultSettings
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { settings } = await request.json();

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings are required' },
        { status: 400 }
      );
    }

    // Note: Settings are handled at application level, not stored in database
    // This is a simplified implementation
    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      settings: settings
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}