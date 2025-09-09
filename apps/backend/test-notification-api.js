#!/usr/bin/env node

/**
 * Notification API Test
 * Tests the real-time notification functionality using API endpoints
 */

const { io } = require('socket.io-client');
const jwt = require('./src/utils/jwt');
const User = require('./src/models/User');
const Notification = require('./src/models/Notification');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: './.env' });

// Test configuration
const SERVER_URL = 'http://192.168.1.142:3001';
const TEST_USER_EMAIL = 'user.test@gmail.com';

let testUser = null;
let authToken = null;
let socket = null;
let notificationReceived = false;

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

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
        });
    });
}

function setupNotificationListeners() {
    console.log('🔔 Setting up notification event listeners...');
    
    // Listen for new notifications
    socket.on('notification:new', (data) => {
        console.log('✅ Received notification:new event:', JSON.stringify(data, null, 2));
        notificationReceived = true;
    });
    
    // Listen for typed notifications
    socket.on('notification:typed', (data) => {
        console.log('✅ Received notification:typed event:', JSON.stringify(data, null, 2));
        notificationReceived = true;
    });
    
    // Listen for unread count updates
    socket.on('notifications:unreadCount', (data) => {
        console.log('✅ Received unread count:', data);
    });
    
    // Listen for subscription confirmation
    socket.on('notifications:subscribed', (data) => {
        console.log('✅ Subscribed to notifications:', data);
    });
    
    console.log('✅ Notification listeners set up');
}

async function testCreateWorkspace() {
    try {
        console.log('📝 Testing workspace creation (should trigger notification)...');
        
        const response = await axios.post(`${SERVER_URL}/api/workspaces`, {
            name: 'Test Workspace for Notifications',
            description: 'This workspace is created to test real-time notifications',
            plan: 'free',
            isPublic: false
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 201) {
            console.log('✅ Workspace created successfully');
            console.log('📋 Workspace ID:', response.data.data.workspace._id);
            
            // Wait for real-time notification
            console.log('⏳ Waiting for real-time notification...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            if (notificationReceived) {
                console.log('✅ Real-time notification received!');
            } else {
                console.log('⚠️ No real-time notification received');
            }
            
            return response.data.data.workspace;
        } else {
            console.log('⚠️ Unexpected response status:', response.status);
        }
        
    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error creating workspace:', error.message);
        }
        throw error;
    }
}

async function testCreateNotificationViaAPI() {
    try {
        console.log('📝 Testing notification creation via API...');
        
        const response = await axios.post(`${SERVER_URL}/api/notifications`, {
            title: 'API Test Notification',
            message: 'This notification was created via API endpoint',
            type: 'system_alert',
            recipient: testUser._id,
            sender: testUser._id,
            relatedEntity: {
                entityType: 'user',
                entityId: testUser._id
            },
            priority: 'high',
            isRead: false,
            actionRequired: false,
            deliveryMethods: { inApp: true }
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 201) {
            console.log('✅ Notification created via API');
            
            // Wait for real-time notification
            console.log('⏳ Waiting for real-time notification...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            if (notificationReceived) {
                console.log('✅ Real-time notification received!');
            } else {
                console.log('⚠️ No real-time notification received');
            }
            
            return response.data.data;
        } else {
            console.log('⚠️ Unexpected response status:', response.status);
        }
        
    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error creating notification via API:', error.message);
        }
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
                { title: 'API Test Notification' },
                { message: { $regex: 'Test Workspace for Notifications' } }
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
        console.log('🚀 Starting Notification API Tests...\n');
        console.log('⚠️ Make sure the backend server is running on port 3001!\n');
        
        // Setup
        await connectToDatabase();
        await findTestUser();
        await generateAuthToken();
        
        // Connect socket
        await connectSocket();
        
        // Setup listeners
        setupNotificationListeners();
        
        // Wait a bit for connection to be established
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 1: Create workspace (should trigger notification)
        await testCreateWorkspace();
        
        // Reset notification received flag
        notificationReceived = false;
        
        // Test 2: Create notification via API
        await testCreateNotificationViaAPI();
        
        console.log('\n📊 Test Results:');
        console.log(`Socket Connection: ✅ Success`);
        console.log(`Real-time Events: ${notificationReceived ? '✅ Received' : '⚠️ Not received'}`);
        
        console.log('\n✅ All tests completed!');
        
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
