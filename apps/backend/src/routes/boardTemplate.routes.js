const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/boardTemplate.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { adminMiddleware } = require('../middlewares/admin.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');

// Validation schemas
const idParamSchema = { id: { required: true, objectId: true } };

const listQuerySchema = {
  page: { number: true, min: 1 },
  limit: { number: true, min: 1, max: 100 },
  search: { string: true, minLength: 1 },
  category: { array: true, arrayOf: 'string' },
  status: { enum: ['active', 'inactive'] }
};

const publicQuerySchema = {
  categories: { array: true, arrayOf: 'string' },
  limit: { number: true, min: 1, max: 50 },
  search: { string: true, minLength: 1 }
};

const createTemplateSchema = {
  name: { required: true, string: true, minLength: 2, maxLength: 100 },
  description: { string: true, maxLength: 500 },
  categories: { array: true, arrayOf: 'string', maxItems: 10 },
  defaultLists: { 
    required: true, 
    array: true, 
    arrayOf: 'object',
    minItems: 1,
    maxItems: 20
  },
  defaultCards: { array: true, arrayOf: 'object', maxItems: 100 },
  tags: { array: true, arrayOf: 'string', maxItems: 20 },
  isPublic: { boolean: true },
  isActive: { boolean: true }
};

const updateTemplateSchema = {
  name: { string: true, minLength: 2, maxLength: 100 },
  description: { string: true, maxLength: 500 },
  categories: { array: true, arrayOf: 'string', maxItems: 10 },
  defaultLists: { 
    array: true, 
    arrayOf: 'object',
    minItems: 1,
    maxItems: 20
  },
  defaultCards: { array: true, arrayOf: 'object', maxItems: 100 },
  tags: { array: true, arrayOf: 'string', maxItems: 20 },
  isPublic: { boolean: true },
  isActive: { boolean: true }
};

const ratingSchema = {
  rating: { required: true, number: true, min: 1, max: 5 }
};

// Custom validators
const validateLists = (req, res, next) => {
  const { defaultLists } = req.body;
  
  if (!defaultLists || !Array.isArray(defaultLists)) {
    return res.status(400).json({
      success: false,
      message: 'Default lists must be an array'
    });
  }
  
  // Validate each list has required fields
  for (let i = 0; i < defaultLists.length; i++) {
    const list = defaultLists[i];
    if (!list.title || typeof list.order !== 'number') {
      return res.status(400).json({
        success: false,
        message: `List ${i + 1} must have title and order`
      });
    }
    
    if (list.order !== i) {
      return res.status(400).json({
        success: false,
        message: `List order must be sequential starting from 0`
      });
    }
  }
  
  next();
};

const validateCards = (req, res, next) => {
  const { defaultCards, defaultLists } = req.body;
  
  if (!defaultCards || !Array.isArray(defaultCards)) {
    return next();
  }
  
  if (!defaultLists || !Array.isArray(defaultLists)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot have cards without lists'
    });
  }
  
  const validListTitles = defaultLists.map(list => list.title);
  
  for (let i = 0; i < defaultCards.length; i++) {
    const card = defaultCards[i];
    if (!card.title || !card.listId) {
      return res.status(400).json({
        success: false,
        message: `Card ${i + 1} must have title and listId`
      });
    }
    
    if (!validListTitles.includes(card.listId)) {
      return res.status(400).json({
        success: false,
        message: `Card ${i + 1} references invalid list: ${card.listId}`
      });
    }
  }
  
  next();
};

// Admin routes (protected)
router.get('/admin', 
  adminMiddleware, 
  ctrl.getAllTemplates
);

router.get('/admin/stats', 
  adminMiddleware, 
  ctrl.getTemplateStats
);

router.post('/', 
  adminMiddleware, 
  validateMiddleware(createTemplateSchema), 
  validateLists, 
  validateCards, 
  ctrl.createTemplate
);

router.put('/:id', 
  adminMiddleware, 
  validateMiddleware(updateTemplateSchema), 
  validateLists, 
  validateCards, 
  ctrl.updateTemplate
);

router.patch('/:id', 
  adminMiddleware, 
  validateMiddleware(updateTemplateSchema), 
  validateLists, 
  validateCards, 
  ctrl.updateTemplate
);

router.delete('/:id', 
  adminMiddleware, 
  ctrl.deleteTemplate
);

router.patch('/:id/toggle-status', 
  adminMiddleware, 
  ctrl.toggleTemplateStatus
);

// Public routes (for users)
router.get('/', 
  ctrl.getPublicTemplates
);

router.get('/:id', 
  ctrl.getTemplateById
);

// User interaction routes
router.post('/:id/use', 
  authMiddleware, 
  ctrl.incrementUsage
);

router.post('/:id/rate', 
  authMiddleware, 
  validateMiddleware(ratingSchema), 
  ctrl.rateTemplate
);

module.exports = router;
