const express = require('express');
const chatController = require('../controllers/chat.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');

const router = express.Router();

// Public routes (for users to create chats)
router.post('/create', chatController.createChat);

// Protected admin routes
router.use(authMiddleware);
router.use(requireSystemAdmin);

router.get('/admin/chats', chatController.getAdminChats);
router.get('/admin/chats/:chatId', chatController.getChatById);
router.post('/admin/chats/:chatId/messages', chatController.sendMessage);
router.patch('/admin/chats/:chatId/status', chatController.updateChatStatus);
router.get('/admin/chats/stats', chatController.getChatStats);
router.patch('/admin/chats/:chatId/read', chatController.markMessagesAsRead);

module.exports = router;
