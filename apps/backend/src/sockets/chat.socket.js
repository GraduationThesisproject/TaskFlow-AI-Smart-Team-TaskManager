const jwt = require('jsonwebtoken');
const env = require('../config/env');

const setupChatSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userModel = decoded.model || 'User';
      next();
    } catch (error) {
      return next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.userId}, Model: ${socket.userModel})`);

    // Join admin room if admin
    if (socket.userModel === 'Admin') {
      socket.join('admin-room');
      console.log(`Admin ${socket.userId} joined admin room`);
      
      // Emit admin online status
      socket.broadcast.to('admin-room').emit('admin:online', {
        adminId: socket.userId,
        timestamp: new Date()
      });
    }

    // Join user room if user
    if (socket.userModel === 'User') {
      socket.join(`user:${socket.userId}`);
      console.log(`User ${socket.userId} joined user room`);
    }

    // Handle joining specific chat rooms
    socket.on('chat:join', (data) => {
      const { chatId } = data;
      if (chatId) {
        socket.join(`chat:${chatId}`);
        console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
        
        // Emit user joined event
        socket.to(`chat:${chatId}`).emit('chat:user-joined', {
          chatId,
          user: {
            id: socket.userId,
            name: socket.userName || 'Unknown',
            model: socket.userModel
          }
        });
      }
    });

    // Handle leaving chat rooms
    socket.on('chat:leave', (data) => {
      const { chatId } = data;
      if (chatId) {
        socket.leave(`chat:${chatId}`);
        console.log(`Socket ${socket.id} left chat room: ${chatId}`);
        
        // Emit user left event
        socket.to(`chat:${chatId}`).emit('chat:user-left', {
          chatId,
          user: {
            id: socket.userId,
            name: socket.userName || 'Unknown',
            model: socket.userModel
          }
        });
      }
    });

    // Handle typing indicators
    socket.on('chat:typing', (data) => {
      const { chatId, isTyping } = data;
      if (chatId) {
        socket.to(`chat:${chatId}`).emit('chat:user-typing', {
          chatId,
          user: {
            id: socket.userId,
            name: socket.userName || 'Unknown',
            model: socket.userModel
          },
          isTyping
        });
      }
    });

    // Handle admin joining admin room
    socket.on('admin:join', (data) => {
      const { adminId } = data;
      if (adminId && socket.userModel === 'Admin') {
        socket.join(`admin:${adminId}`);
        console.log(`Admin ${adminId} joined personal admin room`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      // Emit offline status
      if (socket.userModel === 'Admin') {
        socket.broadcast.to('admin-room').emit('admin:offline', {
          adminId: socket.userId,
          timestamp: new Date()
        });
      }
    });
  });

  // Make io available to controllers
  io.use((socket, next) => {
    socket.req = socket.request;
    socket.req.io = io;
    next();
  });

  return io;
};

module.exports = { setupChatSocket };
