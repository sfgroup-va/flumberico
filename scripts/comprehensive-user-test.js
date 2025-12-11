#!/usr/bin/env node

/**
 * Comprehensive User Features Test Script
 * Tests all user-facing functionality of the job board application
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let testResults = {
  authentication: { passed: 0, failed: 0, details: [] },
  dashboard: { passed: 0, failed: 0, details: [] },
  jobSearch: { passed: 0, failed: 0, details: [] },
  recommendations: { passed: 0, failed: 0, details: [] },
  applications: { passed: 0, failed: 0, details: [] },
  profile: { passed: 0, failed: 0, details: [] },
  subscription: { passed: 0, failed: 0, details: [] },
  navigation: { passed: 0, failed: 0, details: [] }
};

let sessionCookie = null;

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Comprehensive-Test-Script/1.0'
      }
    };

    if (sessionCookie) {
      defaultOptions.headers['Cookie'] = sessionCookie;
    }

    const finalOptions = { ...defaultOptions, ...options };

    const req = http.request(finalOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          cookies: res.headers['set-cookie']
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Test logging function
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

// Test Authentication System
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication System...');

  try {
    // Test 1: Check sign-in page loads
    const signInPage = await makeRequest('/auth/signin');
    logTest('authentication', 'Sign-in page loads',
      signInPage.statusCode === 200,
      `Status: ${signInPage.statusCode}`
    );

    // Test 2: Check sign-up page loads
    const signUpPage = await makeRequest('/auth/signup');
    logTest('authentication', 'Sign-up page loads',
      signUpPage.statusCode === 200,
      `Status: ${signUpPage.statusCode}`
    );

    // Test 3: Test login with valid credentials
    const loginResponse = await makeRequest('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testuser123'
      })
    });

    // Extract session cookie
    if (loginResponse.cookies) {
      sessionCookie = loginResponse.cookies.find(cookie =>
        cookie.includes('next-auth.session-token')
      );
      if (sessionCookie) {
        sessionCookie = sessionCookie.split(';')[0];
      }
    }

    logTest('authentication', 'User login successful',
      loginResponse.statusCode === 200 && sessionCookie !== null,
      `Status: ${loginResponse.statusCode}, Session: ${sessionCookie ? 'Received' : 'Not received'}`
    );

    // Test 4: Test protected route redirect when not authenticated
    const dashboardRedirect = await makeRequest('/dashboard');
    logTest('authentication', 'Protected route redirect works',
      dashboardRedirect.statusCode === 307,
      `Status: ${dashboardRedirect.statusCode}`
    );

  } catch (error) {
    logTest('authentication', 'Authentication tests', false, `Error: ${error.message}`);
  }
}

// Test Dashboard Features
async function testDashboard() {
  console.log('\n📊 Testing Dashboard Features...');

  try {
    // Test 1: Dashboard loads with authentication
    const dashboardResponse = await makeRequest('/dashboard');
    logTest('dashboard', 'Dashboard loads authenticated',
      dashboardResponse.statusCode === 200,
      `Status: ${dashboardResponse.statusCode}`
    );

    // Test 2: Dashboard contains key elements
    const dashboardContent = dashboardResponse.body.toLowerCase();
    const hasCommandCenter = dashboardContent.includes('command center');
    const hasStats = dashboardContent.includes('total applications');
    const hasRecommendations = dashboardContent.includes('jobs for you');

    logTest('dashboard', 'Dashboard shows command center', hasCommandCenter);
    logTest('dashboard', 'Dashboard displays statistics', hasStats);
    logTest('dashboard', 'Dashboard has job recommendations', hasRecommendations);

    // Test 3: API endpoints for user stats
    const statsResponse = await makeRequest('/api/user/stats');
    logTest('dashboard', 'User stats API works',
      statsResponse.statusCode === 200,
      `Status: ${statsResponse.statusCode}`
    );

    // Test 4: API endpoint for user profile
    const profileResponse = await makeRequest('/api/user/profile');
    logTest('dashboard', 'User profile API works',
      profileResponse.statusCode === 200,
      `Status: ${profileResponse.statusCode}`
    );

  } catch (error) {
    logTest('dashboard', 'Dashboard tests', false, `Error: ${error.message}`);
  }
}

// Test Job Search & Navigation
async function testJobSearch() {
  console.log('\n🔍 Testing Job Search & Navigation...');

  try {
    // Test 1: Main jobs page loads
    const jobsPage = await makeRequest('/');
    logTest('jobSearch', 'Main jobs page loads',
      jobsPage.statusCode === 200,
      `Status: ${jobsPage.statusCode}`
    );

    // Test 2: Search page loads
    const searchPage = await makeRequest('/search');
    logTest('jobSearch', 'Search page loads',
      searchPage.statusCode === 200,
      `Status: ${searchPage.statusCode}`
    );

    // Test 3: Jobs API endpoint
    const jobsApi = await makeRequest('/api/jobs');
    logTest('jobSearch', 'Jobs API endpoint works',
      jobsApi.statusCode === 200,
      `Status: ${jobsApi.statusCode}`
    );

    // Test 4: Job recommendations API
    const recommendationsApi = await makeRequest('/api/jobs/recommendations');
    logTest('jobSearch', 'Job recommendations API works',
      recommendationsApi.statusCode === 200,
      `Status: ${recommendationsApi.statusCode}`
    );

  } catch (error) {
    logTest('jobSearch', 'Job search tests', false, `Error: ${error.message}`);
  }
}

// Test Job Recommendations System
async function testRecommendations() {
  console.log('\n🎯 Testing Job Recommendations System...');

  try {
    // Test 1: Recommendations API response structure
    const recommendationsResponse = await makeRequest('/api/jobs/recommendations');

    let recommendationsData = null;
    try {
      recommendationsData = JSON.parse(recommendationsResponse.body);
    } catch (e) {
      // JSON parse failed, might be HTML
    }

    const hasValidStructure = recommendationsData &&
      Array.isArray(recommendationsData.recommendations) &&
      typeof recommendationsData.dailyLimit === 'number';

    logTest('recommendations', 'Recommendations API returns valid structure',
      hasValidStructure,
      recommendationsData ? `Found ${recommendationsData.recommendations?.length || 0} jobs` : 'Invalid response'
    );

    // Test 2: Check if recommendations include match scores
    if (hasValidStructure && recommendationsData.recommendations.length > 0) {
      const firstJob = recommendationsData.recommendations[0];
      const hasMatchScore = typeof firstJob.matchScore === 'number';
      const hasMatchReasons = Array.isArray(firstJob.matchReasons);

      logTest('recommendations', 'Jobs include match scores', hasMatchScore);
      logTest('recommendations', 'Jobs include match reasons', hasMatchReasons);
    }

  } catch (error) {
    logTest('recommendations', 'Recommendations tests', false, `Error: ${error.message}`);
  }
}

// Test Applications System
async function testApplications() {
  console.log('\n📝 Testing Applications System...');

  try {
    // Test 1: Applications page loads
    const applicationsPage = await makeRequest('/applications');
    logTest('applications', 'Applications page loads',
      applicationsPage.statusCode === 200,
      `Status: ${applicationsPage.statusCode}`
    );

    // Test 2: Apply job API endpoint structure
    const applyJobResponse = await makeRequest('/api/user/apply-job', {
      method: 'POST',
      body: JSON.stringify({ jobId: 'test-job-id', method: 'manual' })
    });

    // Should return error for invalid job, but API should be accessible
    const apiAccessible = applyJobResponse.statusCode !== 404;
    logTest('applications', 'Apply job API accessible',
      apiAccessible,
      `Status: ${applyJobResponse.statusCode}`
    );

    // Test 3: User applications API
    const userAppsResponse = await makeRequest('/api/user/applications');
    logTest('applications', 'User applications API works',
      userAppsResponse.statusCode === 200,
      `Status: ${userAppsResponse.statusCode}`
    );

  } catch (error) {
    logTest('applications', 'Applications tests', false, `Error: ${error.message}`);
  }
}

// Test Profile Management
async function testProfile() {
  console.log('\n👤 Testing Profile Management...');

  try {
    // Test 1: Profile page loads
    const profilePage = await makeRequest('/profile');
    logTest('profile', 'Profile page loads',
      profilePage.statusCode === 200,
      `Status: ${profilePage.statusCode}`
    );

    // Test 2: Settings page loads
    const settingsPage = await makeRequest('/settings');
    logTest('profile', 'Settings page loads',
      settingsPage.statusCode === 200,
      `Status: ${settingsPage.statusCode}`
    );

    // Test 3: Profile update API
    const profileUpdateResponse = await makeRequest('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: 'Test User Updated',
        bio: 'Updated bio for testing'
      })
    });

    const apiAccessible = profileUpdateResponse.statusCode !== 404;
    logTest('profile', 'Profile update API accessible',
      apiAccessible,
      `Status: ${profileUpdateResponse.statusCode}`
    );

  } catch (error) {
    logTest('profile', 'Profile tests', false, `Error: ${error.message}`);
  }
}

// Test Subscription System
async function testSubscription() {
  console.log('\n💳 Testing Subscription System...');

  try {
    // Test 1: Pricing page loads
    const pricingPage = await makeRequest('/pricing');
    logTest('subscription', 'Pricing page loads',
      pricingPage.statusCode === 200,
      `Status: ${pricingPage.statusCode}`
    );

    // Test 2: Upgrade page loads
    const upgradePage = await makeRequest('/upgrade');
    logTest('subscription', 'Upgrade page loads',
      upgradePage.statusCode === 200,
      `Status: ${upgradePage.statusCode}`
    );

    // Test 3: User subscription status API
    const subscriptionResponse = await makeRequest('/api/subscription/portal');

    // May redirect or return error, but should be accessible
    const apiAccessible = subscriptionResponse.statusCode !== 404;
    logTest('subscription', 'Subscription API accessible',
      apiAccessible,
      `Status: ${subscriptionResponse.statusCode}`
    );

  } catch (error) {
    logTest('subscription', 'Subscription tests', false, `Error: ${error.message}`);
  }
}

// Test Navigation & Routing
async function testNavigation() {
  console.log('\n🧭 Testing Navigation & Routing...');

  const routes = [
    { path: '/', name: 'Home page' },
    { path: '/about', name: 'About page' },
    { path: '/contact', name: 'Contact page' },
    { path: '/how-it-works', name: 'How it works page' },
    { path: '/terms', name: 'Terms page' },
    { path: '/privacy', name: 'Privacy page' },
    { path: '/disclaimer', name: 'Disclaimer page' },
    { path: '/onboarding', name: 'Onboarding page' },
    { path: '/analytics', name: 'Analytics page' },
    { path: '/preferences', name: 'Preferences page' }
  ];

  try {
    for (const route of routes) {
      const response = await makeRequest(route.path);
      const success = response.statusCode === 200 || response.statusCode === 307;
      logTest('navigation', route.name, success,
        `Status: ${response.statusCode}`
      );
    }

  } catch (error) {
    logTest('navigation', 'Navigation tests', false, `Error: ${error.message}`);
  }
}

// Generate comprehensive report
function generateReport() {
  console.log('\n📋 COMPREHENSIVE USER FEATURES TEST REPORT');
  console.log('='.repeat(60));

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
  });

  const overallTotal = totalPassed + totalFailed;
  const overallPassRate = overallTotal > 0 ? Math.round((totalPassed / overallTotal) * 100) : 0;

  console.log('\n' + '='.repeat(60));
  console.log(`OVERALL RESULTS: ${totalPassed}/${overallTotal} tests passed (${overallPassRate}%)`);

  if (overallPassRate >= 90) {
    console.log('🎉 EXCELLENT: Application is ready for production!');
  } else if (overallPassRate >= 75) {
    console.log('✅ GOOD: Application is mostly functional');
  } else if (overallPassRate >= 50) {
    console.log('⚠️  FAIR: Application has some issues to fix');
  } else {
    console.log('❌ POOR: Application needs significant fixes');
  }

  console.log('\n📊 Category Summary:');
  Object.keys(testResults).forEach(category => {
    const results = testResults[category];
    const total = results.passed + results.failed;
    const passRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;
    const status = passRate >= 80 ? '✅' : passRate >= 60 ? '⚠️' : '❌';
    console.log(`  ${status} ${category}: ${passRate}%`);
  });
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Comprehensive User Features Test');
  console.log('Testing URL:', BASE_URL);

  try {
    await testAuthentication();
    await testDashboard();
    await testJobSearch();
    await testRecommendations();
    await testApplications();
    await testProfile();
    await testSubscription();
    await testNavigation();

    generateReport();

  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(console.error);