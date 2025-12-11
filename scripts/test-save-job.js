const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Testing Save Job Functionality\n');

async function testSaveJobAPI() {
  try {
    console.log('1. Testing POST /api/user/save-job with proper payload...');

    const response = await fetch('http://localhost:3000/api/user/save-job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: 1,
        action: 'save'
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.status === 401) {
      console.log('❌ Expected: User not authenticated');
      console.log('💡 This is normal when not logged in');
    } else if (response.status === 400) {
      console.log('❌ Bad Request - Possible issues:');
      console.log('   - Missing jobId or action');
      console.log('   - Invalid data types');
    } else if (response.status === 200) {
      console.log('✅ Success!');
    }

    console.log('\n2. Testing POST /api/user/save-job/check...');

    const checkResponse = await fetch('http://localhost:3000/api/user/save-job/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId: 1 }),
    });

    const checkData = await checkResponse.json();
    console.log('Check response status:', checkResponse.status);
    console.log('Check response data:', checkData);

    console.log('\n3. Testing GET /api/user/save-job...');

    const getResponse = await fetch('http://localhost:3000/api/user/save-job');
    const getData = await getResponse.json();
    console.log('GET response status:', getResponse.status);
    console.log('GET response data:', getData);

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

function testUserAuthentication() {
  console.log('\n🔐 Checking user authentication status...');

  fetch('http://localhost:3000/api/auth/session')
    .then(response => response.json())
    .then(session => {
      console.log('Session data:', session);
      if (session?.user?.id) {
        console.log('✅ User is authenticated');
        console.log('User ID:', session.user.id);
        console.log('User email:', session.user.email);
      } else {
        console.log('❌ User not authenticated');
        console.log('💡 Please sign in to test save job functionality');
      }
    })
    .catch(error => console.error('Error checking session:', error));
}

function testDatabaseConnection() {
  console.log('\n🗄️  Testing database connection...');

  fetch('http://localhost:3000/api/health')
    .then(response => response.json())
    .then(health => {
      console.log('Health check:', health);
      if (health.status === 'ok') {
        console.log('✅ Database connection appears healthy');
      } else {
        console.log('❌ Database connection issues');
      }
    })
    .catch(error => console.error('Error checking health:', error));
}

// Run all tests
console.log('Starting comprehensive save job functionality test...\n');

testDatabaseConnection();
testUserAuthentication();
setTimeout(testSaveJobAPI, 1000);

setTimeout(() => {
  console.log('\n🎯 Test Summary:');
  console.log('1. If you see 401 errors, please sign in first');
  console.log('2. If you see 400 errors, check API payload format');
  console.log('3. If you see 500 errors, check server logs');
  console.log('\n📝 Next steps:');
  console.log('- Open browser and sign in');
  console.log('- Navigate to a job page');
  console.log('- Try clicking the Save button');
  console.log('- Check browser console for any errors');

  rl.close();
}, 3000);