#!/usr/bin/env node

/**
 * Socket Connection Test with New Configuration
 * Tests the updated socket connection settings
 */

const { io } = require('socket.io-client');

console.log('🔌 Testing Updated Socket Connection');
console.log('=====================================\n');

// Test the new localhost configuration
const testLocalhostConnection = async () => {
    console.log('1️⃣ Testing localhost socket connection...');
    
    const socket = io('http://localhost:3001/test', {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        withCredentials: true,
        rejectUnauthorized: false
    });
    
    return new Promise((resolve) => {
        let connected = false;
        let errorOccurred = false;
        
        socket.on('connect', () => {
            console.log('   ✅ Localhost socket connected successfully');
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
            console.log('   ❌ Localhost socket connection failed:', error.message);
            errorOccurred = true;
            resolve({ success: false, connected: false, error: error.message });
        });
        
        socket.on('disconnect', (reason) => {
            if (connected) {
                console.log('   🔌 Socket disconnected:', reason);
            }
        });
        
        // Timeout after 15 seconds
        setTimeout(() => {
            if (!connected && !errorOccurred) {
                console.log('   ⏰ Connection timeout');
                socket.disconnect();
                resolve({ success: false, connected: false, error: 'timeout' });
            }
        }, 15000);
    });
};

// Test notifications namespace with mock token
const testNotificationsNamespace = async () => {
    console.log('\n2️⃣ Testing notifications namespace with mock token...');
    
    // Create a mock JWT token (this will fail authentication but test connection)
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QiLCJpYXQiOjE2MzA4NzI4MDB9.test';
    
    const socket = io('http://localhost:3001/notifications', {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        auth: { token: mockToken },
        reconnection: true,
        reconnectionAttempts: 2,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        withCredentials: true,
        rejectUnauthorized: false
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
            console.log('   ⚠️  Notifications namespace connection failed (expected - mock token):', error.message);
            errorOccurred = true;
            resolve({ success: true, connected: false, error: error.message }); // This is expected
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (!connected && !errorOccurred) {
                console.log('   ⏰ Notifications namespace timeout');
                socket.disconnect();
                resolve({ success: false, connected: false, error: 'timeout' });
            }
        }, 10000);
    });
};

// Test server accessibility
const testServerAccessibility = async () => {
    console.log('\n3️⃣ Testing server accessibility...');
    
    try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Server health check passed');
            console.log('   📊 Server status:', data.status || 'OK');
            return { success: true, data };
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
    console.log('🚀 Starting updated socket connection tests...\n');
    
    const healthTest = await testServerAccessibility();
    const localhostTest = await testLocalhostConnection();
    const notificationsTest = await testNotificationsNamespace();
    
    console.log('\n📋 TEST RESULTS');
    console.log('================');
    console.log(`Server Health: ${healthTest.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Localhost Socket: ${localhostTest.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Notifications Namespace: ${notificationsTest.success ? '✅ PASS' : '❌ FAIL'}`);
    
    if (healthTest.success && localhostTest.success) {
        console.log('\n🎯 CONCLUSION: Updated socket configuration is working!');
        console.log('🔌 Backend server is accessible on localhost:3001');
        console.log('📱 Mobile app should now connect successfully');
        console.log('🚀 Ready for real-time notifications testing');
        
        console.log('\n📱 Next steps:');
        console.log('   1. Restart mobile app to pick up new configuration');
        console.log('   2. Check mobile app logs for successful connection');
        console.log('   3. Test notifications in Debug tab');
        console.log('   4. Verify real-time updates work');
    } else {
        console.log('\n⚠️  CONCLUSION: Socket configuration still has issues');
        console.log('🔧 Check backend server status and network configuration');
        console.log('📝 Review error messages above for troubleshooting');
        
        if (!healthTest.success) {
            console.log('\n🔧 Troubleshooting steps:');
            console.log('   1. Ensure backend server is running: cd apps/backend && npm start');
            console.log('   2. Check if port 3001 is available: netstat -an | findstr :3001');
            console.log('   3. Verify server is listening on localhost:3001');
        }
    }
};

// Run the tests
runTests().catch(console.error);
