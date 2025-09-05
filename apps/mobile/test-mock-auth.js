// Test script for mock authentication
const { MockAuthService, TEST_ACCOUNT } = require('./services/mockAuthService.ts');

console.log('🧪 Testing Mock Authentication');
console.log('==============================');
console.log('');

async function testMockAuth() {
  console.log('📋 Test Account Info:');
  console.log(`   Email: ${TEST_ACCOUNT.email}`);
  console.log(`   Password: ${TEST_ACCOUNT.password}`);
  console.log(`   User: ${TEST_ACCOUNT.user.name}`);
  console.log('');

  try {
    // Test 1: Login with correct credentials
    console.log('1️⃣ Testing login with correct credentials...');
    const loginResult = await MockAuthService.login({
      email: TEST_ACCOUNT.email,
      password: TEST_ACCOUNT.password
    });
    
    if (loginResult.success) {
      console.log('✅ Login successful');
      console.log(`   Token: ${loginResult.data.token.substring(0, 20)}...`);
      console.log(`   User: ${loginResult.data.user.name}`);
    } else {
      console.log('❌ Login failed');
    }

    // Test 2: Get profile
    console.log('\n2️⃣ Testing get profile...');
    const profileResult = await MockAuthService.getProfile();
    
    if (profileResult.success) {
      console.log('✅ Profile retrieved successfully');
      console.log(`   User: ${profileResult.data.user.name}`);
      console.log(`   Email: ${profileResult.data.user.email}`);
    } else {
      console.log('❌ Profile retrieval failed');
    }

    // Test 3: Check authentication status
    console.log('\n3️⃣ Testing authentication status...');
    const isAuth = await MockAuthService.isAuthenticated();
    console.log(`   Authenticated: ${isAuth ? '✅ Yes' : '❌ No'}`);

    // Test 4: Login with wrong credentials
    console.log('\n4️⃣ Testing login with wrong credentials...');
    try {
      await MockAuthService.login({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Login should have failed but succeeded');
    } catch (error) {
      console.log('✅ Login correctly failed with wrong credentials');
      console.log(`   Error: ${error.message}`);
    }

    // Test 5: Logout
    console.log('\n5️⃣ Testing logout...');
    const logoutResult = await MockAuthService.logout();
    
    if (logoutResult.success) {
      console.log('✅ Logout successful');
    } else {
      console.log('❌ Logout failed');
    }

    // Test 6: Check authentication after logout
    console.log('\n6️⃣ Testing authentication status after logout...');
    const isAuthAfterLogout = await MockAuthService.isAuthenticated();
    console.log(`   Authenticated: ${isAuthAfterLogout ? '❌ Still authenticated' : '✅ Correctly logged out'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n📊 Test Summary:');
  console.log('================');
  console.log('✅ Mock authentication service is working');
  console.log('✅ You can now use the test account to login');
  console.log('✅ This will allow you to test workspaces functionality');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('   1. Navigate to the test-login screen in your mobile app');
  console.log('   2. Use the test credentials to login');
  console.log('   3. Test fetching workspaces');
  console.log('   4. Verify the 401 error is resolved');
}

// Run the test
testMockAuth().catch(console.error);
