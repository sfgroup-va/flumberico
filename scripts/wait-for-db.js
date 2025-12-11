#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function waitForDatabase() {
  console.log('🔍 Waiting for database to be ready...');

  const maxRetries = 30;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.POSTGRES_URL_NON_POOLING || 'postgresql://flumbericoco_user:flumbericoco_password@localhost:5432/flumbericoco_db',
          },
        },
      });

      // Try to connect and run a simple query
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();

      console.log('✅ Database is ready!');
      process.exit(0);
    } catch (error) {
      retries++;
      console.log(`❌ Database not ready (attempt ${retries}/${maxRetries}): ${error.message}`);

      if (retries >= maxRetries) {
        console.error('🚨 Maximum retries reached. Database connection failed.');
        console.error('   Make sure Docker containers are running: npm run docker:up');
        process.exit(1);
      }

      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

waitForDatabase().catch(error => {
  console.error('🚨 Unexpected error while waiting for database:', error);
  process.exit(1);
});