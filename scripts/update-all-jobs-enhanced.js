const { PrismaClient } = require("@prisma/client");
const { enhanceJobDescription } = require("../src/lib/google-ai.ts");

const prisma = new PrismaClient();

async function updateAllJobsWithEnhancedDescriptions() {
  console.log("🚀 Updating all jobs with enhanced AI descriptions...");

  try {
    // Get all jobs
    const allJobs = await prisma.job.findMany({
      where: {
        description: {
          not: null
        }
      }
    });

    console.log(`Found ${allJobs.length} jobs to process`);

    let successCount = 0;
    let errorCount = 0;

    for (const job of allJobs) {
      try {
        console.log(`\n📝 Processing: ${job.companyName} - ${job.title}`);

        const enhancedDescription = await enhanceJobDescription(
          job.description,
          job.title,
          job.companyName,
          job.location || '',
          job.salary > 0 ? `$${(job.salary/12).toLocaleString()}/month` : '',
          job.type || ''
        );

        await prisma.job.update({
          where: { id: job.id },
          data: {
            rewrittenDescription: enhancedDescription
          }
        });

        console.log(`✅ Enhanced: ${job.companyName}`);
        successCount++;

        // Add delay to avoid overwhelming any AI APIs
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.error(`❌ Failed to enhance ${job.companyName}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Enhancement Summary:`);
    console.log(`✅ Successfully enhanced: ${successCount} jobs`);
    console.log(`❌ Failed to enhance: ${errorCount} jobs`);
    console.log(`📈 Total processed: ${allJobs.length} jobs`);

  } catch (error) {
    console.error("❌ Critical error during enhancement process:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllJobsWithEnhancedDescriptions()
  .then(() => {
    console.log("🎉 Job description enhancement completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Enhancement process failed:", error);
    process.exit(1);
  });