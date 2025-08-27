const express = require('express');
const chatController = require('../controllers/chat.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');

const router = express.Router();

// Public routes (for user chat widget)
router.post('/widget/start', chatController.startChat);
router.post('/widget/:chatId/message', chatController.sendMessage);
router.get('/widget/:chatId/history', chatController.getChatHistory);

// Admin routes (protected)
router.use(authMiddleware);
router.use(requireSystemAdmin);

// Admin chat management
router.get('/admin/active', chatController.getActiveChats);
router.get('/admin/stats', chatController.getChatStats);
router.post('/admin/:chatId/accept', chatController.acceptChat);
router.post('/admin/:chatId/messages', chatController.sendAdminMessage);
router.patch('/admin/:chatId/status', chatController.updateChatStatus);
router.post('/admin/:chatId/close', chatController.closeChat);
router.get('/admin/:chatId/history', chatController.getChatHistory);
router.post('/admin/:chatId/read', chatController.markMessagesAsRead);

// Chat search and filtering
router.get('/admin/search', chatController.searchChats);
router.get('/admin/:chatId', chatController.getChatById);

module.exports = router;
