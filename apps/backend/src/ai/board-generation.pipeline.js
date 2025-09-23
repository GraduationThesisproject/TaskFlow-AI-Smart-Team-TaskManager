const googleAIClient = require('./google-ai.client');
const logger = require('../config/logger');

class BoardGenerationPipeline {
  constructor() {
    this.steps = [
      'validate_input',
      'generate_board_data', // Skip analyze_prompt and moderate_content to reduce API calls
      'validate_structure',
      'enhance_data',
      'finalize_output'
    ];
  }

  /**
   * Main pipeline execution
   */
  async generateBoard(userPrompt, options = {}) {
    const context = {
      userPrompt,
      options: {
        maxTokens: 2000,
        includeChecklists: true,
        includeTags: true,
        moderateContent: false, // Disabled by default to reduce API calls
        ...options
      },
      results: {},
      errors: []
    };

    logger.info('Starting board generation pipeline (optimized - single API call)', { 
      prompt: userPrompt.substring(0, 100) + '...',
      options: context.options,
      steps: this.steps.length,
      apiCalls: 1 // Only one API call now
    });

    try {
      // Execute pipeline steps
      for (const step of this.steps) {
        logger.debug(`Executing pipeline step: ${step}`);
        await this.executeStep(step, context);
        
        if (context.errors.length > 0 && step !== 'finalize_output') {
          logger.warn(`Pipeline step ${step} completed with errors`, { errors: context.errors });
        }
      }

      logger.info('Board generation pipeline completed successfully');
      return this.formatOutput(context);

    } catch (error) {
      logger.error('Board generation pipeline failed, using fallback', { 
        error: error.message, 
        step: context.currentStep,
        errors: context.errors 
      });
      
      // If pipeline fails completely, use fallback
      const fallbackAnalysis = this.createFallbackAnalysis(userPrompt);
      context.results.boardData = this.createFallbackBoardData(fallbackAnalysis);
      context.results.finalOutput = {
        board: context.results.boardData.board,
        columns: context.results.boardData.columns || [],
        tasks: context.results.boardData.tasks || [],
        tags: context.results.boardData.tags || [],
        checklists: context.results.boardData.checklists || [],
        metadata: {
          generatedAt: new Date().toISOString(),
          pipelineVersion: '1.0.0',
          errors: context.errors,
          warnings: [],
          fallback: true
        }
      };
      
      return this.formatOutput(context);
    }
  }

  /**
   * Execute individual pipeline step
   */
  async executeStep(stepName, context) {
    context.currentStep = stepName;

    switch (stepName) {
      case 'validate_input':
        return this.validateInput(context);
      
      case 'analyze_prompt':
        return this.analyzePrompt(context);
      
      case 'moderate_content':
        return this.moderateContent(context);
      
      case 'generate_board_data':
        return this.generateBoardData(context);
      
      case 'validate_structure':
        return this.validateStructure(context);
      
      case 'enhance_data':
        return this.enhanceData(context);
      
      case 'finalize_output':
        return this.finalizeOutput(context);
      
      default:
        throw new Error(`Unknown pipeline step: ${stepName}`);
    }
  }

  /**
   * Step 1: Validate input
   */
  async validateInput(context) {
    const { userPrompt } = context;

    if (!userPrompt || typeof userPrompt !== 'string') {
      throw new Error('User prompt is required and must be a string');
    }

    if (userPrompt.trim().length < 3) {
      throw new Error('User prompt must be at least 3 characters long');
    }

    if (userPrompt.length > 1000) {
      context.userPrompt = userPrompt.substring(0, 1000);
      logger.warn('User prompt truncated to 1000 characters');
    }

    context.results.inputValidated = true;
    logger.debug('Input validation completed');
  }

  /**
   * Step 2: Analyze prompt
   */
  async analyzePrompt(context) {
    try {
      const analysis = await googleAIClient.analyzePrompt(context.userPrompt);
      context.results.analysis = analysis;
      logger.debug('Prompt analysis completed', { 
        boardType: analysis.boardType,
        columnsCount: analysis.columns?.length || 0,
        tasksCount: analysis.tasks?.length || 0
      });
    } catch (error) {
      context.errors.push(`Prompt analysis failed: ${error.message}`);
      // Fallback to basic analysis
      context.results.analysis = this.createFallbackAnalysis(context.userPrompt);
    }
  }

