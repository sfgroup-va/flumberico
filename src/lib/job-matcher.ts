import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from './prisma';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface JobMatch {
  jobId: number;
  jobTitle: string;
  companyName: string;
  location: string;
  type: string;
  salary: number;
  matchScore: number;
  matchReasons: string[];
  applicationUrl?: string;
  applicationEmail?: string;
}

export interface MatchingCriteria {
  userId: string;
  jobTitles: string[];
  locations: string[];
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  salaryMin?: number;
  salaryMax?: number;
  remoteOnly: boolean;
  excludeCompanies: string[];
}

export class JobMatchingEngine {
  /**
   * Find matching jobs for a user using AI semantic analysis
   */
  static async findMatchesForUser(criteria: MatchingCriteria): Promise<JobMatch[]> {
    try {
      // Fetch recent approved jobs
      const recentJobs = await prisma.job.findMany({
        where: {
          approved: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          applications: {
            where: { userId: criteria.userId },
            select: { id: true }
          }
        }
      });

      // Filter out already applied jobs
      const availableJobs = recentJobs.filter(job =>
        job.applications.length === 0
      );

      // Apply basic filters
      const filteredJobs = this.applyBasicFilters(availableJobs, criteria);

      // Use AI for semantic matching
      const matches = await this.performSemanticMatching(filteredJobs, criteria);

      // Sort by match score and return top matches
      return matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10); // Return top 10 matches

    } catch (error) {
      console.error('Error finding job matches:', error);
      return [];
    }
  }

  /**
   * Apply basic filtering criteria before AI analysis
   */
  private static applyBasicFilters(jobs: any[], criteria: MatchingCriteria): any[] {
    return jobs.filter(job => {
      // Filter by job titles (flexible matching)
      const titleMatch = criteria.jobTitles.some(title =>
        job.title.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(job.title.toLowerCase())
      );

      // Filter by location
      const locationMatch = criteria.remoteOnly
        ? job.locationType === 'Remote' || !job.location
        : criteria.locations.length === 0 ||
        criteria.locations.some(loc =>
          job.location?.toLowerCase().includes(loc.toLowerCase()) ||
          loc.toLowerCase().includes(job.location?.toLowerCase() || '')
        );

      // Filter by salary range
      const salaryMatch = !criteria.salaryMin ||
        !criteria.salaryMax ||
        (job.salary >= criteria.salaryMin && job.salary <= criteria.salaryMax);

      // Filter out excluded companies
      const companyMatch = !criteria.excludeCompanies.some(company =>
        job.companyName.toLowerCase().includes(company.toLowerCase())
      );

      return titleMatch && locationMatch && salaryMatch && companyMatch;
    });
  }

  /**
   * Perform AI-powered semantic matching
   */
  private static async performSemanticMatching(
    jobs: any[],
    criteria: MatchingCriteria
  ): Promise<JobMatch[]> {
    // Validate API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.warn('Google AI API key not found, skipping AI matching');
      return [];
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const matches: JobMatch[] = [];

    // Process jobs in batches to avoid API limits
    const batchSize = 5;
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);

      const batchPromises = batch.map(async (job) => {
        try {
          const prompt = this.createMatchingPrompt(job, criteria);
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const analysis = response.text();

          return this.parseMatchResponse(job, analysis);
        } catch (error) {
          console.error(`Error matching job ${job.id}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      matches.push(...batchResults.filter(Boolean) as JobMatch[]);

      // Add delay between batches to respect API limits
      if (i + batchSize < jobs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return matches;
  }

  /**
   * Create the AI prompt for job matching
   */
  private static createMatchingPrompt(job: any, criteria: MatchingCriteria): string {
    return `You are an expert AI-powered career matching system with deep knowledge of the tech industry. Analyze this job match with precision and provide actionable insights that will help the candidate make informed decisions.

JOB DETAILS:
Title: ${job.title}
Company: ${job.companyName}
Location: ${job.location || 'Remote'}
Type: ${job.type}
Salary: $${job.salary.toLocaleString()}
Description: ${job.aiEnhancedDescription || job.description}

CANDIDATE PROFILE:
Desired Job Titles: ${criteria.jobTitles.join(', ')}
Desired Locations: ${criteria.locations.join(', ') || 'Remote preferred'}
Required Skills: ${criteria.mustHaveSkills.join(', ')}
Preferred Skills: ${criteria.niceToHaveSkills.join(', ')}
${criteria.salaryMin ? `Salary Range: $${criteria.salaryMin.toLocaleString()} - $${criteria.salaryMax?.toLocaleString() || 'unlimited'}` : ''}

ADVANCED MATCHING ANALYSIS:
Evaluate this match using industry-standard criteria and provide insights that go beyond basic keyword matching. Consider:

1. **SKILLS SYNERGY**: Analyze technical stack compatibility, transferable skills, and growth potential
2. **CAREER TRAJECTORY**: Assess how this position aligns with long-term career goals
3. **COMPANY CULTURE FIT**: Evaluate company size, industry, and work environment compatibility
4. **MARKET COMPETITIVENESS**: Compare salary and benefits against industry standards
5. **GROWTH OPPORTUNITIES**: Identify learning potential and advancement possibilities
6. **TECHNICAL EVOLUTION**: Assess future-proof skills and industry relevance

SCORING METHODOLOGY:
- 90-100: Exceptional match - Apply immediately
- 75-89: Strong match - High priority application
- 60-74: Good match - Consider applying
- 40-59: Moderate match - Apply if no better options
- Below 40: Poor match - Skip this opportunity

Respond in this JSON format:
{
  "matchScore": 85,
  "matchReasons": [
    "Strong technical alignment with React/TypeScript stack requirements",
    "Company offers clear growth path for senior developers",
    "Remote work flexibility matches lifestyle preferences",
    "Salary is 15% above market average for this role level",
    "Opportunity to lead architectural decisions"
  ]
}

Provide specific, actionable insights that help the candidate understand WHY this is or isn't a good match. Include career growth implications and market positioning when relevant.`;
  }

  /**
   * Parse the AI response into a JobMatch object
   */
  private static parseMatchResponse(job: any, analysis: string): JobMatch | null {
    try {
      // Extract JSON from the response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the response
      if (typeof parsed.matchScore !== 'number' || !Array.isArray(parsed.matchReasons)) {
        throw new Error('Invalid response format');
      }

      return {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        location: job.location || 'Remote',
        type: job.type,
        salary: job.salary,
        matchScore: Math.max(0, Math.min(100, parsed.matchScore)), // Clamp between 0-100
        matchReasons: parsed.matchReasons.slice(0, 4), // Max 4 reasons
        applicationUrl: job.applicationUrl,
        applicationEmail: job.applicationEmail
      };

    } catch (error) {
      console.error('Error parsing match response:', error);
      // Return a basic match with default values
      return {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        location: job.location || 'Remote',
        type: job.type,
        salary: job.salary,
        matchScore: 50, // Default score
        matchReasons: ['Basic match based on title and location'],
        applicationUrl: job.applicationUrl,
        applicationEmail: job.applicationEmail
      };
    }
  }

  /**
   * Get matching jobs for multiple users (for cron job)
   */
  static async findMatchesForAllActiveUsers(): Promise<Array<{ userId: string, matches: JobMatch[] }>> {
    try {
      // Get all active users with completed onboarding
      const activeUsers = await prisma.user.findMany({
        where: {
          isActiveHunter: true,
          subscriptionTier: 'pro',
          profile: {
            onboardingCompleted: true
          }
        },
        include: {
          targetingMatrix: true,
          resumeDNA: true
        }
      });

      const results = [];

      for (const user of activeUsers) {
        if (!user.targetingMatrix || !user.resumeDNA) continue;

        const criteria: MatchingCriteria = {
          userId: user.id,
          jobTitles: user.targetingMatrix.jobTitles,
          locations: user.targetingMatrix.locations,
          mustHaveSkills: user.targetingMatrix.mustHaveSkills,
          niceToHaveSkills: user.targetingMatrix.niceToHaveSkills || [],
          salaryMin: user.targetingMatrix.salaryMin || undefined,
          salaryMax: user.targetingMatrix.salaryMax || undefined,
          remoteOnly: user.targetingMatrix.remoteOnly,
          excludeCompanies: user.targetingMatrix.excludeCompanies || []
        };

        const matches = await this.findMatchesForUser(criteria);
        results.push({ userId: user.id, matches });
      }

      return results;

    } catch (error) {
      console.error('Error finding matches for all users:', error);
      return [];
    }
  }
}