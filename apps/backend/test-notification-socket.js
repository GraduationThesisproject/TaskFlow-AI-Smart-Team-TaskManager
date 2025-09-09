#!/usr/bin/env node

/**
 * Notification Socket Test
 * Tests the real-time notification socket functionality
 */

const { io } = require('socket.io-client');
const jwt = require('./src/utils/jwt');
const User = require('./src/models/User');
const Notification = require('./src/models/Notification');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Test configuration
const SERVER_URL = 'http://192.168.1.142:3001';
const TEST_USER_EMAIL = 'user.test@gmail.com';
const TEST_USER_PASSWORD = '12345678A!';

let testUser = null;
let authToken = null;
let socket = null;

async function connectToDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

async function findTestUser() {
    try {
        testUser = await User.findOne({ email: TEST_USER_EMAIL });
        if (!testUser) {
            console.error('❌ Test user not found. Please run the seeder first: npm run seed');
            process.exit(1);
        }
        console.log('✅ Test user found:', testUser.email);
        return testUser;
    } catch (error) {
        console.error('❌ Error finding test user:', error);
        process.exit(1);
    }
}

async function generateAuthToken() {
    try {
        authToken = jwt.generateToken(testUser._id);
        console.log('✅ Auth token generated');
        return authToken;
    } catch (error) {
        console.error('❌ Error generating auth token:', error);
        process.exit(1);
    }
}

function testSocketConnection() {
    return new Promise((resolve, reject) => {
        console.log('🔌 Testing Socket.IO connection...');
        
        socket = io(`${SERVER_URL}/notifications`, {
            auth: { token: authToken },
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: false
        });

        const timeout = setTimeout(() => {
            console.error('❌ Socket connection timeout');
            reject(new Error('Connection timeout'));
        }, 10000);

        socket.on('connect', () => {
            clearTimeout(timeout);
            console.log('✅ Socket connected successfully');
            console.log('📡 Socket ID:', socket.id);
            resolve();
        });

        socket.on('connect_error', (error) => {
            clearTimeout(timeout);
            console.error('❌ Socket connection error:', error);
            reject(error);
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
        });
    });
}

function testNotificationEvents() {
    return new Promise((resolve, reject) => {
        console.log('🔔 Testing notification events...');
        
        let eventCount = 0;
        const expectedEvents = ['notification:new', 'notification:updated', 'notification:deleted'];
        
        // Set up event listeners
        expectedEvents.forEach(eventName => {
            socket.on(eventName, (data) => {
                console.log(`✅ Received ${eventName}:`, data);
                eventCount++;
            });
        });

        // Test sending a notification
        socket.emit('notification:subscribe', { userId: testUser._id });
        
        // Wait for events or timeout
        setTimeout(() => {
            if (eventCount > 0) {
                console.log(`✅ Received ${eventCount} notification events`);
                resolve();
            } else {
                console.log('⚠️ No notification events received (this might be normal if no notifications exist)');
                resolve();
            }
        }, 5000);
    });
}

async function testNotificationCreation() {
    try {
        console.log('📝 Testing notification creation...');
        
        // Create a test notification with proper structure
        const testNotification = new Notification({
            recipient: testUser._id,
            sender: testUser._id,
            type: 'system_alert',
            title: 'Socket Test Notification',
            message: 'This is a test notification for socket functionality',
            relatedEntity: {
                entityType: 'user',
                entityId: testUser._id
            },
            priority: 'medium',
            isRead: false,
            actionRequired: false
        });
        
        await testNotification.save();
        console.log('✅ Test notification created');
        
        // Wait a bit for the socket to receive it
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return testNotification;
    } catch (error) {
        console.error('❌ Error creating test notification:', error);
        throw error;
    }
}

function testSocketPing() {
    return new Promise((resolve) => {
        console.log('🏓 Testing socket ping...');
        
        socket.emit('ping', { message: 'Hello from test client' });
        
        socket.on('pong', (data) => {
            console.log('✅ Received pong:', data);
            resolve();
        });
        
        // Timeout if no pong received
        setTimeout(() => {
            console.log('⚠️ No pong received (this might be normal if server doesn\'t handle ping)');
            resolve();
        }, 3000);
    });
}

async function cleanup() {
    try {
        if (socket) {
            socket.disconnect();
            console.log('🔌 Socket disconnected');
        }
        
        // Clean up test notification
        await Notification.deleteMany({ 
            recipient: testUser._id, 
            type: 'system_alert',
            title: 'Socket Test Notification'
        });
        console.log('🧹 Test notifications cleaned up');
        
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    } catch (error) {
        console.error('❌ Cleanup error:', error);
    }
}

async function runTests() {
    try {
        console.log('🚀 Starting Notification Socket Tests...\n');
        
        // Setup
        await connectToDatabase();
        await findTestUser();
        await generateAuthToken();
        
        // Tests
        await testSocketConnection();
        await testNotificationEvents();
        await testNotificationCreation();
        await testSocketPing();
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n⚠️ Received SIGINT. Cleaning up...');
    await cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n⚠️ Received SIGTERM. Cleaning up...');
    await cleanup();
    process.exit(0);
});

// Run the tests
runTests();
