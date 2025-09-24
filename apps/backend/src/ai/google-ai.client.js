// services/googleAIService.js (CommonJS with dynamic ESM imports)
const db = require("../config/db");
const logger = require("../config/logger");

// Custom error classes for better error handling
class GoogleAIError extends Error {
  constructor(message, code, status = 500) {
    super(message);
    this.name = 'GoogleAIError';
    this.code = code;
    this.status = status;
  }
}

class APIKeyError extends GoogleAIError {
  constructor(message = 'Google API key not found') {
    super(message, 'API_KEY_MISSING', 401);
    this.name = 'APIKeyError';
  }
}

class ModerationError extends GoogleAIError {
  constructor(message, reason) {
    super(message, 'CONTENT_FLAGGED', 400);
    this.name = 'ModerationError';
    this.reason = reason;
  }
}

class RateLimitError extends GoogleAIError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

class GoogleAIService {
  constructor() {
    this.client = null;
    this.fileManager = null;
    this.apiKey = null;
    this.models = {
      boardGenerator: "gemini-1.5-flash",
      analyzer: "gemini-1.5-flash",
      moderation: "gemini-1.5-flash",
      autocomplete: "gemini-1.5-flash",
    };
  }

  /** ─────────────────────────────
   *  CLIENT INITIALIZATION
   *  ───────────────────────────── */
  async initializeClient() {
    if (!this.client) {
      try {
        if (!this.apiKey) {
          const settings = await db.settings.findOne({ key: "GOOGLE_API_KEY" });
          this.apiKey = settings?.value || process.env.GOOGLE_API_KEY;
        }

        if (!this.apiKey) {
          logger.error('Google API key not found in database or environment');
          throw new APIKeyError();
        }

        // Dynamic import of ESM-only modules so they work in CommonJS
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const { GoogleAIFileManager } = await import("@google/generative-ai/server");

        this.client = new GoogleGenerativeAI(this.apiKey);
        this.fileManager = new GoogleAIFileManager(this.apiKey);
        logger.info('Google AI client initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Google AI client:', error);
        throw error;
      }
    }
  }

  async isAvailable() {
    try {
      await this.initializeClient();
      return !!this.client;
    } catch {
      return false;
    }
  }

