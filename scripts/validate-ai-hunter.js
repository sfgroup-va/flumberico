#!/usr/bin/env node

/**
 * AI Hunter Validation Script
 * Validates the AI Hunter implementation without external dependencies
 */

const fs = require('fs');
const path = require('path');

function logStep(step, status, details = '') {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  console.log(`${icons[status]} ${step}${details ? ': ' + details : ''}`);
}

function checkFile(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function validateSchema() {
  logStep('Validating Prisma Schema', 'info');

  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

  if (!checkFile(schemaPath)) {
    logStep('Prisma schema not found', 'error');
    return false;
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  const requiredModels = [
    'User',
    'UserProfile',
    'ResumeDNA',
    'JobTargetingMatrix',
    'JobApplication',
    'Job',
    'HunterLog',
    'QueueJob'
  ];

  const requiredFields = {
    User: ['isActiveHunter', 'lastHunterScanAt', 'hunterJobLimit', 'hunterJobCount'],
    JobApplication: ['matchScore', 'matchReasoning', 'applicationSource', 'stealthDelay'],
    Job: ['requirements', 'skillsRequired', 'experienceLevel'],
    HunterLog: ['action', 'details', 'success', 'processingTime'],
    QueueJob: ['queueName', 'jobData', 'status', 'attempts']
  };

  let allValid = true;

  for (const model of requiredModels) {
    if (schemaContent.includes(`model ${model}`)) {
      logStep(`Model ${model} found`, 'success');
    } else {
      logStep(`Model ${model} not found`, 'error');
      allValid = false;
    }
  }

  for (const [model, fields] of Object.entries(requiredFields)) {
    for (const field of fields) {
      if (schemaContent.includes(field)) {
        logStep(`Field ${model}.${field} found`, 'success');
      } else {
        logStep(`Field ${model}.${field} not found`, 'error');
        allValid = false;
      }
    }
  }

  return allValid;
}

function validateAPIEndpoints() {
  logStep('Validating API Endpoints', 'info');

  const requiredEndpoints = [
    'src/app/api/ai-hunter/scan/route.ts',
    'src/app/api/ai-hunter/analytics/route.ts',
    'src/app/api/cron/job-matching/route.ts',
    'src/app/api/cron/cleanup-queues/route.ts',
    'src/app/api/user/toggle-hunter/route.ts',
    'src/app/api/user/applications/stream/route.ts'
  ];

  let allValid = true;

  for (const endpoint of requiredEndpoints) {
    const filePath = path.join(__dirname, '..', endpoint);
    if (checkFile(filePath)) {
      logStep(`API endpoint ${endpoint} found`, 'success');
    } else {
      logStep(`API endpoint ${endpoint} not found`, 'error');
      allValid = false;
    }
  }

  return allValid;
}

function validateWorkers() {
  logStep('Validating Workers', 'info');

  const requiredWorkers = [
    '/src/workers/job-matching-worker.ts',
    '/src/workers/automation-worker.ts',
    '/src/workers/cover-letter-worker.ts',
    '/src/workers/index.ts'
  ];

  let allValid = true;

  for (const worker of requiredWorkers) {
    const filePath = path.join(__dirname, '..', worker);
    if (checkFile(filePath)) {
      logStep(`Worker ${worker} found`, 'success');
    } else {
      logStep(`Worker ${worker} not found`, 'error');
      allValid = false;
    }
  }

  return allValid;
}

function validateComponents() {
  logStep('Validating Components', 'info');

  const requiredComponents = [
    '/src/components/ApplicationPulse.tsx',
    '/src/app/dashboard/page.tsx',
    '/src/app/analytics/page.tsx'
  ];

  let allValid = true;

  for (const component of requiredComponents) {
    const filePath = path.join(__dirname, '..', component);
    if (checkFile(filePath)) {
      logStep(`Component ${component} found`, 'success');
    } else {
      logStep(`Component ${component} not found`, 'error');
      allValid = false;
    }
  }

  return allValid;
}

function validateLibraries() {
  logStep('Validating Core Libraries', 'info');

  const requiredLibraries = [
    '/src/lib/job-matcher.ts',
    '/src/lib/queue.ts',
    '/src/lib/auth.ts',
    '/src/lib/prisma.ts'
  ];

  let allValid = true;

  for (const lib of requiredLibraries) {
    const filePath = path.join(__dirname, '..', lib);
    if (checkFile(filePath)) {
      logStep(`Library ${lib} found`, 'success');
    } else {
      logStep(`Library ${lib} not found`, 'error');
      allValid = false;
    }
  }

  return allValid;
}

function validateEnvironment() {
  logStep('Validating Environment Configuration', 'info');

  const envPath = path.join(__dirname, '../.env');
  const envExamplePath = path.join(__dirname, '../.env.example');

  let envValid = true;

  if (!checkFile(envPath)) {
    logStep('.env file not found', 'warning', 'Using .env.example as reference');
  } else {
    logStep('.env file found', 'success');
  }

  if (!checkFile(envExamplePath)) {
    logStep('.env.example file not found', 'error');
    envValid = false;
  } else {
    logStep('.env.example file found', 'success');
  }

  // Check if essential variables are documented
  const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
  const requiredEnvVars = [
    'GOOGLE_AI_API_KEY',
    'NEXTAUTH_SECRET',
    'CRON_SECRET',
    'REDIS_HOST',
    'STRIPE_SECRET_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (envExampleContent.includes(envVar)) {
      logStep(`Environment variable ${envVar} documented`, 'success');
    } else {
      logStep(`Environment variable ${envVar} not documented`, 'warning');
    }
  }

  return envValid;
}

function validateDeploymentConfig() {
  logStep('Validating Deployment Configuration', 'info');

  const vercelPath = path.join(__dirname, '../vercel.json');
  const packagePath = path.join(__dirname, '../package.json');

  let allValid = true;

  if (checkFile(vercelPath)) {
    logStep('Vercel configuration found', 'success');

    try {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
      if (vercelConfig.crons && vercelConfig.crons.length > 0) {
        logStep('Cron jobs configured', 'success');
        vercelConfig.crons.forEach((cron, index) => {
          logStep(`  Cron ${index + 1}: ${cron.path} (${cron.schedule})`, 'info');
        });
      } else {
        logStep('No cron jobs configured', 'warning');
      }
    } catch (error) {
      logStep('Invalid Vercel configuration', 'error');
      allValid = false;
    }
  } else {
    logStep('Vercel configuration not found', 'warning');
  }

  if (checkFile(packagePath)) {
    try {
      const packageConfig = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      if (packageConfig.scripts && packageConfig.scripts.workers) {
        logStep('Worker script configured', 'success');
      } else {
        logStep('Worker script not configured', 'warning');
      }
    } catch (error) {
      logStep('Invalid package.json', 'error');
      allValid = false;
    }
  }

  return allValid;
}

function generateSummary(results) {
  console.log('\n📊 AI Hunter Implementation Summary');
  console.log('===================================');

  const categories = [
    { name: 'Database Schema', passed: results.schema },
    { name: 'API Endpoints', passed: results.api },
    { name: 'Workers', passed: results.workers },
    { name: 'Components', passed: results.components },
    { name: 'Libraries', passed: results.libraries },
    { name: 'Environment', passed: results.environment },
    { name: 'Deployment', passed: results.deployment }
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  categories.forEach(category => {
    if (category.passed) {
      totalPassed++;
      console.log(`✅ ${category.name}: Complete`);
    } else {
      totalFailed++;
      console.log(`❌ ${category.name}: Incomplete`);
    }
  });

  console.log('\n📈 Overall Progress');
  console.log('==================');
  console.log(`✅ Complete: ${totalPassed}/${categories.length}`);
  console.log(`❌ Incomplete: ${totalFailed}/${categories.length}`);
  console.log(`📊 Success Rate: ${Math.round((totalPassed / categories.length) * 100)}%`);

  if (totalFailed === 0) {
    console.log('\n🎉 AI Hunter implementation is COMPLETE and ready for deployment!');
    console.log('\n🚀 Next Steps:');
    console.log('1. Configure environment variables in .env');
    console.log('2. Set up Google AI API key');
    console.log('3. Configure Stripe for payments');
    console.log('4. Deploy to Vercel or your preferred platform');
    console.log('5. Start the workers: npm run workers');
    console.log('6. Test the complete workflow');
  } else {
    console.log('\n⚠️ AI Hunter implementation is INCOMPLETE');
    console.log('Please address the failed items above before deployment.');
  }
}

async function runValidation() {
  console.log('🤖 AI Hunter Implementation Validator');
  console.log('=====================================\n');

  const results = {
    schema: validateSchema(),
    api: validateAPIEndpoints(),
    workers: validateWorkers(),
    components: validateComponents(),
    libraries: validateLibraries(),
    environment: validateEnvironment(),
    deployment: validateDeploymentConfig()
  };

  generateSummary(results);
}

// Run the validation
runValidation().catch(console.error);