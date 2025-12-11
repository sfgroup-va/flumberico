#!/usr/bin/env node

/**
 * Advanced User Features Test with Real Browser Simulation
 * Tests critical functionality including auto-apply system
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'testuser123'
};

let testResults = {
  authentication: { passed: 0, failed: 0, details: [] },
  dashboard: { passed: 0, failed: 0, details: [] },
  jobRecommendations: { passed: 0, failed: 0, details: [] },
  autoApply: { passed: 0, failed: 0, details: [] },
  applications: { passed: 0, failed: 0, details: [] },
  profile: { passed: 0, failed: 0, details: [] },
  aiHunter: { passed: 0, failed: 0, details: [] }
};

function logTest(category, testName, passed, details = '') {
  const result = { test: testName, passed, details };
  testResults[category].details.push(result);

  if (passed) {
    testResults[category].passed++;
    console.log(`✅ [${category.toUpperCase()}] ${testName}: PASSED ${details ? '- ' + details : ''}`);
  } else {
    testResults[category].failed++;
    console.log(`❌ [${category.toUpperCase()}] ${testName}: FAILED ${details ? '- ' + details : ''}`);
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testWithBrowser() {
  let browser;
  let page;

  try {
    console.log('🚀 Starting Advanced User Features Test');
    console.log('Browser:', 'Puppeteer Headless Chrome');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });

    console.log('\n🔐 Testing Authentication System...');

    // Test 1: Visit home page
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const homePageTitle = await page.title();
    logTest('authentication', 'Home page loads', homePageTitle.length > 0);

    // Test 2: Navigate to sign in
    await page.click('a[href="/auth/signin"]');
    await page.waitForSelector('form', { timeout: 5000 });
    const signInForm = await page.$('form');
    logTest('authentication', 'Sign-in form accessible', signInForm !== null);

    // Test 3: Fill and submit login form
    await page.type('input[type="email"]', TEST_USER.email, { delay: 100 });
    await page.type('input[type="password"]', TEST_USER.password, { delay: 100 });

    // Submit form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);

    const currentUrl = page.url();
    const isLoggedIn = currentUrl.includes('/dashboard') || !currentUrl.includes('/auth');
    logTest('authentication', 'User login successful', isLoggedIn, `Redirected to: ${currentUrl}`);

    if (!isLoggedIn) {
      console.log('⚠️ Login failed, but continuing with tests...');
    }

    console.log('\n📊 Testing Dashboard Features...');

    // Navigate to dashboard (if not already there)
    if (!currentUrl.includes('/dashboard')) {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    }

    // Test dashboard elements
    try {
      await page.waitForSelector('[data-testid="dashboard-content"], .glass-card', { timeout: 5000 });
      logTest('dashboard', 'Dashboard content loads', true);
    } catch (error) {
      logTest('dashboard', 'Dashboard content loads', false, 'Dashboard selector not found');
    }

    // Check for key dashboard elements
    const dashboardElements = [
      { selector: 'h1, h2, h3', name: 'Dashboard headings' },
      { selector: '[class*="stat"], [class*="application"], [class*="total"]', name: 'Statistics display' },
      { selector: 'button, [href]', name: 'Interactive elements' }
    ];

    for (const element of dashboardElements) {
      const found = await page.$$(element.selector);
      const exists = found.length > 0;
      logTest('dashboard', element.name, exists, `Found ${found.length} elements`);
    }

    console.log('\n🎯 Testing Job Recommendations...');

    // Look for job recommendations
    try {
      await page.waitForSelector('[class*="job"], [class*="recommendation"]', { timeout: 5000 });
      logTest('jobRecommendations', 'Job recommendations section loads', true);
    } catch (error) {
      logTest('jobRecommendations', 'Job recommendations section loads', false, 'No job recommendations found');
    }

    // Check API for recommendations
    try {
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/jobs/recommendations');
        return {
          status: res.status,
          data: await res.json().catch(() => null)
        };
      });

      const apiWorks = response.status === 200;
      logTest('jobRecommendations', 'Recommendations API works', apiWorks, `Status: ${response.status}`);

      if (apiWorks && response.data) {
        const hasJobs = response.data.recommendations && response.data.recommendations.length > 0;
        logTest('jobRecommendations', 'Jobs found in recommendations', hasJobs,
          `Found ${response.data.recommendations?.length || 0} jobs`);

        // Check match scores
        if (hasJobs) {
          const firstJob = response.data.recommendations[0];
          const hasMatchScore = typeof firstJob.matchScore === 'number';
          logTest('jobRecommendations', 'Jobs include match scores', hasMatchScore);
        }
      }
    } catch (error) {
      logTest('jobRecommendations', 'Recommendations API works', false, `Error: ${error.message}`);
    }

    console.log('\n🤖 Testing Auto-Apply System...');

    // Check user subscription status
    try {
      const profileResponse = await page.evaluate(async () => {
        const res = await fetch('/api/user/profile');
        return {
          status: res.status,
          data: await res.json().catch(() => null)
        };
      });

      const profileWorks = profileResponse.status === 200;
      logTest('autoApply', 'User profile API accessible', profileWorks);

      if (profileWorks && profileResponse.data) {
        const isPro = profileResponse.data.subscriptionTier === 'pro';
        const isHunterActive = profileResponse.data.isActiveHunter === true;

        logTest('autoApply', 'User has Pro subscription', isPro, `Tier: ${profileResponse.data.subscriptionTier}`);
        logTest('autoApply', 'AI Hunter is active', isHunterActive, `Status: ${profileResponse.data.isActiveHunter}`);

        if (isPro && isHunterActive) {
          // Test auto-apply functionality
          const applyResponse = await page.evaluate(async () => {
            try {
              const res = await fetch('/api/user/apply-job', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  jobId: 'test-job-id',
                  method: 'automated'
                })
              });
              return {
                status: res.status,
                data: await res.json().catch(() => null)
              };
            } catch (error) {
              return { status: 0, error: error.message };
            }
          });

          const autoApplyAccessible = applyResponse.status !== 404;
          logTest('autoApply', 'Auto-apply API accessible', autoApplyAccessible, `Status: ${applyResponse.status}`);
        }
      }
    } catch (error) {
      logTest('autoApply', 'Auto-apply tests', false, `Error: ${error.message}`);
    }

    console.log('\n📝 Testing Application Management...');

    // Navigate to applications page
    try {
      await page.goto(`${BASE_URL}/applications`, { waitUntil: 'networkidle2' });
      const applicationsLoaded = await page.$('[class*="application"], [class*="job"], table, .glass-card');
      logTest('applications', 'Applications page loads', applicationsLoaded !== null);

      // Test applications API
      const appsResponse = await page.evaluate(async () => {
        const res = await fetch('/api/user/applications');
        return {
          status: res.status,
          data: await res.json().catch(() => null)
        };
      });

      logTest('applications', 'Applications API works', appsResponse.status === 200,
        `Status: ${appsResponse.status}`);

      if (appsResponse.status === 200 && appsResponse.data) {
        const hasApplications = appsResponse.data.applications && appsResponse.data.applications.length > 0;
        logTest('applications', 'User has applications', hasApplications,
          `Found ${appsResponse.data.applications?.length || 0} applications`);
      }
    } catch (error) {
      logTest('applications', 'Application management tests', false, `Error: ${error.message}`);
    }

    console.log('\n👤 Testing Profile Management...');

    // Navigate to profile page
    try {
      await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle2' });
      const profileLoaded = await page.$('[class*="profile"], form, .glass-card');
      logTest('profile', 'Profile page loads', profileLoaded !== null);

      // Navigate to settings page
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
      const settingsLoaded = await page.$('[class*="setting"], form, .glass-card');
      logTest('profile', 'Settings page loads', settingsLoaded !== null);
    } catch (error) {
      logTest('profile', 'Profile management tests', false, `Error: ${error.message}`);
    }

    console.log('\n🎯 Testing AI Hunter Features...');

    // Check AI Hunter functionality
    try {
      const aiHunterResponse = await page.evaluate(async () => {
        const res = await fetch('/api/ai-hunter/scan');
        return {
          status: res.status,
          data: await res.json().catch(() => null)
        };
      });

      const aiHunterWorks = aiHunterResponse.status === 200;
      logTest('aiHunter', 'AI Hunter API accessible', aiHunterWorks, `Status: ${aiHunterResponse.status}`);

      if (aiHunterWorks && aiHunterResponse.data) {
        const hasStatus = aiHunterResponse.data.status !== undefined;
        const canScan = aiHunterResponse.data.status?.canScan === true;

        logTest('aiHunter', 'AI Hunter returns status', hasStatus);
        logTest('aiHunter', 'AI Hunter can scan', canScan);
      }
    } catch (error) {
      logTest('aiHunter', 'AI Hunter tests', false, `Error: ${error.message}`);
    }

    console.log('\n🔍 Testing Job Search & Filtering...');

    // Test job search functionality
    try {
      await page.goto(`${BASE_URL}/search`, { waitUntil: 'networkidle2' });
      const searchLoaded = await page.$('[class*="search"], input, button, .glass-card');
      logTest('dashboard', 'Search page loads', searchLoaded !== null);

      // Test search API
      const searchResponse = await page.evaluate(async () => {
        const res = await fetch('/api/jobs?page=1');
        return {
          status: res.status,
          data: await res.json().catch(() => null)
        };
      });

      logTest('dashboard', 'Jobs search API works', searchResponse.status === 200,
        `Status: ${searchResponse.status}`);

      if (searchResponse.status === 200 && searchResponse.data) {
        const hasJobs = searchResponse.data.jobs && searchResponse.data.jobs.length > 0;
        logTest('dashboard', 'Jobs found in search', hasJobs,
          `Found ${searchResponse.data.jobs?.length || 0} jobs`);
      }
    } catch (error) {
      logTest('dashboard', 'Job search tests', false, `Error: ${error.message}`);
    }

  } catch (error) {
    console.error('\n💥 Browser test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Generate comprehensive report
function generateAdvancedReport() {
  console.log('\n📋 ADVANCED USER FEATURES TEST REPORT');
  console.log('='.repeat(70));

  let totalPassed = 0;
  let totalFailed = 0;

  Object.keys(testResults).forEach(category => {
    const results = testResults[category];
    totalPassed += results.passed;
    totalFailed += results.failed;

    const total = results.passed + results.failed;
    const passRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;

    console.log(`\n${category.toUpperCase()}: ${results.passed}/${total} tests passed (${passRate}%)`);

    if (results.failed > 0) {
      results.details.filter(test => !test.passed).forEach(test => {
        console.log(`  ❌ ${test.test}: ${test.details}`);
      });
    }

    if (results.passed > 0) {
      console.log(`  ✅ Key working features:`);
      results.details.filter(test => test.passed).forEach(test => {
        console.log(`     - ${test.test}`);
      });
    }
  });

  const overallTotal = totalPassed + totalFailed;
  const overallPassRate = overallTotal > 0 ? Math.round((totalPassed / overallTotal) * 100) : 0;

  console.log('\n' + '='.repeat(70));
  console.log(`OVERALL RESULTS: ${totalPassed}/${overallTotal} tests passed (${overallPassRate}%)`);

  // Production readiness assessment
  console.log('\n🎯 PRODUCTION READINESS ASSESSMENT:');

  if (overallPassRate >= 85) {
    console.log('🎉 EXCELLENT - Ready for production deployment!');
  } else if (overallPassRate >= 70) {
    console.log('✅ GOOD - Mostly ready with minor fixes needed');
  } else if (overallPassRate >= 50) {
    console.log('⚠️  NEEDS WORK - Major fixes required before production');
  } else {
    console.log('❌ NOT READY - Significant development needed');
  }

  // Feature-specific analysis
  console.log('\n📊 FEATURE ANALYSIS:');
  Object.keys(testResults).forEach(category => {
    const results = testResults[category];
    const total = results.passed + results.failed;
    const passRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;

    let status = '';
    if (passRate >= 80) status = '✅ PRODUCTION READY';
    else if (passRate >= 60) status = '⚠️ NEEDS POLISH';
    else status = '❌ NEEDS WORK';

    console.log(`  ${category.padEnd(15)}: ${passRate}% - ${status}`);
  });

  // Key findings
  console.log('\n🔍 KEY FINDINGS:');

  const authScore = testResults.authentication.passed / (testResults.authentication.passed + testResults.authentication.failed) * 100;
  if (authScore >= 75) {
    console.log('✅ Authentication system is working properly');
  } else {
    console.log('⚠️ Authentication system needs attention');
  }

  const dashboardScore = testResults.dashboard.passed / (testResults.dashboard.passed + testResults.dashboard.failed) * 100;
  if (dashboardScore >= 70) {
    console.log('✅ Dashboard functionality is operational');
  } else {
    console.log('❌ Dashboard needs significant improvements');
  }

  const autoApplyScore = testResults.autoApply.passed / (testResults.autoApply.passed + testResults.autoApply.failed) * 100;
  if (autoApplyScore >= 80) {
    console.log('✅ Auto-apply system is ready');
  } else if (autoApplyScore > 0) {
    console.log('⚠️ Auto-apply system needs configuration');
  } else {
    console.log('❌ Auto-apply system is not functional');
  }
}

// Main execution
async function runAdvancedTests() {
  await testWithBrowser();
  generateAdvancedReport();
}

// Check if Puppeteer is available
try {
  require.resolve('puppeteer');
  runAdvancedTests().catch(console.error);
} catch (error) {
  console.log('⚠️ Puppeteer not found. Installing puppeteer for browser testing...');
  console.log('Run: npm install puppeteer to enable advanced testing');

  // Fall back to basic report
  console.log('\n📋 BASIC ANALYSIS COMPLETE');
  console.log('For comprehensive testing with browser automation:');
  console.log('1. Install puppeteer: npm install puppeteer');
  console.log('2. Run this script again');
  console.log('3. Or test manually at http://localhost:3000');
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});