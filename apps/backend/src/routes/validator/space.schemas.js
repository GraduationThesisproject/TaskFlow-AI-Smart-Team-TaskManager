/**
 * Space Validation Schemas
 * Contains all validation rules for space-related endpoints
 */

const createSpaceSchema = {
    name: { required: true, minLength: 2, maxLength: 200 },
    description: { maxLength: 1000 },
    workspaceId: { required: true, objectId: true },
    settings: { object: true },
    permissions: { object: true }
};

const updateSpaceSchema = {
    name: { minLength: 2, maxLength: 200 },
    description: { maxLength: 1000 },
    settings: { object: true },
    permissions: { object: true }
};

const addMemberSchema = {
    userId: { required: true, objectId: true },
    role: { enum: ['viewer', 'member', 'admin'], default: 'member' }
};

module.exports = {
    createSpaceSchema,
    updateSpaceSchema,
    addMemberSchema
};
