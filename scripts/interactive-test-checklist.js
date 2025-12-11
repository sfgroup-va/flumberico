#!/usr/bin/env node

/**
 * Interactive Testing Checklist
 * Run this script to guided test all functionality
 */

const readline = require('readline');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const TEST_CONFIG = {
  user: {
    email: 'testuser@example.com',
    password: 'testuser123'
  },
  criticalPages: [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/dashboard',
    '/search',
    '/applications',
    '/profile',
    '/settings'
  ],
  apiEndpoints: [
    '/api/jobs',
    '/api/auth/session',
    '/api/user/profile',
    '/api/user/stats',
    '/api/user/applications',
    '/api/jobs/recommendations'
  ]
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(rl, question) {
  return new Promise(resolve => {
    rl.question(`${colors.cyan}${question}${colors.reset} `, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

function checkPageStatus(url) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve({
        url: url,
        status: res.statusCode,
        success: res.statusCode === 200 || res.statusCode === 307
      });
    });

    req.on('error', () => {
      resolve({
        url: url,
        status: 0,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url: url,
        status: 0,
        success: false
      });
    });

    req.end();
  });
}

async function testServerConnectivity() {
  colorLog('blue', '\n🔍 PHASE 1: SERVER CONNECTIVITY TEST');
  colorLog('yellow', 'Making sure the server is running...');

  const serverTest = await checkPageStatus('/');

  if (serverTest.success) {
    colorLog('green', `✅ Server is running! Status: ${serverTest.status}`);
    return true;
  } else {
    colorLog('red', `❌ Server is not responding! Status: ${serverTest.status}`);
    colorLog('yellow', 'Please start the server with: npm run dev');
    return false;
  }
}

async function testCriticalPages(rl) {
  colorLog('blue', '\n📄 PHASE 2: CRITICAL PAGES TEST');
  colorLog('yellow', 'Testing if all important pages load correctly...\n');

  let passedTests = 0;
  const totalTests = TEST_CONFIG.criticalPages.length;

  for (const page of TEST_CONFIG.criticalPages) {
    process.stdout.write(`Testing ${page}... `);
    const result = await checkPageStatus(page);

    if (result.success) {
      colorLog('green', `✅ PASS (${result.status})`);
      passedTests++;
    } else {
      colorLog('red', `❌ FAIL (${result.status})`);
    }
  }

  colorLog('cyan', `\nPages Test Results: ${passedTests}/${totalTests} passed`);

  if (passedTests === totalTests) {
    colorLog('green', '🎉 All critical pages are working!');
  } else {
    colorLog('yellow', '⚠️ Some pages need attention');
  }

  await askQuestion(rl, 'Press Enter to continue to API testing...');
  return passedTests / totalTests;
}

async function testAPIEndpoints() {
  colorLog('blue', '\n🔌 PHASE 3: API ENDPOINTS TEST');
  colorLog('yellow', 'Testing API endpoints functionality...\n');

  let passedTests = 0;
  const totalTests = TEST_CONFIG.apiEndpoints.length;

  for (const endpoint of TEST_CONFIG.apiEndpoints) {
    process.stdout.write(`Testing ${endpoint}... `);
    const result = await checkPageStatus(endpoint);

    if (result.success) {
      colorLog('green', `✅ PASS (${result.status})`);
      passedTests++;
    } else if (result.status === 401) {
      colorLog('yellow', `⚠️ AUTH REQUIRED (${result.status})`);
      passedTests++; // 401 is expected for protected endpoints
    } else {
      colorLog('red', `❌ FAIL (${result.status})`);
    }
  }

  colorLog('cyan', `\nAPI Test Results: ${passedTests}/${totalTests} passed`);
  return passedTests / totalTests;
}

