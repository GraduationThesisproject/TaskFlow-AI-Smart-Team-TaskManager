/**
 * Workspace Validation Schemas
 * Contains all validation rules for workspace-related endpoints
 */

const createWorkspaceSchema = {
    name: { required: true, minLength: 2, maxLength: 200 },
    description: { maxLength: 1000 },
    plan: { enum: ['free', 'basic', 'premium', 'enterprise'] }
};

const updateWorkspaceSchema = {
    name: { minLength: 2, maxLength: 200 },
    description: { maxLength: 1000 },
    settings: { object: true },
    githubOrg: { 
        object: true
    }
};

const inviteMemberSchema = {
    email: { required: true, email: true },
    role: { enum: ['member', 'admin'], default: 'member' },
    message: { maxLength: 500 }
};

const updateSettingsSchema = {
    section: { required: true, string: true },
    updates: { required: true, object: true }
};

const transferOwnershipSchema = {
    newOwnerId: { required: true, objectId: true }
};

const updateVisibilitySchema = {
    visibility: { required: true, enum: ['public', 'private'] }
};

const updateWorkspaceRulesSchema = {
    content: { required: true, string: true, maxLength: 10000 }
};

module.exports = {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    inviteMemberSchema,
    updateSettingsSchema,
    transferOwnershipSchema,
    updateVisibilitySchema,
    updateWorkspaceRulesSchema
};
