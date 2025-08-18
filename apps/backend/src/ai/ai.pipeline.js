const openaiClient = require('./openai.client');
const logger = require('../config/logger');

/**
 * AI Pipeline for complex multi-step AI operations
 */
class AIPipeline {
    constructor() {
        this.steps = [];
        this.results = {};
        this.context = {};
    }

    // Add a step to the pipeline
    addStep(name, processor, options = {}) {
        this.steps.push({
            name,
            processor,
            options,
            dependencies: options.dependencies || []
        });
        return this;
    }

    // Execute the pipeline
    async execute(initialContext = {}) {
        this.context = { ...initialContext };
        this.results = {};

        logger.info('Starting AI pipeline execution', {
            steps: this.steps.length,
            context: Object.keys(this.context)
        });

        try {
            for (const step of this.steps) {
                // Check dependencies
                const missingDeps = step.dependencies.filter(dep => !this.results[dep]);
                if (missingDeps.length > 0) {
                    throw new Error(`Step ${step.name} missing dependencies: ${missingDeps.join(', ')}`);
                }

                logger.info(`Executing pipeline step: ${step.name}`);

                // Execute step
                const stepResult = await step.processor(this.context, this.results, step.options);
                this.results[step.name] = stepResult;

                // Update context with result if specified
                if (step.options.updateContext) {
                    this.context = { ...this.context, ...stepResult };
                }
            }

            logger.info('AI pipeline execution completed successfully');
            return this.results;

        } catch (error) {
            logger.error('AI pipeline execution failed:', error);
            throw error;
        }
    }

    // Get results from a specific step
    getStepResult(stepName) {
        return this.results[stepName];
    }

    // Get all results
    getAllResults() {
        return this.results;
    }

    // Clear the pipeline
    clear() {
        this.steps = [];
        this.results = {};
        this.context = {};
        return this;
    }
}

// Pre-built pipeline processors
const processors = {
    // Analyze project requirements
    analyzeRequirements: async (context, results, options) => {
        const { requirements } = context;
        
        if (!requirements) {
            throw new Error('Requirements text is required');
        }

        const prompt = `
            Analyze these project requirements and extract:
            1. Core objectives (3-5 main goals)
            2. Key deliverables (specific outcomes)
            3. Success metrics (how to measure success)
            4. Potential risks (what could go wrong)
            5. Resource needs (skills, tools, time)
            
            Requirements: ${requirements}
            
            Return structured JSON.
        `;

        const response = await openaiClient.generateCompletion(prompt, {
            maxTokens: 1000,
            temperature: 0.3
        });

        return JSON.parse(response);
    },

    // Generate work breakdown structure
    generateWBS: async (context, results, options) => {
        const requirements = results.analyzeRequirements || context;
        
        const prompt = `
            Create a Work Breakdown Structure based on these requirements:
            ${JSON.stringify(requirements, null, 2)}
            
            Generate a hierarchical breakdown with:
            - Level 1: Major phases/workstreams (3-6 items)
            - Level 2: Key activities within each phase
            - Level 3: Specific tasks (actionable items)
            
            For each task include: title, description, estimatedHours, priority, skills
            Return structured JSON.
        `;

        const response = await openaiClient.generateCompletion(prompt, {
            maxTokens: 1500,
            temperature: 0.4
        });

        return JSON.parse(response);
    },

    // Estimate project timeline
    estimateTimeline: async (context, results, options) => {
        const wbs = results.generateWBS;
        const { teamSize = 3, workHoursPerDay = 8 } = options;

        const prompt = `
            Create a realistic project timeline based on this WBS:
            ${JSON.stringify(wbs, null, 2)}
            
            Assumptions:
            - Team size: ${teamSize} people
            - Work hours per day: ${workHoursPerDay}
            - Account for dependencies, buffer time, and parallel work
            
            Return JSON with:
            - totalEstimatedHours
            - totalDays
            - phases (with start/end dates)
            - criticalPath
            - milestones
        `;

        const response = await openaiClient.generateCompletion(prompt, {
            maxTokens: 1000,
            temperature: 0.2
        });

        return JSON.parse(response);
    },

    // Identify risks and mitigation strategies
    riskAnalysis: async (context, results, options) => {
        const requirements = results.analyzeRequirements;
        const timeline = results.estimateTimeline;

        const prompt = `
            Perform risk analysis for this project:
            Requirements: ${JSON.stringify(requirements, null, 2)}
            Timeline: ${JSON.stringify(timeline, null, 2)}
            
            Identify risks in categories:
            - Technical risks
            - Resource risks
            - Schedule risks
            - Quality risks
            - External risks
            
            For each risk provide:
            - description
            - probability (low/medium/high)
            - impact (low/medium/high)
            - mitigation strategy
            
            Return structured JSON.
        `;

        const response = await openaiClient.generateCompletion(prompt, {
            maxTokens: 1200,
            temperature: 0.3
        });

        return JSON.parse(response);
    },

    // Generate team recommendations
    teamPlanning: async (context, results, options) => {
        const wbs = results.generateWBS;
        const timeline = results.estimateTimeline;

        const prompt = `
            Based on this project structure:
            WBS: ${JSON.stringify(wbs, null, 2)}
            Timeline: ${JSON.stringify(timeline, null, 2)}
            
            Recommend team structure:
            - Required roles and skills
            - Team composition
            - Workload distribution
            - Communication structure
            - Responsibilities matrix
            
            Return structured JSON.
        `;

        const response = await openaiClient.generateCompletion(prompt, {
            maxTokens: 800,
            temperature: 0.3
        });

        return JSON.parse(response);
    }
};

