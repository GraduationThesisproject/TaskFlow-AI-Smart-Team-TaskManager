/**
 * Mobile Notification Socket Test
 * Tests the real-time notification socket functionality from mobile app
 */

const { io } = require('socket.io-client');

// Test configuration
const SERVER_URL = 'http://192.168.1.142:3001';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OGY5Y2Y5Y2Y5Y2Y5Y2Y5Y2Y5Y2Y5IiwiaWF0IjoxNzM2NDQ4MDAwLCJleHAiOjE3MzcxNTI4MDB9.test'; // This would be a real token

let socket = null;
let testResults = {
    connection: false,
    events: false,
    ping: false,
    errors: []
};

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

async function testSocketConnection() {
    return new Promise((resolve, reject) => {
        log('🔌 Testing Socket.IO connection to notifications namespace...');
        
        socket = io(`${SERVER_URL}/notifications`, {
            auth: { token: TEST_TOKEN },
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: false,
            forceNew: true
        });

        const timeout = setTimeout(() => {
            testResults.errors.push('Connection timeout');
            log('Connection timeout after 10 seconds', 'error');
            reject(new Error('Connection timeout'));
        }, 10000);

        socket.on('connect', () => {
            clearTimeout(timeout);
            testResults.connection = true;
            log(`Socket connected successfully! ID: ${socket.id}`, 'success');
            resolve();
        });

        socket.on('connect_error', (error) => {
            clearTimeout(timeout);
            testResults.errors.push(`Connection error: ${error.message}`);
            log(`Socket connection error: ${error.message}`, 'error');
            log(`Error details: ${JSON.stringify(error)}`, 'error');
            reject(error);
        });

        socket.on('disconnect', (reason) => {
            log(`Socket disconnected: ${reason}`, 'warning');
        });
    });
}

function testNotificationEvents() {
    return new Promise((resolve) => {
        log('🔔 Testing notification event listeners...');
        
        let eventCount = 0;
        const expectedEvents = [
            'notification:new',
            'notification:updated', 
            'notification:deleted',
            'notification:read',
            'notification:unread'
        ];
        
        // Set up event listeners
        expectedEvents.forEach(eventName => {
            socket.on(eventName, (data) => {
                eventCount++;
                log(`Received ${eventName}: ${JSON.stringify(data)}`, 'success');
            });
        });

        // Subscribe to notifications
        socket.emit('notification:subscribe', { 
            userId: '678f9cf9cf9cf9cf9cf9cf9cf9cf9cf9cf9' // Test user ID
        });
        
        // Test sending a notification
        socket.emit('notification:test', {
            title: 'Test Notification',
            message: 'This is a test notification from mobile app',
            type: 'test'
        });
        
        // Wait for events
        setTimeout(() => {
            if (eventCount > 0) {
                testResults.events = true;
                log(`Received ${eventCount} notification events`, 'success');
            } else {
                log('No notification events received (this might be normal)', 'warning');
            }
            resolve();
        }, 5000);
    });
}

function testSocketPing() {
    return new Promise((resolve) => {
        log('🏓 Testing socket ping/pong...');
        
        socket.emit('ping', { 
            message: 'Hello from mobile test client',
            timestamp: new Date().toISOString()
        });
        
        socket.on('pong', (data) => {
            testResults.ping = true;
            log(`Received pong: ${JSON.stringify(data)}`, 'success');
            resolve();
        });
        
        // Timeout if no pong received
        setTimeout(() => {
            log('No pong received (this might be normal if server doesn\'t handle ping)', 'warning');
            resolve();
        }, 3000);
    });
}

function testSocketHealth() {
    return new Promise((resolve) => {
        log('🏥 Testing socket health...');
        
        socket.emit('health:check', { 
            client: 'mobile-test',
            timestamp: new Date().toISOString()
        });
        
        socket.on('health:response', (data) => {
            log(`Health response: ${JSON.stringify(data)}`, 'success');
            resolve();
        });
        
        // Timeout if no health response
        setTimeout(() => {
            log('No health response received', 'warning');
            resolve();
        }, 3000);
    });
}

async function runAllTests() {
    try {
        log('🚀 Starting Mobile Notification Socket Tests...\n');
        
        // Test 1: Connection
        await testSocketConnection();
        
        // Test 2: Events
        await testNotificationEvents();
        
        // Test 3: Ping/Pong
        await testSocketPing();
        
        // Test 4: Health Check
        await testSocketHealth();
        
        // Results
        log('\n📊 Test Results:', 'info');
        log(`Connection: ${testResults.connection ? 'PASS' : 'FAIL'}`, testResults.connection ? 'success' : 'error');
        log(`Events: ${testResults.events ? 'PASS' : 'FAIL'}`, testResults.events ? 'success' : 'error');
        log(`Ping: ${testResults.ping ? 'PASS' : 'FAIL'}`, testResults.ping ? 'success' : 'error');
        
        if (testResults.errors.length > 0) {
            log('\n❌ Errors encountered:', 'error');
            testResults.errors.forEach(error => log(`  - ${error}`, 'error'));
        }
        
        const allPassed = testResults.connection && testResults.events && testResults.ping;
        log(`\n${allPassed ? '✅ All tests passed!' : '⚠️ Some tests failed or had warnings'}`, allPassed ? 'success' : 'warning');
        
    } catch (error) {
        log(`Test suite failed: ${error.message}`, 'error');
        log(`Error details: ${JSON.stringify(error)}`, 'error');
    } finally {
        if (socket) {
            socket.disconnect();
            log('🔌 Socket disconnected', 'info');
        }
    }
}

// Handle process termination
process.on('SIGINT', () => {
    log('Received SIGINT. Cleaning up...', 'warning');
    if (socket) {
        socket.disconnect();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    log('Received SIGTERM. Cleaning up...', 'warning');
    if (socket) {
        socket.disconnect();
    }
    process.exit(0);
});

// Run the tests
runAllTests();