  /**
   * Step 3: Moderate content
   */
  async moderateContent(context) {
    if (!context.options.moderateContent) {
      context.results.moderation = { flagged: false, categories: [] };
      return;
    }

    try {
      const moderation = await googleAIClient.moderateContent(context.userPrompt);
      context.results.moderation = moderation;
      
      if (moderation.flagged) {
        logger.warn('Content flagged during moderation', { 
          categories: moderation.categories,
          reason: moderation.reason 
        });
        context.errors.push(`Content flagged: ${moderation.reason}`);
      }
      
      logger.debug('Content moderation completed', { flagged: moderation.flagged });
    } catch (error) {
      context.errors.push(`Content moderation failed: ${error.message}`);
      context.results.moderation = { flagged: false, categories: [] };
    }
  }

  /**
   * Step 2: Generate board data (optimized - single API call)
   */
  async generateBoardData(context) {
    try {
      // First try to get AI-generated board data with a single API call
      const boardData = await googleAIClient.generateBoardData(
        { userPrompt: context.userPrompt }, // Pass prompt directly instead of analysis
        context.options
      );
      context.results.boardData = boardData;
      logger.debug('Board data generation completed', {
        boardName: boardData.board?.name,
        columnsCount: boardData.columns?.length || 0,
        tasksCount: boardData.tasks?.length || 0
      });
    } catch (error) {
      const errorMessage = this.getUserFriendlyErrorMessage(error);
      context.errors.push(`Board data generation failed: ${errorMessage}`);
      
      // Log the specific error for debugging
      logger.warn('AI service error, using fallback board data:', {
        error: error.message,
        status: error.status,
        isRetryable: error.status === 503 || error.status === 429
      });
      
      // Create fallback analysis and board data
      const fallbackAnalysis = this.createFallbackAnalysis(context.userPrompt);
      context.results.boardData = this.createFallbackBoardData(fallbackAnalysis);
    }
  }

  /**
   * Step 5: Validate structure
   */
  async validateStructure(context) {
    const { boardData } = context.results;
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validate board structure
    if (!boardData.board || !boardData.board.name) {
      validation.errors.push('Board name is required');
      validation.isValid = false;
    }

    // Validate columns
    if (!boardData.columns || boardData.columns.length === 0) {
      validation.errors.push('At least one column is required');
      validation.isValid = false;
    } else {
      boardData.columns.forEach((column, index) => {
        if (!column.name) {
          validation.errors.push(`Column ${index + 1} is missing a name`);
          validation.isValid = false;
        }
        if (typeof column.position !== 'number') {
          validation.warnings.push(`Column ${index + 1} position should be a number`);
        }
      });
    }

    // Validate tasks
    if (boardData.tasks && boardData.tasks.length > 0) {
      boardData.tasks.forEach((task, index) => {
        if (!task.title) {
          validation.errors.push(`Task ${index + 1} is missing a title`);
          validation.isValid = false;
        }
        if (!task.column) {
          validation.warnings.push(`Task ${index + 1} is not assigned to a column`);
        }
      });
    }

    // Validate tags
    if (boardData.tags && boardData.tags.length > 0) {
      boardData.tags.forEach((tag, index) => {
        if (!tag.name) {
          validation.errors.push(`Tag ${index + 1} is missing a name`);
          validation.isValid = false;
        }
        if (!tag.color || !/^#[0-9A-F]{6}$/i.test(tag.color)) {
          validation.warnings.push(`Tag ${index + 1} has invalid color format`);
        }
      });
    }

    context.results.validation = validation;
    
    if (!validation.isValid) {
      context.errors.push(`Structure validation failed: ${validation.errors.join(', ')}`);
    }

    logger.debug('Structure validation completed', { 
      isValid: validation.isValid,
      errorsCount: validation.errors.length,
      warningsCount: validation.warnings.length
    });
  }

  /**
   * Step 6: Enhance data
   */
  async enhanceData(context) {
    const { boardData } = context.results;

    try {
      // Add missing IDs
      this.addMissingIds(boardData);

      // Normalize colors
      this.normalizeColors(boardData);

      // Ensure proper ordering
      this.normalizeOrdering(boardData);

      // Add default values
      this.addDefaultValues(boardData);

      context.results.enhanced = true;
      logger.debug('Data enhancement completed');
    } catch (error) {
      context.errors.push(`Data enhancement failed: ${error.message}`);
    }
  }

  /**
   * Step 7: Finalize output
   */
  async finalizeOutput(context) {
    const { boardData } = context.results;

    // Create final output structure
    context.results.finalOutput = {
      board: boardData.board,
      columns: boardData.columns || [],
      tasks: boardData.tasks || [],
      tags: boardData.tags || [],
      checklists: boardData.checklists || [],
      metadata: {
        generatedAt: new Date().toISOString(),
        pipelineVersion: '1.0.0',
        errors: context.errors,
        warnings: context.results.validation?.warnings || []
      }
    };

    logger.debug('Output finalization completed');
  }

  /**
   * Create fallback analysis when AI analysis fails
   */
  createFallbackAnalysis(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Detect project type from prompt
    let boardName = 'Generated Board';
    let description = 'AI-generated board based on user input';
    let columns = [
      { name: 'To Do', description: 'Tasks to be done', color: '#6B7280', order: 0 },
      { name: 'In Progress', description: 'Tasks currently being worked on', color: '#3B82F6', order: 1 },
      { name: 'Done', description: 'Completed tasks', color: '#10B981', order: 2 }
    ];
    let tasks = [];
    let tags = [];

    // E-commerce project detection
    if (lowerPrompt.includes('e-commerce') || lowerPrompt.includes('ecommerce') || lowerPrompt.includes('online store') || lowerPrompt.includes('shop')) {
      boardName = 'E-commerce Project Board';
      description = 'Complete project management board for e-commerce development';
      columns = [
        { name: 'Planning', description: 'Project planning and research phase', color: '#8B5CF6', order: 0 },
        { name: 'Development', description: 'Active development work', color: '#3B82F6', order: 1 },
        { name: 'Testing', description: 'Quality assurance and testing', color: '#F59E0B', order: 2 },
        { name: 'Deployment', description: 'Production deployment', color: '#10B981', order: 3 }
      ];
      tasks = [
        { title: 'Market Research & Analysis', description: 'Research target market, competitors, and user needs', priority: 'high', estimatedHours: 8, tags: ['research', 'planning'], column: 'Planning' },
        { title: 'Product Catalog Setup', description: 'Create product database and catalog structure', priority: 'high', estimatedHours: 12, tags: ['backend', 'database'], column: 'Development' },
        { title: 'Payment Integration', description: 'Integrate payment gateways (Stripe, PayPal)', priority: 'high', estimatedHours: 16, tags: ['integration', 'payment'], column: 'Development' },
        { title: 'User Authentication', description: 'Implement user registration and login system', priority: 'medium', estimatedHours: 10, tags: ['auth', 'security'], column: 'Development' },
        { title: 'Shopping Cart Functionality', description: 'Build cart, checkout, and order management', priority: 'high', estimatedHours: 20, tags: ['frontend', 'cart'], column: 'Development' },
        { title: 'Mobile Responsiveness', description: 'Ensure site works perfectly on mobile devices', priority: 'medium', estimatedHours: 8, tags: ['mobile', 'responsive'], column: 'Testing' },
        { title: 'Security Testing', description: 'Test payment security and data protection', priority: 'high', estimatedHours: 6, tags: ['security', 'testing'], column: 'Testing' },
        { title: 'Performance Optimization', description: 'Optimize site speed and loading times', priority: 'medium', estimatedHours: 4, tags: ['performance', 'optimization'], column: 'Testing' },
        { title: 'Production Deployment', description: 'Deploy to production server and configure domain', priority: 'high', estimatedHours: 4, tags: ['deployment', 'production'], column: 'Deployment' }
      ];
      tags = [
        { name: 'frontend', color: '#3B82F6', category: 'development' },
        { name: 'backend', color: '#8B5CF6', category: 'development' },
        { name: 'database', color: '#10B981', category: 'development' },
        { name: 'integration', color: '#F59E0B', category: 'development' },
        { name: 'testing', color: '#EF4444', category: 'quality' },
        { name: 'deployment', color: '#6B7280', category: 'operations' }
      ];
    }
    // Software development project detection
    else if (lowerPrompt.includes('software') || lowerPrompt.includes('development') || lowerPrompt.includes('app') || lowerPrompt.includes('programming')) {
      boardName = 'Software Development Board';
      description = 'Comprehensive board for software development project';
      columns = [
        { name: 'Backlog', description: 'Planned features and tasks', color: '#6B7280', order: 0 },
        { name: 'In Progress', description: 'Currently being developed', color: '#3B82F6', order: 1 },
        { name: 'Code Review', description: 'Ready for code review', color: '#F59E0B', order: 2 },
        { name: 'Testing', description: 'Quality assurance phase', color: '#EF4444', order: 3 },
        { name: 'Done', description: 'Completed and deployed', color: '#10B981', order: 4 }
      ];
      tasks = [
        { title: 'Project Setup & Architecture', description: 'Initialize project structure and define architecture', priority: 'high', estimatedHours: 8, tags: ['setup', 'architecture'], column: 'Backlog' },
        { title: 'Core Feature Development', description: 'Implement main application features', priority: 'high', estimatedHours: 24, tags: ['feature', 'development'], column: 'In Progress' },
        { title: 'Database Design & Implementation', description: 'Design and implement database schema', priority: 'high', estimatedHours: 12, tags: ['database', 'backend'], column: 'In Progress' },
        { title: 'API Development', description: 'Create RESTful APIs for frontend communication', priority: 'medium', estimatedHours: 16, tags: ['api', 'backend'], column: 'In Progress' },
        { title: 'Frontend Implementation', description: 'Build user interface and user experience', priority: 'medium', estimatedHours: 20, tags: ['frontend', 'ui'], column: 'In Progress' },
        { title: 'Code Review Session', description: 'Review code quality and best practices', priority: 'medium', estimatedHours: 4, tags: ['review', 'quality'], column: 'Code Review' },
        { title: 'Unit Testing', description: 'Write and execute unit tests', priority: 'medium', estimatedHours: 8, tags: ['testing', 'unit'], column: 'Testing' },
        { title: 'Integration Testing', description: 'Test component integration and workflows', priority: 'medium', estimatedHours: 6, tags: ['testing', 'integration'], column: 'Testing' },
        { title: 'Documentation', description: 'Create user and developer documentation', priority: 'low', estimatedHours: 4, tags: ['documentation', 'docs'], column: 'Done' }
      ];
      tags = [
        { name: 'frontend', color: '#3B82F6', category: 'development' },
        { name: 'backend', color: '#8B5CF6', category: 'development' },
        { name: 'database', color: '#10B981', category: 'development' },
        { name: 'testing', color: '#EF4444', category: 'quality' },
        { name: 'documentation', color: '#6B7280', category: 'support' }
      ];
    }
    // Marketing project detection
    else if (lowerPrompt.includes('marketing') || lowerPrompt.includes('campaign') || lowerPrompt.includes('promotion') || lowerPrompt.includes('social media')) {
      boardName = 'Marketing Campaign Board';
      description = 'Complete marketing campaign management board';
      columns = [
        { name: 'Ideas', description: 'Creative ideas and concepts', color: '#8B5CF6', order: 0 },
        { name: 'Planning', description: 'Campaign planning and strategy', color: '#3B82F6', order: 1 },
        { name: 'In Progress', description: 'Content creation in progress', color: '#F59E0B', order: 2 },
        { name: 'Review', description: 'Content review and approval', color: '#EF4444', order: 3 },
        { name: 'Published', description: 'Live and published content', color: '#10B981', order: 4 }
      ];
      tasks = [
        { title: 'Campaign Strategy Development', description: 'Define target audience and campaign objectives', priority: 'high', estimatedHours: 6, tags: ['strategy', 'planning'], column: 'Ideas' },
        { title: 'Content Calendar Creation', description: 'Plan content schedule across all channels', priority: 'high', estimatedHours: 4, tags: ['content', 'calendar'], column: 'Planning' },
        { title: 'Social Media Content', description: 'Create posts for Facebook, Instagram, Twitter', priority: 'medium', estimatedHours: 8, tags: ['social', 'content'], column: 'In Progress' },
        { title: 'Email Marketing Campaign', description: 'Design and write email sequences', priority: 'medium', estimatedHours: 6, tags: ['email', 'campaign'], column: 'In Progress' },
        { title: 'Video Production', description: 'Create promotional videos and ads', priority: 'high', estimatedHours: 12, tags: ['video', 'production'], column: 'In Progress' },
        { title: 'Content Review', description: 'Review all content for brand consistency', priority: 'medium', estimatedHours: 3, tags: ['review', 'quality'], column: 'Review' },
        { title: 'Analytics Setup', description: 'Configure tracking and analytics tools', priority: 'low', estimatedHours: 2, tags: ['analytics', 'tracking'], column: 'Published' }
      ];
      tags = [
        { name: 'content', color: '#3B82F6', category: 'creation' },
        { name: 'social', color: '#8B5CF6', category: 'channel' },
        { name: 'email', color: '#10B981', category: 'channel' },
        { name: 'video', color: '#EF4444', category: 'media' },
        { name: 'analytics', color: '#6B7280', category: 'measurement' }
      ];
    }
    // Default fallback
    else {
      tasks = [
        { title: 'Project Planning', description: 'Define project scope and requirements', priority: 'high', estimatedHours: 4, tags: ['planning'], column: 'To Do' },
        { title: 'Task Implementation', description: 'Work on main project tasks', priority: 'medium', estimatedHours: 8, tags: ['development'], column: 'In Progress' },
        { title: 'Quality Assurance', description: 'Test and review completed work', priority: 'medium', estimatedHours: 3, tags: ['testing'], column: 'Done' }
      ];
      tags = [
        { name: 'planning', color: '#8B5CF6', category: 'phase' },
        { name: 'development', color: '#3B82F6', category: 'phase' },
        { name: 'testing', color: '#10B981', category: 'phase' }
      ];
    }

    return {
      boardType: 'kanban',
      boardName,
      description,
      columns,
      tasks,
      tags,
      checklists: [],
      settings: {
        allowComments: true,
        allowAttachments: true,
        allowTimeTracking: false,
        defaultTaskPriority: 'medium'
      }
    };
  }

  /**
   * Create fallback board data when AI generation fails
   */
  /**
   * Get user-friendly error message for AI service errors
   */
  getUserFriendlyErrorMessage(error) {
    if (error.status === 503) {
      return 'AI service is temporarily overloaded. Using intelligent fallback board template instead.';
    } else if (error.status === 429) {
      return 'AI service rate limit exceeded. Using intelligent fallback board template instead.';
    } else if (error.status === 500) {
      return 'AI service is experiencing issues. Using intelligent fallback board template instead.';
    } else if (error.message && error.message.includes('overloaded')) {
      return 'AI service is currently overloaded. Using intelligent fallback board template instead.';
    } else {
      return error.message || 'Unknown error occurred during board generation. Using intelligent fallback board template instead.';
    }
  }

  createFallbackBoardData(analysis) {
    return {
      board: {
        name: analysis.boardName || 'Generated Board',
        description: analysis.description || 'AI-generated board',
        type: analysis.boardType || 'kanban',
        visibility: 'private',
        settings: analysis.settings || {
          allowComments: true,
          allowAttachments: true,
          allowTimeTracking: false,
          defaultTaskPriority: 'medium',
          autoArchive: false,
          archiveAfterDays: 30
        }
      },
      columns: (analysis.columns || []).map((col, index) => ({
        name: col.name,
        position: col.order || index,
        color: col.color || '#6B7280',
        backgroundColor: '#F9FAFB',
        limit: null,
        settings: {
          wipLimit: { enabled: false, limit: null, strictMode: false },
          sorting: { method: 'manual', direction: 'asc', autoSort: false }
        },
        style: {
          color: col.color || '#6B7280',
          backgroundColor: '#F9FAFB',
          icon: null
        }
      })),
      tasks: (analysis.tasks || []).map((task, index) => ({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        color: '#6B7280',
        assignees: [],
        tags: task.tags || [],
        dueDate: task.dueDate || null,
        estimatedHours: task.estimatedHours || null,
        position: index,
        column: task.column || 'To Do'
      })),
      tags: (analysis.tags || []).map(tag => ({
        name: tag.name,
        color: tag.color || '#6B7280',
        textColor: '#FFFFFF',
        category: tag.category || 'custom',
        description: tag.description || '',
        scope: 'board'
      })),
      checklists: analysis.checklists || []
    };
  }

  /**
   * Add missing IDs to board data
   */
  addMissingIds(boardData) {
    // Add board ID
    if (!boardData.board.id) {
      boardData.board.id = `board_${Date.now()}`;
    }

    // Add column IDs
    if (boardData.columns) {
      boardData.columns.forEach((column, index) => {
        if (!column.id) {
          column.id = `col_${index + 1}`;
        }
      });
    }

    // Add task IDs
    if (boardData.tasks) {
      boardData.tasks.forEach((task, index) => {
        if (!task.id) {
          task.id = `task_${index + 1}`;
        }
      });
    }

    // Add tag IDs
    if (boardData.tags) {
      boardData.tags.forEach((tag, index) => {
        if (!tag.id) {
          tag.id = `tag_${index + 1}`;
        }
      });
    }

    // Add checklist IDs
    if (boardData.checklists) {
      boardData.checklists.forEach((checklist, index) => {
        if (!checklist.id) {
          checklist.id = `checklist_${index + 1}`;
        }
        if (checklist.items) {
          checklist.items.forEach((item, itemIndex) => {
            if (!item.id) {
              item.id = `item_${itemIndex + 1}`;
            }
          });
        }
      });
    }
  }

  /**
   * Normalize colors in board data
   */
  normalizeColors(boardData) {
    const defaultColors = {
      column: '#6B7280',
      task: '#6B7280',
      tag: '#6B7280',
      text: '#FFFFFF'
    };

    // Normalize column colors
    if (boardData.columns) {
      boardData.columns.forEach(column => {
        if (!column.color || !/^#[0-9A-F]{6}$/i.test(column.color)) {
          column.color = defaultColors.column;
        }
        if (!column.style) column.style = {};
        if (!column.style.color) column.style.color = column.color;
        if (!column.style.backgroundColor) column.style.backgroundColor = '#F9FAFB';
      });
    }

    // Normalize task colors
    if (boardData.tasks) {
      boardData.tasks.forEach(task => {
        if (!task.color || !/^#[0-9A-F]{6}$/i.test(task.color)) {
          task.color = defaultColors.task;
        }
      });
    }

    // Normalize tag colors
    if (boardData.tags) {
      boardData.tags.forEach(tag => {
        if (!tag.color || !/^#[0-9A-F]{6}$/i.test(tag.color)) {
          tag.color = defaultColors.tag;
        }
        if (!tag.textColor) tag.textColor = defaultColors.text;
      });
    }
  }

