#!/usr/bin/env node

/**
 * TaskFlow API Testing Script
 * Tests the backend API endpoints to ensure they're working correctly
 */

const http = require('http');
const https = require('https');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TIMEOUT = 5000;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: TIMEOUT,
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data,
            parseError: error.message,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    log(`\n🔍 Testing ${name}...`, 'cyan');
    log(`   URL: ${url}`, 'blue');
    
    const response = await makeRequest(url);
    
    if (response.status === expectedStatus) {
      log(`   ✅ Status: ${response.status} (Expected: ${expectedStatus})`, 'green');
      
      if (response.data) {
        log(`   📊 Response: ${JSON.stringify(response.data, null, 2)}`, 'magenta');
      } else if (response.rawData) {
        log(`   📄 Raw Response: ${response.rawData}`, 'magenta');
      }
      
      return { success: true, response };
    } else {
      log(`   ❌ Status: ${response.status} (Expected: ${expectedStatus})`, 'red');
      if (response.rawData) {
        log(`   📄 Response: ${response.rawData}`, 'yellow');
      }
      return { success: false, response };
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return { success: false, error };
  }
}

async function runTests() {
  log('🚀 TaskFlow API Testing Suite', 'bright');
  log('===============================', 'bright');
  
  const tests = [
    {
      name: 'Health Check',
      url: `${API_BASE_URL}/health`,
      expectedStatus: 200,
    },
    {
      name: 'Workspaces List',
      url: `${API_BASE_URL}/workspaces`,
      expectedStatus: 200,
    },
    {
      name: 'Analytics Data',
      url: `${API_BASE_URL}/analytics`,
      expectedStatus: 200,
    },
    {
      name: 'Templates List',
      url: `${API_BASE_URL}/templates`,
      expectedStatus: 200,
    },
    {
      name: 'Auth Status',
      url: `${API_BASE_URL}/auth/status`,
      expectedStatus: 200,
    },
  ];

  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url, test.expectedStatus);
    results.push({ ...test, ...result });
  }

  // Summary
  log('\n📊 Test Summary', 'bright');
  log('================', 'bright');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');
  log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`, 'cyan');

  if (failed > 0) {
    log('\n🔧 Troubleshooting Tips:', 'yellow');
    log('• Ensure backend is running on port 3000', 'yellow');
    log('• Check if MongoDB is running', 'yellow');
    log('• Verify API routes are properly configured', 'yellow');
    log('• Check backend logs for errors', 'yellow');
  }

  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().then((results) => {
    const hasFailures = results.some(r => !r.success);
    process.exit(hasFailures ? 1 : 0);
  }).catch((error) => {
    log(`💥 Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint };
