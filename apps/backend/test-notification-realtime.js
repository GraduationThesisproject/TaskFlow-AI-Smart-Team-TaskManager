#!/usr/bin/env node

/**
 * Real-time Notification Test
 * Tests the real-time notification emission functionality
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

let testUser = null;
let authToken = null;
let socket = null;
let notificationNamespace = null;

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

function connectSocket() {
    return new Promise((resolve, reject) => {
        console.log('🔌 Connecting to notification socket...');
        
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
    });
}

function setupNotificationListeners() {
    return new Promise((resolve) => {
        console.log('🔔 Setting up notification event listeners...');
        
        let notificationReceived = false;
        
        // Listen for new notifications
        socket.on('notification:new', (data) => {
            console.log('✅ Received notification:new event:', data);
            notificationReceived = true;
        });
        
        // Listen for typed notifications
        socket.on('notification:typed', (data) => {
            console.log('✅ Received notification:typed event:', data);
            notificationReceived = true;
        });
        
        // Listen for unread count updates
        socket.on('notifications:unreadCount', (data) => {
            console.log('✅ Received unread count:', data);
        });
        
        // Subscribe to notifications
        socket.emit('notifications:subscribe', { 
            userId: testUser._id,
            types: ['system_alert', 'task_assigned', 'comment_added']
        });
        
        // Wait a bit for subscription to be processed
        setTimeout(() => {
            console.log('✅ Notification listeners set up');
            resolve();
        }, 1000);
    });
}

async function testRealTimeNotification() {
    try {
        console.log('📝 Testing real-time notification emission...');
        
        // Get the notification namespace from the server
        const { initializeSockets } = require('./src/sockets');
        const { io } = require('socket.io');
        const http = require('http');
        const app = require('./src/app');
        
        // Create a test server instance to get the notification namespace
        const server = http.createServer(app);
        const serverIo = io(server, {
            path: '/socket.io',
            cors: { origin: true }
        });
        
        const namespaces = initializeSockets(serverIo);
        notificationNamespace = namespaces.notification;
        
        // Create a test notification using the sendNotification function
        const notificationData = {
            sender: testUser._id,
            type: 'system_alert',
            title: 'Real-time Test Notification',
            message: 'This notification should be sent in real-time via socket',
            relatedEntity: {
                entityType: 'user',
                entityId: testUser._id
            },
            priority: 'high',
            isRead: false,
            actionRequired: false
        };
        
        console.log('📤 Sending notification via socket...');
        await notificationNamespace.sendNotification(testUser._id, notificationData);
        
        // Wait for the notification to be received
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('✅ Real-time notification test completed');
        
    } catch (error) {
        console.error('❌ Error testing real-time notification:', error);
        throw error;
    }
}

async function testDirectNotificationCreation() {
    try {
        console.log('📝 Testing direct notification creation...');
        
        // Create notification directly in database
        const notification = new Notification({
            recipient: testUser._id,
            sender: testUser._id,
            type: 'task_assigned',
            title: 'Direct Test Notification',
            message: 'This notification was created directly in the database',
            relatedEntity: {
                entityType: 'task',
                entityId: new mongoose.Types.ObjectId()
            },
            priority: 'medium',
            isRead: false
        });
        
        await notification.save();
        console.log('✅ Direct notification created');
        
        // Now send it via socket
        if (notificationNamespace) {
            console.log('📤 Sending direct notification via socket...');
            await notificationNamespace.sendNotification(testUser._id, notification);
        }
        
        // Wait for the notification to be received
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ Error testing direct notification:', error);
        throw error;
    }
}

async function cleanup() {
    try {
        if (socket) {
            socket.disconnect();
            console.log('🔌 Socket disconnected');
        }
        
        // Clean up test notifications
        await Notification.deleteMany({ 
            recipient: testUser._id, 
            $or: [
                { title: 'Real-time Test Notification' },
                { title: 'Direct Test Notification' }
            ]
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
        console.log('🚀 Starting Real-time Notification Tests...\n');
        
        // Setup
        await connectToDatabase();
        await findTestUser();
        await generateAuthToken();
        
        // Connect socket
        await connectSocket();
        
        // Setup listeners
        await setupNotificationListeners();
        
        // Test 1: Real-time notification via sendNotification
        await testRealTimeNotification();
        
        // Test 2: Direct notification creation
        await testDirectNotificationCreation();
        
        console.log('\n✅ All real-time notification tests completed!');
        
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
