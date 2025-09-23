const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const logger = require('../config/logger');
const aiTokenService = require('../services/aiTokenService');

class GoogleAIClient {
  constructor() {
    this.client = null;
    this.apiKey = null;
    this.models = {
      boardGenerator: 'gemini-1.5-flash',
      promptAnalyzer: 'gemini-1.5-flash',
      contentModerator: 'gemini-1.5-flash'
    };

    // Initialize with fallback to env
    this.initializeClient();
  }

  async initializeClient() {
    try {
      // Try to get token from database first
      const token = await aiTokenService.getTokenValue('google');
      
      if (token) {
        this.apiKey = token;
        this.client = new GoogleGenerativeAI(token);
        logger.info('Google AI client initialized with database token');
        return;
      }

      // Fallback to environment variable
      if (env.GOOGLE_API_GEMINI_API_KEY) {
        this.apiKey = env.GOOGLE_API_GEMINI_API_KEY;
        this.client = new GoogleGenerativeAI(env.GOOGLE_API_GEMINI_API_KEY);
        logger.info('Google AI client initialized with environment token');
        return;
      }

      logger.warn('Google AI API key not configured. AI features will be disabled.');
      this.client = null;
    } catch (error) {
      logger.error('Error initializing Google AI client:', error);
      this.client = null;
    }
  }

  // Check if client is available
  isAvailable() {
    return this.client !== null;
  }

  // Refresh client with new token
  async refreshClient() {
    await this.initializeClient();
  }

  // Get current API key (masked for security)
  getApiKeyInfo() {
    if (!this.apiKey) return null;
    return {
      key: this.apiKey.substring(0, 8) + '...' + this.apiKey.substring(this.apiKey.length - 4),
      length: this.apiKey.length
    };
  }

  // Helper method to prepare client and handle usage
  async prepareClient() {
    await this.refreshClient();
    
    if (!this.isAvailable()) {
      throw new Error('Google AI client not available');
    }
  }

