const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testAdminAccess() {
  console.log("🔐 Testing Admin Access Setup...");

  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL || "admin@flumbericoco.com" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!adminUser) {
      console.log("❌ Admin user not found in database");
      console.log("💡 Admin credentials may need to be created through first login");
      return;
    }

    console.log("✅ Admin user found:");
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Created: ${adminUser.createdAt.toLocaleString()}`);

    // Check if admin has correct role
    if (adminUser.role !== "admin") {
      console.log("⚠️  User exists but doesn't have 'admin' role");
      console.log("   Current role:", adminUser.role);

      // Update role to admin
      const updated = await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: "admin" }
      });

      console.log("✅ Role updated to 'admin'");
    } else {
      console.log("✅ Admin role confirmed");
    }

    // Check job statistics for dashboard
    const totalJobs = await prisma.job.count();
    const approvedJobs = await prisma.job.count({ where: { approved: true } });
    const pendingJobs = totalJobs - approvedJobs;

    console.log("\n📊 Job Statistics for Dashboard:");
    console.log(`   Total jobs: ${totalJobs}`);
    console.log(`   Approved jobs: ${approvedJobs}`);
    console.log(`   Pending jobs: ${pendingJobs}`);
    console.log(`   Enhancement rate: ${Math.round((approvedJobs / totalJobs) * 100)}%`);

    // Check application statistics
    const applicationStats = await prisma.jobApplication.aggregate({
      _count: {
        id: true
      }
    });

    console.log("\n📋 Application Statistics:");
    console.log(`   Total applications: ${applicationStats._count.id}`);

    console.log("\n✅ Admin setup verification complete!");
    console.log("🌐 You can now test admin access at: http://localhost:3000/admin");

  } catch (error) {
    console.error("❌ Error during admin access test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAccess();