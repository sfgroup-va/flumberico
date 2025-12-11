const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAIHunter() {
  try {
    console.log('🤖 Testing AI Hunter functionality...');

    // Get test user
    const user = await prisma.user.findFirst({
      where: { email: 'testuser@example.com' },
      include: {
        profile: true,
        targetingMatrix: true,
        resumeDNA: true,
      }
    });

    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('✅ Found user:', user.name);
    console.log('🎯 Is AI Hunter active:', user.isActiveHunter);
    console.log('💳 Subscription tier:', user.subscriptionTier);
    console.log('📊 Profile completed:', user.profile?.onboardingCompleted);
    console.log('💼 Skills count:', user.resumeDNA?.skills?.length);
    console.log('🎯 Targeting jobs:', user.targetingMatrix?.jobTitles?.length);
    console.log('📋 Daily limit:', user.hunterJobLimit);

    // Check prerequisites
    if (!user.isActiveHunter) {
      console.log('❌ AI Hunter is not active');
      return;
    }

    if (user.subscriptionTier !== 'pro') {
      console.log('❌ User is not Pro tier');
      return;
    }

    if (!user.profile?.onboardingCompleted) {
      console.log('❌ Profile onboarding not completed');
      return;
    }

    if (!user.targetingMatrix || !user.resumeDNA) {
      console.log('❌ Missing targeting matrix or resume DNA');
      return;
    }

    console.log('✅ All prerequisites met!');

    // Check today's applications
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayApplications = await prisma.jobApplication.count({
      where: {
        userId: user.id,
        aiGenerated: true,
        appliedAt: {
          gte: today,
        },
      },
    });

    console.log('📈 Today\'s AI applications:', todayApplications);
    console.log('📊 Remaining quota:', user.hunterJobLimit - todayApplications);

    if (todayApplications >= user.hunterJobLimit) {
      console.log('❌ Daily limit reached');
      return;
    }

    // Simulate job matching logic
    console.log('🔍 Finding job matches...');

    // Get available jobs
    const availableJobs = await prisma.job.findMany({
      where: {
        AND: [
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
      take: 20
    });

    console.log('💼 Available jobs:', availableJobs.length);

    // Get already applied jobs
    const appliedJobs = await prisma.jobApplication.findMany({
      where: { userId: user.id },
      select: { jobId: true }
    });

    const appliedJobIds = new Set(appliedJobs.map(app => app.jobId));
    const eligibleJobs = availableJobs.filter(job => !appliedJobIds.has(job.id));

    console.log('📋 Eligible jobs:', eligibleJobs.length);

    // Simulate matching and scoring
    const matches = eligibleJobs.map(job => {
      let score = 0;
      const reasons = [];

      // Job title matching
      if (user.targetingMatrix?.jobTitles?.some(title =>
        job.title.toLowerCase().includes(title.toLowerCase()))) {
        score += 30;
        reasons.push('Job title matches your preferences');
      }

      // Location matching
      if (user.targetingMatrix?.remoteOnly && job.locationType === 'remote') {
        score += 20;
        reasons.push('Remote work opportunity');
      } else if (user.targetingMatrix?.locations?.some(loc =>
        job.location?.toLowerCase().includes(loc.toLowerCase()))) {
        score += 20;
        reasons.push('Location matches your preferences');
      }

      // Skills matching
      if (user.resumeDNA?.skills && job.skillsRequired?.length > 0) {
        const userSkills = new Set(user.resumeDNA.skills.map(s => s.toLowerCase()));
        const requiredSkills = job.skillsRequired.map(s => s.toLowerCase());
        const matchingSkills = requiredSkills.filter(skill => userSkills.has(skill));

        if (matchingSkills.length > 0) {
          const skillScore = (matchingSkills.length / requiredSkills.length) * 30;
          score += skillScore;
          reasons.push(`${matchingSkills.length}/${requiredSkills.length} skills match`);
        }
      }

      // Salary matching
      if (user.targetingMatrix?.salaryMin && job.salaryMin && job.salaryMin >= user.targetingMatrix.salaryMin) {
        score += 20;
        reasons.push('Salary meets expectations');
      }

      return {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        location: job.location || 'Remote',
        type: job.type,
        salary: job.salaryMin || 0,
        matchScore: Math.round(score),
        matchReasons: reasons,
        applicationUrl: job.applicationUrl,
        applicationEmail: job.applicationEmail
      };
    });

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    console.log('🎯 Total matches found:', matches.length);

    // Filter high quality matches (70+ score)
    const highQualityMatches = matches.filter(match => match.matchScore >= 70);
    console.log('🏆 High quality matches (70+):', highQualityMatches.length);

    // Limit to remaining quota
    const remainingQuota = user.hunterJobLimit - todayApplications;
    const matchesToApply = highQualityMatches.slice(0, remainingQuota);
    console.log('📝 Jobs to apply to:', matchesToApply.length);

    // Show top matches
    console.log('\n🏆 Top 3 Matches:');
    matches.slice(0, 3).forEach((match, index) => {
      console.log(`${index + 1}. ${match.jobTitle} at ${match.companyName}`);
      console.log(`   Score: ${match.matchScore}% | Location: ${match.location}`);
      console.log(`   Reasons: ${match.matchReasons.join(', ')}`);
      console.log('');
    });

    if (matchesToApply.length > 0) {
      console.log('✅ AI Hunter scan completed successfully!');
      console.log(`📊 Ready to apply to ${matchesToApply.length} jobs automatically.`);
    } else {
      console.log('⚠️ No high-quality matches found. Try adjusting your preferences.');
    }

  } catch (error) {
    console.error('❌ AI Hunter test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAIHunter();