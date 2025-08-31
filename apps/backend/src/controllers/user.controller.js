const User = require('../models/User');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get all users (for autocomplete and user selection)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: true })
            .select('name email avatar isActive')
            .sort({ name: 1 });

        sendResponse(res, 200, true, 'Users retrieved successfully', users);
    } catch (error) {
        logger.error('Get all users error:', error);
        sendResponse(res, 500, false, 'Server error retrieving users');
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id)
            .select('name email avatar isActive preferences');

        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        sendResponse(res, 200, true, 'User retrieved successfully', user);
    } catch (error) {
        logger.error('Get user by ID error:', error);
        sendResponse(res, 500, false, 'Server error retrieving user');
    }
};

// Search users by name or email
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return sendResponse(res, 400, false, 'Search query must be at least 2 characters');
        }

        const users = await User.find({
            isActive: true,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        })
        .select('name email avatar')
        .limit(10)
        .sort({ name: 1 });

        sendResponse(res, 200, true, 'Users found successfully', users);
    } catch (error) {
        logger.error('Search users error:', error);
        sendResponse(res, 500, false, 'Server error searching users');
    }
};

// Update user plan after successful payment
exports.updateUserPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const { planName, sessionId, upgradeDate } = req.body;

        if (!planName || !sessionId) {
            return sendResponse(res, 400, false, 'Plan name and session ID are required');
        }

        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Update user's subscription plan
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    'subscription.plan': planName,
                    'subscription.status': 'active',
                    'subscription.startDate': upgradeDate || new Date(),
                    'subscription.paymentSessionId': sessionId,
                    'subscription.lastUpdated': new Date()
                }
            },
            { new: true, runValidators: true }
        ).select('-password');

        logger.info(`User ${userId} upgraded to ${planName} plan`);
        sendResponse(res, 200, true, 'Plan updated successfully', updatedUser);
    } catch (error) {
        logger.error('Update user plan error:', error);
        sendResponse(res, 500, false, 'Server error updating user plan');
    }
};
