// Debug script for mock authentication
const AsyncStorage = require('@react-native-async-storage/async-storage');

// Mock AsyncStorage for Node.js testing
const mockStorage = {};
AsyncStorage.setItem = async (key, value) => {
  mockStorage[key] = value;
  console.log(`📦 Stored: ${key} = ${value.substring(0, 20)}...`);
};
AsyncStorage.getItem = async (key) => {
  const value = mockStorage[key];
  console.log(`📦 Retrieved: ${key} = ${value ? value.substring(0, 20) + '...' : 'null'}`);
  return value;
};
AsyncStorage.removeItem = async (key) => {
  delete mockStorage[key];
  console.log(`📦 Removed: ${key}`);
};

// Mock the MockAuthService
const STATIC_TEST_ACCOUNT = {
  email: 'test@taskflow.com',
  password: 'test123',
  user: {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@taskflow.com',
    avatar: 'https://via.placeholder.com/150',
    role: 'member',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
  token: 'mock-jwt-token-' + Date.now(),
  refreshToken: 'mock-refresh-token-' + Date.now(),
};

class MockAuthService {
  static async login(credentials) {
    console.log('🔧 MockAuthService: Processing login request');
    console.log('📧 Email:', credentials.email);
    console.log('🔑 Password:', credentials.password ? '***' : 'empty');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if credentials match our static account
    if (credentials.email === STATIC_TEST_ACCOUNT.email && 
        credentials.password === STATIC_TEST_ACCOUNT.password) {
      
      console.log('✅ MockAuthService: Login successful');
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('token', STATIC_TEST_ACCOUNT.token);
      await AsyncStorage.setItem('refreshToken', STATIC_TEST_ACCOUNT.refreshToken);
      
      return {
        success: true,
        message: 'Login successful',
        data: {
          token: STATIC_TEST_ACCOUNT.token,
          refreshToken: STATIC_TEST_ACCOUNT.refreshToken,
          user: STATIC_TEST_ACCOUNT.user,
        }
      };
    } else {
      console.log('❌ MockAuthService: Invalid credentials');
      throw new Error('Invalid email or password');
    }
  }

  static async getProfile() {
    console.log('🔧 MockAuthService: Getting user profile');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: STATIC_TEST_ACCOUNT.user,
        token: token,
      }
    };
  }

  static async isAuthenticated() {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  }
}

console.log('🧪 Debug Mock Authentication');
console.log('=============================');
console.log('');

async function debugMockAuth() {
  console.log('📋 Test Account Info:');
  console.log(`   Email: ${STATIC_TEST_ACCOUNT.email}`);
  console.log(`   Password: ${STATIC_TEST_ACCOUNT.password}`);
  console.log(`   User: ${STATIC_TEST_ACCOUNT.user.name}`);
  console.log('');

  try {
    // Test 1: Login with correct credentials
    console.log('1️⃣ Testing login with correct credentials...');
    const loginResult = await MockAuthService.login({
      email: STATIC_TEST_ACCOUNT.email,
      password: STATIC_TEST_ACCOUNT.password
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

    // Test 4: Simulate axios request with token
    console.log('\n4️⃣ Simulating axios request with token...');
    const token = await AsyncStorage.getItem('token');
    if (token) {
      console.log('✅ Token found for request');
      console.log(`   Authorization header would be: Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('❌ No token found for request');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n📊 Debug Summary:');
  console.log('==================');
  console.log('🔍 If mock auth is working:');
  console.log('   • Login should succeed ✅');
  console.log('   • Token should be stored ✅');
  console.log('   • Profile should be retrieved ✅');
  console.log('   • Authentication status should be true ✅');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('   1. Check if ENABLE_API_MOCKING is true in your app');
  console.log('   2. Verify the mock auth service is being used');
  console.log('   3. Check if the token is being sent with requests');
  console.log('   4. Look at the console logs in your mobile app');
}

// Run the debug
debugMockAuth().catch(console.error);
