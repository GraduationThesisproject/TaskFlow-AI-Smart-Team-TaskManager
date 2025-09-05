// Test script to debug authentication issues
const API_BASE_URL = 'http://192.168.1.142:3001/api';

console.log('🔐 Testing Authentication Debug');
console.log('================================');
console.log(`📡 API Base URL: ${API_BASE_URL}`);
console.log('');

// Test 1: Check if auth endpoints exist
async function testAuthEndpoints() {
  console.log('1️⃣ Testing auth endpoints...');
  
  const endpoints = [
    '/auth/login',
    '/auth/register', 
    '/auth/me',
    '/auth/refresh'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const status = response.status;
      const statusText = response.statusText;
      
      if (status === 401) {
        console.log(`✅ ${endpoint}: Protected endpoint (401 Unauthorized) - This is expected`);
      } else if (status === 404) {
        console.log(`❌ ${endpoint}: Not found (404)`);
      } else if (status === 405) {
        console.log(`✅ ${endpoint}: Method not allowed (405) - Endpoint exists but wrong method`);
      } else {
        console.log(`ℹ️  ${endpoint}: ${status} ${statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

// Test 2: Test login with invalid credentials (should get 401)
async function testInvalidLogin() {
  console.log('\n2️⃣ Testing invalid login (should get 401)...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    });
    
    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    if (status === 401) {
      console.log('✅ Invalid login correctly returns 401 Unauthorized');
      console.log(`   Error message: ${data.message || 'Unauthorized'}`);
    } else {
      console.log(`❌ Expected 401, got ${status}`);
      console.log(`   Response: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`❌ Login test failed: ${error.message}`);
  }
}

// Test 3: Test login with valid credentials (if you have them)
async function testValidLogin() {
  console.log('\n3️⃣ Testing valid login...');
  console.log('   (Skipping - requires valid credentials)');
  console.log('   To test this, provide valid email/password in the script');
  
  // Uncomment and fill in your test credentials:
  /*
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'your-test-email@example.com',
        password: 'your-test-password'
      })
    });
    
    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    if (status === 200) {
      console.log('✅ Valid login successful');
      console.log(`   Token received: ${data.data?.token ? 'Yes' : 'No'}`);
      return data.data?.token;
    } else {
      console.log(`❌ Login failed with status ${status}`);
      console.log(`   Error: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Login test failed: ${error.message}`);
  }
  */
}

// Test 4: Test protected endpoint without token
async function testProtectedEndpoint() {
  console.log('\n4️⃣ Testing protected endpoint without token...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header - should get 401
      }
    });
    
    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    if (status === 401) {
      console.log('✅ Protected endpoint correctly requires authentication (401)');
      console.log(`   Error message: ${data.message || 'Unauthorized'}`);
    } else {
      console.log(`❌ Expected 401, got ${status}`);
      console.log(`   Response: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`❌ Protected endpoint test failed: ${error.message}`);
  }
}

// Test 5: Test protected endpoint with invalid token
async function testInvalidToken() {
  console.log('\n5️⃣ Testing protected endpoint with invalid token...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-12345'
      }
    });
    
    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    if (status === 401) {
      console.log('✅ Invalid token correctly rejected (401)');
      console.log(`   Error message: ${data.message || 'Unauthorized'}`);
    } else {
      console.log(`❌ Expected 401, got ${status}`);
      console.log(`   Response: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`❌ Invalid token test failed: ${error.message}`);
  }
}

// Run all tests
async function runAuthTests() {
  console.log('🚀 Starting authentication tests...\n');
  
  await testAuthEndpoints();
  await testInvalidLogin();
  await testValidLogin();
  await testProtectedEndpoint();
  await testInvalidToken();
  
  console.log('\n📊 Authentication Test Summary:');
  console.log('================================');
  console.log('✅ 401 errors are EXPECTED for:');
  console.log('   • Invalid login credentials');
  console.log('   • Protected endpoints without token');
  console.log('   • Protected endpoints with invalid token');
  console.log('');
  console.log('🔧 Next Steps:');
  console.log('   1. Make sure you are logged in to the mobile app');
  console.log('   2. Check if the token is being stored in AsyncStorage');
  console.log('   3. Verify the token is being sent in Authorization header');
  console.log('   4. Check if the token has expired');
  console.log('');
  console.log('💡 The 401 error means your app is connecting successfully!');
  console.log('   The issue is likely with authentication token handling.');
}

// Run the tests
runAuthTests().catch(console.error);
