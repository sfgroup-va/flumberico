// Test script to verify dashboard API endpoints
const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testDashboardAPIs() {
  console.log('🧪 Testing Dashboard API Endpoints...\n');

  // Test 1: Check if server is running
  try {
    console.log('1. Testing server connectivity...');
    const response = await makeRequest('/');
    if (response.statusCode === 200) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server response:', response.statusCode);
    }
  } catch (error) {
    console.log('❌ Server is not accessible:', error.message);
    return;
  }

  // Test 2: Test user profile API (will fail without authentication, but should not crash)
  try {
    console.log('\n2. Testing /api/user/profile endpoint...');
    const response = await makeRequest('/api/user/profile');
    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 401) {
      console.log('✅ Authentication is properly enforced');
    } else {
      console.log('❌ Expected 401 Unauthorized');
    }
  } catch (error) {
    console.log('❌ Error accessing profile API:', error.message);
  }

  // Test 3: Test user stats API
  try {
    console.log('\n3. Testing /api/user/stats endpoint...');
    const response = await makeRequest('/api/user/stats');
    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 401) {
      console.log('✅ Authentication is properly enforced');
    } else {
      console.log('❌ Expected 401 Unauthorized');
    }
  } catch (error) {
    console.log('❌ Error accessing stats API:', error.message);
  }

  // Test 4: Test user applications API
  try {
    console.log('\n4. Testing /api/user/applications endpoint...');
    const response = await makeRequest('/api/user/applications');
    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 401) {
      console.log('✅ Authentication is properly enforced');
    } else {
      console.log('❌ Expected 401 Unauthorized');
    }
  } catch (error) {
    console.log('❌ Error accessing applications API:', error.message);
  }

  // Test 5: Test jobs API (public endpoint)
  try {
    console.log('\n5. Testing /api/jobs endpoint...');
    const response = await makeRequest('/api/jobs');
    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 200) {
      console.log('✅ Jobs API is accessible');
      if (response.data && Array.isArray(response.data.jobs)) {
        console.log(`✅ Found ${response.data.jobs.length} jobs in the database`);
      }
    } else {
      console.log('❌ Jobs API error:', response.statusCode);
    }
  } catch (error) {
    console.log('❌ Error accessing jobs API:', error.message);
  }

  // Test 6: Test locations API (public endpoint)
  try {
    console.log('\n6. Testing /api/locations endpoint...');
    const response = await makeRequest('/api/locations');
    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 200) {
      console.log('✅ Locations API is accessible');
      if (response.data && Array.isArray(response.data.locations)) {
        console.log(`✅ Found ${response.data.locations.length} locations`);
      }
    } else {
      console.log('❌ Locations API error:', response.statusCode);
    }
  } catch (error) {
    console.log('❌ Error accessing locations API:', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Visit http://localhost:3001/auth/signin');
  console.log('2. Login with test user:');
  console.log('   Email: testuser@example.com');
  console.log('   Password: testuser123');
  console.log('3. Access the dashboard at http://localhost:3001/dashboard');
}

testDashboardAPIs().catch(console.error);