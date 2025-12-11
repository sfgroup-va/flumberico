const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testApplyJobAPI() {
  try {
    console.log('🧪 Testing Apply Job API...');

    // Get test user
    const user = await prisma.user.findFirst({
      where: { email: 'testuser@example.com' },
      select: { id: true, subscriptionTier: true }
    });

    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('✅ Found user:', user.subscriptionTier, 'tier');

    // Get a job to apply to (one that user hasn't applied to yet)
    const existingApplications = await prisma.jobApplication.findMany({
      where: { userId: user.id },
      select: { jobId: true }
    });

    const appliedJobIds = existingApplications.map(app => app.jobId);

    const availableJob = await prisma.job.findFirst({
      where: {
        AND: [
          { id: { notIn: appliedJobIds.length > 0 ? appliedJobIds : [] } },
          { approved: true },
          { isActive: true }
        ]
      }
    });

    if (!availableJob) {
      console.log('❌ No available jobs to apply to');
      return;
    }

    console.log('✅ Found available job:', availableJob.title);
    console.log('   Company:', availableJob.companyName);
    console.log('   Job ID:', availableJob.id);

    // Test manual application
    console.log('\n🔄 Testing manual application...');

    const application = await prisma.jobApplication.create({
      data: {
        userId: user.id,
        jobId: availableJob.id,
        method: 'manual',
        status: 'pending',
        appliedAt: new Date()
      }
    });

    console.log('✅ Manual application created:');
    console.log('   Application ID:', application.id);
    console.log('   Method:', application.method);
    console.log('   Status:', application.status);
    console.log('   Applied At:', application.appliedAt);

    // Verify the application was created correctly
    const createdApplication = await prisma.jobApplication.findUnique({
      where: { id: application.id },
      include: {
        job: true
      }
    });

    if (createdApplication) {
      console.log('\n✅ Application verification successful:');
      console.log('   Job Title:', createdApplication.job.title);
      console.log('   Company:', createdApplication.job.companyName);
      console.log('   Application URL:', createdApplication.job.applicationUrl || 'None');
    }

    console.log('\n🎉 Apply Job API test completed successfully!');

  } catch (error) {
    console.error('❌ Apply Job API test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApplyJobAPI();