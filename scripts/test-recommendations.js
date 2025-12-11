const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRecommendationsAPI() {
  try {
    console.log('🧪 Testing recommendations API logic...');

    // Get test user
    const user = await prisma.user.findFirst({
      where: { email: 'testuser@example.com' },
      include: {
        profile: true,
        resumeDNA: true,
        targetingMatrix: true
      }
    });

    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('✅ Found user:', user.name);
    console.log('📊 Profile completed:', user.profile?.onboardingCompleted);
    console.log('💼 Skills count:', user.resumeDNA?.skills?.length);
    console.log('🎯 Targeting jobs:', user.targetingMatrix?.jobTitles?.length);

    // Get recent applications
    const recentApplications = await prisma.jobApplication.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: { jobId: true }
    });

    const appliedJobIds = recentApplications.map(app => app.jobId);
    console.log('📋 Recent applications:', appliedJobIds.length);

    // Get available jobs
    const recommendations = await prisma.job.findMany({
      where: {
        AND: [
          { id: { notIn: appliedJobIds.length > 0 ? appliedJobIds : [] } },
          { approved: true },
          { isActive: true },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        ]
      },
      take: 10
    });

    console.log('🎉 Available jobs found:', recommendations.length);

    // Calculate match scores
    const recommendationsWithScores = recommendations.map(job => {
      let score = 0;
      let factors = 0;

      // Skills matching (40% weight)
      if (user.resumeDNA?.skills && job.skillsRequired && job.skillsRequired.length > 0) {
        const userSkills = new Set(user.resumeDNA.skills.map(s => s.toLowerCase()));
        const requiredSkills = job.skillsRequired.map(s => s.trim().toLowerCase());
        const matchingSkills = requiredSkills.filter(skill => userSkills.has(skill));
        score += (matchingSkills.length / requiredSkills.length) * 40;
        factors += 40;
        console.log(`💡 Job ${job.title}: ${matchingSkills.length}/${requiredSkills.length} skills match`);
      } else {
        factors += 40;
      }

      // Experience level (20% weight)
      if (user.profile?.experienceYears && job.experienceLevel) {
        const userExperience = user.profile.experienceYears;
        const requiredExperience = parseExperienceLevel(job.experienceLevel);
        if (userExperience >= requiredExperience) {
          score += 20;
        } else {
          score += Math.max(0, (userExperience / requiredExperience) * 20);
        }
        factors += 20;
      } else {
        factors += 20;
      }

      // Location preference (15% weight)
      if (user.profile?.preferredLocationType && job.locationType) {
        if (user.profile.preferredLocationType === job.locationType) {
          score += 15;
        } else if (user.profile.preferredLocationType === 'hybrid' && job.locationType === 'remote') {
          score += 10;
        } else if (user.profile.preferredLocationType === 'remote' && job.locationType === 'hybrid') {
          score += 8;
        }
      }
      factors += 15;

      // Salary range (15% weight)
      if (user.profile?.expectedSalaryMin && job.salaryMin) {
        if (job.salaryMin >= user.profile.expectedSalaryMin) {
          score += 15;
        } else if (job.salaryMin >= user.profile.expectedSalaryMin * 0.8) {
          score += 10;
        } else if (job.salaryMin >= user.profile.expectedSalaryMin * 0.6) {
          score += 5;
        }
      }
      factors += 15;

      // Job type preference (10% weight)
      if (user.profile?.preferredJobTypes && job.jobType) {
        if (user.profile.preferredJobTypes.includes(job.jobType)) {
          score += 10;
        }
      }
      factors += 10;

      const finalScore = factors > 0 ? Math.min(100, score) : 0;

      return {
        ...job,
        company: {
          name: job.companyName,
          logo: job.companyLogoUrl,
          industry: null
        },
        matchScore: Math.round(finalScore),
        urgency: calculateUrgency(job),
        competitionLevel: assessCompetition(job)
      };
    });

    // Sort by match score
    recommendationsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    console.log('\n📈 Top Recommendations:');
    recommendationsWithScores.slice(0, 3).forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company?.name} - Score: ${job.matchScore}%`);
      console.log(`   Skills: ${job.skillsRequired?.join(', ')}`);
      console.log(`   Location: ${job.location} | Type: ${job.locationType} | Salary: $${job.salaryMin?.toLocaleString()}`);
      console.log('');
    });

    console.log('✅ Recommendations API logic test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function parseExperienceLevel(level) {
  const levelMap = {
    'entry': 0,
    'junior': 1,
    'mid': 3,
    'senior': 5,
    'lead': 7,
    'principal': 10
  };
  const normalizedLevel = level.toLowerCase();
  return levelMap[normalizedLevel] || 0;
}

function calculateUrgency(job) {
  const daysSincePosted = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSincePosted <= 3) return 'high';
  if (daysSincePosted <= 7) return 'medium';
  return 'low';
}

function assessCompetition(job) {
  if (job.featured) return 'high';
  if (job.salaryMin && job.salaryMin > 100000) return 'medium';
  return 'low';
}

testRecommendationsAPI();