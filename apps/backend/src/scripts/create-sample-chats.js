const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Admin = require('../models/Admin');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/taskflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createSampleChats = async () => {
  try {
    console.log('Creating sample chats...');

    // Find a user and admin for sample data
    const user = await User.findOne();
    const admin = await Admin.findOne();

    if (!user || !admin) {
      console.log('No users or admins found. Please create some first.');
      return;
    }

    // Sample chat data
    const sampleChats = [
      {
        participants: [
          { id: user._id, name: user.name, model: 'User', avatar: user.avatar || '' },
          { id: admin._id, name: admin.name || 'Admin', model: 'Admin', avatar: '' }
        ],
        messages: [
          {
            content: 'Hello, I need help with my project setup.',
            sender: { id: user._id, name: user.name, model: 'User' },
            messageType: 'text',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            updatedAt: new Date(Date.now() - 1000 * 60 * 30)
          },
          {
            content: 'Hi! I\'d be happy to help. What specific issue are you facing?',
            sender: { id: admin._id, name: admin.name || 'Admin', model: 'Admin' },
            messageType: 'text',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
            updatedAt: new Date(Date.now() - 1000 * 60 * 25)
          },
          {
            content: 'I\'m getting an error when trying to install dependencies.',
            sender: { id: user._id, name: user.name, model: 'User' },
            messageType: 'text',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
            updatedAt: new Date(Date.now() - 1000 * 60 * 20)
          }
        ],
        status: 'active',
        category: 'technical',
        priority: 'medium',
        lastMessage: {
          content: 'I\'m getting an error when trying to install dependencies.',
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
          sender: { id: user._id, name: user.name }
        }
      },
      {
        participants: [
          { id: user._id, name: user.name, model: 'User', avatar: user.avatar || '' },
          { id: admin._id, name: admin.name || 'Admin', model: 'Admin', avatar: '' }
        ],
        messages: [
          {
            content: 'URGENT: My application is down and I have a client meeting in 1 hour!',
            sender: { id: user._id, name: user.name, model: 'User' },
            messageType: 'text',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
            updatedAt: new Date(Date.now() - 1000 * 60 * 10)
          }
        ],
        status: 'pending',
        category: 'technical',
        priority: 'urgent',
        lastMessage: {
          content: 'URGENT: My application is down and I have a client meeting in 1 hour!',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          sender: { id: user._id, name: user.name }
        }
      },
      {
        participants: [
          { id: user._id, name: user.name, model: 'User', avatar: user.avatar || '' },
          { id: admin._id, name: admin.name || 'Admin', model: 'Admin', avatar: '' }
        ],
        messages: [
          {
            content: 'I have a billing question about my subscription.',
            sender: { id: user._id, name: user.name, model: 'User' },
            messageType: 'text',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
          },
          {
            content: 'Sure, I can help with that. What\'s your question?',
            sender: { id: admin._id, name: admin.name || 'Admin', model: 'Admin' },
            messageType: 'text',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5)
          }
        ],
        status: 'resolved',
        category: 'billing',
        priority: 'low',
        lastMessage: {
          content: 'Sure, I can help with that. What\'s your question?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
          sender: { id: admin._id, name: admin.name || 'Admin' }
        }
      }
    ];

    // Clear existing chats
    await Chat.deleteMany({});
    console.log('Cleared existing chats');

    // Create new sample chats
    const createdChats = await Chat.insertMany(sampleChats);
    console.log(`Created ${createdChats.length} sample chats`);

    // Log the created chats
    createdChats.forEach((chat, index) => {
      console.log(`Chat ${index + 1}:`);
      console.log(`  - ID: ${chat._id}`);
      console.log(`  - Status: ${chat.status}`);
      console.log(`  - Priority: ${chat.priority}`);
      console.log(`  - Category: ${chat.category}`);
      console.log(`  - Messages: ${chat.messages.length}`);
      console.log(`  - Participants: ${chat.participants.length}`);
      console.log('');
    });

    console.log('Sample chats created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error creating sample chats:', error);
    process.exit(1);
  }
};

createSampleChats();
