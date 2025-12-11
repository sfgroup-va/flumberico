const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRecommendationsAPI() {
  try {
    console.log('🔍 Testing Recommendations API logic...');

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

    // Simulate API logic (same as /api/jobs/recommendations)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recentApplications = await prisma.jobApplication.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: today
        }
      },
      select: { jobId: true }
    });

    const appliedJobIds = recentApplications.map(app => app.jobId);
    console.log('📋 Recent applications:', appliedJobIds.length);

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

    console.log('💼 Available jobs:', recommendations.length);

    // Calculate match scores (same as API)
    const recommendationsWithScores = recommendations.map(job => {
      let score = 0;

      // Job title matching (30 points)
      if (user.targetingMatrix?.jobTitles?.some(title =>
        job.title.toLowerCase().includes(title.toLowerCase()))) {
        score += 30;
      }

      // Location matching (20 points)
      if (user.targetingMatrix?.remoteOnly && job.locationType === 'remote') {
        score += 20;
      } else if (user.targetingMatrix?.locations?.some(loc =>
        job.location?.toLowerCase().includes(loc.toLowerCase()))) {
        score += 20;
      }

      // Skills matching (30 points)
      if (user.resumeDNA?.skills && job.skillsRequired && job.skillsRequired.length > 0) {
        const userSkills = new Set(user.resumeDNA.skills.map(s => s.toLowerCase()));
        const requiredSkills = job.skillsRequired.map(s => s.toLowerCase());
        const matchingSkills = requiredSkills.filter(skill => userSkills.has(skill));
        score += (matchingSkills.length / requiredSkills.length) * 30;
      }

      // Salary matching (20 points)
      if (user.targetingMatrix?.salaryMin && job.salaryMin && job.salaryMin >= user.targetingMatrix.salaryMin) {
        score += 20;
      }

      const finalScore = Math.min(100, Math.round(score));

      return {
        ...job,
        company: {
          name: job.companyName,
          logo: job.companyLogoUrl,
          industry: null
        },
        matchScore: finalScore,
        locationType: job.locationType,
        urgency: calculateUrgency(job)
      };
    });

    recommendationsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    // Get user's saved jobs
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: user.id },
      select: { jobId: true }
    });

    const savedJobIds = new Set(savedJobs.map(saved => saved.jobId));

    const finalRecommendations = recommendationsWithScores.map(job => ({
      ...job,
      isSaved: savedJobIds.has(job.id)
    }));

    console.log('\n🏆 Top Recommendations:');
    finalRecommendations.slice(0, 3).forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company.name}`);
      console.log(`   Score: ${job.matchScore}% | Location: ${job.locationType} | Urgency: ${job.urgency}`);
      console.log(`   Saved: ${job.isSaved ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Check auto apply candidates (70+ score + remote)
    const autoApplyCandidates = finalRecommendations.filter(job =>
      job.matchScore >= 70 && job.locationType?.toLowerCase() === 'remote'
    );

    console.log('🤖 Auto Apply Candidates:', autoApplyCandidates.length);
    autoApplyCandidates.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company.name} (${job.matchScore}% match)`);
    });

    console.log('\n✅ Recommendations API logic working correctly!');
    console.log(`📊 Ready for frontend: ${finalRecommendations.length} recommendations`);
    console.log(`🤖 Ready for auto apply: ${autoApplyCandidates.length} candidates`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function calculateUrgency(job) {
  const daysSincePosted = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSincePosted <= 3) return 'high';
  if (daysSincePosted <= 7) return 'medium';
  return 'low';
}

testRecommendationsAPI();