  /** ─────────────────────────────
   *  API CALL HANDLER (RETRY)
   *  ───────────────────────────── */
  async makeApiCall(apiCall, maxRetries = 1, baseDelay = 1000) {
    if (!this.isAvailable()) await this.initializeClient();

    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiCall();
        if (attempt > 0) {
          logger.info(`API call succeeded on attempt ${attempt + 1}`);
        }
        return result;
      } catch (error) {
        lastError = error;
        
        // Log error details
        logger.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}):`, {
          error: error.message,
          code: error.code,
          status: error.status
        });

        // Handle specific error types
        if (error.status === 429) {
          throw new RateLimitError(error.message);
        }

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          logger.info(`Retrying in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
    
    logger.error('API call failed after all retries:', lastError);
    throw lastError;
  }

  /** ─────────────────────────────
   *  JSON CLEANER (Utility)
   *  ───────────────────────────── */
  cleanJsonResponse(content, expectArray = false) {
    let cleaned = content.trim();

    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(json)?\s*/, "").replace(/\s*```$/, "");
    }

    const match = cleaned.match(expectArray ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/);
    if (match) cleaned = match[0];

    return cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** ─────────────────────────────
   *  RESPONSE OPTIMIZER
   *  ───────────────────────────── */
  optimizeResponse(data, type = 'default') {
    switch (type) {
      case 'board':
        return {
          name: data.board?.name || "Untitled Board",
          description: data.board?.description || "",
          columns: (data.columns || []).map(col => ({
            name: col.name,
            position: col.position,
            color: col.color,
            limit: col.limit
          })),
          tasks: (data.tasks || []).map(task => ({
            title: task.title,
            priority: task.priority,
            column: task.column,
            dueDate: task.dueDate
          })),
          tags: (data.tags || []).map(tag => ({
            name: tag.name,
            color: tag.color
          }))
        };
      
      case 'analysis':
        return {
          goals: data.goals?.slice(0, 5) || [],
          keyFeatures: data.keyFeatures?.slice(0, 5) || [],
          targetUsers: data.targetUsers?.slice(0, 3) || []
        };
      
      case 'suggestions':
        return {
          suggestions: data.suggestions?.slice(0, 5) || [],
          categories: data.categories?.slice(0, 3) || []
        };
      
      case 'templates':
        return (data || []).slice(0, 5).map(template => ({
          name: template.name,
          description: template.description
        }));
      
      default:
        return data;
    }
  }

  /** ─────────────────────────────
   *  NORMALIZATION (bulletproof)
   *  ───────────────────────────── */
  normalizeBoardData(data) {
    const board = {
      name: data.board?.name || "Untitled Board",
      description: data.board?.description || "",
      settings: {
        allowComments: !!data.board?.settings?.allowComments,
        allowAttachments: !!data.board?.settings?.allowAttachments,
        allowTimeTracking: !!data.board?.settings?.allowTimeTracking,
        defaultTaskPriority:
          ["low", "medium", "high", "critical"].includes(
            data.board?.settings?.defaultTaskPriority
          )
            ? data.board.settings.defaultTaskPriority
            : "medium",
        autoArchive: !!data.board?.settings?.autoArchive,
        archiveAfterDays: Number(data.board?.settings?.archiveAfterDays || 30),
      },
    };

    const columns = (data.columns || []).map((col, i) => ({
      name: col.name || `Column ${i + 1}`,
      position: Number.isInteger(col.position) ? col.position : i,
      color: col.color || "#cccccc",
      backgroundColor: col.backgroundColor || "#ffffff",
      limit: col.limit ?? null,
    }));

    const tasks = (data.tasks || []).map((t, i) => ({
      title: t.title || `Task ${i + 1}`,
      description: t.description || "",
      priority: ["low", "medium", "high", "critical"].includes(t.priority)
        ? t.priority
        : "medium",
      tags: Array.isArray(t.tags) ? t.tags : [],
      dueDate: t.dueDate || null,
      position: Number.isInteger(t.position) ? t.position : i,
      column: t.column || (columns[0]?.name || "Backlog"),
    }));

    const tags = (data.tags || []).map((tag, i) => ({
      name: tag.name || `Tag ${i + 1}`,
      color: tag.color || "#999999",
    }));

    const checklists = (data.checklists || []).map((cl, i) => ({
      title: cl.title || `Checklist ${i + 1}`,
      items: (cl.items || []).map((item, j) => ({
        text: item.text || `Item ${j + 1}`,
        position: Number.isInteger(item.position) ? item.position : j,
      })),
    }));

    return { board, columns, tasks, tags, checklists };
  }

  /** ─────────────────────────────
   *  MODERATION
   *  ───────────────────────────── */
  async moderateContent(text) {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({
        model: this.models.moderation,
      });

      const prompt = `
        Analyze the following text for safety:
        "${text}"

        Return JSON with:
        { "flagged": boolean, "reason": string }
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      const moderation = JSON.parse(this.cleanJsonResponse(content));
      
      if (moderation.flagged) {
        logger.warn('Content flagged by moderation:', {
          text: text.substring(0, 100) + '...',
          reason: moderation.reason
        });
        throw new ModerationError(`Content flagged: ${moderation.reason}`, moderation.reason);
      }
      
      return moderation;
    });
  }

  /** ─────────────────────────────
   *  ANALYSIS
   *  ───────────────────────────── */
  async analyzePrompt(userPrompt) {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({
        model: this.models.analyzer,
        generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
      });

      const prompt = `
        Analyze this request and extract requirements:
        "${userPrompt}"

        Return JSON (max 5 items per array):
        {
          "goals": string[],
          "keyFeatures": string[],
          "targetUsers": string[]
        }
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      const analysis = JSON.parse(this.cleanJsonResponse(content));
      return this.optimizeResponse(analysis, 'analysis');
    });
  }

  /** ─────────────────────────────
   *  BOARD GENERATION
   *  ───────────────────────────── */
  async generateBoardData(analysis) {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({
        model: this.models.boardGenerator,
        generationConfig: { maxOutputTokens: 1200, temperature: 0.3 },
      });

      const prompt = `
        Generate a task board JSON from this analysis:
        ${JSON.stringify(analysis, null, 2)}

        Return JSON (max 6 columns, 8 tasks, 5 tags):
        {
          "board": { "name": "string", "description": "string" },
          "columns": [ { "name": "string", "position": number, "color": "#hex", "limit": number|null } ],
          "tasks": [ { "title": "string", "priority": "low|medium|high|critical", "column": "column name" } ],
          "tags": [ { "name": "string", "color": "#hex" } ]
        }
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      const raw = JSON.parse(this.cleanJsonResponse(content));

      // Normalize and optimize
      const normalized = this.normalizeBoardData(raw);
      return this.optimizeResponse(normalized, 'board');
    });
  }

  /** ─────────────────────────────
   *  ADDITIONAL TASKS
   *  ───────────────────────────── */
  async generateAdditionalTasks(columnContext, userPrompt, numTasks = 5) {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({
        model: this.models.boardGenerator,
        generationConfig: { maxOutputTokens: 1000, temperature: 0.4 },
      });

      const prompt = `
        Add ${numTasks} tasks for column "${columnContext.name}".
        Based on: ${userPrompt}

        Return JSON array:
        [ { "title": "string", "description": "string", "priority": "low|medium|high|critical" } ]
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      return JSON.parse(this.cleanJsonResponse(content, true));
    });
  }

  /** ─────────────────────────────
   *  IMPROVEMENTS
   *  ───────────────────────────── */
  async suggestImprovements(boardData) {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({
        model: this.models.analyzer,
      });

      const prompt = `
        Suggest improvements for this board:
        ${JSON.stringify(boardData, null, 2)}

        Return JSON:
        { "structural": string[], "content": string[], "usability": string[] }
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      return JSON.parse(this.cleanJsonResponse(content));
    });
  }

  /** ─────────────────────────────
   *  AUTO-COMPLETION
   *  ───────────────────────────── */
  async autoCompletePrompt(partialPrompt, context = {}) {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({
        model: this.models.autocomplete,
        generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
      });

      const prompt = `
        Complete this task management prompt:
        "${partialPrompt}"
        
        Return JSON array of 3 completion suggestions:
        [ "suggestion1", "suggestion2", "suggestion3" ]
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      const suggestions = JSON.parse(this.cleanJsonResponse(content, true));
      return suggestions.slice(0, 3); // Limit to 3 suggestions
    });
  }

  /** ─────────────────────────────
   *  SMART SUGGESTIONS
   *  ───────────────────────────── */
  async getSmartSuggestions(input, type = 'board') {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({
        model: this.models.analyzer,
        generationConfig: { maxOutputTokens: 300, temperature: 0.5 },
      });

      const prompt = `
        Generate smart suggestions for ${type} based on:
        "${input}"
        
        Return JSON (max 5 suggestions, 3 categories):
        {
          "suggestions": string[],
          "categories": string[]
        }
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      const suggestions = JSON.parse(this.cleanJsonResponse(content));
      return this.optimizeResponse(suggestions, 'suggestions');
    });
  }

  /** ─────────────────────────────
   *  QUICK TEMPLATES
   *  ───────────────────────────── */
  async generateQuickTemplates(category = 'general', count = 5) {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({
        model: this.models.boardGenerator,
        generationConfig: { maxOutputTokens: 600, temperature: 0.4 },
      });

      const prompt = `
        Generate ${Math.min(count, 5)} quick board templates for ${category} category.
        
        Return JSON array:
        [ { "name": "string", "description": "string" } ]
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      const templates = JSON.parse(this.cleanJsonResponse(content, true));
      return this.optimizeResponse(templates, 'templates');
    });
  }

  /** ─────────────────────────────
   *  MODEL INFORMATION
   *  ───────────────────────────── */
  getModelInfo() {
    return {
      models: this.models,
      features: [
        'board_generation',
        'content_moderation',
        'auto_completion',
        'smart_suggestions',
        'quick_templates',
        'improvement_suggestions'
      ],
      available: this.client !== null
    };
  }

  /** ─────────────────────────────
   *  ENHANCED ADDITIONAL TASKS
   *  ───────────────────────────── */
  async generateAdditionalTasks(board, columnName, count = 3) {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({
        model: this.models.boardGenerator,
        generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
      });

      const boardContext = {
        name: board.name,
        columns: board.columns?.map(col => ({ name: col.name })) || [],
        tags: board.tags?.map(tag => ({ name: tag.name })) || []
      };

      const prompt = `
        Add ${Math.min(count, 5)} tasks for column "${columnName}" in this board:
        ${JSON.stringify(boardContext, null, 2)}

        Return JSON array:
        [ { "title": "string", "priority": "low|medium|high|critical" } ]
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      const tasks = JSON.parse(this.cleanJsonResponse(content, true));
      return tasks.slice(0, Math.min(count, 5));
    });
  }

  /** ─────────────────────────────
   *  ENHANCED IMPROVEMENTS
   *  ───────────────────────────── */
  async suggestImprovements(board) {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({
        model: this.models.analyzer,
        generationConfig: { maxOutputTokens: 400, temperature: 0.3 },
      });

      const boardData = {
        name: board.name,
        columns: board.columns?.map(col => ({
          name: col.name,
          taskCount: col.taskIds?.length || 0
        })) || [],
        tags: board.tags?.map(tag => ({ name: tag.name })) || []
      };

      const prompt = `
        Suggest improvements for this board (max 3 per category):
        ${JSON.stringify(boardData, null, 2)}

        Return JSON:
        { "structural": string[], "content": string[], "usability": string[] }
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      const improvements = JSON.parse(this.cleanJsonResponse(content));
      
      // Limit suggestions to 3 per category
      return {
        structural: improvements.structural?.slice(0, 3) || [],
        content: improvements.content?.slice(0, 3) || [],
        usability: improvements.usability?.slice(0, 3) || []
      };
    });
  }

  /** ─────────────────────────────
   *  PIPELINE ORCHESTRATOR
   *  ───────────────────────────── */
  async processUserRequest(userPrompt) {
    const startTime = Date.now();
    logger.info('Processing user request:', { promptLength: userPrompt.length });
    
    try {
      // 1. Moderate
      const moderation = await this.moderateContent(userPrompt);

      // 2. Analyze
      const analysis = await this.analyzePrompt(userPrompt);
      logger.debug('Analysis completed:', { goals: analysis.goals?.length || 0 });

      // 3. Generate + Normalize
      const boardData = await this.generateBoardData(analysis);
      logger.debug('Board data generated:', { 
        columns: boardData.columns?.length || 0,
        tasks: boardData.tasks?.length || 0
      });

      // 4. Improvements
      const improvements = await this.suggestImprovements({ 
        name: boardData.name, 
        description: boardData.description,
        columns: boardData.columns,
        tags: boardData.tags
      });

      const responseTime = Date.now() - startTime;
      logger.info('User request processed successfully', { 
        responseTime: `${responseTime}ms`,
        dataSize: `${(JSON.stringify({ analysis, boardData, improvements }).length / 1024).toFixed(2)}KB`
      });
      
      return { analysis, boardData, improvements };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to process user request:', {
        error: error.message,
        code: error.code,
        promptLength: userPrompt.length,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  }
}

// Export for CommonJS consumers
module.exports = new GoogleAIService();
module.exports.GoogleAIService = GoogleAIService;
module.exports.GoogleAIError = GoogleAIError;
module.exports.APIKeyError = APIKeyError;
module.exports.ModerationError = ModerationError;
module.exports.RateLimitError = RateLimitError;
