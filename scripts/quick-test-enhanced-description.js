const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function quickTest() {
  try {
    // Get one enhanced job
    const job = await prisma.job.findFirst({
      where: {
        rewrittenDescription: {
          not: null
        }
      }
    });

    if (job) {
      console.log(`📄 Testing Enhanced Description for: ${job.title} at ${job.companyName}`);
      console.log(`🔗 URL: http://localhost:3000/jobs/${job.slug}`);

      if (job.rewrittenDescription) {
        console.log(`✅ Has enhanced description: ${job.rewrittenDescription.length} characters`);
        console.log(`📝 First 200 characters:`);
        console.log(job.rewrittenDescription.substring(0, 200) + '...');

        // Check if it contains enhanced structure
        const hasAbout = job.rewrittenDescription.includes('About the Role');
        const hasResponsibilities = job.rewrittenDescription.includes('Key Responsibilities');
        const hasRequirements = job.rewrittenDescription.includes('Requirements & Qualifications');
        const hasBenefits = job.rewrittenDescription.includes('What We Offer');
        const hasWhyJoin = job.rewrittenDescription.includes('Why Join');

        console.log(`\n📊 Structure Analysis:`);
        console.log(`• About the Role: ${hasAbout ? '✅' : '❌'}`);
        console.log(`• Key Responsibilities: ${hasResponsibilities ? '✅' : '❌'}`);
        console.log(`• Requirements & Qualifications: ${hasRequirements ? '✅' : '❌'}`);
        console.log(`• What We Offer: ${hasBenefits ? '✅' : '❌'}`);
        console.log(`• Why Join: ${hasWhyJoin ? '✅' : '❌'}`);

        const structureScore = [hasAbout, hasResponsibilities, hasRequirements, hasBenefits, hasWhyJoin].filter(Boolean).length;
        console.log(`\n🎯 Structure Score: ${structureScore}/5 sections`);
      } else {
        console.log(`❌ No enhanced description found`);
      }
    } else {
      console.log(`❌ No jobs with enhanced descriptions found`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();