// Comprehensive authentication test script
const API_BASE_URL = 'http://localhost:3001/api';

console.log('🚀 Starting comprehensive authentication test...\n');

// Test 1: Check backend connectivity
async function testBackendConnectivity() {
  console.log('='.repeat(60));
  console.log('TEST 1: Backend Connectivity');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/me`);
    console.log('✅ Backend is accessible');
    console.log('Status:', response.status);
    console.log('Response:', await response.json());
    return true;
  } catch (error) {
    console.error('❌ Backend connectivity failed:', error.message);
    return false;
  }
}

// Test 2: Test admin login endpoint
async function testAdminLogin() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Admin Login Endpoint');
  console.log('='.repeat(60));
  
  // Test with multiple admin credentials from the seeder
  const adminCredentials = [
    { email: 'admin@admin.com', password: 'admin123!', description: 'Main Super Admin' },
    { email: 'admin@taskflow.com', password: 'Admin123!', description: 'Default Admin User' },
    { email: 'moderator@taskflow.com', password: 'Moderator123!', description: 'Moderator User' },
    { email: 'viewer@taskflow.com', password: 'Viewer123!', description: 'Viewer User' }
  ];
  
  for (const creds of adminCredentials) {
    console.log(`\n🔍 Testing with: ${creds.description} (${creds.email})`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: creds.email,
          password: creds.password
        })
      });
      
      console.log('Status:', response.status);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
      
      if (response.ok && data.data?.token) {
        console.log(`✅ Login successful with ${creds.description}!`);
        console.log('Token received:', data.data.token.substring(0, 20) + '...');
        return data.data.token;
      } else {
        console.log(`❌ Login failed with ${creds.description}`);
      }
    } catch (error) {
      console.error(`❌ Login request failed for ${creds.description}:`, error.message);
    }
  }
  
  console.log('\n❌ All admin login attempts failed');
  return null;
}

// Test 3: Test board templates admin endpoint with token
async function testBoardTemplatesWithToken(token) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Board Templates Admin Endpoint (with token)');
  console.log('='.repeat(60));
  
  if (!token) {
    console.log('❌ No token provided, skipping test');
    return false;
  }
  
  try {
    console.log('🔍 Testing with token:', token.substring(0, 20) + '...');
    
    const response = await fetch(`${API_BASE_URL}/board-templates/admin?status=active&page=1&limit=20`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Board templates admin endpoint accessible with token');
      return true;
    } else {
      console.log('❌ Board templates admin endpoint failed with token');
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

// Test 4: Test board templates stats endpoint with token
async function testBoardTemplatesStatsWithToken(token) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Board Templates Stats Endpoint (with token)');
  console.log('='.repeat(60));
  
  if (!token) {
    console.log('❌ No token provided, skipping test');
    return false;
  }
  
  try {
    console.log('🔍 Testing with token:', token.substring(0, 20) + '...');
    
    const response = await fetch(`${API_BASE_URL}/board-templates/admin/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Board templates stats endpoint accessible with token');
      return true;
    } else {
      console.log('❌ Board templates stats endpoint failed with token');
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

// Test 5: Test without token (should fail)
async function testBoardTemplatesWithoutToken() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: Board Templates Admin Endpoint (without token)');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE_URL}/board-templates/admin?status=active&page=1&limit=20`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Correctly rejected without token (401)');
      return true;
    } else {
      console.log('❌ Unexpected response without token');
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

// Test 6: Test with invalid token
async function testBoardTemplatesWithInvalidToken() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 6: Board Templates Admin Endpoint (with invalid token)');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE_URL}/board-templates/admin?status=active&page=1&limit=20`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token-123',
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Correctly rejected with invalid token (401)');
      return true;
    } else {
      console.log('❌ Unexpected response with invalid token');
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

// Test 7: Check environment configuration
function testEnvironmentConfig() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 7: Environment Configuration');
  console.log('='.repeat(60));
  
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Expected backend URL: http://localhost:3001/api');
  console.log('Current frontend port: 5175 (from error logs)');
  
  if (API_BASE_URL === 'http://localhost:3001/api') {
    console.log('✅ API_BASE_URL is correctly configured');
    return true;
  } else {
    console.log('❌ API_BASE_URL is incorrectly configured');
    console.log('This is likely the root cause of the 401 errors!');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🔍 Running comprehensive authentication tests...\n');
  
  const results = {
    backendConnectivity: false,
    adminLogin: false,
    boardTemplatesWithToken: false,
    boardTemplatesStatsWithToken: false,
    boardTemplatesWithoutToken: false,
    boardTemplatesWithInvalidToken: false,
    environmentConfig: false
  };
  
  try {
    // Test 1: Backend connectivity
    results.backendConnectivity = await testBackendConnectivity();
    
    // Test 2: Admin login
    const token = await testAdminLogin();
    results.adminLogin = !!token;
    
    // Test 3: Board templates with token
    if (token) {
      results.boardTemplatesWithToken = await testBoardTemplatesWithToken(token);
    }
    
    // Test 4: Board templates stats with token
    if (token) {
      results.boardTemplatesStatsWithToken = await testBoardTemplatesStatsWithToken(token);
    }
    
    // Test 5: Board templates without token
    results.boardTemplatesWithoutToken = await testBoardTemplatesWithoutToken();
    
    // Test 6: Board templates with invalid token
    results.boardTemplatesWithInvalidToken = await testBoardTemplatesWithInvalidToken();
    
    // Test 7: Environment configuration
    results.environmentConfig = testEnvironmentConfig();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 Overall Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The authentication system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
    
    if (!results.environmentConfig) {
      console.log('\n🚨 CRITICAL ISSUE: Environment configuration is incorrect!');
      console.log('The frontend is trying to make API calls to the wrong URL.');
      console.log('Fix the VITE_API_BASE_URL in the .env file or env.ts configuration.');
    }
  }
}

// Run all tests
runAllTests().catch(console.error);
