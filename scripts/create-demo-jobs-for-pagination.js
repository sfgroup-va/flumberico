const { PrismaClient } = require("@prisma/client");
const { enhanceJobDescriptionWithHTML } = require("../src/lib/google-ai-html-enhanced.ts");

const prisma = new PrismaClient();

// Sample job data to create 10 additional jobs
const sampleJobs = [
  {
    title: "Senior Backend Developer",
    companyName: "DataFlow Systems",
    location: "Seattle, Washington",
    salary: 140000,
    type: "Full-Time",
    locationType: "Remote",
    skills: ["Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL", "TypeScript"]
  },
  {
    title: "Full Stack Engineer",
    companyName: "CloudTech Solutions",
    location: "Denver, Colorado",
    salary: 125000,
    type: "Full-Time",
    locationType: "Hybrid",
    skills: ["React", "Node.js", "Python", "MongoDB", "Docker", "CI/CD"]
  },
  {
    title: "DevOps Engineer",
    companyName: "InfraBuild Inc",
    location: "Austin, Texas",
    salary: 135000,
    type: "Full-Time",
    locationType: "Remote",
    skills: ["Kubernetes", "AWS", "Terraform", "Jenkins", "Linux", "Python"]
  },
  {
    title: "Mobile App Developer",
    companyName: "AppMasters Co",
    location: "San Francisco, California",
    salary: 130000,
    type: "Full-Time",
    locationType: "On-site",
    skills: ["React Native", "iOS", "Android", "TypeScript", "Redux", "Firebase"]
  },
  {
    title: "Data Scientist",
    companyName: "AI Analytics Pro",
    location: "Boston, Massachusetts",
    salary: 145000,
    type: "Full-Time",
    locationType: "Hybrid",
    skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL", "R"]
  },
  {
    title: "UI/UX Designer",
    companyName: "DesignFlow Studio",
    location: "Portland, Oregon",
    salary: 110000,
    type: "Full-Time",
    locationType: "Remote",
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research", "Design Systems"]
  },
  {
    title: "Product Manager",
    companyName: "ProductLaunch Inc",
    location: "Los Angeles, California",
    salary: 150000,
    type: "Full-Time",
    locationType: "Hybrid",
    skills: ["Product Strategy", "Agile", "Data Analysis", "User Research", "SQL", "Jira"]
  },
  {
    title: "QA Engineer",
    companyName: "QualityFirst Tech",
    location: "Chicago, Illinois",
    salary: 105000,
    type: "Full-Time",
    locationType: "Remote",
    skills: ["Selenium", "Jest", "Cypress", "Test Automation", "Agile", "JIRA"]
  },
  {
    title: "Cybersecurity Analyst",
    companyName: "SecureNet Solutions",
    location: "Washington, DC",
    salary: 140000,
    type: "Full-Time",
    locationType: "On-site",
    skills: ["Network Security", "Penetration Testing", "SIEM", "Risk Assessment", "Compliance", "Python"]
  },
  {
    title: "Machine Learning Engineer",
    companyName: "ML Innovate Labs",
    location: "Palo Alto, California",
    salary: 160000,
    type: "Full-Time",
    locationType: "Hybrid",
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Kubernetes", "AWS"]
  }
];

async function createDemoJobs() {
  console.log("🚀 Creating 10 demo jobs for pagination testing...");

  try {
    for (let i = 0; i < sampleJobs.length; i++) {
      const jobData = sampleJobs[i];

      console.log(`\n📝 Creating job ${i + 1}/10: ${jobData.title} at ${jobData.companyName}`);

      // Create HTML enhanced description
      const enhancedDescription = await enhanceJobDescriptionWithHTML(
        `We are looking for a talented ${jobData.title} to join our growing team.`,
        jobData.title,
        jobData.companyName,
        jobData.location,
        `$${(jobData.salary/12).toLocaleString()}/month`,
        jobData.type
      );

      // Create unique slug
      const slug = `${jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${jobData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

      // Create job in database
      const createdJob = await prisma.job.create({
        data: {
          slug,
          title: jobData.title,
          type: jobData.type,
          locationType: jobData.locationType,
          location: jobData.location,
          description: `We are looking for a talented ${jobData.title} to join our growing team.`,
          rewrittenDescription: enhancedDescription,
          salary: jobData.salary,
          companyName: jobData.companyName,
          approved: true,
          skillsRequired: jobData.skills
        },
      });

      console.log(`✅ Created: ${createdJob.title} (ID: ${createdJob.id})`);
    }

    console.log("\n🎉 All 10 demo jobs created successfully!");

    // Check total job count
    const totalJobs = await prisma.job.count({
      where: { approved: true }
    });

    console.log(`\n📊 Total approved jobs now: ${totalJobs}`);

    if (totalJobs > 20) {
      const totalPages = Math.ceil(totalJobs / 20);
      console.log(`✅ Pagination will be visible with ${totalPages} pages`);
      console.log(`🌐 Visit: http://localhost:3000/search to see pagination in action`);
    }

  } catch (error) {
    console.error("❌ Error creating demo jobs:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDemoJobs()
  .then(() => {
    console.log("\n🎊 Demo job creation completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to create demo jobs:", error);
    process.exit(1);
  });