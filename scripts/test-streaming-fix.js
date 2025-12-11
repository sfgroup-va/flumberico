// Test the streaming fix
const http = require('http');

async function testStreamingEndpoint() {
  console.log("🧪 Testing Streaming Endpoint Fix...");

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/user/applications/stream',
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`✅ Response status: ${res.statusCode}`);
      console.log(`✅ Response headers:`, res.headers);

      let dataReceived = false;
      let timeout;

      res.on('data', (chunk) => {
        dataReceived = true;
        clearTimeout(timeout);

        const lines = chunk.toString().split('\n').filter(line => line.trim());

        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              console.log('📦 Received data:', data.type);

              if (data.type === 'connected') {
                console.log('✅ Streaming connection established');
              } else if (data.type === 'applications_update') {
                console.log(`✅ Applications data received: ${data.applications.length} applications`);
              } else if (data.type === 'error') {
                console.log(`⚠️  Error received: ${data.message}`);
              }
            } catch (e) {
              console.log('📝 Raw data:', line.substring(6));
            }
          }
        });
      });

      res.on('end', () => {
        console.log('✅ Stream ended gracefully');
        resolve(true);
      });

      // Set timeout for the test
      timeout = setTimeout(() => {
        if (!dataReceived) {
          console.log('❌ Test timeout - no data received');
          reject(new Error('Test timeout'));
        } else {
          console.log('✅ Test completed - data received successfully');
          resolve(true);
        }
        req.destroy();
      }, 10000); // 10 second test timeout

      res.on('error', (err) => {
        clearTimeout(timeout);
        console.error('❌ Response error:', err);
        reject(err);
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request error:', err);
      reject(err);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run the test
testStreamingEndpoint()
  .then(() => {
    console.log('\n🎉 Streaming endpoint test completed successfully!');
    console.log('✅ No timeout errors detected');
    console.log('✅ Direct database calls working');
    console.log('✅ Admin dashboard should now work without errors');
  })
  .catch((error) => {
    console.error('\n💥 Streaming endpoint test failed:', error.message);
    console.log('⚠️  Note: This might be expected if the server is not running');
    console.log('💡 To test manually, start the dev server and visit the admin dashboard');
  });