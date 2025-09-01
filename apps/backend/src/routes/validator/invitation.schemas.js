/**
 * Invitation Validation Schemas
 * Contains all validation rules for invitation-related endpoints
 */

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

module.exports = {
    createInvitationSchema,
    bulkInviteSchema,
    extendInvitationSchema
};
