const express = require('express');
const tagController = require('../controllers/tag.controller');
const validateMiddleware = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation schemas
const createTagSchema = {
    name: { required: true, minLength: 1, maxLength: 50 },
    color: { required: true, pattern: /^#[0-9A-F]{6}$/i },
    description: { maxLength: 200 }
};

const updateTagSchema = {
    name: { minLength: 1, maxLength: 50 },
    color: { pattern: /^#[0-9A-F]{6}$/i },
    description: { maxLength: 200 }
};

const mergeTagsSchema = {
    sourceTagId: { required: true, objectId: true },
    targetTagId: { required: true, objectId: true }
};

// Routes
router.get('/project/:projectId', tagController.getProjectTags);
router.get('/project/:projectId/usage', tagController.getTagUsage);

router.post('/project/:projectId',
    validateMiddleware(createTagSchema),
    tagController.createTag
);

router.put('/:id',
    validateMiddleware(updateTagSchema),
    tagController.updateTag
);

router.delete('/:id', tagController.deleteTag);

router.post('/merge',
    validateMiddleware(mergeTagsSchema),
    tagController.mergeTags
);

module.exports = router;
