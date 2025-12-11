const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupData() {
  try {
    console.log('🔄 Creating backup...');

    // Backup users
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        resumeDNA: true,
        targetingMatrix: true
      }
    });

    // Backup applications
    const applications = await prisma.jobApplication.findMany();

    // Backup saved jobs
    const savedJobs = await prisma.savedJob.findMany();

    const backup = {
      timestamp: new Date().toISOString(),
      users,
      applications,
      savedJobs
    };

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Save backup with timestamp
    const backupFile = path.join(backupDir, `backup-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`📊 Backed up ${users.length} users, ${applications.length} applications, ${savedJobs.length} saved jobs`);

  } catch (error) {
    console.error('❌ Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function restoreData(backupFile) {
  try {
    console.log('🔄 Restoring backup...');

    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

    // Clear existing data (in correct order to respect foreign keys)
    await prisma.savedJob.deleteMany();
    await prisma.jobApplication.deleteMany();
    await prisma.jobTargetingMatrix.deleteMany();
    await prisma.resumeDNA.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();

    // Restore users with their related data
    for (const user of backup.users) {
      const createdUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          isActiveHunter: user.isActiveHunter,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });

      // Restore profile
      if (user.profile) {
        await prisma.userProfile.create({
          data: {
            ...user.profile,
            userId: createdUser.id
          }
        });
      }

      // Restore resumeDNA
      if (user.resumeDNA) {
        await prisma.resumeDNA.create({
          data: {
            ...user.resumeDNA,
            userId: createdUser.id
          }
        });
      }

      // Restore targeting matrix
      if (user.targetingMatrix) {
        await prisma.jobTargetingMatrix.create({
          data: {
            ...user.targetingMatrix,
            userId: createdUser.id
          }
        });
      }
    }

    // Restore applications
    for (const app of backup.applications) {
      await prisma.jobApplication.create({
        data: app
      });
    }

    // Restore saved jobs
    for (const saved of backup.savedJobs) {
      await prisma.savedJob.create({
        data: saved
      });
    }

    console.log(`✅ Backup restored successfully from ${backupFile}`);
    console.log(`📊 Restored ${backup.users.length} users, ${backup.applications.length} applications, ${backup.savedJobs.length} saved jobs`);

  } catch (error) {
    console.error('❌ Restore failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Command line interface
const command = process.argv[2];
const file = process.argv[3];

if (command === 'backup') {
  backupData();
} else if (command === 'restore' && file) {
  restoreData(file);
} else {
  console.log('Usage:');
  console.log('  node backup-restore.js backup');
  console.log('  node backup-restore.js restore <backup-file>');
}