const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateJobSkills() {
  try {
    console.log('🔄 Updating job skills...');

    // Get all jobs
    const jobs = await prisma.job.findMany({
      select: { id: true, title: true, companyName: true, skillsRequired: true }
    });

    console.log(`Found ${jobs.length} total jobs`);

    // Update jobs with empty or missing skills
    const emptyJobs = jobs.filter(job =>
      !job.skillsRequired ||
      Array.isArray(job.skillsRequired) && job.skillsRequired.length === 0
    );

    console.log(`Jobs needing skills update: ${emptyJobs.length}`);

    for (const job of emptyJobs) {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          skillsRequired: ['JavaScript', 'TypeScript', 'React', 'Node.js']
        }
      });
      console.log(`✅ Updated: ${job.title} at ${job.companyName}`);
    }

    console.log('✅ Job skills update completed!');

  } catch (error) {
    console.error('❌ Error updating job skills:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateJobSkills();