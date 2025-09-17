const googleAIClient = require('./google-ai.client');
const logger = require('../config/logger');

class BoardGenerationPipeline {
  constructor() {
    this.steps = [
      'validate_input',
      'analyze_prompt',
      'moderate_content',
      'generate_board_data',
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
        moderateContent: true,
        ...options
      },
      results: {},
      errors: []
    };

    logger.info('Starting board generation pipeline', { 
      prompt: userPrompt.substring(0, 100) + '...',
      options: context.options 
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
      logger.error('Board generation pipeline failed', { 
        error: error.message, 
        step: context.currentStep,
        errors: context.errors 
      });
      throw new Error(`Board generation failed: ${error.message}`);
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
   * Step 4: Generate board data
   */
  async generateBoardData(context) {
    try {
      const boardData = await googleAIClient.generateBoardData(
        context.results.analysis,
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
      
      // Fallback to basic board structure
      context.results.boardData = this.createFallbackBoardData(context.results.analysis);
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
    return {
      boardType: 'kanban',
      boardName: 'Generated Board',
      description: 'AI-generated board based on user input',
      columns: [
        { name: 'To Do', description: 'Tasks to be done', color: '#6B7280', order: 0 },
        { name: 'In Progress', description: 'Tasks currently being worked on', color: '#3B82F6', order: 1 },
        { name: 'Done', description: 'Completed tasks', color: '#10B981', order: 2 }
      ],
      tasks: [
        {
          title: 'Sample Task',
          description: 'This is a sample task generated from your input',
          priority: 'medium',
          estimatedHours: 2,
          tags: ['sample'],
          column: 'To Do'
        }
      ],
      tags: [
        { name: 'sample', color: '#6B7280', category: 'custom' }
      ],
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
      return 'AI service is temporarily overloaded. Please try again in a few minutes.';
    } else if (error.status === 429) {
      return 'AI service rate limit exceeded. Please wait a moment before trying again.';
    } else if (error.status === 500) {
      return 'AI service is experiencing issues. Please try again later.';
    } else if (error.message && error.message.includes('overloaded')) {
      return 'AI service is currently overloaded. Please try again in a few minutes.';
    } else {
      return error.message || 'Unknown error occurred during board generation.';
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
