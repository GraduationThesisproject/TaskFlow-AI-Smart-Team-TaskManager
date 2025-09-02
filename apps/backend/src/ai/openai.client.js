const OpenAI = require('openai');
const env = require('../config/env');
const logger = require('../config/logger');

class OpenAIClient {
    constructor() {
        if (!env.OPENAI_API_KEY) {
            logger.warn('OpenAI API key not configured. AI features will be disabled.');
            this.client = null;
            return;
        }

        this.client = new OpenAI({
            apiKey: env.OPENAI_API_KEY
        });

        this.models = {
            text: 'gpt-3.5-turbo',
            analysis: 'gpt-4',
            embedding: 'text-embedding-ada-002'
        };

        logger.info('OpenAI client initialized successfully');
    }

    // Check if client is available
    isAvailable() {
        return this.client !== null;
    }

    // Generate text completion
    async generateCompletion(prompt, options = {}) {
        if (!this.isAvailable()) {
            throw new Error('OpenAI client not available. Check API key configuration.');
        }

        try {
            const response = await this.client.chat.completions.create({
                model: options.model || this.models.text,
                messages: [
                    {
                        role: 'system',
                        content: 'You are TaskFlow AI, an intelligent assistant for space and task management. Provide helpful, accurate, and actionable responses.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: options.maxTokens || 1000,
                temperature: options.temperature || 0.7,
                top_p: options.topP || 1,
                frequency_penalty: options.frequencyPenalty || 0,
                presence_penalty: options.presencePenalty || 0,
                ...options
            });

            const content = response.choices[0]?.message?.content;
            
            if (!content) {
                throw new Error('No response content received from OpenAI');
            }

            logger.info('OpenAI completion generated successfully', {
                model: options.model || this.models.text,
                tokensUsed: response.usage?.total_tokens
            });

            return content.trim();

        } catch (error) {
            logger.error('OpenAI completion error:', {
                error: error.message,
                prompt: prompt.substring(0, 100) + '...'
            });

            // Handle specific OpenAI errors
            if (error.code === 'rate_limit_exceeded') {
                throw new Error('AI service rate limit exceeded. Please try again later.');
            } else if (error.code === 'insufficient_quota') {
                throw new Error('AI service quota exceeded. Please check your plan.');
            } else if (error.code === 'invalid_api_key') {
                throw new Error('AI service authentication failed.');
            }

            throw new Error(`AI completion failed: ${error.message}`);
        }
    }

    // Generate embeddings for semantic search
    async generateEmbedding(text) {
        if (!this.isAvailable()) {
            throw new Error('OpenAI client not available');
        }

        try {
            const response = await this.client.embeddings.create({
                model: this.models.embedding,
                input: text.substring(0, 8000) // Limit input length
            });

            const embedding = response.data[0]?.embedding;
            
            if (!embedding) {
                throw new Error('No embedding received from OpenAI');
            }

            return embedding;

        } catch (error) {
            logger.error('OpenAI embedding error:', error);
            throw new Error(`Embedding generation failed: ${error.message}`);
        }
    }

    // Analyze text sentiment
    async analyzeSentiment(text) {
        const prompt = `
            Analyze the sentiment of the following text and return a JSON object with:
            - sentiment: "positive", "negative", or "neutral"
            - confidence: number between 0 and 1
            - summary: brief explanation
            
            Text: "${text}"
        `;

        try {
            const response = await this.generateCompletion(prompt, {
                maxTokens: 200,
                temperature: 0.3
            });

            return JSON.parse(response);
        } catch (error) {
            logger.error('Sentiment analysis error:', error);
            return {
                sentiment: 'neutral',
                confidence: 0.5,
                summary: 'Analysis unavailable'
            };
        }
    }

    // Extract key information from text
    async extractKeyInfo(text, type = 'general') {
        const prompt = `
            Extract space information from this text and return JSON with:
            - name: space name
            - description: space description
            - goals: array of main objectives
            - team: array of team members mentioned
            - timeline: estimated duration if mentioned
            - priority: priority level if mentioned
            
            Text: "${text}"
        `;

        try {
            const response = await this.generateCompletion(prompt, {
                maxTokens: 500,
                temperature: 0.3
            });

            return JSON.parse(response);
        } catch (error) {
            logger.error('Key info extraction error:', error);
            return { error: 'Extraction failed' };
        }
    }

    // Generate creative suggestions
    async generateSuggestions(context, type = 'task', count = 5) {
        const prompts = {
            task: `
                Based on this space context, suggest ${count} specific and actionable tasks:
                Context: ${context}
                
                Return JSON array of objects with: title, description, priority, estimatedHours
            `,
            improvement: `
                Suggest ${count} ways to improve this workflow or process:
                Context: ${context}
                
                Return JSON array of objects with: suggestion, impact, effort, description
            `,
            milestone: `
                Suggest ${count} space milestones based on this context:
                Context: ${context}
                
                Return JSON array of objects with: name, description, timeline, deliverables
            `
        };

        try {
            const response = await this.generateCompletion(prompts[type] || prompts.task, {
                maxTokens: 800,
                temperature: 0.8
            });

            return JSON.parse(response);
        } catch (error) {
            logger.error('Suggestion generation error:', error);
            return [];
        }
    }

    // Moderate content for inappropriate material
    async moderateContent(text) {
        if (!this.isAvailable()) {
            return { flagged: false, categories: [] };
        }

        try {
            const response = await this.client.moderations.create({
                input: text
            });

            const result = response.results[0];
            
            return {
                flagged: result.flagged,
                categories: Object.entries(result.categories)
                    .filter(([_, flagged]) => flagged)
                    .map(([category, _]) => category),
                scores: result.category_scores
            };

        } catch (error) {
            logger.error('Content moderation error:', error);
            return { flagged: false, categories: [], error: error.message };
        }
    }

    // Get model information
    getModelInfo() {
        return {
            available: this.isAvailable(),
            models: this.models,
            features: [
                'text_completion',
                'embeddings',
                'content_moderation',
                'sentiment_analysis',
                'information_extraction'
            ]
        };
    }

    // Estimate token usage
    estimateTokens(text) {
        // Rough estimation: ~4 characters per token for English
        return Math.ceil(text.length / 4);
    }

    // Truncate text to fit token limits
    truncateText(text, maxTokens = 4000) {
        const estimatedTokens = this.estimateTokens(text);
        
        if (estimatedTokens <= maxTokens) {
            return text;
        }

        const ratio = maxTokens / estimatedTokens;
        const truncatedLength = Math.floor(text.length * ratio);
        
        return text.substring(0, truncatedLength) + '...';
    }
}

// Create singleton instance
const openaiClient = new OpenAIClient();

module.exports = openaiClient;
