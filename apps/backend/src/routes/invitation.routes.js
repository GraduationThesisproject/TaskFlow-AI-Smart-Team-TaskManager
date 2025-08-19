const express = require('express');
const invitationController = require('../controllers/invitation.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');

const router = express.Router();

// Validation schemas
const createInvitationSchema = {
    email: { required: true, email: true },
    name: { maxLength: 100 },
    targetEntity: { 
        type: { required: true, enum: ['Workspace', 'Space'] },
        id: { required: true, objectId: true }
    },
    role: { enum: ['viewer', 'member', 'contributor', 'admin'], default: 'member' },
    message: { maxLength: 500 }
};

const bulkInviteSchema = {
    emails: { required: true, array: true, arrayOf: 'email', minItems: 1, maxItems: 50 },
    entityType: { required: true, enum: ['workspace', 'space'] },
    entityId: { required: true, objectId: true },
    role: { enum: ['viewer', 'member', 'contributor', 'admin'], default: 'member' },
    message: { maxLength: 500 }
};

const extendInvitationSchema = {
    days: { number: true, min: 1, max: 30 }
};

// Public routes (no auth required)
router.get('/token/:token', invitationController.getInvitation);

// Protected routes that require authentication
router.post('/token/:token/accept', authMiddleware, invitationController.acceptInvitation);
router.post('/token/:token/decline', authMiddleware, invitationController.declineInvitation);

// Protected routes
router.post('/', 
    authMiddleware,
    validateMiddleware(createInvitationSchema),
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
    validateMiddleware(bulkInviteSchema),
    invitationController.bulkInvite
);

router.delete('/:id', authMiddleware, invitationController.cancelInvitation);

router.post('/:id/resend', authMiddleware, invitationController.resendInvitation);

router.patch('/:id/extend',
    authMiddleware,
    validateMiddleware(extendInvitationSchema),
    invitationController.extendInvitation
);

// Admin routes
router.post('/cleanup-expired',
    authMiddleware,
    requireSystemAdmin,
    invitationController.cleanupExpired
);

module.exports = router;