// Pre-built pipelines
const pipelines = {
    // Complete project analysis pipeline
    projectAnalysis: () => {
        return new AIPipeline()
            .addStep('requirements', processors.analyzeRequirements)
            .addStep('wbs', processors.generateWBS, { dependencies: ['requirements'] })
            .addStep('timeline', processors.estimateTimeline, { dependencies: ['wbs'] })
            .addStep('risks', processors.riskAnalysis, { dependencies: ['requirements', 'timeline'] })
            .addStep('team', processors.teamPlanning, { dependencies: ['wbs', 'timeline'] });
    },

    // Task optimization pipeline
    taskOptimization: () => {
        return new AIPipeline()
            .addStep('analyze', async (context) => {
                const { tasks } = context;
                
                const prompt = `
                    Analyze these tasks for optimization opportunities:
                    ${JSON.stringify(tasks, null, 2)}
                    
                    Identify:
                    - Dependencies and bottlenecks
                    - Parallelization opportunities
                    - Resource conflicts
                    - Priority adjustments needed
                    
                    Return structured analysis.
                `;

                const response = await openaiClient.generateCompletion(prompt, {
                    maxTokens: 800,
                    temperature: 0.3
                });

                return JSON.parse(response);
            })
            .addStep('optimize', async (context, results) => {
                const analysis = results.analyze;
                
                const prompt = `
                    Based on this analysis:
                    ${JSON.stringify(analysis, null, 2)}
                    
                    Provide optimized task schedule with:
                    - Reordered task sequence
                    - Resource allocation
                    - Timeline improvements
                    - Risk mitigation
                    
                    Return structured optimization plan.
                `;

                const response = await openaiClient.generateCompletion(prompt, {
                    maxTokens: 1000,
                    temperature: 0.2
                });

                return JSON.parse(response);
            }, { dependencies: ['analyze'] });
    }
};

// Pipeline execution helpers
const executePipeline = async (pipelineName, context, options = {}) => {
    if (!pipelines[pipelineName]) {
        throw new Error(`Pipeline ${pipelineName} not found`);
    }

    const pipeline = pipelines[pipelineName]();
    
    // Add custom options to each step
    if (options.stepOptions) {
        pipeline.steps.forEach(step => {
            if (options.stepOptions[step.name]) {
                Object.assign(step.options, options.stepOptions[step.name]);
            }
        });
    }

    return await pipeline.execute(context);
};

// Custom pipeline builder
const createCustomPipeline = (steps) => {
    const pipeline = new AIPipeline();
    
    steps.forEach(step => {
        if (typeof step === 'string' && processors[step]) {
            pipeline.addStep(step, processors[step]);
        } else if (typeof step === 'object') {
            pipeline.addStep(step.name, step.processor, step.options);
        }
    });

    return pipeline;
};

module.exports = {
    AIPipeline,
    processors,
    pipelines,
    executePipeline,
    createCustomPipeline
};
