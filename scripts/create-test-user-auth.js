#!/usr/bin/env node

/**
 * Create test user with simple authentication for dashboard testing
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUserAuth() {
  try {
    console.log('🔐 Setting up test user authentication...\n');

    const email = 'test-dashboard@example.com';
    const password = 'password123';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with password
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    console.log('✅ Test user authentication setup completed!');
    console.log('\n🔑 Login Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\n🌐 Login URL:');
    console.log('http://localhost:3001/auth/signin');
    console.log('\n📊 Dashboard URL (after login):');
    console.log('http://localhost:3001/dashboard');

  } catch (error) {
    console.error('❌ Error setting up test user auth:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUserAuth();