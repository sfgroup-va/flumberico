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

    const { resumeData, optimizedSummary, preferences } = await request.json();

    if (!resumeData || !preferences) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Create or update user profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        summary: resumeData.summary || null,
        aiOptimizedSummary: optimizedSummary || null,
        experienceYears: resumeData.totalExperience || 0,
        onboardingCompleted: true,
      },
      create: {
        userId,
        summary: resumeData.summary || null,
        aiOptimizedSummary: optimizedSummary || null,
        experienceYears: resumeData.totalExperience || 0,
        onboardingCompleted: true,
      },
    });

    // Create or update resume DNA
    const resumeDNA = await prisma.resumeDNA.upsert({
      where: { userId },
      update: {
        extractedText: resumeData.summary || null,
        skills: resumeData.skills || [],
        parsedExperience: resumeData.experience || null,
        parsedEducation: resumeData.education || null,
        aiOptimizedSummary: optimizedSummary || null,
      },
      create: {
        userId,
        extractedText: resumeData.summary || null,
        skills: resumeData.skills || [],
        parsedExperience: resumeData.experience || null,
        parsedEducation: resumeData.education || null,
        aiOptimizedSummary: optimizedSummary || null,
      },
    });

    // Create or update job targeting matrix
    const targetingMatrix = await prisma.jobTargetingMatrix.upsert({
      where: { userId },
      update: {
        jobTitles: preferences.jobTitles || [],
        locations: preferences.locations || [],
        remoteOnly: preferences.remotePreference === "remote",
        mustHaveSkills: resumeData.skills || [],
      },
      create: {
        userId,
        jobTitles: preferences.jobTitles || [],
        locations: preferences.locations || [],
        remoteOnly: preferences.remotePreference === "remote",
        mustHaveSkills: resumeData.skills || [],
      },
    });

    return NextResponse.json({
      success: true,
      profile,
      resumeDNA,
      targetingMatrix
    });

  } catch (error) {
    console.error('Save preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}