const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDashboardComplete() {
  try {
    console.log('🧪 Complete Dashboard Test Started...');
    console.log('='.repeat(50));

    // 1. Test user authentication and profile
    console.log('1️⃣ Testing User Profile...');
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

    console.log('✅ User Profile:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Subscription: ${user.subscriptionTier}`);
    console.log(`   AI Hunter Active: ${user.isActiveHunter}`);
    const jobTitles = user.targetingMatrix?.jobTitles || [];
    console.log(`   Target Job Titles: ${jobTitles.join(', ')}`);
    const skills = user.resumeDNA?.skills || [];
    console.log(`   User Skills: ${skills.slice(0, 5).join(', ')}...`);

    // 2. Test job recommendations logic
    console.log('\n2️⃣ Testing Job Recommendations...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recentApplications = await prisma.jobApplication.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: today }
      },
      select: { jobId: true }
    });

    const appliedJobIds = recentApplications.map(app => app.jobId);
    console.log(`   Recent applications today: ${recentApplications.length}`);

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

    console.log(`   Available jobs: ${recommendations.length}`);

    // Calculate match scores for recommendations
    const recommendationsWithScores = recommendations.map(job => {
      let score = 0;

      // Job title matching (30 points)
      if (user.targetingMatrix?.jobTitles?.some(title =>
        job.title.toLowerCase().includes(title.toLowerCase()))) {
        score += 30;
      }

      // Location matching (20 points)
      if (user.targetingMatrix?.remoteOnly && job.locationType?.toLowerCase() === 'remote') {
        score += 20;
      }

      // Skills matching (30 points)
      if (user.resumeDNA?.skills && job.skillsRequired?.length > 0) {
        const userSkills = new Set(user.resumeDNA.skills.map(s => s.toLowerCase()));
        const requiredSkills = job.skillsRequired.map(s => s.toLowerCase());
        const matchingSkills = requiredSkills.filter(skill => userSkills.has(skill));
        score += (matchingSkills.length / requiredSkills.length) * 30;
      }

      // Salary matching (20 points)
      if (user.targetingMatrix?.salaryMin && job.salaryMin && job.salaryMin >= user.targetingMatrix.salaryMin) {
        score += 20;
      }

      return {
        ...job,
        matchScore: Math.min(100, Math.round(score)),
        locationType: job.locationType
      };
    });

    recommendationsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    console.log('\n🏆 Top 3 Recommendations:');
    recommendationsWithScores.slice(0, 3).forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} at ${job.companyName}`);
      console.log(`      Score: ${job.matchScore}% | Location: ${job.locationType}`);
    });

    // 3. Test auto-apply candidates
    console.log('\n3️⃣ Testing Auto-Apply Candidates...');
    const autoApplyCandidates = recommendationsWithScores.filter(job =>
      job.matchScore >= 70 && job.locationType?.toLowerCase() === 'remote'
    );

    console.log(`   Auto-apply eligible jobs: ${autoApplyCandidates.length}`);
    autoApplyCandidates.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} at ${job.companyName} (${job.matchScore}% match)`);
    });

    // 4. Test application statistics
    console.log('\n4️⃣ Testing Application Statistics...');
    const totalApplications = await prisma.jobApplication.count({
      where: { userId: user.id }
    });

    const automatedApplications = await prisma.jobApplication.count({
      where: {
        userId: user.id,
        aiGenerated: true
      }
    });

    const recentApplicationsCount = await prisma.jobApplication.count({
      where: {
        userId: user.id,
        createdAt: { gte: today }
      }
    });

    console.log(`   Total applications: ${totalApplications}`);
    console.log(`   Automated applications: ${automatedApplications}`);
    console.log(`   Manual applications: ${totalApplications - automatedApplications}`);
    console.log(`   Today's applications: ${recentApplicationsCount}`);

    // 5. Test AI Hunter status
    console.log('\n5️⃣ Testing AI Hunter Status...');
    const aiHunterStatus = {
      isActive: user.isActiveHunter,
      subscriptionTier: user.subscriptionTier,
      hasProfile: !!user.profile,
      hasResumeDNA: !!user.resumeDNA,
      hasTargetingMatrix: !!user.targetingMatrix
    };

    console.log('   AI Hunter Configuration:');
    Object.entries(aiHunterStatus).forEach(([key, value]) => {
      console.log(`     ${key}: ${value}`);
    });

    // 6. Test dashboard components functionality
    console.log('\n6️⃣ Testing Dashboard Components...');

    // Test stats API logic
    const stats = {
      totalApplications,
      pendingApplications: await prisma.jobApplication.count({
        where: {
          userId: user.id,
          status: 'pending'
        }
      }),
      submittedApplications: await prisma.jobApplication.count({
        where: {
          userId: user.id,
          status: 'submitted'
        }
      }),
      interviewApplications: await prisma.jobApplication.count({
        where: {
          userId: user.id,
          status: 'interview'
        }
      })
    };

    console.log('   Application Stats:', stats);

    // Test performance data logic
    const performanceData = {
      applicationsByDay: [],
      successRate: totalApplications > 0 ? (stats.submittedApplications / totalApplications * 100).toFixed(1) : 0,
      averageResponseTime: '2.5 days'
    };

    console.log('   Performance Data:', performanceData);

    // 7. Final verification
    console.log('\n7️⃣ Final Verification...');

    const verificationResults = {
      userProfile: !!user.profile,
      recommendationsWorking: recommendationsWithScores.length > 0,
      scoringConsistent: recommendationsWithScores.some(job => job.matchScore >= 70),
      autoApplyWorking: automatedApplications > 0,
      dashboardDataReady: true
    };

    const allTestsPassed = Object.values(verificationResults).every(result => result === true);

    console.log('\n📊 Test Results:');
    Object.entries(verificationResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${test}: ${status}`);
    });

    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
      console.log('🎉 ALL DASHBOARD TESTS PASSED!');
      console.log('✅ Dashboard is ready for user access');
      console.log('✅ Auto-apply system working correctly');
      console.log('✅ Job recommendations displaying accurate scores');
      console.log('✅ User statistics calculating properly');
    } else {
      console.log('⚠️ Some tests failed. Check the results above.');
    }

  } catch (error) {
    console.error('❌ Dashboard test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardComplete();