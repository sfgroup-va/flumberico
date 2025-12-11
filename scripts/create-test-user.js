const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Create a test user
    const hashedPassword = await bcrypt.hash('testuser123', 10);

    const user = await prisma.user.upsert({
      where: { email: 'testuser@example.com' },
      update: {
        name: 'Test User',
        password: hashedPassword,
        role: 'user',
        subscriptionTier: 'pro',
        isActiveHunter: false
      },
      create: {
        email: 'testuser@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'user',
        subscriptionTier: 'pro',
        isActiveHunter: false
      }
    });

    // Create user profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        headline: 'Full-Stack Developer',
        summary: 'Experienced full-stack developer looking for new opportunities',
        phone: '+1234567890',
        location: 'San Francisco, CA',
        website: 'https://testuser.dev',
        linkedin: 'https://linkedin.com/in/testuser',
        github: 'https://github.com/testuser',
        experienceYears: 5,
        desiredJobTitles: ['Full-Stack Developer', 'Software Engineer', 'Frontend Developer'],
        desiredLocations: ['San Francisco', 'Remote', 'New York'],
        expectedSalaryMin: 100000,
        expectedSalaryMax: 150000,
        preferredJobTypes: ['full-time', 'contract'],
        preferredLocationType: 'remote',
        onboardingCompleted: true
      },
      create: {
        userId: user.id,
        headline: 'Full-Stack Developer',
        summary: 'Experienced full-stack developer looking for new opportunities',
        phone: '+1234567890',
        location: 'San Francisco, CA',
        website: 'https://testuser.dev',
        linkedin: 'https://linkedin.com/in/testuser',
        github: 'https://github.com/testuser',
        experienceYears: 5,
        desiredJobTitles: ['Full-Stack Developer', 'Software Engineer', 'Frontend Developer'],
        desiredLocations: ['San Francisco', 'Remote', 'New York'],
        expectedSalaryMin: 100000,
        expectedSalaryMax: 150000,
        preferredJobTypes: ['full-time', 'contract'],
        preferredLocationType: 'remote',
        onboardingCompleted: true
      }
    });

    // Create ResumeDNA
    const resumeDNA = await prisma.resumeDNA.upsert({
      where: { userId: user.id },
      update: {
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL'],
        extractedText: 'Experienced full-stack developer with 5+ years of experience...',
        aiOptimizedSummary: 'Results-driven Full-Stack Developer with 5 years of experience building scalable web applications...'
      },
      create: {
        userId: user.id,
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL'],
        extractedText: 'Experienced full-stack developer with 5+ years of experience...',
        aiOptimizedSummary: 'Results-driven Full-Stack Developer with 5 years of experience building scalable web applications...'
      }
    });

    // Create job targeting matrix
    const targetingMatrix = await prisma.jobTargetingMatrix.upsert({
      where: { userId: user.id },
      update: {
        jobTitles: ['Full-Stack Developer', 'Software Engineer', 'Frontend Developer'],
        locations: ['San Francisco', 'Remote', 'New York'],
        companySizes: ['medium', 'large', 'enterprise'],
        industries: ['Technology', 'Software', 'SaaS'],
        salaryMin: 100000,
        salaryMax: 200000,
        remoteOnly: true,
        mustHaveSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        niceToHaveSkills: ['Python', 'AWS', 'Docker', 'GraphQL'],
        excludeCompanies: []
      },
      create: {
        userId: user.id,
        jobTitles: ['Full-Stack Developer', 'Software Engineer', 'Frontend Developer'],
        locations: ['San Francisco', 'Remote', 'New York'],
        companySizes: ['medium', 'large', 'enterprise'],
        industries: ['Technology', 'Software', 'SaaS'],
        salaryMin: 100000,
        salaryMax: 200000,
        remoteOnly: true,
        mustHaveSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        niceToHaveSkills: ['Python', 'AWS', 'Docker', 'GraphQL'],
        excludeCompanies: []
      }
    });

    // Create some sample applications
    const jobs = await prisma.job.findMany({ take: 3 });

    for (const job of jobs) {
      const existingApplication = await prisma.jobApplication.findFirst({
        where: {
          userId: user.id,
          jobId: job.id
        }
      });

      if (!existingApplication) {
        await prisma.jobApplication.create({
          data: {
            userId: user.id,
            jobId: job.id,
            status: ['scouted', 'applied', 'interview'][Math.floor(Math.random() * 3)],
            aiGenerated: Math.random() > 0.5,
            method: 'automated',
            appliedAt: new Date()
          }
        });
      }
    }

    console.log('✅ Test user created successfully!');
    console.log('Email: testuser@example.com');
    console.log('Password: testuser123');
    console.log('User ID:', user.id);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();