/**
 * TaskFlow Socket System - Central Export File
 * 
 * This file provides a centralized interface for all socket handlers
 * and utilities in the TaskFlow application.
 */

const boardSocket = require('./board.socket');
const notificationSocket = require('./notification.socket');
const systemSocket = require('./system.socket');
const workspaceSocket = require('./workspace.socket');
const chatSocket = require('./chat.socket');
const PermissionSocket = require('./permission.socket');

/**
 * Initialize all socket handlers
 * @param {Object} io - Socket.IO server instance
 * @returns {Object} Object containing all socket namespaces
 */
const initializeSockets = (io) => {
    // Initialize permission socket first (handles authentication)
    const permissionSocket = new PermissionSocket(io);
    
    const namespaces = {
        permission: permissionSocket,
        board: boardSocket(io),
        notification: notificationSocket(io),
        system: systemSocket(io),
        workspace: workspaceSocket(io),
        chat: chatSocket(io)
    };

    // Log socket initialization
    const logger = require('../config/logger');
    logger.info('Socket system initialized with namespaces:', Object.keys(namespaces));

    return namespaces;
};

/**
 * Get socket namespace by name
 * @param {string} namespaceName - Name of the namespace
 * @returns {Object|null} Socket namespace or null if not found
 */
const getNamespace = (namespaceName) => {
    const namespaces = {
        board: global.io,
        notification: global.notificationNamespace,
        system: global.systemNamespace,
        workspace: global.workspaceNamespace,
        chat: global.chatNamespace
    };

    return namespaces[namespaceName] || null;
};

/**
 * Broadcast message to all connected users
 * @param {string} event - Event name
 * @param {*} data - Event data
 */
const broadcastToAll = (event, data) => {
    if (global.io) {
        global.io.emit(event, data);
    }
};

/**
 * Send notification to specific user
 * @param {string} userId - User ID
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification
 */
const sendNotification = async (userId, notificationData) => {
    if (global.notificationNamespace) {
        return await global.notificationNamespace.sendNotification(userId, notificationData);
    }
    throw new Error('Notification namespace not available');
};

/**
 * Send system notification to all users
 * @param {Object} notificationData - Notification data
 * @param {Object} userFilter - User filter criteria
 * @returns {Promise<Array>} Results of bulk notification sending
 */
const broadcastSystemNotification = async (notificationData, userFilter = {}) => {
    if (global.notificationNamespace) {
        return await global.notificationNamespace.broadcastSystemNotification(notificationData, userFilter);
    }
    throw new Error('Notification namespace not available');
};

/**
 * Notify all users in a specific board
 * @param {string} boardId - Board ID
 * @param {string} event - Event name
 * @param {*} data - Event data
 */
const notifyBoard = (boardId, event, data) => {
    if (global.io) {
        global.io.notifyBoard(boardId, event, data);
    }
};

/**
 * Get system health status
 * @returns {Object} System health information
 */
const getSystemHealth = () => {
    if (global.systemNamespace) {
        // This would typically call a method on the system namespace
        return {
            status: 'available',
            timestamp: new Date()
        };
    }
    return {
        status: 'unavailable',
        timestamp: new Date()
    };
};

module.exports = {
    // Socket handlers
    boardSocket,
    notificationSocket,
    systemSocket,
    workspaceSocket,
    chatSocket,
    
    // Initialization
    initializeSockets,
    
    // Utility functions
    getNamespace,
    broadcastToAll,
    sendNotification,
    broadcastSystemNotification,
    notifyBoard,
    getSystemHealth
};
