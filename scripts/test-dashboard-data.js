const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestDashboardData() {
  try {
    console.log('Creating test dashboard data...');

    // Find existing test user (we'll use one that already exists or create minimal user)
    let testUser = await prisma.user.findFirst({
      where: { role: 'user' }
    });

    if (!testUser) {
      // Create a minimal test user without password for testing
      testUser = await prisma.user.create({
        data: {
          email: 'testuser@example.com',
          name: 'Test User',
          role: 'user',
          subscriptionTier: 'pro',
          isActiveHunter: true,
        }
      });
      console.log('Created test user:', testUser.email);
    } else {
      console.log('Using existing test user:', testUser.email);
    }

    // Create user profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId: testUser.id }
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId: testUser.id,
          headline: 'Full Stack Developer',
          summary: 'Experienced developer with 5 years in web development',
          location: 'San Francisco, CA',
          expectedSalaryMin: 120000,
          expectedSalaryMax: 180000,
          preferredLocationType: 'remote',
          experienceYears: 5,
          desiredJobTitles: ['Full Stack Developer', 'Senior Software Engineer', 'Frontend Developer'],
          desiredLocations: ['San Francisco', 'Remote', 'New York'],
          portfolio: 'https://testuser.dev',
          github: 'https://github.com/testuser',
          linkedin: 'https://linkedin.com/in/testuser',
          website: 'https://testuser.dev',
          onboardingCompleted: true
        }
      });
      console.log('Created user profile');
    }

    // Create ResumeDNA
    let resumeDNA = await prisma.resumeDNA.findUnique({
      where: { userId: testUser.id }
    });

    if (!resumeDNA) {
      resumeDNA = await prisma.resumeDNA.create({
        data: {
          userId: testUser.id,
          skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'Communication', 'Leadership'],
          extractedText: 'Experienced full stack developer with expertise in JavaScript, React, Node.js, and Python.',
          aiOptimizedSummary: 'Senior Full Stack Developer with 5+ years of experience building scalable web applications'
        }
      });
      console.log('Created ResumeDNA');
    }

    // Create JobTargetingMatrix
    let targetingMatrix = await prisma.jobTargetingMatrix.findUnique({
      where: { userId: testUser.id }
    });

    if (!targetingMatrix) {
      targetingMatrix = await prisma.jobTargetingMatrix.create({
        data: {
          userId: testUser.id,
          jobTitles: ['Full Stack Developer', 'Senior Software Engineer', 'Frontend Developer'],
          locations: ['San Francisco', 'Remote', 'New York'],
          remoteOnly: true,
          salaryMin: 120000,
          companySizes: ['50-200', '200-1000', '1000+'],
          industries: ['Technology', 'Software', 'Startup'],
          workSchedule: ['full-time'],
          experienceLevels: ['Mid-level', 'Senior']
        }
      });
      console.log('Created JobTargetingMatrix');
    }

    // Create some test jobs if they don't exist
    const existingJobs = await prisma.job.findMany();
    if (existingJobs.length === 0) {
      const testJobs = [
        {
          title: 'Senior Full-Stack Developer',
          slug: 'senior-full-stack-developer-techcorp',
          type: 'Full-time',
          locationType: 'Remote',
          location: 'San Francisco, CA',
          description: 'We are looking for a senior full-stack developer with expertise in JavaScript, React, and Node.js...',
          salary: 175000,
          salaryMin: 150000,
          salaryMax: 200000,
          companyName: 'TechCorp Inc.',
          applicationEmail: 'jobs@techcorp.com',
          companyLogoUrl: 'https://via.placeholder.com/100',
          approved: true,
          isActive: true,
          featured: true,
          skillsRequired: ['JavaScript', 'React', 'Node.js'],
          experienceLevel: 'Senior',
          jobType: 'full-time'
        },
        {
          title: 'Full-Stack Developer',
          slug: 'full-stack-developer-apple',
          type: 'Full-time',
          locationType: 'Hybrid',
          location: 'Cupertino, California, United States',
          description: 'Apple is looking for talented full-stack developers to join our innovative team...',
          salary: 150000,
          salaryMin: 130000,
          salaryMax: 170000,
          companyName: 'Apple Inc.',
          applicationUrl: 'https://jobs.apple.com/apply',
          companyLogoUrl: 'https://via.placeholder.com/100',
          approved: true,
          isActive: true,
          featured: true,
          skillsRequired: ['JavaScript', 'Swift', 'Python'],
          experienceLevel: 'Mid-level',
          jobType: 'full-time'
        },
        {
          title: 'ChatGPT Backend Developer',
          slug: 'chatgpt-backend-developer-openai',
          type: 'Full-time',
          locationType: 'On-site',
          location: 'San Francisco, California, United States',
          description: 'Join OpenAI to work on ChatGPT backend systems and help shape the future of AI...',
          salary: 200000,
          salaryMin: 180000,
          salaryMax: 250000,
          companyName: 'OpenAI',
          applicationUrl: 'https://openai.com/jobs',
          companyLogoUrl: 'https://via.placeholder.com/100',
          approved: true,
          isActive: true,
          featured: true,
          skillsRequired: ['Python', 'Machine Learning', 'API Development'],
          experienceLevel: 'Senior',
          jobType: 'full-time'
        },
        {
          title: 'Junior Web Developer',
          slug: 'junior-web-developer-shopify',
          type: 'Full-time',
          locationType: 'Hybrid',
          location: 'Ottawa, Ontario, Canada',
          description: 'Shopify is looking for junior web developers to help build the future of commerce...',
          salary: 80000,
          salaryMin: 70000,
          salaryMax: 90000,
          companyName: 'Shopify',
          applicationEmail: 'careers@shopify.com',
          companyLogoUrl: 'https://via.placeholder.com/100',
          approved: true,
          isActive: true,
          skillsRequired: ['JavaScript', 'React', 'CSS'],
          experienceLevel: 'Junior',
          jobType: 'full-time'
        }
      ];

      for (const jobData of testJobs) {
        await prisma.job.create({
          data: {
            ...jobData,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
          }
        });
      }
      console.log('Created test jobs');
    }

    // Create some test applications
    const jobs = await prisma.job.findMany({ take: 6 });
    const applicationStatuses = ['submitted', 'viewed', 'interview', 'pending', 'applied', 'submitted'];

    for (let i = 0; i < Math.min(6, jobs.length); i++) {
      const existingApplication = await prisma.jobApplication.findFirst({
        where: {
          userId: testUser.id,
          jobId: jobs[i].id
        }
      });

      if (!existingApplication) {
        await prisma.jobApplication.create({
          data: {
            userId: testUser.id,
            jobId: jobs[i].id,
            status: applicationStatuses[i % applicationStatuses.length],
            appliedAt: new Date(Date.now() - (i * 18 * 60 * 60 * 1000)), // Staggered over last few days
            aiGenerated: i < 2, // First 2 are AI generated
            matchScore: 90 - (i * 10), // Decreasing scores
            matchReasoning: `Excellent match for your profile. ${5 - i} of your skills match requirements`,
            applicationSource: i < 2 ? 'ai_hunter' : 'manual',
            notes: i < 2 ? 'Automated application by AI Hunter' : 'Applied manually',
            method: i < 2 ? 'automated' : 'manual'
          }
        });
      }
    }

    console.log('Dashboard test data created successfully!');
    console.log(`User: ${testUser.email}`);
    console.log(`Applications created: ${Math.min(6, jobs.length)}`);

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestDashboardData();