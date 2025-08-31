const express = require('express');
const invitationController = require('../controllers/invitation.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');
const { invitation: invitationSchemas } = require('./validator');

const router = express.Router();



// Public routes (no auth required)
router.get('/token/:token', invitationController.getInvitation);

// Protected routes that require authentication
router.post('/token/:token/accept', authMiddleware, invitationController.acceptInvitation);
router.post('/token/:token/decline', authMiddleware, invitationController.declineInvitation);

// Protected routes
router.post('/', 
    authMiddleware,
    validateMiddleware(invitationSchemas.createInvitationSchema),
    invitationController.createInvitation
);

router.get('/', authMiddleware, invitationController.getUserInvitations);

router.get('/user/pending', authMiddleware, invitationController.getUserInvitations);

router.get('/entity/:entityType/:entityId', 
    authMiddleware,
    invitationController.getEntityInvitations
);

router.post('/bulk-invite',
    authMiddleware,
    validateMiddleware(invitationSchemas.bulkInviteSchema),
    invitationController.bulkInvite
);

router.delete('/:id', authMiddleware, invitationController.cancelInvitation);

router.post('/:id/resend', authMiddleware, invitationController.resendInvitation);

router.patch('/:id/extend',
    authMiddleware,
    validateMiddleware(invitationSchemas.extendInvitationSchema),
    invitationController.extendInvitation
);

// Admin routes
router.post('/cleanup-expired',
    authMiddleware,
    requireSystemAdmin,
    invitationController.cleanupExpired
);

module.exports = router;
