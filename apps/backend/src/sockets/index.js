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
const aiSocket = require('./ai.socket');
const PermissionSocket = require('./permission.socket');

// Import socket manager to set Socket.IO instance
const { setSocketIO } = require('../utils/socketManager');

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
        chat: chatSocket(io),
        ai: aiSocket(io)
    };

    // Store namespaces locally for getNamespace function
    socketNamespaces = namespaces;

    // Set Socket.IO instance in workspace controller for real-time events
    setSocketIO(io, namespaces.workspace);

    // Log socket initialization
    const logger = require('../config/logger');
    logger.info('Socket system initialized with namespaces:', Object.keys(namespaces));

    return namespaces;
};

// Store namespaces locally instead of using globals
let socketNamespaces = {};

/**
 * Get socket namespace by name
 * @param {string} namespaceName - Name of the namespace
 * @returns {Object|null} Socket namespace or null if not found
 */
const getNamespace = (namespaceName) => {
    return socketNamespaces[namespaceName] || null;
};

/**
 * Broadcast message to all connected users
 * @param {string} event - Event name
 * @param {*} data - Event data
 */
const broadcastToAll = (event, data) => {
    const boardNamespace = socketNamespaces.board;
    if (boardNamespace) {
        boardNamespace.emit(event, data);
    }
};

/**
 * Send notification to specific user
 * @param {string} userId - User ID
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification
 */
const sendNotification = async (userId, notificationData) => {
    const notificationNamespace = socketNamespaces.notification;
    if (notificationNamespace && notificationNamespace.sendNotification) {
        return await notificationNamespace.sendNotification(userId, notificationData);
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
    const notificationNamespace = socketNamespaces.notification;
    if (notificationNamespace && notificationNamespace.broadcastSystemNotification) {
        return await notificationNamespace.broadcastSystemNotification(notificationData, userFilter);
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
    const boardNamespace = socketNamespaces.board;
    if (boardNamespace && boardNamespace.notifyBoard) {
        boardNamespace.notifyBoard(boardId, event, data);
    }
};

/**
 * Get system health status
 * @returns {Object} System health information
 */
const getSystemHealth = () => {
    const systemNamespace = socketNamespaces.system;
    if (systemNamespace) {
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
    aiSocket,
    
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