async function testManualFeatures(rl) {
  colorLog('blue', '\n🧪 PHASE 4: MANUAL FEATURE TESTING');
  colorLog('yellow', 'Please manually test the following features:\n');

  const manualTests = [
    {
      name: 'Login Functionality',
      instructions: 'Go to http://localhost:3000/auth/signin and try logging in with testuser@example.com / testuser123',
      question: 'Did login work and redirect to dashboard? (y/n)'
    },
    {
      name: 'Dashboard Loading',
      instructions: 'Check if dashboard shows statistics, job recommendations, and user profile',
      question: 'Did dashboard load correctly with all components? (y/n)'
    },
    {
      name: 'Job Recommendations',
      instructions: 'Look at job recommendations section, check match scores and job cards',
      question: 'Are job recommendations showing with match scores? (y/n)'
    },
    {
      name: 'Auto-Apply System',
      instructions: 'As a Pro user, check if jobs with 70%+ match show "Auto Applied" badges',
      question: 'Do you see auto-applied jobs with green borders? (y/n)'
    },
    {
      name: 'Application Tracking',
      instructions: 'Go to /applications and check if application list loads',
      question: 'Does the applications page show your application history? (y/n)'
    },
    {
      name: 'Profile Management',
      instructions: 'Visit /profile and try editing your information',
      question: 'Can you view and edit your profile? (y/n)'
    },
    {
      name: 'Navigation',
      instructions: 'Test navigation menu items (About, Contact, Pricing, etc.)',
      question: 'Do all navigation links work properly? (y/n)'
    },
    {
      name: 'Mobile Responsiveness',
      instructions: 'Resize browser to mobile width and test functionality',
      question: 'Does the layout work correctly on mobile? (y/n)'
    }
  ];

  let passedTests = 0;

  for (const test of manualTests) {
    colorLog('magenta', `\n📋 ${test.name}`);
    colorLog('white', `   ${test.instructions}`);

    const answer = await askQuestion(rl, test.question);

    if (answer === 'y' || answer === 'yes') {
      colorLog('green', `   ✅ PASS`);
      passedTests++;
    } else {
      colorLog('red', `   ❌ FAIL`);
      colorLog('yellow', `   Please check the implementation for ${test.name}`);
    }
  }

  colorLog('cyan', `\nManual Test Results: ${passedTests}/${manualTests.length} passed`);
  return passedTests / manualTests.length;
}

async function testAutoApplySpecific(rl) {
  colorLog('blue', '\n🤖 PHASE 5: AUTO-APPLY SYSTEM DEEP DIVE');
  colorLog('yellow', 'Testing the critical auto-apply functionality...\n');

  const autoApplyTests = [
    {
      name: 'Pro Plan Status Check',
      instructions: 'Check if you have Pro Plan subscription active',
      question: 'Is your account on Pro Plan? (y/n)'
    },
    {
      name: 'AI Hunter Activation',
      instructions: 'Try to activate AI Hunter in dashboard',
      question: 'Can you activate AI Hunter? (y/n)'
    },
    {
      name: 'Job Match Scoring',
      instructions: 'Look at job recommendation scores (should be 70%+)',
      question: 'Do jobs show match scores above 70%? (y/n)'
    },
    {
      name: 'Auto-Apply Visual Indicators',
      instructions: 'Check for green borders and "Auto Applied" badges on qualifying jobs',
      question: 'Do you see visual indicators for auto-applied jobs? (y/n)'
    },
    {
      name: 'Remote Job Filtering',
      instructions: 'Verify only remote jobs are being auto-applied to',
      question: 'Are only remote jobs being auto-applied? (y/n)'
    }
  ];

  let passedTests = 0;

  for (const test of autoApplyTests) {
    colorLog('magenta', `\n🔍 ${test.name}`);
    colorLog('white', `   ${test.instructions}`);

    const answer = await askQuestion(rl, test.question);

    if (answer === 'y' || answer === 'yes') {
      colorLog('green', `   ✅ PASS`);
      passedTests++;
    } else {
      colorLog('red', `   ❌ FAIL`);
      colorLog('yellow', `   This is a critical feature that needs attention`);
    }
  }

  colorLog('cyan', `\nAuto-Apply Test Results: ${passedTests}/${autoApplyTests.length} passed`);
  return passedTests / autoApplyTests.length;
}

