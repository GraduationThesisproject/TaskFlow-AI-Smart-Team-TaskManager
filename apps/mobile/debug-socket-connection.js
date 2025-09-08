#!/usr/bin/env node

/**
 * Mobile App Socket Debug Helper
 * Provides debugging information for mobile app socket connections
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Mobile App Socket Debug Helper');
console.log('==================================\n');

// Check current configuration
console.log('1️⃣ Current Configuration:');
const envPath = path.join(__dirname, 'config', 'env.ts');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Extract socket URL
    const socketUrlMatch = envContent.match(/SOCKET_URL.*?['"`]([^'"`]+)['"`]/);
    if (socketUrlMatch) {
        console.log(`   📍 Socket URL: ${socketUrlMatch[1]}`);
    }
    
    // Extract API URL
    const apiUrlMatch = envContent.match(/API_URL.*?['"`]([^'"`]+)['"`]/);
    if (apiUrlMatch) {
        console.log(`   📍 API URL: ${apiUrlMatch[1]}`);
    }
    
    // Extract BASE URL
    const baseUrlMatch = envContent.match(/BASE_URL.*?['"`]([^'"`]+)['"`]/);
    if (baseUrlMatch) {
        console.log(`   📍 Base URL: ${baseUrlMatch[1]}`);
    }
} else {
    console.log('   ❌ Environment configuration not found');
}

console.log('');

// Check middleware configuration
console.log('2️⃣ Socket Middleware Configuration:');
const middlewarePath = path.join(__dirname, 'store', 'middleware', 'notificationsSocketMiddleware.ts');
if (fs.existsSync(middlewarePath)) {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    
    // Check reconnection settings
    const maxAttemptsMatch = middlewareContent.match(/MAX_RECONNECT_ATTEMPTS.*?=.*?(\d+)/);
    if (maxAttemptsMatch) {
        console.log(`   🔄 Max Reconnection Attempts: ${maxAttemptsMatch[1]}`);
    }
    
    // Check timeout settings
    const timeoutMatch = middlewareContent.match(/timeout.*?(\d+)/);
    if (timeoutMatch) {
        console.log(`   ⏰ Connection Timeout: ${timeoutMatch[1]}ms`);
    }
    
    // Check reconnection delay
    const delayMatch = middlewareContent.match(/reconnectionDelay.*?(\d+)/);
    if (delayMatch) {
        console.log(`   ⏳ Reconnection Delay: ${delayMatch[1]}ms`);
    }
    
    // Check transports
    const transportsMatch = middlewareContent.match(/transports.*?\[(.*?)\]/);
    if (transportsMatch) {
        console.log(`   🚌 Transports: ${transportsMatch[1]}`);
    }
} else {
    console.log('   ❌ Socket middleware not found');
}

console.log('');

// Check if backend server is running
console.log('3️⃣ Backend Server Status:');
const testBackendConnection = async () => {
    try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
            console.log('   ✅ Backend server is running on localhost:3001');
            const data = await response.json();
            console.log(`   📊 Server status: ${data.status || 'OK'}`);
            return true;
        } else {
            console.log(`   ❌ Backend server responded with status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Backend server not accessible: ${error.message}`);
        return false;
    }
};

// Test socket.io endpoint
const testSocketEndpoint = async () => {
    try {
        const response = await fetch('http://localhost:3001/socket.io/');
        if (response.ok) {
            console.log('   ✅ Socket.IO endpoint is accessible');
            return true;
        } else {
            console.log(`   ❌ Socket.IO endpoint responded with status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Socket.IO endpoint not accessible: ${error.message}`);
        return false;
    }
};

// Run backend tests
const runBackendTests = async () => {
    const backendRunning = await testBackendConnection();
    const socketEndpoint = await testSocketEndpoint();
    
    console.log('');
    console.log('4️⃣ Debugging Recommendations:');
    
    if (!backendRunning) {
        console.log('   🔧 Backend server is not running:');
        console.log('      • Start backend: cd apps/backend && npm start');
        console.log('      • Check if port 3001 is available');
        console.log('      • Verify no other process is using port 3001');
    } else if (!socketEndpoint) {
        console.log('   🔧 Socket.IO endpoint issues:');
        console.log('      • Check backend server logs for errors');
        console.log('      • Verify socket.io is properly initialized');
        console.log('      • Check CORS configuration');
    } else {
        console.log('   ✅ Backend server and Socket.IO are working correctly');
        console.log('   🔧 If mobile app still can\'t connect:');
        console.log('      • Restart mobile app to pick up new configuration');
        console.log('      • Check mobile app logs for connection errors');
        console.log('      • Verify authentication token is valid');
        console.log('      • Test with Debug tab in mobile app settings');
    }
    
    console.log('');
    console.log('5️⃣ Mobile App Debug Steps:');
    console.log('   1. Restart mobile app: Stop and restart npm start');
    console.log('   2. Check console logs for socket connection messages');
    console.log('   3. Look for these log messages:');
    console.log('      • "🔌 [notificationsSocketMiddleware] connecting to socket"');
    console.log('      • "✅ [notificationsSocketMiddleware] socket connected"');
    console.log('      • "❌ [notificationsSocketMiddleware] connect_error"');
    console.log('   4. Use Debug tab in Settings to test notifications');
    console.log('   5. Check Redux DevTools for socket state changes');
    
    console.log('');
    console.log('6️⃣ Common Issues and Solutions:');
    console.log('   • Connection timeout: Increase timeout in middleware');
    console.log('   • Authentication failed: Check JWT token validity');
    console.log('   • CORS errors: Verify backend CORS configuration');
    console.log('   • Network errors: Check firewall and network settings');
    console.log('   • Max reconnection attempts: Check server availability');
};

// Run the debug helper
runBackendTests().catch(console.error);
