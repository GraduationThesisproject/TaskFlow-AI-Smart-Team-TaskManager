const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/template.controller');
const auth = require('../middlewares/auth.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const mongoose = require('mongoose');

// Validation schemas
const idParamSchema = { id: { required: true, objectId: true } };

const listQuerySchema = {
  type: { enum: ['task', 'board', 'space', 'workflow', 'checklist'] },
  category: { enum: [
    'Marketing','Development','Design','Sales','Support','Operations','HR','Finance','General','Custom'
  ] },
  q: { string: true, minLength: 1 },
  isPublic: { string: true, pattern: /^(true|false)$/ },
  status: { enum: ['draft', 'active', 'archived', 'deprecated'] },
  limit: { number: true, min: 1, max: 200 },
  workspaceId: { objectId: true },
  scope: { enum: ['all'] }
};

const createTemplateSchema = {
  name: { required: true, string: true, minLength: 2, maxLength: 100 },
  description: { string: true, maxLength: 500 },
  type: { required: true, enum: ['task', 'board', 'space', 'workflow', 'checklist'] },
  content: { required: true, object: true },
  category: { enum: [
    'Marketing','Development','Design','Sales','Support','Operations','HR','Finance','General','Custom'
  ] },
  tags: { array: true, arrayOf: 'string', maxItems: 20 },
  isPublic: { boolean: true },
  status: { enum: ['draft', 'active', 'archived', 'deprecated'] },
  accessControl: { object: true }
};

const updateTemplateSchema = {
  name: { string: true, minLength: 2, maxLength: 100 },
  description: { string: true, maxLength: 500 },
  type: { enum: ['task', 'board', 'space', 'workflow', 'checklist'] },
  content: { object: true },
  category: { enum: [
    'Marketing','Development','Design','Sales','Support','Operations','HR','Finance','General','Custom'
  ] },
  tags: { array: true, arrayOf: 'string', maxItems: 20 },
  isPublic: { boolean: true },
  status: { enum: ['draft', 'active', 'archived', 'deprecated'] },
  accessControl: { object: true }
};

// Custom validators for nested fields
const ALLOWED_ROLES = ['user','manager','team_member','admin','superadmin'];

const validateTagsLength = (req, res, next) => {
  const tags = req.body?.tags;
  if (!Array.isArray(tags)) return next();
  const tooLong = tags.find((t) => typeof t !== 'string' || t.length > 50);
  if (tooLong) {
    return res.status(400).json({ success: false, message: 'Each tag must be a string of max length 50' });
  }
  next();
};

const validateAccessControl = (req, res, next) => {
  const ac = req.body?.accessControl;
  if (!ac) return next();
  const { allowedUsers, allowedWorkspaces, allowedRoles } = ac;
  if (allowedUsers) {
    if (!Array.isArray(allowedUsers) || !allowedUsers.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, message: 'accessControl.allowedUsers must be an array of valid ObjectIds' });
    }
  }
  if (allowedWorkspaces) {
    if (!Array.isArray(allowedWorkspaces) || !allowedWorkspaces.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, message: 'accessControl.allowedWorkspaces must be an array of valid ObjectIds' });
    }
  }
  if (allowedRoles) {
    if (!Array.isArray(allowedRoles) || !allowedRoles.every((r) => ALLOWED_ROLES.includes(r))) {
      return res.status(400).json({ success: false, message: `accessControl.allowedRoles must be an array within: ${ALLOWED_ROLES.join(', ')}` });
    }
  }
  next();
};

// CRUD
router.get('/', validateMiddleware.validateQuery(listQuerySchema), ctrl.list);
router.get('/:id', validateMiddleware.validateParams(idParamSchema), ctrl.getById);
router.post('/', auth, validateMiddleware(createTemplateSchema), validateTagsLength, validateAccessControl, ctrl.create);
router.put('/:id', auth, validateMiddleware.validateParams(idParamSchema), validateMiddleware(updateTemplateSchema), validateTagsLength, validateAccessControl, ctrl.update);
router.delete('/:id', auth, validateMiddleware.validateParams(idParamSchema), ctrl.remove);

// Engagement
router.post('/:id/views', validateMiddleware.validateParams(idParamSchema), ctrl.incrementViews);
router.post('/:id/like', auth, validateMiddleware.validateParams(idParamSchema), ctrl.toggleLike);

module.exports = router;
