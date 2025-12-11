#!/usr/bin/env node

/**
 * Create test data for dashboard validation
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🔧 Creating test data for dashboard validation...\n');

    // Create test user if not exists
    const testUser = await prisma.user.upsert({
      where: { email: 'test-dashboard@example.com' },
      update: {},
      create: {
        email: 'test-dashboard@example.com',
        name: 'Test Dashboard User',
        subscriptionTier: 'pro',
        isActiveHunter: true,
        lastHunterScanAt: new Date(),
        hunterJobLimit: 10,
        hunterJobCount: 3,
      },
    });

    console.log(`✅ Test user: ${testUser.name} (${testUser.email})`);

    // Create user profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        headline: 'Senior Full Stack Developer',
        summary: 'Experienced developer with 5+ years in web development',
        location: 'San Francisco, CA',
        experience: '5',
        desiredJobTitles: ['Full Stack Developer', 'Senior Software Engineer'],
        desiredLocations: ['San Francisco', 'Remote', 'New York'],
        desiredSalary: 120000,
        jobType: 'full-time',
        remotePreference: 'remote',
        onboardingCompleted: true,
      },
    });

    console.log('✅ User profile created');

    // Create resume DNA
    const resumeDNA = await prisma.resumeDNA.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        fileName: 'test-resume.pdf',
        extractedText: 'Test resume content with skills and experience',
        parsedSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
        parsedExperience: {
          companies: ['Tech Corp', 'StartupXYZ'],
          roles: ['Senior Developer', 'Full Stack Engineer'],
          years: [3, 2]
        },
        aiOptimizedSummary: 'AI-enhanced professional summary highlighting technical expertise and leadership skills',
      },
    });

    console.log('✅ Resume DNA created');

    // Create job targeting matrix
    const targetingMatrix = await prisma.jobTargetingMatrix.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        jobTitles: ['Full Stack Developer', 'Senior Software Engineer', 'Frontend Developer'],
        locations: ['San Francisco', 'Remote', 'New York'],
        companySizes: ['startup', 'small', 'medium'],
        industries: ['Technology', 'Software', 'FinTech'],
        salaryMin: 100000,
        salaryMax: 150000,
        remoteOnly: false,
        mustHaveSkills: ['React', 'TypeScript', 'Node.js'],
        niceToHaveSkills: ['Python', 'AWS', 'Docker'],
        excludeCompanies: ['BadCompany Inc'],
      },
    });

    console.log('✅ Job targeting matrix created');

    // Create test jobs
    const testJobs = [
      {
        slug: 'senior-frontend-developer-techcorp',
        title: 'Senior Frontend Developer',
        type: 'full-time',
        locationType: 'Remote',
        location: 'San Francisco, CA',
        description: 'Looking for a senior frontend developer with React and TypeScript experience.',
        salary: 130000,
        salaryMin: 120000,
        salaryMax: 150000,
        companyName: 'TechCorp',
        approved: true,
        skillsRequired: ['React', 'TypeScript', 'JavaScript'],
        experienceLevel: 'Senior',
      },
      {
        slug: 'full-stack-engineer-startup',
        title: 'Full Stack Engineer',
        type: 'full-time',
        locationType: 'Hybrid',
        location: 'New York, NY',
        description: 'Join our startup as a full stack engineer. React, Node.js, and cloud experience required.',
        salary: 120000,
        salaryMin: 110000,
        salaryMax: 140000,
        companyName: 'StartupXYZ',
        approved: true,
        skillsRequired: ['React', 'Node.js', 'Python', 'AWS'],
        experienceLevel: 'Mid-Senior',
      },
      {
        slug: 'senior-software-engineer-fintech',
        title: 'Senior Software Engineer',
        type: 'full-time',
        locationType: 'Remote',
        location: 'Remote',
        description: 'Senior software engineer role at a leading fintech company. Strong backend skills required.',
        salary: 140000,
        salaryMin: 130000,
        salaryMax: 160000,
        companyName: 'FinTech Solutions',
        approved: true,
        skillsRequired: ['Python', 'Java', 'AWS', 'Docker'],
        experienceLevel: 'Senior',
      },
    ];

    for (const jobData of testJobs) {
      const job = await prisma.job.upsert({
        where: { slug: jobData.slug },
        update: jobData,
        create: jobData,
      });
      console.log(`✅ Job created: ${job.title} at ${job.companyName}`);
    }

    // Get created jobs for applications
    const createdJobs = await prisma.job.findMany({
      where: {
        slug: {
          in: ['senior-frontend-developer-techcorp', 'full-stack-engineer-startup', 'senior-software-engineer-fintech']
        }
      }
    });

    console.log(`Found ${createdJobs.length} jobs for applications`);

    // Create test applications with different statuses
    const applications = [
      {
        job: createdJobs.find(j => j.slug === 'senior-frontend-developer-techcorp'),
        status: 'applied',
        aiGenerated: true,
        matchScore: 92,
        matchReasoning: 'Perfect match for React and TypeScript skills with competitive salary',
        applicationSource: 'ai_hunter',
        stealthDelay: 240,
        firstName: 'Test',
        lastName: 'User',
        email: 'test-dashboard@example.com',
        phone: '+1-555-0123',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        job: createdJobs.find(j => j.slug === 'full-stack-engineer-startup'),
        status: 'interview',
        aiGenerated: true,
        matchScore: 88,
        matchReasoning: 'Strong full stack profile with relevant tech stack experience',
        applicationSource: 'ai_hunter',
        stealthDelay: 180,
        firstName: 'Test',
        lastName: 'User',
        email: 'test-dashboard@example.com',
        phone: '+1-555-0123',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        job: createdJobs.find(j => j.slug === 'senior-software-engineer-fintech'),
        status: 'scouted',
        aiGenerated: true,
        matchScore: 85,
        matchReasoning: 'Good fit for senior role with competitive compensation package',
        applicationSource: 'ai_hunter',
        stealthDelay: 360,
        firstName: 'Test',
        lastName: 'User',
        email: 'test-dashboard@example.com',
        phone: '+1-555-0123',
        appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    for (const appData of applications) {
      if (!appData.job) {
        console.log(`⚠️ Skipping application - job not found`);
        continue;
      }

      const { job, ...applicationData } = appData;
      const application = await prisma.jobApplication.upsert({
        where: {
          userId_jobId: {
            userId: testUser.id,
            jobId: job.id,
          },
        },
        update: applicationData,
        create: {
          ...applicationData,
          userId: testUser.id,
          jobId: job.id,
        },
      });
      console.log(`✅ Application created: ${application.status} for job ${job.title}`);
    }

    // Create hunter activity logs
    const hunterLogs = [
      {
        action: 'scan_started',
        details: { timestamp: new Date().toISOString(), applicationsFound: 15 },
        success: true,
        processingTime: 1250,
      },
      {
        action: 'job_found',
        details: { matchesFound: 8, highQualityMatches: 3 },
        success: true,
        processingTime: 890,
      },
      {
        action: 'match_scored',
        jobId: 1,
        details: { matchScore: 92, reasoning: 'Perfect technical fit' },
        success: true,
        processingTime: 450,
      },
      {
        action: 'application_sent',
        jobId: 1,
        details: { coverLetterGenerated: true, stealthDelay: 240 },
        success: true,
        processingTime: 3200,
      },
    ];

    for (const logData of hunterLogs) {
      const log = await prisma.hunterLog.create({
        data: {
          ...logData,
          userId: testUser.id,
        },
      });
      console.log(`✅ Hunter log created: ${log.action}`);
    }

    console.log('\n🎉 Test data creation completed!');
    // Get actual application stats for summary
    const actualApplications = await prisma.jobApplication.findMany({
      where: { userId: testUser.id }
    });

    console.log('\n📊 Dashboard Stats Summary:');
    console.log(`- Total Applications: ${actualApplications.length}`);
    console.log(`- Interviews Scheduled: ${actualApplications.filter(a => a.status === 'interview').length}`);
    console.log(`- Offers Received: ${actualApplications.filter(a => a.status === 'offer').length}`);
    console.log(`- Success Rate: ${actualApplications.length > 0 ? Math.round((actualApplications.filter(a => a.status === 'interview').length / actualApplications.length) * 100) : 0}%`);
    console.log(`- AI Generated: ${actualApplications.filter(a => a.aiGenerated).length}`);
    console.log(`- Average Match Score: ${actualApplications.length > 0 ? Math.round(actualApplications.reduce((sum, a) => sum + (a.matchScore || 0), 0) / actualApplications.length) : 0}%`);

    console.log('\n👤 Test User Login:');
    console.log('Email: test-dashboard@example.com');
    console.log('Status: Ready for dashboard testing');

    console.log('\n🌐 Dashboard URL:');
    console.log('http://localhost:3001/dashboard');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();