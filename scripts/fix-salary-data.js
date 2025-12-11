const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixSalaryData() {
  console.log("🔧 Fixing salary data...");

  // Get all jobs with salary data
  const jobs = await prisma.job.findMany({
    where: {
      salary: {
        not: null
      }
    }
  });

  console.log(`Found ${jobs.length} jobs with salary data to process`);

  for (const job of jobs) {
    let salaryMin = null;
    let salaryMax = null;

    // Check if salary looks like a combined range (e.g., 800011000 for 8000-11000)
    if (job.salary > 1000000) {
      const salaryStr = job.salary.toString();

      // Try to split the number to find a reasonable range
      // For numbers like 800011000, split into 8000 and 11000
      if (salaryStr.length >= 6) {
        const midPoint = Math.floor(salaryStr.length / 2);
        const firstPart = parseInt(salaryStr.substring(0, midPoint));
        const secondPart = parseInt(salaryStr.substring(midPoint));

        // Validate that this looks like a realistic range
        if (firstPart > 0 && secondPart > 0 && secondPart > firstPart && secondPart < 1000000) {
          salaryMin = firstPart;
          salaryMax = secondPart;
          console.log(`Job ${job.slug}: Converting ${job.salary} to range ${salaryMin}-${salaryMax}`);
        }
      }
    }

    // If we couldn't parse a range, treat it as a single salary value
    if (!salaryMin && !salaryMax) {
      salaryMin = job.salary;
      salaryMax = job.salary;
      console.log(`Job ${job.slug}: Setting single salary ${job.salary}`);
    }

    // Update the job with the new salary range
    await prisma.job.update({
      where: { id: job.id },
      data: {
        salaryMin,
        salaryMax,
        // Keep the old salary field for backward compatibility during transition
      }
    });
  }

  console.log("✅ Salary data migration completed!");
}

fixSalaryData()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error while fixing salary data:", e);
    await prisma.$disconnect();
    process.exit(1);
  });