function generateFinalReport(results) {
  colorLog('blue', '\n📊 FINAL TESTING REPORT');
  colorLog('yellow', '=' .repeat(50));

  const overall = {
    connectivity: results.connectivity ? 100 : 0,
    pages: Math.round(results.pages * 100),
    apis: Math.round(results.apis * 100),
    manual: Math.round(results.manual * 100),
    autoApply: Math.round(results.autoApply * 100)
  };

  const overallScore = Math.round(
    (overall.connectivity + overall.pages + overall.apis + overall.manual + overall.autoApply) / 5
  );

  colorLog('cyan', '\n📈 Test Scores:');
  colorLog('white', `   Server Connectivity: ${overall.connectivity}%`);
  colorLog('white', `   Page Loading: ${overall.pages}%`);
  colorLog('white', `   API Endpoints: ${overall.apis}%`);
  colorLog('white', `   Manual Features: ${overall.manual}%`);
  colorLog('white', `   Auto-Apply System: ${overall.autoApply}%`);

  colorLog('bright', `\n🎯 OVERALL SCORE: ${overallScore}%`);

  if (overallScore >= 90) {
    colorLog('green', '\n🎉 EXCELLENT! Ready for production launch!');
  } else if (overallScore >= 75) {
    colorLog('green', '\n✅ GOOD! Mostly ready with minor fixes needed');
  } else if (overallScore >= 60) {
    colorLog('yellow', '\n⚠️ FAIR! Needs some work before production');
  } else {
    colorLog('red', '\n❌ NEEDS WORK! Significant fixes required');
  }

  colorLog('blue', '\n🔧 Recommendations:');

  if (overall.autoApply < 100) {
    colorLog('yellow', '   Priority #1: Fix auto-apply system (your key feature)');
  }
  if (overall.pages < 100) {
    colorLog('yellow', '   Fix page loading issues');
  }
  if (overall.apis < 100) {
    colorLog('yellow', '   Fix API endpoint errors');
  }
  if (overall.manual < 80) {
    colorLog('yellow', '   Improve user interface and experience');
  }

  colorLog('green', '\n📋 Next Steps:');
  colorLog('white', '   1. Fix any failed tests');
  colorLog('white', '   2. Complete payment system integration');
  colorLog('white', '   3. Set up production environment');
  colorLog('white', '   4. Deploy to production! 🚀');
}

async function main() {
  colorLog('bright', '\n🧪 INTERACTIVE TESTING CHECKLIST');
  colorLog('cyan', 'Flumbericoco Job Board - Comprehensive Functionality Test');
  colorLog('white', 'URL: http://localhost:3000');
  colorLog('white', 'Test User: testuser@example.com / testuser123\n');

  const rl = createReadline();

  try {
    // Phase 1: Server Connectivity
    const serverWorks = await testServerConnectivity();
    if (!serverWorks) {
      rl.close();
      return;
    }

    await askQuestion(rl, 'Press Enter to continue testing...');

    // Phase 2: Critical Pages
    const pagesScore = await testCriticalPages(rl);

    // Phase 3: API Endpoints
    const apisScore = await testAPIEndpoints();

    await askQuestion(rl, 'Press Enter to continue to manual testing...');

    // Phase 4: Manual Features
    const manualScore = await testManualFeatures(rl);

    // Phase 5: Auto-Apply System
    const autoApplyScore = await testAutoApplySpecific(rl);

    // Generate Final Report
    generateFinalReport({
      connectivity: serverWorks,
      pages: pagesScore,
      apis: apisScore,
      manual: manualScore,
      autoApply: autoApplyScore
    });

  } catch (error) {
    colorLog('red', `\n❌ Error during testing: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  colorLog('yellow', '\n\n👋 Testing interrupted by user');
  process.exit(0);
});

// Run the interactive testing
main().catch(console.error);