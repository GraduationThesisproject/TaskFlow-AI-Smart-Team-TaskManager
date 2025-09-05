// Test script to verify the mobile app connection after fixes
const API_BASE_URL = 'http://192.168.1.142:3001/api';

console.log('🧪 Testing Mobile App Connection After Fixes');
console.log('==========================================');
console.log(`📡 API Base URL: ${API_BASE_URL}`);
console.log('');

// Test 1: Basic connectivity
async function testBasicConnectivity() {
  console.log('1️⃣ Testing basic connectivity...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Basic connectivity: OK');
      console.log(`   Server status: ${data.status || 'unknown'}`);
      return true;
    } else {
      console.log(`❌ Basic connectivity: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Basic connectivity: ${error.message}`);
    return false;
  }
}

// Test 2: Templates endpoint (from the error)
async function testTemplatesEndpoint() {
  console.log('2️⃣ Testing templates endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/templates?status=active`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Templates endpoint: OK');
      console.log(`   Templates count: ${data.data?.length || 0}`);
      return true;
    } else {
      console.log(`❌ Templates endpoint: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Templates endpoint: ${error.message}`);
    return false;
  }
}

// Test 3: Workspaces endpoint (from the error)
async function testWorkspacesEndpoint() {
  console.log('3️⃣ Testing workspaces endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Workspaces endpoint: OK');
      console.log(`   Workspaces count: ${data.data?.length || 0}`);
      return true;
    } else {
      console.log(`❌ Workspaces endpoint: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Workspaces endpoint: ${error.message}`);
    return false;
  }
}

// Test 4: Analytics endpoint (from the error)
async function testAnalyticsEndpoint() {
  console.log('4️⃣ Testing analytics endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/analytics`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Analytics endpoint: OK');
      return true;
    } else {
      console.log(`❌ Analytics endpoint: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Analytics endpoint: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting connection tests...\n');
  
  const results = await Promise.all([
    testBasicConnectivity(),
    testTemplatesEndpoint(),
    testWorkspacesEndpoint(),
    testAnalyticsEndpoint()
  ]);
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! The mobile app should now connect successfully.');
    console.log('💡 You can now restart your mobile app and try again.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check:');
    console.log('   • Backend server is running on 192.168.1.142:3001');
    console.log('   • WiFi connection is stable');
    console.log('   • Firewall allows connections on port 3001');
  }
  
  console.log('\n🔧 Configuration Summary:');
  console.log('========================');
  console.log(`   API Base URL: ${API_BASE_URL}`);
  console.log('   Expected URL scheme: http://');
  console.log('   Backend port: 3001');
  console.log('   WiFi IP: 192.168.1.142');
}

// Run the tests
runAllTests().catch(console.error);
