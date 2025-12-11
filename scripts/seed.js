const { placeholderJobs } = require("./placeholder-data");

// Add missing fields to job data
const enrichedJobs = placeholderJobs.map(job => {
  const { featured, ...jobData } = job;
  return {
    ...jobData,
    skillsRequired: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'], // Add skills
    experienceLevel: 'mid'
  }; // Exclude featured field if it exists
});
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting to seed database...");

  console.log(`Found ${enrichedJobs.length} jobs to seed`);

  for (const job of enrichedJobs) {
    console.log(`Processing job: ${job.title}`);
    await prisma.job.upsert({
      where: {
        slug: job.slug,
      },
      update: job,
      create: job,
    });
  }

  console.log("✅ Database seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error while seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
