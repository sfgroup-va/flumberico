const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('Testing login for john.doe@example.com...');

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'john.doe@example.com' }
    });

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    console.log('✅ User found:', user.email, 'Role:', user.role, 'Subscription:', user.subscriptionTier);

    // Test password verification
    const testPassword = 'password123';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);

    if (isPasswordValid) {
      console.log('✅ Password verification successful');
    } else {
      console.log('❌ Password verification failed');
      console.log('Stored password hash:', user.password.substring(0, 30) + '...');

      // Test with incorrect password
      const testWrongPassword = 'wrongpassword';
      const isWrongPasswordValid = await bcrypt.compare(testWrongPassword, user.password);
      console.log('Wrong password valid:', isWrongPasswordValid);
    }

    // Check if profile exists
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    });

    if (profile) {
      console.log('✅ User profile found');
      console.log('   Name:', user.name);
      console.log('   Experience:', profile.experienceYears, 'years');
      console.log('   Location:', profile.location);
      console.log('   Expected salary:', profile.expectedSalaryMin, '-', profile.expectedSalaryMax);
    } else {
      console.log('❌ User profile not found');
    }

    // Check if resume DNA exists
    const resumeDNA = await prisma.resumeDNA.findUnique({
      where: { userId: user.id }
    });

    if (resumeDNA) {
      console.log('✅ Resume DNA found');
      console.log('   Skills count:', resumeDNA.skills.length);
      console.log('   Sample skills:', resumeDNA.skills.slice(0, 5).join(', '));
    } else {
      console.log('❌ Resume DNA not found');
    }

    // Check targeting matrix
    const targetingMatrix = await prisma.jobTargetingMatrix.findUnique({
      where: { userId: user.id }
    });

    if (targetingMatrix) {
      console.log('✅ Job targeting matrix found');
      console.log('   Job titles count:', targetingMatrix.jobTitles.length);
      console.log('   Salary range:', targetingMatrix.salaryMin, '-', targetingMatrix.salaryMax);
    } else {
      console.log('❌ Job targeting matrix not found');
    }

    console.log('\n📊 Full user data test completed!');
    console.log('\n🔑 Login credentials to test:');
    console.log('   Email: john.doe@example.com');
    console.log('   Password: password123');
    console.log('\n🌐 URLs to test:');
    console.log('   Sign in: http://localhost:3000/auth/signin');
    console.log('   Dashboard: http://localhost:3000/dashboard');
    console.log('   Upgrade: http://localhost:3000/upgrade');

  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();