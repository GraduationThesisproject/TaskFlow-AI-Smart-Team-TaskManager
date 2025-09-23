const express = require('express');
const invitationController = require('../controllers/invitation.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');
const { invitation: invitationSchemas } = require('./validator');

const router = express.Router();

// Protected routes that require authentication
router.get('/token/:token', authMiddleware, invitationController.getByToken);
router.post('/token/:token/accept', authMiddleware, invitationController.acceptInvitation);
router.post('/token/:token/decline', authMiddleware, invitationController.declineInvitation);

// Protected routes
router.post('/', 
    authMiddleware,
    validateMiddleware.validateBody(invitationSchemas.createInvitationSchema),
    invitationController.createInvitation
);

router.get('/', authMiddleware, invitationController.getUserInvitations);

router.get('/user/pending', authMiddleware, invitationController.getUserInvitations);

router.post('/bulk-invite',
    authMiddleware,
    validateMiddleware.validateBody(invitationSchemas.bulkInviteSchema),
    invitationController.bulkInvite
);

// GitHub member invitation routes
router.post('/github-members',
    authMiddleware,
    validateMiddleware.validateBody(invitationSchemas.inviteGitHubMembersSchema),
    invitationController.inviteGitHubMembers
);

// Invitation management routes
router.get('/:invitationId', authMiddleware, invitationController.getInvitationById);
router.post('/:invitationId/accept', authMiddleware, invitationController.acceptInvitation);
router.post('/:invitationId/decline', authMiddleware, invitationController.declineInvitation);
router.delete('/:invitationId', authMiddleware, invitationController.cancelInvitation);

// Statistics routes
router.get('/stats/:entityType/:entityId', authMiddleware, invitationController.getInvitationStats);

// Admin routes
router.post('/cleanup-expired',
    authMiddleware,
    requireSystemAdmin,
    invitationController.cleanupExpiredInvitations
);

module.exports = router;