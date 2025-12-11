import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to submit an application' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const {
      jobId,
      fullName,
      email,
      phone,
      coverLetter,
      experience,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      noticePeriod,
      salaryExpectation,
      location,
      willingToRelocate,
    } = body;

    // Validate required fields
    if (!jobId || !fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, fullName, email, phone' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, companyName: true }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user has already applied to this job
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        userId: userId,
        jobId: jobId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this position' },
        { status: 409 }
      );
    }

    // Create the application
    const application = await prisma.jobApplication.create({
      data: {
        userId: userId,
        jobId: jobId,
        coverLetter: coverLetter || null,
        status: 'pending',
      },
      include: {
        job: {
          select: {
            title: true,
            companyName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        jobTitle: application.job.title,
        companyName: application.job.companyName,
        status: application.status,
        createdAt: application.createdAt,
      },
    });

  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to view applications' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's applications with job details
    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logo: true,
                industry: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      applications,
      hasMore: applications.length === limit,
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}