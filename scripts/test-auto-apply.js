const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAutoApplySystem() {
  try {
    console.log('🚀 Testing Auto Apply System...');

    // Get test user
    const user = await prisma.user.findFirst({
      where: { email: 'testuser@example.com' },
      include: {
        profile: true,
        resumeDNA: true,
        targetingMatrix: true,
      }
    });

    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('✅ Found user:', user.name);
    console.log('💳 Subscription tier:', user.subscriptionTier);
    console.log('🎯 Is AI Hunter active:', user.isActiveHunter);

    if (user.subscriptionTier !== 'pro') {
      console.log('❌ User is not Pro tier - auto apply only works for Pro users');
      return;
    }

    // Get job recommendations (simulating the dashboard auto apply logic)
    console.log('🔍 Getting job recommendations...');

    const recommendations = await prisma.job.findMany({
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
      take: 10
    });

    console.log('💼 Available jobs:', recommendations.length);

    // Get user's existing applications
    const existingApplications = await prisma.jobApplication.findMany({
      where: { userId: user.id },
      select: { jobId: true }
    });

    const appliedJobIds = new Set(existingApplications.map(app => app.jobId));
    const eligibleJobs = recommendations.filter(job => !appliedJobIds.has(job.id));

    console.log('📋 Eligible jobs:', eligibleJobs.length);

    // Simulate auto apply logic (only for high-quality matches)
    const autoAppliedJobs = [];

    for (const job of eligibleJobs) {
      // Calculate match score (same logic as JobRecommendations)
      let score = 0;

      // Job title matching (30 points) - Same as AI Hunter
      if (user.targetingMatrix?.jobTitles?.some(title =>
        job.title.toLowerCase().includes(title.toLowerCase()))) {
        score += 30;
      }

      // Location matching (20 points) - Same as AI Hunter
      if (user.targetingMatrix?.remoteOnly && job.locationType === 'remote') {
        score += 20;
      } else if (user.targetingMatrix?.locations?.some(loc =>
        job.location?.toLowerCase().includes(loc.toLowerCase()))) {
        score += 20;
      }

      // Skills matching (30 points) - Same as AI Hunter
      if (user.resumeDNA?.skills && job.skillsRequired?.length > 0) {
        const userSkills = new Set(user.resumeDNA.skills.map(s => s.toLowerCase()));
        const requiredSkills = job.skillsRequired.map(s => s.toLowerCase());
        const matchingSkills = requiredSkills.filter(skill => userSkills.has(skill));
        if (matchingSkills.length > 0) {
          const skillScore = (matchingSkills.length / requiredSkills.length) * 30;
          score += skillScore;
        }
      }

      // Salary matching (20 points) - Same as AI Hunter
      if (user.targetingMatrix?.salaryMin && job.salaryMin && job.salaryMin >= user.targetingMatrix.salaryMin) {
        score += 20;
      }

      const finalScore = Math.min(100, Math.round(score));

      // Show calculation details
      console.log(`📊 ${job.title} at ${job.companyName}: Score ${finalScore}%, Location: ${job.locationType}`);

      // Auto apply conditions (same as JobRecommendations component)
      console.log(`🔍 Checking: finalScore=${finalScore} >= 70? ${finalScore >= 70}, locationType="${job.locationType}" === "remote"? ${job.locationType === 'remote'}`);

      if (finalScore >= 70 && job.locationType.toLowerCase() === 'remote') {
        console.log(`🎯 Auto-applying to: ${job.title} at ${job.companyName} (Score: ${finalScore}%)`);

        // Create application record
        const application = await prisma.jobApplication.create({
          data: {
            userId: user.id,
            jobId: job.id,
            method: 'automated',
            status: 'submitted',
            aiGenerated: true,
            appliedAt: new Date(),
            submittedAt: new Date(),
            matchScore: finalScore,
            applicationSource: 'auto_apply'
          }
        });

        autoAppliedJobs.push({
          jobTitle: job.title,
          companyName: job.companyName,
          score: finalScore,
          applicationId: application.id
        });

        console.log(`✅ Application created: ${application.id}`);
      } else {
        console.log(`⏸️ Skipped: Score ${finalScore}% < 70% or not remote (${job.locationType})`);
      }
    }

    console.log('\n📊 Auto Apply Results:');
    console.log(`🎯 Jobs auto-applied: ${autoAppliedJobs.length}`);
    console.log(`📈 Total applications: ${existingApplications.length + autoAppliedJobs.length}`);

    if (autoAppliedJobs.length > 0) {
      console.log('\n✅ Auto Applied Jobs:');
      autoAppliedJobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.jobTitle} at ${job.companyName} (${job.score}% match)`);
      });

      console.log('\n🎉 Auto Apply System Working!');
      console.log('💡 Pro Plan users get automatic applications to high-quality remote jobs');
    } else {
      console.log('\n⚠️ No jobs met auto-apply criteria (80+ score + remote)');
      console.log('💡 Try adjusting job preferences or wait for more suitable opportunities');
    }

    // Check current application status
    const totalApplications = await prisma.jobApplication.count({
      where: { userId: user.id }
    });

    const automatedApplications = await prisma.jobApplication.count({
      where: {
        userId: user.id,
        aiGenerated: true
      }
    });

    console.log('\n📈 Application Statistics:');
    console.log(`📊 Total applications: ${totalApplications}`);
    console.log(`🤖 Automated applications: ${automatedApplications}`);
    console.log(`👨‍💼 Manual applications: ${totalApplications - automatedApplications}`);

  } catch (error) {
    console.error('❌ Auto Apply test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAutoApplySystem();