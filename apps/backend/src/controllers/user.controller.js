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
