const express = require('express');
const invitationController = require('../controllers/invitation.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');

const router = express.Router();

// Validation schemas
const bulkInviteSchema = {
    emails: { required: true, array: true, arrayOf: 'email', minItems: 1, maxItems: 50 },
    entityType: { required: true, enum: ['workspace', 'project', 'space'] },
    entityId: { required: true, objectId: true },
    role: { enum: ['viewer', 'member', 'contributor', 'admin'], default: 'member' },
    message: { maxLength: 500 }
};

const extendInvitationSchema = {
    days: { number: true, min: 1, max: 30 }
};

// Public routes (no auth required)
router.get('/token/:token', invitationController.getInvitation);
router.post('/token/:token/accept', invitationController.acceptInvitation);
router.post('/token/:token/decline', invitationController.declineInvitation);

// Protected routes
router.get('/user/pending', invitationController.getUserInvitations);

router.get('/entity/:entityType/:entityId', 
    invitationController.getEntityInvitations
);

router.post('/bulk-invite',
    validateMiddleware(bulkInviteSchema),
    invitationController.bulkInvite
);

router.delete('/:id', invitationController.cancelInvitation);

router.post('/:id/resend', invitationController.resendInvitation);

router.patch('/:id/extend',
    validateMiddleware(extendInvitationSchema),
    invitationController.extendInvitation
);

// Admin routes
router.post('/cleanup-expired',
    requireSystemAdmin,
    invitationController.cleanupExpired
);

module.exports = router;
