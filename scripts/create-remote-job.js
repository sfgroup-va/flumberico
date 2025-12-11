const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createRemoteJobForAutoApply() {
  try {
    console.log('🚀 Creating remote job for auto-apply test...');

    // Generate slug
    const slug = 'senior-full-stack-developer-at-techcorp-' + Date.now();

    // Create a high-quality remote job that matches user profile
    const job = await prisma.job.create({
      data: {
        slug,
        title: 'Senior Full-Stack Developer',
        type: 'full-time',
        companyName: 'TechCorp Inc.',
        companyLogoUrl: 'https://via.placeholder.com/100/0000FF/FFFFFF?text=TC',
        location: 'San Francisco, CA',
        locationType: 'Remote',
        description: `We are looking for a Senior Full-Stack Developer with expertise in React, TypeScript, and Node.js to join our remote team.

**Requirements:**
- 5+ years of experience with React and TypeScript
- Strong Node.js and Express.js skills
- Experience with PostgreSQL and database design
- Remote work experience preferred
- Strong communication skills

**What we offer:**
- Competitive salary ($150,000 - $200,000)
- Fully remote position
- Flexible working hours
- Great benefits package

This is a perfect match for candidates with React, TypeScript, and Node.js skills looking for remote opportunities.`,
        applicationUrl: 'https://example.com/apply',
        salaryMin: 150000,
        salaryMax: 200000,
        skillsRequired: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL'],
        applicationEmail: 'jobs@techcorp.com',
        approved: true,
        isActive: true,
        featured: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });

    console.log(`✅ Created remote job: ${job.title} at ${job.companyName}`);
    console.log(`📍 Location: ${job.location} (${job.locationType})`);
    console.log(`💰 Salary: $${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`);
    console.log(`🛠️ Skills required: ${job.skillsRequired.join(', ')}`);
    console.log(`🆔 Job ID: ${job.id}`);

  } catch (error) {
    console.error('❌ Error creating remote job:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRemoteJobForAutoApply();