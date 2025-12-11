const { PrismaClient } = require("@prisma/client");
const { enhanceJobDescription } = require("../src/lib/google-ai.ts");

const prisma = new PrismaClient();

async function testEnhancedJobCreation() {
  console.log("🧪 Testing Enhanced Job Description System...\n");

  try {
    // Test job data - similar to your example
    const testJob = {
      title: "Senior Product Designer",
      companyName: "ApexFlow Technologies",
      location: "San Francisco, California",
      description: "Looking for an experienced product designer to join our design team. Need someone who can create user-centered digital experiences and work with product managers and engineers.",
      salary: 84000, // $7,000 per month
      type: "Full-Time",
      locationType: "Hybrid"
    };

    console.log(`📝 Creating test job: ${testJob.title} at ${testJob.companyName}`);
    console.log(`💰 Salary: $${(testJob.salary/12).toLocaleString()}/month`);
    console.log(`📍 Location: ${testJob.location} (${testJob.locationType})\n`);

    // Generate enhanced description
    console.log("🤖 Enhancing job description with AI...");
    const enhancedDescription = await enhanceJobDescription(
      testJob.description,
      testJob.title,
      testJob.companyName,
      testJob.location,
      `$${(testJob.salary/12).toLocaleString()}/month`,
      testJob.type
    );

    console.log("✅ Enhancement completed!\n");
    console.log("📄 ENHANCED JOB DESCRIPTION:");
    console.log("=" .repeat(80));
    console.log(enhancedDescription);
    console.log("=" .repeat(80));
    console.log("\n");

    // Create job in database
    const slug = `${testJob.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${testJob.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    console.log("💾 Creating job in database...");
    const createdJob = await prisma.job.create({
      data: {
        slug,
        title: testJob.title,
        type: testJob.type,
        locationType: testJob.locationType,
        location: testJob.location,
        description: testJob.description,
        rewrittenDescription: enhancedDescription,
        salary: testJob.salary,
        companyName: testJob.companyName,
        approved: true, // Auto-approve for testing
        skillsRequired: ["Figma", "UI/UX Design", "Product Design", "Prototyping", "User Research"]
      },
    });

    console.log(`✅ Job created successfully!`);
    console.log(`🔗 Job URL: http://localhost:3000/jobs/${createdJob.slug}`);
    console.log(`🆔 Job ID: ${createdJob.id}`);
    console.log(`📊 Salary: $${createdJob.salary.toLocaleString()}/year`);

  } catch (error) {
    console.error("❌ Error during testing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testEnhancedJobCreation()
  .then(() => {
    console.log("\n🎉 Enhanced job creation test completed!");
    console.log("📱 Check the job at: http://localhost:3000/jobs");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  });