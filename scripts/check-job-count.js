const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkJobCount() {
  try {
    const totalJobs = await prisma.job.count({
      where: { approved: true }
    });

    console.log(`\n📊 Total approved jobs: ${totalJobs}`);

    if (totalJobs <= 20) {
      console.log("⚠️  Pagination will not be visible because there are 20 or fewer jobs");
      console.log("💡 Pagination appears only when there are MORE than 20 jobs");
    } else {
      console.log("✅ Pagination should be visible");
      const totalPages = Math.ceil(totalJobs / 20);
      console.log(`📖 Total pages with 20 jobs per page: ${totalPages}`);
    }

    // Check if database connection works
    console.log("\n🔗 Database connection: ✅");

  } catch (error) {
    console.error("❌ Error checking job count:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkJobCount();