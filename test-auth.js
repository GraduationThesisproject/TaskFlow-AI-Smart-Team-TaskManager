// Test script to verify authentication and API endpoints
const API_BASE_URL = 'http://localhost:3001/api';

// Test 1: Check if backend is accessible
async function testBackendAccess() {
  console.log('🔍 Testing backend access...');
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('✅ Backend is accessible');
    console.log('Status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    return true;
  } catch (error) {
    console.error('❌ Backend is not accessible:', error.message);
    return false;
  }
}

// Test 2: Check authentication without token
async function testAuthWithoutToken() {
  console.log('\n🔍 Testing authentication without token...');
  try {
    const response = await fetch(`${API_BASE_URL}/board-templates/admin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    return response.status === 401;
  } catch (error) {
    console.error('❌ Error testing auth without token:', error.message);
    return false;
  }
}

// Test 3: Check authentication with invalid token
async function testAuthWithInvalidToken() {
  console.log('\n🔍 Testing authentication with invalid token...');
  try {
    const response = await fetch(`${API_BASE_URL}/board-templates/admin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-123'
      }
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    return response.status === 401;
  } catch (error) {
    console.error('❌ Error testing auth with invalid token:', error.message);
    return false;
  }
}

// Test 4: Check board templates endpoint structure
async function testBoardTemplatesEndpoint() {
  console.log('\n🔍 Testing board templates endpoint structure...');
  try {
    const response = await fetch(`${API_BASE_URL}/board-templates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Public endpoint accessible');
      console.log('Response structure:', Object.keys(data));
      console.log('Response preview:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    } else {
      console.log('❌ Public endpoint not accessible');
      const data = await response.json();
      console.log('Error response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error testing board templates endpoint:', error.message);
  }
}

// Test 5: Check admin authentication endpoint
async function testAdminAuthEndpoint() {
  console.log('\n🔍 Testing admin authentication endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response structure:', Object.keys(data));
    console.log('Response:', JSON.stringify(data, null, 2));
    return response.status === 400 || response.status === 401; // Expected for invalid credentials
  } catch (error) {
    console.error('❌ Error testing admin auth endpoint:', error.message);
    return false;
  }
}

// Test 6: Check the specific endpoint that's failing
async function testFailingEndpoint() {
  console.log('\n🔍 Testing the specific failing endpoint...');
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
    return response.status === 401;
  } catch (error) {
    console.error('❌ Error testing failing endpoint:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting authentication tests...\n');
  
  const tests = [
    { name: 'Backend Access', fn: testBackendAccess },
    { name: 'Auth Without Token', fn: testAuthWithoutToken },
    { name: 'Auth With Invalid Token', fn: testAuthWithInvalidToken },
    { name: 'Board Templates Endpoint', fn: testBoardTemplatesEndpoint },
    { name: 'Admin Auth Endpoint', fn: testAdminAuthEndpoint },
    { name: 'Failing Endpoint', fn: testFailingEndpoint }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Running: ${test.name}`);
      console.log(`${'='.repeat(50)}`);
      const result = await test.fn();
      if (result !== false) {
        passed++;
      }
    } catch (error) {
      console.error(`❌ Test "${test.name}" failed:`, error.message);
    }
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed. Check the output above for details.');
  }
}

// Run tests
runTests().catch(console.error);
