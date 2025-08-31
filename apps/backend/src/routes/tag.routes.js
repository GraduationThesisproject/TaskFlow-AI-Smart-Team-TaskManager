const express = require('express');
const tagController = require('../controllers/tag.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { tag: tagSchemas } = require('./validator');

const router = express.Router();
// List/search all accessible tags
router.get('/', async (req, res) => {
    try {
        const { scope, search } = req.query;
        const userId = req.user.id;
        const Tag = require('../models/Tag');

        const query = { isActive: true };
        if (scope) query.scope = scope;
        if (search) query.name = { $regex: search, $options: 'i' };

        const tags = await Tag.find(query).limit(100);
        res.status(200).json({ success: true, message: 'Tags retrieved', data: { tags } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error retrieving tags' });
    }
});



// Routes
router.get('/space/:spaceId', tagController.getSpaceTags);
router.get('/space/:spaceId/usage', tagController.getTagUsage);

router.post('/space/:spaceId',
    validateMiddleware(tagSchemas.createTagSchema),
    tagController.createTag
);

router.put('/:id',
    validateMiddleware(tagSchemas.updateTagSchema),
    tagController.updateTag
);

router.delete('/:id', tagController.deleteTag);

router.post('/merge',
    validateMiddleware(tagSchemas.mergeTagsSchema),
    tagController.mergeTags
);

// Bulk create tags for a space
router.post('/bulk-create', async (req, res) => {
    try {
        const { spaceId, tags } = req.body;
        const userId = req.user.id;
        const TagService = require('../services/tag.service');
        const Tag = require('../models/Tag');
        const User = require('../models/User');
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        if (!userRoles.hasSpaceRole(spaceId, 'member')) {
            return res.status(403).json({ success: false, message: 'Access denied to this space' });
        }
        const created = [];
        let skipped = 0;
        const processedNames = new Set();
        
        for (const data of tags) {
            try {
                const normalizedName = data.name.toLowerCase().trim();
                if (processedNames.has(normalizedName)) {
                    skipped += 1;
                    continue;
                }
                
                // Check if tag already exists in database
                const existingTag = await Tag.findOne({ 
                    name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }, 
                    space: spaceId 
                });
                
                if (existingTag) {
                    skipped += 1;
                    continue;
                }
                
                const tag = await TagService.createOrGetTag(spaceId, data.name, data.color, userId);
                created.push(tag);
                processedNames.add(normalizedName);
            } catch (e) {
                skipped += 1;
            }
        }
        res.status(201).json({ success: true, message: 'Tags created', data: { tags: created, created: created.length, skipped } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error creating tags' });
    }
});

module.exports = router;