  // Helper method to handle API call with usage tracking and retry logic
  async makeApiCall(apiCall, maxRetries = 3, baseDelay = 1000) {
    await this.prepareClient();
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiCall();
        
        // Update token usage
        await aiTokenService.updateTokenUsage('google');
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Check if it's a retryable error
        const isRetryable = this.isRetryableError(error);
        
        if (isRetryable && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          logger.warn(`API call failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, error.message);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        logger.error('API call error:', error);
        throw error;
      }
    }
    
    throw lastError;
  }

  // Check if an error is retryable
  isRetryableError(error) {
    if (!error || !error.status) return false;
    
    // Retry on these HTTP status codes
    const retryableStatuses = [503, 429, 500, 502, 504];
    return retryableStatuses.includes(error.status);
  }

  /**
   * Analyze user prompt to extract board requirements
   */
  async analyzePrompt(prompt) {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({ model: this.models.promptAnalyzer });
      
      const analysisPrompt = `
        Analyze this user request for creating a task board and extract structured information.
        
        User Request: "${prompt}"
        
        Return a JSON object with:
        {
          "boardType": "kanban" | "list" | "calendar" | "timeline",
          "boardName": "suggested name",
          "description": "brief description",
          "columns": [
            {
              "name": "column name",
              "description": "column purpose",
              "color": "#hexcolor",
              "order": number
            }
          ],
          "tasks": [
            {
              "title": "task title",
              "description": "task description",
              "priority": "low" | "medium" | "high" | "critical",
              "estimatedHours": number,
              "tags": ["tag1", "tag2"],
              "column": "column name"
            }
          ],
          "tags": [
            {
              "name": "tag name",
              "color": "#hexcolor",
              "category": "priority" | "status" | "type" | "department" | "custom"
            }
          ],
          "checklists": [
            {
              "title": "checklist title",
              "items": [
                {
                  "text": "item text",
                  "priority": "low" | "medium" | "high" | "critical"
                }
              ]
            }
          ],
          "settings": {
            "allowComments": boolean,
            "allowAttachments": boolean,
            "allowTimeTracking": boolean,
            "defaultTaskPriority": "low" | "medium" | "high" | "critical"
          }
        }
        
        Make the response practical and actionable. Use appropriate colors and realistic task names.
      `;

      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('No response content received from Google AI');
      }

      // Clean up the response - remove markdown code blocks if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Try to extract JSON from the response if it's not pure JSON
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      // Additional JSON cleaning
      cleanedContent = cleanedContent
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .replace(/,\s*$/, '')    // Remove trailing commas at end
        .replace(/\s*,\s*}/g, '}')  // Remove commas before closing braces
        .replace(/\s*,\s*]/g, ']')  // Remove commas before closing brackets
        .replace(/([^\\])\\([^\\])/g, '$1\\\\$2')  // Fix escaped characters
        .trim();

      return JSON.parse(cleanedContent);
    });
  }

  /**
   * Generate board data based on analyzed requirements
   */
  async generateBoardData(analysis, options = {}) {
    return this.makeApiCall(async () => {
      const model = this.client.getGenerativeModel({ 
        model: this.models.boardGenerator,
        generationConfig: {
          maxOutputTokens: options.maxTokens || 2000,
          temperature: 0.3,
        }
      });

      const generationPrompt = `
        Generate a complete task board JSON structure based on this analysis:
        
        ${JSON.stringify(analysis, null, 2)}
        
        Return a JSON object following this exact schema:
        {
          "board": {
            "name": "string",
            "description": "string",
            "type": "kanban" | "list" | "calendar" | "timeline",
            "visibility": "private" | "workspace" | "public",
            "settings": {
              "allowComments": boolean,
              "allowAttachments": boolean,
              "allowTimeTracking": boolean,
              "defaultTaskPriority": "low" | "medium" | "high" | "critical",
              "autoArchive": boolean,
              "archiveAfterDays": number
            }
          },
          "columns": [
            {
              "name": "string",
              "position": number,
              "color": "#hexcolor",
              "backgroundColor": "#hexcolor",
              "limit": number | null,
              "settings": {
                "wipLimit": {
                  "enabled": boolean,
                  "limit": number | null,
                  "strictMode": boolean
                },
                "sorting": {
                  "method": "manual" | "priority" | "due_date" | "created_date" | "alphabetical",
                  "direction": "asc" | "desc",
                  "autoSort": boolean
                }
              },
              "style": {
                "color": "#hexcolor",
                "backgroundColor": "#hexcolor",
                "icon": "string" | null
              }
            }
          ],
          "tasks": [
            {
              "title": "string",
              "description": "string",
              "priority": "low" | "medium" | "high" | "critical",
              "color": "#hexcolor",
              "assignees": [],
              "tags": ["string"],
              "dueDate": "ISO date string" | null,
              "estimatedHours": number | null,
              "position": number,
              "column": "column name"
            }
          ],
          "tags": [
            {
              "name": "string",
              "color": "#hexcolor",
              "textColor": "#hexcolor",
              "category": "priority" | "status" | "type" | "department" | "custom",
              "description": "string",
              "scope": "board"
            }
          ],
          "checklists": [
            {
              "title": "string",
              "items": [
                {
                  "text": "string",
                  "priority": "low" | "medium" | "high" | "critical",
                  "position": number,
                  "estimatedMinutes": number | null
                }
              ]
            }
          ]
        }
        
        Requirements:
        - All IDs should be unique and meaningful
        - Colors should be valid hex codes
        - Column positions should be sequential starting from 0
        - Task positions should be sequential within each column
        - Tags should reference board-level scope
        - Make the board practical and usable
        - Include realistic task descriptions and priorities
        - Use appropriate color schemes for different priorities and statuses
      `;

      const result = await model.generateContent(generationPrompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('No response content received from Google AI');
      }

      // Clean up the response
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Try to extract JSON from the response if it's not pure JSON
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      // Additional JSON cleaning
      cleanedContent = cleanedContent
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .replace(/,\s*$/, '')    // Remove trailing commas at end
        .replace(/\s*,\s*}/g, '}')  // Remove commas before closing braces
        .replace(/\s*,\s*]/g, ']')  // Remove commas before closing brackets
        .replace(/([^\\])\\([^\\])/g, '$1\\\\$2')  // Fix escaped characters
        .trim();

      return JSON.parse(cleanedContent);
    });
  }

  /**
   * Generate additional tasks for existing board
   */
  async generateAdditionalTasks(boardContext, columnName, count = 3) {
    if (!this.isAvailable()) {
      throw new Error('Google AI client not available');
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.models.boardGenerator });
      
      const taskPrompt = `
        Generate ${count} additional tasks for the "${columnName}" column of this board:
        
        Board Context: ${JSON.stringify(boardContext, null, 2)}
        
        Return a JSON array of task objects:
        [
          {
            "title": "string",
            "description": "string",
            "priority": "low" | "medium" | "high" | "critical",
            "color": "#hexcolor",
            "tags": ["string"],
            "estimatedHours": number | null,
            "dueDate": "ISO date string" | null
          }
        ]
        
        Make tasks relevant to the board's purpose and column context.
      `;

      const result = await model.generateContent(taskPrompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('No response content received from Google AI');
      }

      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Try to extract JSON array from the response if it's not pure JSON
      const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      // Additional JSON cleaning
      cleanedContent = cleanedContent
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .replace(/,\s*$/, '')    // Remove trailing commas at end
        .replace(/\s*,\s*}/g, '}')  // Remove commas before closing braces
        .replace(/\s*,\s*]/g, ']')  // Remove commas before closing brackets
        .replace(/([^\\])\\([^\\])/g, '$1\\\\$2')  // Fix escaped characters
        .trim();

      return JSON.parse(cleanedContent);
    } catch (error) {
      logger.error('Additional task generation error:', error);
      throw new Error(`Additional task generation failed: ${error.message}`);
    }
  }

  /**
   * Suggest board improvements
   */
  async suggestImprovements(boardData) {
    if (!this.isAvailable()) {
      throw new Error('Google AI client not available');
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.models.boardGenerator });
      
      const improvementPrompt = `
        Analyze this board structure and suggest improvements:
        
        ${JSON.stringify(boardData, null, 2)}
        
        Return a JSON object with suggestions:
        {
          "workflow": [
            {
              "suggestion": "string",
              "reason": "string",
              "impact": "low" | "medium" | "high",
              "effort": "low" | "medium" | "high"
            }
          ],
          "columns": [
            {
              "columnName": "string",
              "suggestions": ["string"]
            }
          ],
          "tasks": [
            {
              "suggestion": "string",
              "reason": "string"
            }
          ],
          "tags": [
            {
              "suggestion": "string",
              "reason": "string"
            }
          ],
          "settings": [
            {
              "setting": "string",
              "suggestion": "string",
              "reason": "string"
            }
          ]
        }
      `;

      const result = await model.generateContent(improvementPrompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('No response content received from Google AI');
      }

      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Try to extract JSON from the response if it's not pure JSON
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      // Additional JSON cleaning
      cleanedContent = cleanedContent
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .replace(/,\s*$/, '')    // Remove trailing commas at end
        .replace(/\s*,\s*}/g, '}')  // Remove commas before closing braces
        .replace(/\s*,\s*]/g, ']')  // Remove commas before closing brackets
        .replace(/([^\\])\\([^\\])/g, '$1\\\\$2')  // Fix escaped characters
        .trim();

      return JSON.parse(cleanedContent);
    } catch (error) {
      logger.error('Improvement suggestion error:', error);
      throw new Error(`Improvement suggestion failed: ${error.message}`);
    }
  }

  /**
   * Moderate content for inappropriate material
   */
  async moderateContent(text) {
    if (!this.isAvailable()) {
      return { flagged: false, categories: [] };
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.models.contentModerator });
      
      const moderationPrompt = `
        Check this content for inappropriate material, hate speech, or harmful content:
        
        "${text}"
        
        Return JSON:
        {
          "flagged": boolean,
          "categories": ["string"],
          "confidence": number (0-1),
          "reason": "string"
        }
      `;

      const result = await model.generateContent(moderationPrompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        return { flagged: false, categories: [], confidence: 0, reason: 'Unable to moderate' };
      }

      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Try to extract JSON from the response if it's not pure JSON
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      // Additional JSON cleaning
      cleanedContent = cleanedContent
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .replace(/,\s*$/, '')    // Remove trailing commas at end
        .replace(/\s*,\s*}/g, '}')  // Remove commas before closing braces
        .replace(/\s*,\s*]/g, ']')  // Remove commas before closing brackets
        .replace(/([^\\])\\([^\\])/g, '$1\\\\$2')  // Fix escaped characters
        .trim();

      // Try to parse the JSON, with fallback to manual parsing
      try {
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        logger.warn('JSON parse failed, attempting manual parsing:', parseError.message);
        logger.warn('Content that failed to parse:', cleanedContent);
        
        // Manual parsing fallback
        const flaggedMatch = cleanedContent.match(/"flagged":\s*(true|false)/i);
        const categoriesMatch = cleanedContent.match(/"categories":\s*\[([^\]]*)\]/);
        const confidenceMatch = cleanedContent.match(/"confidence":\s*([0-9.]+)/);
        const reasonMatch = cleanedContent.match(/"reason":\s*"([^"]*)"/);
        
        return {
          flagged: flaggedMatch ? flaggedMatch[1].toLowerCase() === 'true' : false,
          categories: categoriesMatch ? 
            categoriesMatch[1].split(',').map(cat => cat.trim().replace(/"/g, '')) : [],
          confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0,
          reason: reasonMatch ? reasonMatch[1] : 'Manual parsing fallback'
        };
      }
    } catch (error) {
      logger.error('Content moderation error:', error);
      return { flagged: false, categories: [], confidence: 0, reason: 'Moderation failed' };
    }
  }

  /**
   * Auto-complete user prompts for board creation
   */
  async autoCompletePrompt(partialPrompt, context = {}) {
    if (!this.isAvailable()) {
      throw new Error('Google AI client not available');
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.models.promptAnalyzer });
      
      const completionPrompt = `
        Complete this partial board creation prompt and provide 3 different suggestions:
        
        Partial Prompt: "${partialPrompt}"
        Context: ${JSON.stringify(context, null, 2)}
        
        Return a JSON object with completion suggestions:
        {
          "suggestions": [
            {
              "prompt": "complete prompt text",
              "description": "what this board will create",
              "complexity": "simple" | "medium" | "complex",
              "estimatedTasks": number,
              "estimatedColumns": number
            }
          ],
          "keywords": ["suggested", "keywords", "for", "search"],
          "categories": ["project-management", "content-creation", "development", "etc"]
        }
        
        Make suggestions practical and actionable. Consider different board types (kanban, list, calendar, timeline).
      `;

      const result = await model.generateContent(completionPrompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('No response content received from Google AI');
      }

      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Try to extract JSON from the response if it's not pure JSON
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      // Additional JSON cleaning
      cleanedContent = cleanedContent
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .replace(/,\s*$/, '')    // Remove trailing commas at end
        .replace(/\s*,\s*}/g, '}')  // Remove commas before closing braces
        .replace(/\s*,\s*]/g, ']')  // Remove commas before closing brackets
        .replace(/([^\\])\\([^\\])/g, '$1\\\\$2')  // Fix escaped characters
        .trim();

      try {
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        logger.warn('JSON parsing failed, attempting to fix:', parseError.message);
        
        // Try to fix common JSON issues
        let fixedContent = cleanedContent
          .replace(/([^\\])\\([^\\])/g, '$1\\\\$2')  // Fix escaped characters
          .replace(/([^\\])\\([^\\])/g, '$1\\\\$2')  // Double fix
          .replace(/'/g, '"')  // Replace single quotes with double quotes
          .replace(/(\w+):/g, '"$1":')  // Quote unquoted keys
          .replace(/:\s*([^",{\[\s][^,}\]\]]*?)([,}\]])/g, ': "$1"$2')  // Quote unquoted string values
          .replace(/,\s*}/g, '}')  // Remove trailing commas
          .replace(/,\s*]/g, ']');  // Remove trailing commas
        
        try {
          return JSON.parse(fixedContent);
        } catch (secondError) {
          // Return fallback response
          logger.warn('JSON parsing failed after fixes, returning fallback');
          return {
            suggestions: [
              {
                prompt: `${partialPrompt} a project management board with tasks and columns`,
                description: 'A basic project management board',
                complexity: 'simple',
                estimatedTasks: 5,
                estimatedColumns: 3
              }
            ],
            keywords: ['project', 'management', 'board', 'tasks'],
            categories: ['project-management']
          };
        }
      }
    } catch (error) {
      logger.error('Auto-completion error:', error);
      throw new Error(`Auto-completion failed: ${error.message}`);
    }
  }

  /**
   * Get smart suggestions based on user input
   */
  async getSmartSuggestions(input, type = 'board') {
    if (!this.isAvailable()) {
      throw new Error('Google AI client not available');
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.models.promptAnalyzer });
      
      const suggestionsPrompt = `
        Provide smart suggestions for ${type} creation based on this input:
        
        Input: "${input}"
        
        Return a JSON object with suggestions:
        {
          "boardTypes": [
            {
              "type": "kanban" | "list" | "calendar" | "timeline",
              "name": "display name",
              "description": "when to use this type",
              "icon": "icon name"
            }
          ],
          "templates": [
            {
              "name": "template name",
              "description": "template description",
              "category": "category",
              "complexity": "simple" | "medium" | "complex",
              "estimatedTime": "time to set up"
            }
          ],
          "features": [
            {
              "feature": "feature name",
              "description": "what it does",
              "recommended": boolean
            }
          ],
          "columns": [
            {
              "name": "column name",
              "description": "column purpose",
              "color": "#hexcolor",
              "icon": "icon name"
            }
          ],
          "tags": [
            {
              "name": "tag name",
              "color": "#hexcolor",
              "category": "priority" | "status" | "type" | "department" | "custom"
            }
          ]
        }
      `;

      const result = await model.generateContent(suggestionsPrompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('No response content received from Google AI');
      }

      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Try to extract JSON from the response if it's not pure JSON
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      // Additional JSON cleaning
      cleanedContent = cleanedContent
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .replace(/,\s*$/, '')    // Remove trailing commas at end
        .replace(/\s*,\s*}/g, '}')  // Remove commas before closing braces
        .replace(/\s*,\s*]/g, ']')  // Remove commas before closing brackets
        .replace(/([^\\])\\([^\\])/g, '$1\\\\$2')  // Fix escaped characters
        .trim();

      try {
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        logger.warn('JSON parsing failed for smart suggestions, returning fallback');
        return {
          boardTypes: [
            { type: 'kanban', name: 'Kanban Board', description: 'Visual workflow management', icon: 'columns' },
            { type: 'list', name: 'List Board', description: 'Simple task list management', icon: 'list' }
          ],
          templates: [
            { name: 'Basic Project', description: 'Simple project management', category: 'general', complexity: 'simple', estimatedTime: '5 minutes' }
          ],
          features: [
            { feature: 'Task Management', description: 'Create and organize tasks', recommended: true }
          ],
          columns: [
            { name: 'To Do', description: 'Tasks to be completed', color: '#6B7280', icon: 'circle' },
            { name: 'In Progress', description: 'Tasks currently being worked on', color: '#3B82F6', icon: 'play' },
            { name: 'Done', description: 'Completed tasks', color: '#10B981', icon: 'check' }
          ],
          tags: [
            { name: 'High Priority', color: '#EF4444', category: 'priority' },
            { name: 'Bug', color: '#F59E0B', category: 'type' }
          ]
        };
      }
    } catch (error) {
      logger.error('Smart suggestions error:', error);
      throw new Error(`Smart suggestions failed: ${error.message}`);
    }
  }

  /**
   * Generate quick board templates
   */
  async generateQuickTemplates(category = 'general', count = 5) {
    if (!this.isAvailable()) {
      throw new Error('Google AI client not available');
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.models.boardGenerator });
      
      const templatePrompt = `
        Generate ${count} quick board templates for ${category} category.
        
        Return a JSON array of template objects:
        [
          {
            "name": "template name",
            "description": "template description",
            "category": "category",
            "boardType": "kanban" | "list" | "calendar" | "timeline",
            "prompt": "ready-to-use prompt for this template",
            "columns": [
              {
                "name": "column name",
                "color": "#hexcolor",
                "description": "column purpose"
              }
            ],
            "tags": [
              {
                "name": "tag name",
                "color": "#hexcolor",
                "category": "priority" | "status" | "type" | "department" | "custom"
              }
            ],
            "complexity": "simple" | "medium" | "complex",
            "estimatedTasks": number,
            "estimatedTime": "setup time"
          }
        ]
        
        Make templates practical and ready to use.
      `;

      const result = await model.generateContent(templatePrompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('No response content received from Google AI');
      }

      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Try to extract JSON array from the response if it's not pure JSON
      const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      // Additional JSON cleaning
      cleanedContent = cleanedContent
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .replace(/,\s*$/, '')    // Remove trailing commas at end
        .replace(/\s*,\s*}/g, '}')  // Remove commas before closing braces
        .replace(/\s*,\s*]/g, ']')  // Remove commas before closing brackets
        .replace(/([^\\])\\([^\\])/g, '$1\\\\$2')  // Fix escaped characters
        .trim();

      try {
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        logger.warn('JSON parsing failed for quick templates, returning fallback');
        return [
          {
            name: 'Basic Kanban',
            description: 'A simple Kanban board for task management',
            category: 'general',
            boardType: 'kanban',
            prompt: 'Create a basic Kanban board with To Do, In Progress, and Done columns',
            columns: [
              { name: 'To Do', color: '#6B7280', description: 'Tasks to be completed' },
              { name: 'In Progress', color: '#3B82F6', description: 'Tasks currently being worked on' },
              { name: 'Done', color: '#10B981', description: 'Completed tasks' }
            ],
            tags: [
              { name: 'High Priority', color: '#EF4444', category: 'priority' },
              { name: 'Bug', color: '#F59E0B', category: 'type' }
            ],
            complexity: 'simple',
            estimatedTasks: 5,
            estimatedTime: '2 minutes'
          }
        ];
      }
    } catch (error) {
      logger.error('Quick templates error:', error);
      throw new Error(`Quick templates generation failed: ${error.message}`);
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      available: this.isAvailable(),
      models: this.models,
      features: [
        'board_generation',
        'prompt_analysis',
        'task_generation',
        'improvement_suggestions',
        'content_moderation',
        'auto_completion',
        'smart_suggestions',
        'quick_templates'
      ]
    };
  }
}

// Create singleton instance
const googleAIClient = new GoogleAIClient();

module.exports = googleAIClient;
