import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Daily limit for free tier users
const FREE_TIER_DAILY_LIMIT = 10;

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
    const subscriptionTier = (session.user as any).subscriptionTier || 'free';

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // For now, use simplified daily limit tracking
    // TODO: After Prisma migration, use RecommendationView model
    let dailyUsed = 0;
    let dailyLimit = subscriptionTier === 'pro' ? 999 : FREE_TIER_DAILY_LIMIT;

    // Temporary: Use application count as proxy for daily usage
    // This will be replaced with proper RecommendationView tracking after migration
    if (subscriptionTier === 'free') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      try {
        // Count applications today as temporary measure
        const applicationsToday = await prisma.jobApplication.count({
          where: {
            userId,
            appliedAt: {
              gte: today
            }
          }
        });
        dailyUsed = Math.min(applicationsToday, dailyLimit);
      } catch (error) {
        console.error('Error counting daily usage:', error);
        dailyUsed = 0;
      }

      // If limit reached, return empty with limit info
      if (dailyUsed >= dailyLimit) {
        return NextResponse.json({
          recommendations: [],
          hasMore: false,
          dailyLimit,
          dailyUsed,
          limitReached: true,
          message: 'Daily recommendation limit reached. Upgrade to Pro for unlimited access.'
        });
      }
    }

    // Get user's resume DNA for matching
    const resumeDNA = await prisma.resumeDNA.findUnique({
      where: { userId },
      select: {
        skills: true,
        parsedExperience: true,
        parsedEducation: true
      }
    });

    // TODO: After migration, get from JobPreferences model
    // For now, use empty arrays - recommendations will be based on skills only
    const userSkills = resumeDNA?.skills || [];
    const desiredTitles: string[] = [];
    const preferredLocations: string[] = [];
    const minSalary: number | null = null;

    // Build matching criteria
    // Fetch jobs with AI-based matching
    const whereClause: any = {
      approved: true
    };

    // If user has skills, add skill-based filtering
    if (userSkills.length > 0) {
      whereClause.OR = [
        {
          aiExtractedSkills: {
            hasSome: userSkills
          }
        },
        {
          title: {
            contains: userSkills[0],
            mode: 'insensitive' as const
          }
        }
      ];
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        slug: true,
        title: true,
        companyName: true,
        companyLogoUrl: true,
        location: true,
        locationType: true,
        type: true,
        salary: true,
        salaryMin: true,
        salaryMax: true,
        description: true,
        aiEnhancedDescription: true,
        aiExtractedSkills: true,
        applicationUrl: true,
        applicationEmail: true,
        createdAt: true
      }
    });

    // Calculate match scores
    const recommendations = jobs.map(job => {
      let matchScore = 0;
      const matchReasons: string[] = [];

      // Skill matching (max 40 points)
      const jobSkills = job.aiExtractedSkills || [];
      const matchingSkills = userSkills.filter(skill =>
        jobSkills.some(jobSkill =>
          jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      );
      if (matchingSkills.length > 0) {
        matchScore += Math.min(40, matchingSkills.length * 10);
        matchReasons.push(`${matchingSkills.length} matching skills`);
      }

      // Title matching (max 30 points)
      const titleMatch = desiredTitles.some(title =>
        job.title.toLowerCase().includes(title.toLowerCase())
      );
      if (titleMatch) {
        matchScore += 30;
        matchReasons.push('Matches desired role');
      }

      // Location matching (max 20 points)
      const locationMatch = preferredLocations.some(loc =>
        job.location?.toLowerCase().includes(loc.toLowerCase())
      ) || job.locationType === 'remote';
      if (locationMatch) {
        matchScore += 20;
        matchReasons.push('Preferred location');
      }

      // Salary matching (max 10 points)
      if (minSalary && job.salary && job.salary >= minSalary) {
        matchScore += 10;
        matchReasons.push('Meets salary expectations');
      }

      // Determine urgency based on posting date
      const daysOld = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const urgency = daysOld <= 3 ? 'high' : daysOld <= 7 ? 'medium' : 'low';

      // Estimate competition level (simplified)
      const competitionLevel = matchScore >= 80 ? 'high' : matchScore >= 60 ? 'medium' : 'low';

      return {
        id: job.id.toString(),
        title: job.title,
        company: {
          name: job.companyName,
          logo: job.companyLogoUrl || undefined
        },
        location: job.location || 'Remote',
        locationType: job.locationType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        jobType: job.type,
        description: job.aiEnhancedDescription || job.description || '',
        applicationUrl: job.applicationUrl || undefined,
        createdAt: job.createdAt.toISOString(),
        matchScore: Math.min(100, matchScore),
        matchReasons,
        urgency,
        competitionLevel,
        isSaved: false // Will be updated by client
      };
    });

    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // TODO: Track recommendation views after Prisma migration
    // For now, skip tracking
    // if (subscriptionTier === 'free' && recommendations.length > 0) {
    //   await prisma.recommendationView.createMany({...});
    // }

    // Check if there are more results
    const hasMore = jobs.length === limit;

    return NextResponse.json({
      recommendations,
      hasMore,
      dailyLimit,
      dailyUsed,
      limitReached: false
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}