  /**
   * Normalize ordering in board data
   */
  normalizeOrdering(boardData) {
    // Sort columns by position
    if (boardData.columns) {
      boardData.columns.sort((a, b) => (a.position || 0) - (b.position || 0));
    }

    // Sort tasks by position within each column
    if (boardData.tasks) {
      boardData.tasks.sort((a, b) => (a.position || 0) - (b.position || 0));
    }

    // Sort checklist items by position
    if (boardData.checklists) {
      boardData.checklists.forEach(checklist => {
        if (checklist.items) {
          checklist.items.sort((a, b) => (a.position || 0) - (b.position || 0));
        }
      });
    }
  }

  /**
   * Add default values to board data
   */
  addDefaultValues(boardData) {
    // Board defaults
    if (!boardData.board.type) boardData.board.type = 'kanban';
    if (!boardData.board.visibility) boardData.board.visibility = 'private';
    if (!boardData.board.settings) {
      boardData.board.settings = {
        allowComments: true,
        allowAttachments: true,
        allowTimeTracking: false,
        defaultTaskPriority: 'medium',
        autoArchive: false,
        archiveAfterDays: 30
      };
    }

    // Column defaults
    if (boardData.columns) {
      boardData.columns.forEach(column => {
        if (typeof column.position !== 'number') column.position = 0;
        if (!column.settings) {
          column.settings = {
            wipLimit: { enabled: false, limit: null, strictMode: false },
            sorting: { method: 'manual', direction: 'asc', autoSort: false }
          };
        }
      });
    }

    // Task defaults
    if (boardData.tasks) {
      boardData.tasks.forEach(task => {
        if (!task.priority) task.priority = 'medium';
        if (!task.assignees) task.assignees = [];
        if (!task.tags) task.tags = [];
        if (typeof task.position !== 'number') task.position = 0;
      });
    }

    // Tag defaults
    if (boardData.tags) {
      boardData.tags.forEach(tag => {
        if (!tag.category) tag.category = 'custom';
        if (!tag.scope) tag.scope = 'board';
        if (!tag.description) tag.description = '';
      });
    }
  }

  /**
   * Format final output
   */
  formatOutput(context) {
    return {
      success: context.errors.length === 0,
      data: context.results.finalOutput,
      errors: context.errors,
      warnings: context.results.validation?.warnings || [],
      metadata: context.results.finalOutput.metadata
    };
  }

  /**
   * Get pipeline status
   */
  getStatus() {
    return {
      available: googleAIClient.isAvailable(),
      steps: this.steps,
      version: '1.0.0'
    };
  }
}

// Create singleton instance
const boardGenerationPipeline = new BoardGenerationPipeline();

module.exports = boardGenerationPipeline;
