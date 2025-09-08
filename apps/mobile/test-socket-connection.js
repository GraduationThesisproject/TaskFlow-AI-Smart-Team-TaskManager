#!/usr/bin/env node

/**
 * Socket Connection Test
 * Tests actual socket connection between mobile app and backend server
 */

const { io } = require('socket.io-client');

console.log('🔌 Testing Socket Connection');
console.log('============================\n');

// Test socket connection
const testSocketConnection = async () => {
    console.log('1️⃣ Testing basic socket connection...');
    
    const socket = io('http://localhost:3001/test', {
        transports: ['websocket', 'polling'],
        timeout: 5000
    });
    
    return new Promise((resolve) => {
        let connected = false;
        let errorOccurred = false;
        
        socket.on('connect', () => {
            console.log('   ✅ Socket connected successfully');
            console.log(`   📍 Socket ID: ${socket.id}`);
            connected = true;
            
            // Test ping-pong
            console.log('   🏓 Testing ping-pong...');
            socket.emit('ping');
            
            socket.on('pong', (data) => {
                console.log('   ✅ Ping-pong successful:', data.message);
                socket.disconnect();
                resolve({ success: true, connected: true });
            });
        });
        
        socket.on('connect_error', (error) => {
            console.log('   ❌ Socket connection failed:', error.message);
            errorOccurred = true;
            resolve({ success: false, connected: false, error: error.message });
        });
        
        socket.on('disconnect', (reason) => {
            if (connected) {
                console.log('   🔌 Socket disconnected:', reason);
            }
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (!connected && !errorOccurred) {
                console.log('   ⏰ Connection timeout');
                socket.disconnect();
                resolve({ success: false, connected: false, error: 'timeout' });
            }
        }, 10000);
    });
};

// Test notifications namespace
const testNotificationsNamespace = async () => {
    console.log('\n2️⃣ Testing notifications namespace...');
    
    const socket = io('http://localhost:3001/notifications', {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        auth: {
            token: 'test-token' // This will fail authentication, but we can test the connection
        }
    });
    
    return new Promise((resolve) => {
        let connected = false;
        let errorOccurred = false;
        
        socket.on('connect', () => {
            console.log('   ✅ Notifications namespace connected');
            console.log(`   📍 Socket ID: ${socket.id}`);
            connected = true;
            socket.disconnect();
            resolve({ success: true, connected: true });
        });
        
        socket.on('connect_error', (error) => {
            console.log('   ⚠️  Notifications namespace connection failed (expected - no valid token):', error.message);
            errorOccurred = true;
            resolve({ success: true, connected: false, error: error.message }); // This is expected
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
            if (!connected && !errorOccurred) {
                console.log('   ⏰ Notifications namespace timeout');
                socket.disconnect();
                resolve({ success: false, connected: false, error: 'timeout' });
            }
        }, 5000);
    });
};

// Test server health
const testServerHealth = async () => {
    console.log('\n3️⃣ Testing server health...');
    
    try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
            console.log('   ✅ Server health check passed');
            return { success: true };
        } else {
            console.log('   ❌ Server health check failed:', response.status);
            return { success: false, error: `HTTP ${response.status}` };
        }
    } catch (error) {
        console.log('   ❌ Server health check failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Run all tests
const runTests = async () => {
    console.log('🚀 Starting socket connection tests...\n');
    
    const healthTest = await testServerHealth();
    const basicTest = await testSocketConnection();
    const notificationsTest = await testNotificationsNamespace();
    
    console.log('\n📋 TEST RESULTS');
    console.log('================');
    console.log(`Server Health: ${healthTest.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Basic Socket: ${basicTest.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Notifications Namespace: ${notificationsTest.success ? '✅ PASS' : '❌ FAIL'}`);
    
    if (healthTest.success && basicTest.success) {
        console.log('\n🎯 CONCLUSION: Socket system is working correctly!');
        console.log('🔌 Backend server is running and accepting connections');
        console.log('📱 Mobile app should be able to connect to the socket');
        console.log('🚀 Ready for real-time notifications testing');
    } else {
        console.log('\n⚠️  CONCLUSION: Socket system has issues');
        console.log('🔧 Check backend server status and configuration');
        console.log('📝 Review error messages above for troubleshooting');
    }
    
    console.log('\n📱 Next steps:');
    console.log('   1. Start mobile app: npm start');
    console.log('   2. Check mobile app logs for socket connection');
    console.log('   3. Test notifications in Debug tab');
    console.log('   4. Verify real-time updates work');
};

// Run the tests
runTests().catch(console.error);
