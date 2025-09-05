/**
 * SocketIO Permission Handler
 * Handles real-time permission checks for socket connections
 */

const User = require('../models/User');
const logger = require('../config/logger');

class PermissionSocket {
    constructor(io) {
        this.io = io;
        this.userSockets = new Map(); // userId -> socketId[]
        this.workspaceSockets = new Map(); // workspaceId -> socketId[]
        
        this.setupMiddleware();
        this.setupEventHandlers();
    }

    /**
     * Setup socket middleware for authentication and permission checking
     */
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                // Get token from handshake auth
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
                
                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                // Verify token and get user (you'll need to implement this)
                const user = await this.verifyToken(token);
                if (!user) {
                    return next(new Error('Invalid authentication token'));
                }

                // Attach user to socket
                socket.user = user;
                socket.userId = user.id;
                
                next();
            } catch (error) {
                logger.error('Socket authentication error:', error);
                next(new Error('Authentication failed'));
            }
        });
    }

    /**
     * Setup socket event handlers
     */
    setupEventHandlers() {
        this.io.on('connection', async (socket) => {
            logger.info(`Socket connected: ${socket.id} for user: ${socket.userId}`);
            
            // Handle workspace join
            socket.on('join-workspace', async (workspaceId) => {
                try {
                    const canJoin = await this.checkWorkspaceAccess(socket.userId, workspaceId);
                    
                    if (canJoin) {
                        await this.joinWorkspace(socket, workspaceId);
                        socket.emit('workspace-joined', { workspaceId, success: true });
                    } else {
                        socket.emit('workspace-join-error', { 
                            workspaceId, 
                            error: 'Access denied to workspace' 
                        });
                    }
                } catch (error) {
                    logger.error('Workspace join error:', error);
                    socket.emit('workspace-join-error', { 
                        workspaceId, 
                        error: 'Failed to join workspace' 
                    });
                }
            });

            // Handle workspace leave
            socket.on('leave-workspace', async (workspaceId) => {
                await this.leaveWorkspace(socket, workspaceId);
                socket.emit('workspace-left', { workspaceId });
            });

            // Handle space join
            socket.on('join-space', async (spaceId) => {
                try {
                    const canJoin = await this.checkSpaceAccess(socket.userId, spaceId);
                    
                    if (canJoin) {
                        await this.joinSpace(socket, spaceId);
                        socket.emit('space-joined', { spaceId, success: true });
                    } else {
                        socket.emit('space-join-error', { 
                            spaceId, 
                            error: 'Access denied to space' 
                        });
                    }
                } catch (error) {
                    logger.error('Space join error:', error);
                    socket.emit('space-join-error', { 
                        spaceId, 
                        error: 'Failed to join space' 
                    });
                }
            });

            // Handle board join
            socket.on('join-board', async (boardId) => {
                try {
                    const canJoin = await this.checkBoardAccess(socket.userId, boardId);
                    
                    if (canJoin) {
                        await this.joinBoard(socket, boardId);
                        socket.emit('board-joined', { boardId, success: true });
                    } else {
                        socket.emit('board-join-error', { 
                            boardId, 
                            error: 'Access denied to board' 
                        });
                    }
                } catch (error) {
                    logger.error('Board join error:', error);
                    socket.emit('board-join-error', { 
                        boardId, 
                        error: 'Failed to join board' 
                    });
                }
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    /**
     * Check if user has access to workspace
     */
    async checkWorkspaceAccess(userId, workspaceId) {
        try {
            const user = await User.findById(userId);
            if (!user) return false;

            const userRoles = await user.getRoles();
            const wsRole = userRoles.workspaces.find(ws => 
                ws.workspace.toString() === workspaceId.toString()
            );

            return !!wsRole;
        } catch (error) {
            logger.error('Workspace access check error:', error);
            return false;
        }
    }

    /**
     * Check if user has access to space
     */
    async checkSpaceAccess(userId, spaceId) {
        try {
            const user = await User.findById(userId);
            if (!user) return false;

            const userRoles = await user.getRoles();
            const Space = require('../models/Space');
            const space = await Space.findById(spaceId);
            
            if (!space) return false;

            const wsRole = userRoles.workspaces.find(ws => 
                ws.workspace.toString() === space.workspace.toString()
            );

            return !!wsRole;
        } catch (error) {
            logger.error('Space access check error:', error);
            return false;
        }
    }

    /**
     * Check if user has access to board
     */
    async checkBoardAccess(userId, boardId) {
        try {
            const user = await User.findById(userId);
            if (!user) return false;

            const userRoles = await user.getRoles();
            const Board = require('../models/Board');
            const board = await Board.findById(boardId);
            
            if (!board) return false;

            const wsRole = userRoles.workspaces.find(ws => 
                ws.workspace.toString() === board.workspace.toString()
            );

            return !!wsRole;
        } catch (error) {
            logger.error('Board access check error:', error);
            return false;
        }
    }

    /**
     * Join workspace room
     */
    async joinWorkspace(socket, workspaceId) {
        // Leave previous workspace rooms
        socket.rooms.forEach(room => {
            if (room.startsWith('workspace:')) {
                socket.leave(room);
            }
        });

        // Join new workspace room
        const roomName = `workspace:${workspaceId}`;
        socket.join(roomName);
        
        // Track socket in workspace
        if (!this.workspaceSockets.has(workspaceId)) {
            this.workspaceSockets.set(workspaceId, new Set());
        }
        this.workspaceSockets.get(workspaceId).add(socket.id);

        // Track user sockets
        if (!this.userSockets.has(socket.userId)) {
            this.userSockets.set(socket.userId, new Set());
        }
        this.userSockets.get(socket.userId).add(socket.id);

        logger.info(`User ${socket.userId} joined workspace ${workspaceId}`);
    }

    /**
     * Join space room
     */
    async joinSpace(socket, spaceId) {
        const roomName = `space:${spaceId}`;
        socket.join(roomName);
        logger.info(`User ${socket.userId} joined space ${spaceId}`);
    }

    /**
     * Join board room
     */
    async joinBoard(socket, boardId) {
        const roomName = `board:${boardId}`;
        socket.join(roomName);
        logger.info(`User ${socket.userId} joined board ${boardId}`);
    }

    /**
     * Leave workspace room
     */
    async leaveWorkspace(socket, workspaceId) {
        const roomName = `workspace:${workspaceId}`;
        socket.leave(roomName);
        
        // Remove from tracking
        if (this.workspaceSockets.has(workspaceId)) {
            this.workspaceSockets.get(workspaceId).delete(socket.id);
        }
        
        logger.info(`User ${socket.userId} left workspace ${workspaceId}`);
    }

    /**
     * Leave space room
     */
    async leaveSpace(socket, spaceId) {
        const roomName = `space:${spaceId}`;
        socket.leave(roomName);
        logger.info(`User ${socket.userId} left space ${spaceId}`);
    }

    /**
     * Leave board room
     */
    async leaveBoard(socket, boardId) {
        const roomName = `board:${boardId}`;
        socket.leave(roomName);
        logger.info(`User ${socket.userId} left board ${boardId}`);
    }

    /**
     * Handle socket disconnect
     */
    handleDisconnect(socket) {
        logger.info(`Socket disconnected: ${socket.id} for user: ${socket.userId}`);
        
        // Clean up tracking
        if (this.userSockets.has(socket.userId)) {
            this.userSockets.get(socket.userId).delete(socket.id);
            if (this.userSockets.get(socket.userId).size === 0) {
                this.userSockets.delete(socket.userId);
            }
        }

        // Clean up workspace tracking
        this.workspaceSockets.forEach((sockets, workspaceId) => {
            if (sockets.has(socket.id)) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    this.workspaceSockets.delete(workspaceId);
                }
            }
        });
    }

    /**
     * Emit to workspace room
     */
    emitToWorkspace(workspaceId, event, data) {
        const roomName = `workspace:${workspaceId}`;
        this.io.to(roomName).emit(event, data);
    }

    /**
     * Emit to space room
     */
    emitToSpace(spaceId, event, data) {
        const roomName = `space:${spaceId}`;
        this.io.to(roomName).emit(event, data);
    }

    /**
     * Emit to board room
     */
    emitToBoard(boardId, event, data) {
        const roomName = `board:${boardId}`;
        this.io.to(roomName).emit(event, data);
    }

    /**
     * Emit to specific user
     */
    emitToUser(userId, event, data) {
        if (this.userSockets.has(userId)) {
            this.userSockets.get(userId).forEach(socketId => {
                this.io.to(socketId).emit(event, data);
            });
        }
    }

    /**
     * Verify JWT token
     */
    async verifyToken(token) {
        try {
            const jwt = require('../utils/jwt');
            const decoded = jwt.verifyToken(token);
            return await User.findById(decoded.id);
        } catch (error) {
            logger.error('Token verification error:', error);
            return null;
        }
    }
}

module.exports = PermissionSocket;
