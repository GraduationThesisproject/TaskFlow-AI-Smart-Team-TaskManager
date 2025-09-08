#!/usr/bin/env node

/**
 * Socket.IO Authentication Debug Test
 * Tests the actual authentication flow with a real token
 */

const { io } = require('socket.io-client');

console.log('🔐 Socket.IO Authentication Debug Test');
console.log('=====================================\n');

// Test with a real JWT token from the mobile app logs
const testWithRealToken = async () => {
    console.log('1️⃣ Testing with real JWT token...');
    
    // This is the token preview from your logs: eyJhbGciOiJIUzI1NiIs...
    // We need to get the full token from the mobile app
    console.log('   📝 Note: We need the full JWT token from the mobile app logs');
    console.log('   🔍 Look for "Token preview: eyJhbGciOiJIUzI1NiIs..." in your mobile app logs');
    console.log('   📋 Copy the full token and test it manually');
    
    return false; // We can't test without the actual token
};

// Test the Socket.IO handshake process
const testSocketHandshake = async () => {
    console.log('\n2️⃣ Testing Socket.IO handshake process...');
    
    const socket = io('http://192.168.217.1:3001/notifications', {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        auth: { token: 'test-token' }, // This will fail but show us the handshake process
        forceNew: true,
        upgrade: true,
        rememberUpgrade: false,
    });
    
    return new Promise((resolve) => {
        let handshakeStarted = false;
        
        socket.on('connect', () => {
            console.log('   ✅ Socket connected successfully');
            socket.disconnect();
            resolve(true);
        });
        
        socket.on('connect_error', (error) => {
            console.log('   ❌ Socket connection failed:', error.message);
            console.log('   🔍 Error details:', {
                type: error.type,
                description: error.description,
                context: error.context
            });
            
            if (!handshakeStarted) {
                console.log('   📊 Handshake process:');
                console.log('     1. Client sends WebSocket upgrade request');
                console.log('     2. Server should respond with HTTP 101 (Switching Protocols)');
                console.log('     3. Current error: Server responded with HTTP 400 (Bad Request)');
                console.log('   🔧 Possible causes:');
                console.log('     • Socket.IO version mismatch');
                console.log('     • Authentication middleware rejecting connection');
                console.log('     • CORS configuration issue');
                console.log('     • Server not properly configured for Socket.IO');
                handshakeStarted = true;
            }
            
            resolve(false);
        });
        
        socket.on('disconnect', (reason) => {
            console.log('   🔌 Socket disconnected:', reason);
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
            console.log('   ⏰ Connection timeout');
            socket.disconnect();
            resolve(false);
        }, 10000);
    });
};

// Test basic Socket.IO server accessibility
const testSocketServerAccess = async () => {
    console.log('\n3️⃣ Testing Socket.IO server accessibility...');
    
    try {
        // Test the Socket.IO endpoint directly
        const response = await fetch('http://192.168.217.1:3001/socket.io/');
        console.log(`   📊 Socket.IO endpoint response: ${response.status}`);
        
        if (response.status === 400) {
            console.log('   ⚠️  HTTP 400 response - this is expected for Socket.IO endpoint');
            console.log('   📝 Socket.IO expects specific query parameters');
            return true;
        } else if (response.status === 200) {
            console.log('   ✅ Socket.IO endpoint accessible');
            return true;
        } else {
            console.log(`   ❌ Unexpected response: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Socket.IO endpoint not accessible: ${error.message}`);
        return false;
    }
};

// Run all tests
const runDebugTests = async () => {
    console.log('🚀 Starting Socket.IO authentication debug tests...\n');
    
    const handshakeTest = await testSocketHandshake();
    const serverAccessTest = await testSocketServerAccess();
    const tokenTest = await testWithRealToken();
    
    console.log('\n📋 DEBUG RESULTS');
    console.log('=================');
    console.log(`Socket Handshake: ${handshakeTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Server Access: ${serverAccessTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Token Test: ${tokenTest ? '✅ PASS' : '⚠️  SKIP'}`);
    
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('==========================');
    console.log('1. Check backend server logs for Socket.IO errors');
    console.log('2. Verify Socket.IO version compatibility');
    console.log('3. Test with a valid JWT token from mobile app');
    console.log('4. Check CORS configuration for Socket.IO');
    console.log('5. Verify authentication middleware is working');
    
    console.log('\n📱 NEXT STEPS:');
    console.log('==============');
    console.log('1. Get the full JWT token from mobile app logs');
    console.log('2. Test Socket.IO connection with the real token');
    console.log('3. Check backend server logs for authentication errors');
    console.log('4. Verify the Socket.IO namespace is properly configured');
};

// Run the debug tests
runDebugTests().catch(console.error);
