const axios = require('axios');
const { io } = require('socket.io-client');

// Test CORS configuration
async function testCors() {
    const baseUrl = 'http://localhost:3001';
    const testOrigins = [
        'http://localhost:5173',
        'http://192.168.217.1:8081',
        'http://192.168.217.1:3001',
        'http://192.168.1.142:3001',
        'exp://192.168.217.1:8081'
    ];

    console.log('🧪 Testing CORS configuration...\n');

    for (const origin of testOrigins) {
        try {
            console.log(`Testing origin: ${origin}`);
            
            const response = await axios.get(`${baseUrl}/cors-test`, {
                headers: {
                    'Origin': origin
                },
                timeout: 5000
            });
            
            console.log(`✅ ${origin} - Status: ${response.status}`);
            console.log(`   Response: ${JSON.stringify(response.data)}\n`);
            
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${origin} - Status: ${error.response.status}`);
                console.log(`   Error: ${error.response.data?.message || error.message}\n`);
            } else {
                console.log(`❌ ${origin} - Network Error: ${error.message}\n`);
            }
        }
    }
}

// Test Socket.IO connections
async function testSocketIO() {
    const baseUrl = 'http://localhost:3001';
    
    console.log('🔌 Testing Socket.IO connections...\n');

    // Test 1: Test namespace (no auth required)
    console.log('1. Testing /test namespace (no auth)...');
    await new Promise((resolve) => {
        const testSocket = io(`${baseUrl}/test`, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            forceNew: true
        });

        testSocket.on('connected', (data) => {
            console.log('✅ Test namespace connection successful');
            console.log(`   Response: ${JSON.stringify(data)}`);
            testSocket.disconnect();
            resolve();
        });

        testSocket.on('connect_error', (error) => {
            console.log('❌ Test namespace connection failed');
            console.log(`   Error: ${error.message}`);
            console.log(`   Description: ${JSON.stringify(error.description)}`);
            resolve();
        });

        // Timeout after 10 seconds
        setTimeout(() => {
            console.log('⏰ Test namespace connection timeout');
            testSocket.disconnect();
            resolve();
        }, 10000);
    });

    // Test 2: Notifications namespace (auth required)
    console.log('\n2. Testing /notifications namespace (auth required)...');
    await new Promise((resolve) => {
        const notificationSocket = io(`${baseUrl}/notifications`, {
            auth: { token: 'invalid-token' }, // Use invalid token to test auth
            transports: ['websocket', 'polling'],
            timeout: 10000,
            forceNew: true
        });

        notificationSocket.on('connect', () => {
            console.log('❌ Notifications namespace connected with invalid token (unexpected)');
            notificationSocket.disconnect();
            resolve();
        });

        notificationSocket.on('connect_error', (error) => {
            console.log('✅ Notifications namespace correctly rejected invalid token');
            console.log(`   Error: ${error.message}`);
            resolve();
        });

        // Timeout after 10 seconds
        setTimeout(() => {
            console.log('⏰ Notifications namespace connection timeout');
            notificationSocket.disconnect();
            resolve();
        }, 10000);
    });

    // Test 3: Test with valid token (if available)
    console.log('\n3. Testing /notifications namespace with valid token...');
    console.log('   (Skipping - requires valid JWT token)');
}

// Main test function
async function runTests() {
    try {
        await testCors();
        await testSocketIO();
        
        console.log('\n🎉 All tests completed!');
        console.log('\n📋 Summary:');
        console.log('   - CORS configuration tested for multiple origins');
        console.log('   - Socket.IO /test namespace tested (no auth)');
        console.log('   - Socket.IO /notifications namespace tested (auth required)');
        console.log('\n💡 Next steps:');
        console.log('   1. Restart your backend server');
        console.log('   2. Test mobile app connection');
        console.log('   3. Check server logs for any remaining issues');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the tests
runTests();
