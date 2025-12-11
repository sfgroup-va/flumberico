const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDummyProUser() {
  try {
    console.log('Creating dummy Pro user...');

    // Check if user exists and delete it first
    const existingUser = await prisma.user.findUnique({
      where: { email: 'john.doe@example.com' }
    });

    if (existingUser) {
      console.log('🗑️  Existing user found, deleting...');
      await prisma.user.delete({
        where: { email: 'john.doe@example.com' }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        password: hashedPassword,
        subscriptionTier: 'pro',
        subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        isActiveHunter: false,
        role: 'user'
      }
    });

    console.log('✅ User created:', user.email);

    // Create user profile
    const profile = await prisma.userProfile.create({
      data: {
        userId: user.id,
        headline: 'Senior Full Stack Developer | React | Node.js | TypeScript',
        summary: 'Experienced full stack developer with 5+ years building scalable web applications. Passionate about creating intuitive user experiences and robust backend systems.',
        phone: '+1-555-123-4567',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        portfolio: 'https://johndoe-portfolio.com',
        experienceYears: 5,
        desiredJobTitles: ['Senior Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Engineer'],
        desiredLocations: ['San Francisco', 'Remote', 'New York', 'Austin', 'Seattle'],
        expectedSalaryMin: 120000,
        expectedSalaryMax: 180000,
        preferredJobTypes: ['full-time', 'contract'],
        preferredLocationType: 'remote',
        onboardingCompleted: true
      }
    });

    console.log('✅ User profile created');

    // Create resume DNA
    const resumeDNA = await prisma.resumeDNA.create({
      data: {
        userId: user.id,
        fileUrl: '/resumes/john_doe_resume.pdf',
        fileName: 'john_doe_resume.pdf',
        extractedText: 'John Doe - Senior Full Stack Developer with 5+ years of experience...',
        skills: [
          'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express.js',
          'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Docker', 'Kubernetes',
          'Git', 'CI/CD', 'Agile', 'REST APIs', 'GraphQL', 'HTML5', 'CSS3',
          'Sass', 'Tailwind CSS', 'Jest', 'Testing', 'Microservices', 'System Design'
        ],
        parsedExperience: {
          companies: [
            {
              name: 'TechCorp',
              position: 'Senior Full Stack Developer',
              duration: '2021 - Present',
              responsibilities: ['Led development of microservices architecture', 'Mentored junior developers']
            },
            {
              name: 'StartupXYZ',
              position: 'Full Stack Developer',
              duration: '2019 - 2021',
              responsibilities: ['Built React applications', 'Developed REST APIs']
            }
          ]
        },
        parsedEducation: {
          degree: 'Bachelor of Science in Computer Science',
          university: 'University of California, Berkeley',
          year: '2019'
        },
        aiOptimizedSummary: 'Results-driven Senior Full Stack Developer with 5+ years of expertise in building scalable web applications using React, Node.js, and TypeScript. Proven track record of leading development teams and implementing microservices architectures. Seeking challenging roles in innovative tech companies.'
      }
    });

    console.log('✅ Resume DNA created');

    // Create job targeting matrix
    const targetingMatrix = await prisma.jobTargetingMatrix.create({
      data: {
        userId: user.id,
        jobTitles: [
          'Senior Full Stack Developer',
          'Full Stack Engineer',
          'Frontend Developer',
          'Backend Developer',
          'Software Engineer',
          'Web Developer'
        ],
        locations: [
          'San Francisco, CA',
          'Remote',
          'New York, NY',
          'Austin, TX',
          'Seattle, WA',
          'Los Angeles, CA'
        ],
        companySizes: ['startup', 'small', 'medium', 'large'],
        industries: [
          'Technology',
          'Software',
          'Internet',
          'SaaS',
          'FinTech',
          'Healthcare'
        ],
        salaryMin: 120000,
        salaryMax: 200000,
        remoteOnly: false,
        mustHaveSkills: [
          'JavaScript',
          'React',
          'Node.js',
          'TypeScript'
        ],
        niceToHaveSkills: [
          'Python',
          'Go',
          'Rust',
          'GraphQL',
          'Docker',
          'Kubernetes',
          'AWS',
          'MongoDB',
          'PostgreSQL'
        ],
        excludeCompanies: [
          'ToxicCorp',
          'BadCompany Inc'
        ]
      }
    });

    console.log('✅ Job targeting matrix created');

    // Create some dummy companies
    let techCorp = await prisma.company.findFirst({ where: { name: 'TechCorp' } });
    if (!techCorp) {
      techCorp = await prisma.company.create({
        data: {
          name: 'TechCorp',
          logo: 'https://logo.clearbit.com/techcorp.com',
          industry: 'Technology',
          website: 'https://techcorp.com',
          size: 'large'
        }
      });
    }

    let startupXYZ = await prisma.company.findFirst({ where: { name: 'StartupXYZ' } });
    if (!startupXYZ) {
      startupXYZ = await prisma.company.create({
        data: {
          name: 'StartupXYZ',
          logo: 'https://logo.clearbit.com/startupxyz.com',
          industry: 'SaaS',
          website: 'https://startupxyz.com',
          size: 'startup'
        }
      });
    }

    let cloudTech = await prisma.company.findFirst({ where: { name: 'CloudTech' } });
    if (!cloudTech) {
      cloudTech = await prisma.company.create({
        data: {
          name: 'CloudTech',
          logo: 'https://logo.clearbit.com/cloudtech.com',
          industry: 'Cloud Computing',
          website: 'https://cloudtech.com',
          size: 'medium'
        }
      });
    }

    const companies = [techCorp, startupXYZ, cloudTech];

    console.log('✅ Companies created/upserted');

  // Create some dummy jobs with unique slugs
    const timestamp = Date.now();
    const jobs = await Promise.all([
      prisma.job.create({
        data: {
          slug: `senior-full-stack-developer-techcorp-${timestamp}`,
          title: 'Senior Full Stack Developer',
          type: 'full-time',
          locationType: 'remote',
          location: 'Remote - USA',
          description: 'We are looking for a Senior Full Stack Developer to join our growing team...',
          rewrittenDescription: 'Join our innovative team as a Senior Full Stack Developer where you will work on cutting-edge projects...',
          salaryMin: 140000,
          salaryMax: 180000,
          companyName: 'TechCorp',
          applicationEmail: 'jobs@techcorp.com',
          applicationUrl: 'https://techcorp.com/jobs/senior-full-stack-developer',
          companyLogoUrl: 'https://logo.clearbit.com/techcorp.com',
          companyId: companies[0].id,
          approved: true,
          requirements: {
            experience: '5+ years',
            education: 'Bachelor degree preferred'
          },
          skillsRequired: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
          experienceLevel: 'senior',
          requiredSkills: 'JavaScript, React, Node.js, TypeScript, PostgreSQL',
          jobType: 'full-time',
          featured: true,
          isActive: true,
          applicationCount: 0
        }
      }),
      prisma.job.create({
        data: {
          slug: `frontend-developer-startupxyz-${timestamp + 1}`,
          title: 'Frontend Developer - React',
          type: 'full-time',
          locationType: 'hybrid',
          location: 'San Francisco, CA',
          description: 'StartupXYZ is looking for a talented Frontend Developer with React experience...',
          rewrittenDescription: 'Exciting opportunity for a Frontend Developer to join our fast-growing startup...',
          salaryMin: 120000,
          salaryMax: 160000,
          companyName: 'StartupXYZ',
          applicationEmail: 'careers@startupxyz.com',
          applicationUrl: 'https://startupxyz.com/careers/frontend-developer',
          companyLogoUrl: 'https://logo.clearbit.com/startupxyz.com',
          companyId: companies[1].id,
          approved: true,
          requirements: {
            experience: '3+ years',
            education: 'Bachelor degree preferred'
          },
          skillsRequired: ['JavaScript', 'React', 'TypeScript', 'CSS', 'HTML'],
          experienceLevel: 'mid',
          requiredSkills: 'JavaScript, React, TypeScript, CSS, HTML',
          jobType: 'full-time',
          featured: false,
          isActive: true,
          applicationCount: 0
        }
      }),
      prisma.job.create({
        data: {
          slug: `full-stack-engineer-cloudtech-${timestamp + 2}`,
          title: 'Full Stack Engineer - Cloud Platform',
          type: 'full-time',
          locationType: 'remote',
          location: 'Remote - Global',
          description: 'CloudTech is seeking a Full Stack Engineer to help build our next-generation cloud platform...',
          rewrittenDescription: 'Join CloudTech as a Full Stack Engineer and work on revolutionary cloud infrastructure...',
          salaryMin: 130000,
          salaryMax: 170000,
          companyName: 'CloudTech',
          applicationEmail: 'engineering@cloudtech.com',
          applicationUrl: 'https://cloudtech.com/jobs/full-stack-engineer',
          companyLogoUrl: 'https://logo.clearbit.com/cloudtech.com',
          companyId: companies[2].id,
          approved: true,
          requirements: {
            experience: '4+ years',
            education: 'Bachelor degree required'
          },
          skillsRequired: ['JavaScript', 'Python', 'AWS', 'Docker', 'PostgreSQL'],
          experienceLevel: 'mid',
          requiredSkills: 'JavaScript, Python, AWS, Docker, PostgreSQL',
          jobType: 'full-time',
          featured: true,
          isActive: true,
          applicationCount: 0
        }
      })
    ]);

    console.log('✅ Jobs created:', jobs.length, 'jobs');

    // Create some saved jobs for the user
    const savedJobs = await Promise.all([
      prisma.savedJob.create({
        data: {
          userId: user.id,
          jobId: jobs[0].id,
          savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      }),
      prisma.savedJob.create({
        data: {
          userId: user.id,
          jobId: jobs[1].id,
          savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
      })
    ]);

    console.log('✅ Saved jobs created:', savedJobs.length, 'saved jobs');

    // Create some dummy applications
    const applications = await Promise.all([
      prisma.jobApplication.create({
        data: {
          userId: user.id,
          jobId: jobs[2].id,
          method: 'manual',
          status: 'submitted',
          coverLetter: 'Dear CloudTech Team,\n\nI am excited to apply for the Full Stack Engineer position...',
          aiGenerated: false,
          appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          matchScore: 85,
          matchReasoning: 'Strong match: 85% - Excellent skill alignment with JavaScript, Python, and cloud technologies. Experience level fits perfectly.',
          applicationSource: 'manual'
        }
      }),
      prisma.jobApplication.create({
        data: {
          userId: user.id,
          jobId: jobs[0].id,
          method: 'automated',
          status: 'interview',
          coverLetter: 'Dear TechCorp Hiring Team,\n\nI am writing to express my strong interest in the Senior Full Stack Developer position...',
          aiGenerated: true,
          appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          matchScore: 92,
          matchReasoning: 'Exceptional match: 92% - Perfect alignment with required skills and senior experience level. Remote preference matches job offering.',
          applicationSource: 'ai_assisted',
          stealthDelay: 3600 // 1 hour delay
        }
      })
    ]);

    console.log('✅ Applications created:', applications.length, 'applications');

    // Create some AI Hunter logs
    const hunterLogs = await Promise.all([
      prisma.hunterLog.create({
        data: {
          userId: user.id,
          action: 'scan_started',
          details: { type: 'scheduled_scan', jobIdCount: 3 },
          success: true,
          processingTime: 2500,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
      }),
      prisma.hunterLog.create({
        data: {
          userId: user.id,
          action: 'job_found',
          details: {
            jobId: jobs[0].id,
            matchScore: 92,
            matchReasoning: 'Perfect skill match with React, Node.js, and TypeScript'
          },
          jobId: jobs[0].id,
          success: true,
          processingTime: 500,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
      }),
      prisma.hunterLog.create({
        data: {
          userId: user.id,
          action: 'application_sent',
          details: {
            jobId: jobs[0].id,
            method: 'ai_assisted',
            coverLetterGenerated: true
          },
          jobId: jobs[0].id,
          success: true,
          processingTime: 1200,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      })
    ]);

    console.log('✅ Hunter logs created:', hunterLogs.length, 'logs');

    console.log('\n🎉 Dummy Pro user created successfully!');
    console.log('\n📧 Login credentials:');
    console.log('   Email: john.doe@example.com');
    console.log('   Password: password123');
    console.log('\n📊 User stats:');
    console.log('   Subscription: Pro (active for 1 year)');
    console.log('   Profile: Complete');
    console.log('   Skills: 20+ technologies');
    console.log('   Experience: 5 years');
    console.log('   Saved jobs: 2');
    console.log('   Applications: 2 (1 manual, 1 automated)');
    console.log('   Match scores: 85-92%');
    console.log('\n🔗 Available jobs for testing:', jobs.length, 'jobs');

  } catch (error) {
    console.error('❌ Error creating dummy user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyProUser();