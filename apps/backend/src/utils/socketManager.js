/**
 * Socket.IO Manager Utility
 * Centralized management of Socket.IO instances for real-time events
 */

let io = null;
let workspaceIo = null;

/**
 * Set Socket.IO instances
 * @param {Object} socketIO - Main Socket.IO instance
 * @param {Object} workspaceSocketIO - Workspace namespace Socket.IO instance
 */
const setSocketIO = (socketIO, workspaceSocketIO) => {
    io = socketIO;
    workspaceIo = workspaceSocketIO;
};

/**
 * Get main Socket.IO instance
 * @returns {Object|null} Main Socket.IO instance
 */
const getSocketIO = () => io;

/**
 * Get workspace Socket.IO instance
 * @returns {Object|null} Workspace Socket.IO instance
 */
const getWorkspaceSocketIO = () => workspaceIo;

/**
 * Emit invitation received event
 * @param {string} userId - User ID to emit to
 * @param {Object} invitationData - Invitation data
 */
const emitInvitationReceived = (userId, invitationData) => {
    if (io) {
        try {
            // Emit to the user directly
            io.to(userId.toString()).emit('invitation:received', invitationData);
            
            // Also emit to notifications namespace
            io.to(`notifications:${userId}`).emit('invitation:received', invitationData);
            
            console.log('Socket.IO invitation events emitted to user:', userId);
        } catch (error) {
            console.error('Failed to emit Socket.IO events:', error);
        }
    } else {
        console.warn('Socket.IO not available for real-time updates');
    }
};

/**
 * Emit workspace member event
 * @param {string} workspaceId - Workspace ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const emitWorkspaceEvent = (workspaceId, event, data) => {
    if (workspaceIo) {
        try {
            workspaceIo.to(workspaceId).emit(event, data);
            console.log(`Workspace event ${event} emitted to workspace ${workspaceId}`);
        } catch (error) {
            console.error(`Failed to emit workspace event ${event}:`, error);
        }
    } else {
        console.warn('Workspace Socket.IO not available for real-time updates');
    }
};

module.exports = {
    setSocketIO,
    getSocketIO,
    getWorkspaceSocketIO,
    emitInvitationReceived,
    emitWorkspaceEvent
};

