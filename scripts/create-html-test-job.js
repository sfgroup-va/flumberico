const { PrismaClient } = require("@prisma/client");
const { enhanceJobDescriptionWithHTML } = require("../src/lib/google-ai-html-enhanced.ts");

const prisma = new PrismaClient();

async function createHTMLTestJob() {
  console.log("🧪 Creating test job with HTML enhancement...");

  try {
    const testJob = {
      title: "Senior Frontend Developer",
      companyName: "TechFlow Solutions",
      location: "Austin, Texas",
      description: "We're looking for a skilled frontend developer to build amazing web applications with modern React and Next.js.",
      salary: 120000,
      type: "Full-Time",
      locationType: "Hybrid"
    };

    console.log(`📝 Creating: ${testJob.title} at ${testJob.companyName}`);

    const enhancedDescription = await enhanceJobDescriptionWithHTML(
      testJob.description,
      testJob.title,
      testJob.companyName,
      testJob.location,
      `$${(testJob.salary/12).toLocaleString()}/month`,
      testJob.type
    );

    console.log("✅ HTML enhancement completed!\n");
    console.log("📄 Sample HTML Output:");
    console.log(enhancedDescription.substring(0, 300) + "...\n");

    // Create job in database
    const slug = `${testJob.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${testJob.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-html-test`;

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
        approved: true,
        skillsRequired: ["React", "Next.js", "TypeScript", "JavaScript", "CSS", "HTML"]
      },
    });

    console.log(`✅ Job created successfully!`);
    console.log(`🔗 Job URL: http://localhost:3000/jobs/${slug}`);
    console.log(`🆔 Job ID: ${createdJob.id}`);

    return createdJob;

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createHTMLTestJob()
  .then((job) => {
    console.log(`\n🎉 Test job created! Check it at: http://localhost:3000/jobs/${job.slug}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  });