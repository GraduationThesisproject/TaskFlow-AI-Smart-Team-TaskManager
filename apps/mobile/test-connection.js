#!/usr/bin/env node

/**
 * Test mobile app connection to backend
 */

const http = require('http');

const API_BASE_URL = 'http://192.168.1.142:3001/api';

function testConnection() {
  console.log('🧪 Testing mobile app connection to backend...');
  console.log(`📡 Backend URL: ${API_BASE_URL}`);
  
  const options = {
    hostname: '192.168.1.142',
    port: 3001,
    path: '/api/workspaces',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Platform': 'android',
      'X-App-Version': '1.0.0',
      'X-Device-Id': 'test-device'
    },
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`✅ Connection successful!`);
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📄 Response: ${data}`);
      
      if (res.statusCode === 200) {
        console.log('🎉 Backend is accessible from mobile app!');
      } else if (res.statusCode === 401) {
        console.log('🔐 Authentication required (this is expected)');
      } else {
        console.log('⚠️ Unexpected status code');
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Connection failed: ${error.message}`);
    console.log('🔧 Troubleshooting:');
    console.log('  • Check if backend is running on 192.168.1.142:3001');
    console.log('  • Verify WiFi connection');
    console.log('  • Check firewall settings');
  });

  req.on('timeout', () => {
    console.log('⏰ Connection timeout');
    req.destroy();
  });

  req.end();
}

// Run the test
testConnection();
