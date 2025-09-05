// Debug script to check authentication state
const API_BASE_URL = 'http://192.168.1.142:3001/api';

console.log('🔐 Debugging Authentication State');
console.log('=================================');
console.log(`📡 API Base URL: ${API_BASE_URL}`);
console.log('');

// Test 1: Check if user is logged in by testing /auth/me endpoint
async function checkAuthStatus() {
  console.log('1️⃣ Checking authentication status...');
  
  try {
    // First, let's see what happens when we call /auth/me without a token
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header - this should return 401
      }
    });
    
    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    console.log(`   Status: ${status}`);
    console.log(`   Message: ${data.message || 'No message'}`);
    
    if (status === 401) {
      console.log('   ✅ Endpoint is protected (expected)');
      console.log('   ❌ No authentication token found');
      console.log('');
      console.log('   💡 This means you need to:');
      console.log('      1. Login to the mobile app first');
      console.log('      2. Make sure the login process stores the token');
      console.log('      3. Verify the token is being sent with requests');
    } else if (status === 200) {
      console.log('   ✅ User is authenticated');
      console.log(`   User: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log(`   ❓ Unexpected status: ${status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error checking auth status: ${error.message}`);
  }
}

// Test 2: Test workspaces endpoint without authentication
async function testWorkspacesWithoutAuth() {
  console.log('\n2️⃣ Testing workspaces endpoint without authentication...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      }
    });
    
    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    console.log(`   Status: ${status}`);
    console.log(`   Message: ${data.message || 'No message'}`);
    
    if (status === 401) {
      console.log('   ✅ Workspaces endpoint is protected (expected)');
      console.log('   ❌ Authentication required');
    } else if (status === 200) {
      console.log('   ✅ Workspaces accessible (unexpected - should be protected)');
      console.log(`   Workspaces count: ${data.data?.workspaces?.length || 0}`);
    } else {
      console.log(`   ❓ Unexpected status: ${status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error testing workspaces: ${error.message}`);
  }
}

// Test 3: Test login process
async function testLoginProcess() {
  console.log('\n3️⃣ Testing login process...');
  console.log('   (This requires valid credentials)');
  
  // You can uncomment and fill in your test credentials:
  /*
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'your-email@example.com',
        password: 'your-password'
      })
    });
    
    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    if (status === 200) {
      console.log('   ✅ Login successful');
      console.log(`   Token received: ${data.data?.token ? 'Yes' : 'No'}`);
      console.log(`   Token preview: ${data.data?.token ? data.data.token.substring(0, 20) + '...' : 'None'}`);
      
      // Test the token
      if (data.data?.token) {
        await testWithToken(data.data.token);
      }
    } else {
      console.log(`   ❌ Login failed: ${status}`);
      console.log(`   Error: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`   ❌ Login test failed: ${error.message}`);
  }
  */
  
  console.log('   ⏭️  Skipping login test (requires credentials)');
}

// Test 4: Test with a token (if provided)
async function testWithToken(token) {
  console.log('\n4️⃣ Testing with authentication token...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    if (status === 200) {
      console.log('   ✅ Token is valid');
      console.log(`   User: ${data.data?.user?.name || 'Unknown'}`);
      
      // Test workspaces with token
      await testWorkspacesWithToken(token);
    } else {
      console.log(`   ❌ Token is invalid: ${status}`);
      console.log(`   Error: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`   ❌ Token test failed: ${error.message}`);
  }
}

// Test 5: Test workspaces with token
async function testWorkspacesWithToken(token) {
  console.log('\n5️⃣ Testing workspaces with authentication token...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    if (status === 200) {
      console.log('   ✅ Workspaces accessible with token');
      console.log(`   Workspaces count: ${data.data?.workspaces?.length || 0}`);
    } else {
      console.log(`   ❌ Workspaces still not accessible: ${status}`);
      console.log(`   Error: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`   ❌ Workspaces test failed: ${error.message}`);
  }
}

// Run all tests
async function runAuthDebug() {
  console.log('🚀 Starting authentication debug...\n');
  
  await checkAuthStatus();
  await testWorkspacesWithoutAuth();
  await testLoginProcess();
  
  console.log('\n📊 Debug Summary:');
  console.log('==================');
  console.log('🔍 The 401 error when fetching workspaces means:');
  console.log('   • Your app is successfully connecting to the backend ✅');
  console.log('   • The workspaces endpoint is protected (good security) ✅');
  console.log('   • You need to be logged in to access workspaces ❌');
  console.log('');
  console.log('🛠️  Solutions:');
  console.log('   1. Make sure you are logged in to the mobile app');
  console.log('   2. Check if the login process is working correctly');
  console.log('   3. Verify the token is being stored in AsyncStorage');
  console.log('   4. Ensure the token is being sent with requests');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('   • Try logging in to the mobile app');
  console.log('   • Check the console logs for authentication debug info');
  console.log('   • Verify the login flow is working');
}

// Run the debug
runAuthDebug().catch(console.error);
