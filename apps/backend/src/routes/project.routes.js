const express = require('express');
const projectController = require('../controllers/project.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireProjectPermission, requireMembership } = require('../middlewares/permission.middleware');

const router = express.Router();

// Validation schemas
const createProjectSchema = {
    name: { required: true, minLength: 2, maxLength: 200 },
    description: { maxLength: 1000 },
    goal: { required: true, minLength: 10, maxLength: 500 },
    priority: { enum: ['low', 'medium', 'high', 'critical'] },
    targetEndDate: { required: true, date: true },
    workspaceId: { objectId: true },
    budget: {
        amount: { number: true, min: 0 },
        currency: { string: true }
    },
    tags: { array: true, arrayOf: 'string' }
};

const updateProjectSchema = {
    name: { minLength: 2, maxLength: 200 },
    description: { maxLength: 1000 },
    goal: { minLength: 10, maxLength: 500 },
    status: { enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'] },
    priority: { enum: ['low', 'medium', 'high', 'critical'] },
    targetEndDate: { date: true },
    budget: {
        amount: { number: true, min: 0 },
        currency: { string: true }
    },
    tags: { array: true, arrayOf: 'string' }
};

const addMemberSchema = {
    userId: { required: true, objectId: true },
    role: { enum: ['member', 'contributor', 'admin'], default: 'member' }
};

const updateMemberRoleSchema = {
    role: { required: true, enum: ['member', 'contributor', 'admin', 'owner'] }
};

const cloneProjectSchema = {
    name: { required: true, minLength: 2, maxLength: 200 },
    includeTeam: { boolean: true }
};

// Routes
router.get('/', projectController.getAllProjects);

router.get('/:id', 
    requireMembership('Project', 'team'),
    projectController.getProject
);

router.post('/', 
    validateMiddleware(createProjectSchema),
    projectController.createProject
);

router.put('/:id', 
    requireProjectPermission('canEditProject'),
    validateMiddleware(updateProjectSchema),
    projectController.updateProject
);

router.delete('/:id', 
    requireProjectPermission('canDeleteProject'),
    projectController.deleteProject
);

router.post('/:id/members',
    requireProjectPermission('canManageMembers'),
    validateMiddleware(addMemberSchema),
    projectController.addMember
);

router.delete('/:id/members/:memberId',
    requireProjectPermission('canManageMembers'),
    projectController.removeMember
);

router.put('/:id/members/:memberId/role',
    requireProjectPermission('canManageMembers'),
    validateMiddleware(updateMemberRoleSchema),
    projectController.updateMemberRole
);

router.get('/:id/members',
    requireMembership('Project', 'team'),
    projectController.getProjectMembers
);

router.get('/:id/insights',
    requireMembership('Project', 'team'),
    projectController.getProjectInsights
);

router.post('/:id/archive',
    requireProjectPermission('canEditProject'),
    projectController.archiveProject
);

router.post('/:id/clone',
    requireMembership('Project', 'team'),
    validateMiddleware(cloneProjectSchema),
    projectController.cloneProject
);

module.exports = router;