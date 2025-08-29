const BoardTemplate = require('../models/BoardTemplate');
const { isValidObjectId } = require('../middlewares/validate.middleware');

// Get all board templates (admin only)
exports.getAllTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    
    const query = {};
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Category filter
    if (category) {
      query.categories = { $in: Array.isArray(category) ? category : [category] };
    }
    
    // Status filter
    if (status) {
      query.isActive = status === 'active';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [templates, total] = await Promise.all([
      BoardTemplate.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email'),
      BoardTemplate.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching board templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch board templates',
      error: error.message
    });
  }
};

// Get public board templates (for users)
exports.getPublicTemplates = async (req, res) => {
  try {
    const { categories, limit = 20, search } = req.query;
    
    let query = { isActive: true, isPublic: true };
    
    // Category filter
    if (categories) {
      const categoryArray = Array.isArray(categories) ? categories : [categories];
      query.categories = { $in: categoryArray };
    }
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    const templates = await BoardTemplate.find(query)
      .sort({ usageCount: -1, 'rating.average': -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .select('-metadata'); // Don't send internal metadata to users
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching public board templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch board templates',
      error: error.message
    });
  }
};

// Get template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID'
      });
    }
    
    const template = await BoardTemplate.findById(id)
      .populate('createdBy', 'name email');
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Board template not found'
      });
    }
    
    // Check if user can access this template
    if (!template.isPublic && !req.user) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this template'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching board template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch board template',
      error: error.message
    });
  }
};

// Create new board template (admin only)
exports.createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      categories,
      defaultLists,
      defaultCards,
      tags,
      isPublic = true,
      isActive = true
    } = req.body;
    
    // Validate required fields
    if (!name || !defaultLists || defaultLists.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name and at least one default list are required'
      });
    }
    
    // Validate list structure
    const validLists = defaultLists.every((list, index) => 
      list.title && 
      typeof list.order === 'number' && 
      list.order === index
    );
    
    if (!validLists) {
      return res.status(400).json({
        success: false,
        message: 'Lists must have titles and sequential order starting from 0'
      });
    }
    
    // Validate cards reference valid lists
    if (defaultCards && defaultCards.length > 0) {
      const validListTitles = defaultLists.map(list => list.title);
      const invalidCards = defaultCards.filter(card => 
        !validListTitles.includes(card.listId)
      );
      
      if (invalidCards.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'All cards must reference valid list titles'
        });
      }
    }
    
    const template = new BoardTemplate({
      name,
      description,
      categories: categories || ['General'],
      defaultLists,
      defaultCards: defaultCards || [],
      tags: tags || [],
      isPublic,
      isActive,
      createdBy: req.admin._id
    });
    
    await template.save();
    
    res.status(201).json({
      success: true,
      message: 'Board template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Error creating board template:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create board template',
      error: error.message
    });
  }
};

// Update board template (admin only)
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID'
      });
    }
    
    const template = await BoardTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Board template not found'
      });
    }
    
    // Validate list structure if updating lists
    if (updateData.defaultLists) {
      const validLists = updateData.defaultLists.every((list, index) => 
        list.title && 
        typeof list.order === 'number' && 
        list.order === index
      );
      
      if (!validLists) {
        return res.status(400).json({
          success: false,
          message: 'Lists must have titles and sequential order starting from 0'
        });
      }
      
      // Validate cards reference valid lists
      if (updateData.defaultCards && updateData.defaultCards.length > 0) {
        const validListTitles = updateData.defaultLists.map(list => list.title);
        const invalidCards = updateData.defaultCards.filter(card => 
          !validListTitles.includes(card.listId)
        );
        
        if (invalidCards.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'All cards must reference valid list titles'
          });
        }
      }
    }
    
    // Update the template
    Object.assign(template, updateData);
    await template.save();
    
    res.json({
      success: true,
      message: 'Board template updated successfully',
      data: template
    });
  } catch (error) {
    console.error('Error updating board template:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update board template',
      error: error.message
    });
  }
};

// Delete board template (admin only)
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID'
      });
    }
    
    const template = await BoardTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Board template not found'
      });
    }
    
    // Check if template is in use
    if (template.usageCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete template that is currently in use'
      });
    }
    
    await BoardTemplate.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Board template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting board template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete board template',
      error: error.message
    });
  }
};

// Toggle template status (admin only)
exports.toggleTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID'
      });
    }
    
    const template = await BoardTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Board template not found'
      });
    }
    
    template.isActive = !template.isActive;
    await template.save();
    
    res.json({
      success: true,
      message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`,
      data: template
    });
  } catch (error) {
    console.error('Error toggling template status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle template status',
      error: error.message
    });
  }
};

// Get template statistics (admin only)
exports.getTemplateStats = async (req, res) => {
  try {
    const stats = await BoardTemplate.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching template statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template statistics',
      error: error.message
    });
  }
};

// Increment template usage (when user creates board from template)
exports.incrementUsage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID'
      });
    }
    
    const template = await BoardTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Board template not found'
      });
    }
    
    if (!template.isActive || !template.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'Template is not available for use'
      });
    }
    
    await template.incrementUsage();
    
    res.json({
      success: true,
      message: 'Template usage incremented successfully',
      data: { usageCount: template.usageCount }
    });
  } catch (error) {
    console.error('Error incrementing template usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment template usage',
      error: error.message
    });
  }
};

// Rate template (user feedback)
exports.rateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID'
      });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const template = await BoardTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Board template not found'
      });
    }
    
    if (!template.isActive || !template.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'Template is not available for rating'
      });
    }
    
    await template.addRating(rating);
    
    res.json({
      success: true,
      message: 'Template rated successfully',
      data: { 
        averageRating: template.rating.average,
        ratingCount: template.rating.count
      }
    });
  } catch (error) {
    console.error('Error rating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate template',
      error: error.message
    });
  }
};
