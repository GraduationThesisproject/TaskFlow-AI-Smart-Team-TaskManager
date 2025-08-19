const openaiClient = require('../ai/openai.client');
const Task = require('../models/Task');
const Space = require('../models/Space');
const Analytics = require('../models/Analytics');
const logger = require('../config/logger');

class AIService {
    // Generate task suggestions based on space goal
    async generateTaskSuggestions({ goal, context, boardType = 'kanban' }) {
        try {
            const prompt = `
                Space Goal: ${goal}
                Context: ${context || 'General space management'}
                Board Type: ${boardType}
                
                Generate a list of 5-8 specific, actionable tasks to achieve this space goal.
                For each task, provide:
                1. Title (concise, action-oriented)
                2. Description (2-3 sentences explaining what needs to be done)
                3. Priority (low, medium, high, urgent)
                4. Estimated hours (realistic estimate)
                5. Suggested column (if kanban: "To Do", "In Progress", "Review", "Done")
                
                Format as JSON array of task objects.
            `;

            const response = await openaiClient.generateCompletion(prompt);
            const suggestions = JSON.parse(response);

            // Validate and clean suggestions
            const cleanedSuggestions = suggestions.map(task => ({
                title: task.title?.substring(0, 200) || 'Untitled Task',
                description: task.description?.substring(0, 1000) || '',
                priority: ['low', 'medium', 'high', 'urgent'].includes(task.priority) 
                    ? task.priority : 'medium',
                estimatedHours: Math.max(0, Math.min(168, task.estimatedHours || 4)), // Cap at 1 week
                suggestedColumn: task.suggestedColumn || 'To Do',
                aiGenerated: true
            }));

            logger.info('AI task suggestions generated successfully');
            return cleanedSuggestions;

        } catch (error) {
            logger.error('AI task generation error:', error);
            throw new Error('Failed to generate AI task suggestions');
        }
    }

    // Analyze tasks for potential risks and delays
    async analyzeTaskRisks({ spaceId, boardId, userId }) {
        try {
            // Get space tasks
            const tasks = await Task.find({
                space: spaceId,
                ...(boardId && { board: boardId }),
                archived: false
            }).populate('assignees', 'name');

            if (tasks.length === 0) {
                return { risks: [], recommendations: [] };
            }

            const now = new Date();
            const risks = [];
            const recommendations = [];

            // Analyze overdue tasks
            const overdueTasks = tasks.filter(task => 
                task.dueDate && task.dueDate < now && task.status !== 'completed'
            );

            if (overdueTasks.length > 0) {
                risks.push({
                    type: 'overdue_tasks',
                    severity: 'high',
                    message: `${overdueTasks.length} task(s) are overdue`,
                    tasks: overdueTasks.map(t => t._id),
                    recommendation: 'Review and reschedule overdue tasks or mark as completed'
                });
            }

            // Analyze tasks due soon without assignees
            const unassignedDueSoon = tasks.filter(task => 
                task.dueDate &&
                task.dueDate > now &&
                task.dueDate < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) && // 3 days
                task.assignees.length === 0
            );

            if (unassignedDueSoon.length > 0) {
                risks.push({
                    type: 'unassigned_due_soon',
                    severity: 'medium',
                    message: `${unassignedDueSoon.length} task(s) due soon have no assignees`,
                    tasks: unassignedDueSoon.map(t => t._id),
                    recommendation: 'Assign these tasks to team members'
                });
            }

            // Analyze workload distribution
            const assigneeWorkload = tasks.reduce((acc, task) => {
                task.assignees.forEach(assignee => {
                    if (!acc[assignee._id]) {
                        acc[assignee._id] = { name: assignee.name, tasks: [] };
                    }
                    if (task.status !== 'completed') {
                        acc[assignee._id].tasks.push(task);
                    }
                });
                return acc;
            }, {});

            const workloads = Object.values(assigneeWorkload);
            const avgWorkload = workloads.reduce((sum, w) => sum + w.tasks.length, 0) / workloads.length;
            
            const overloadedMembers = workloads.filter(w => w.tasks.length > avgWorkload * 1.5);
            const underloadedMembers = workloads.filter(w => w.tasks.length < avgWorkload * 0.5);

            if (overloadedMembers.length > 0) {
                risks.push({
                    type: 'workload_imbalance',
                    severity: 'medium',
                    message: `${overloadedMembers.length} team member(s) may be overloaded`,
                    data: overloadedMembers,
                    recommendation: 'Consider redistributing tasks to balance workload'
                });
            }

            // AI-powered risk analysis
            if (tasks.length > 5) {
                const taskSummary = tasks.map(task => ({
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    assignees: task.assignees.length,
                    estimatedHours: task.estimatedHours
                }));

                const aiAnalysis = await this.getAIRiskAnalysis(taskSummary);
                if (aiAnalysis.risks) {
                    risks.push(...aiAnalysis.risks);
                }
                if (aiAnalysis.recommendations) {
                    recommendations.push(...aiAnalysis.recommendations);
                }
            }

            return {
                risks,
                recommendations,
                summary: {
                    totalTasks: tasks.length,
                    overdueTasks: overdueTasks.length,
                    completedTasks: tasks.filter(t => t.status === 'completed').length,
                    riskScore: this.calculateRiskScore(risks)
                }
            };

        } catch (error) {
            logger.error('AI risk analysis error:', error);
            throw new Error('Failed to analyze task risks');
        }
    }

    // Get AI-powered risk analysis
    async getAIRiskAnalysis(taskSummary) {
        try {
            const prompt = `
                Analyze these space tasks for potential risks and provide recommendations:
                ${JSON.stringify(taskSummary, null, 2)}
                
                Identify patterns that might indicate:
                1. Schedule risks (tight deadlines, task dependencies)
                2. Resource risks (too many high-priority tasks)
                3. Quality risks (rushed timelines)
                
                Return JSON with "risks" and "recommendations" arrays.
                Each risk should have: type, severity (low/medium/high), message, recommendation
            `;

            const response = await openaiClient.generateCompletion(prompt);
            return JSON.parse(response);

        } catch (error) {
            logger.error('AI risk analysis error:', error);
            return { risks: [], recommendations: [] };
        }
    }

    // Parse natural language input to create structured task
    async parseNaturalLanguageTask({ input, boardId, userId }) {
        try {
            const prompt = `
                Parse this natural language input into a structured task:
                "${input}"
                
                Extract:
                1. Title (main action/goal)
                2. Description (if implied)
                3. Priority (if mentioned: urgent, high, medium, low)
                4. Due date (if mentioned, in ISO format)
                5. Assignee indicators (if mentioned: "assign to", "for", etc.)
                6. Tags/labels (if implied)
                
                Return JSON object with parsed fields. Set null for missing information.
            `;

            const response = await openaiClient.generateCompletion(prompt);
            const parsed = JSON.parse(response);

            return {
                title: parsed.title || input.substring(0, 100),
                description: parsed.description || null,
                priority: parsed.priority || 'medium',
                dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
                labels: parsed.labels || [],
                suggestedAssignees: parsed.assigneeIndicators || [],
                originalInput: input
            };

        } catch (error) {
            logger.error('Natural language parsing error:', error);
            // Fallback to simple parsing
            return {
                title: input.substring(0, 100),
                description: input.length > 100 ? input.substring(100) : null,
                priority: 'medium',
                originalInput: input
            };
        }
    }

    // Generate space timeline with AI optimization
    async generateSpaceTimeline({ spaceId, startDate, targetEndDate, priorities }) {
        try {
            const tasks = await Task.find({ space: spaceId, archived: false });
            
            if (tasks.length === 0) {
                return { message: 'No tasks found for timeline generation' };
            }

            const prompt = `
                Generate an optimized space timeline for these tasks:
                ${JSON.stringify(tasks.map(t => ({
                    id: t._id,
                    title: t.title,
                    priority: t.priority,
                    estimatedHours: t.estimatedHours,
                    status: t.status,
                    dependencies: t.dependencies || []
                })), null, 2)}
                
                Space constraints:
                - Start date: ${startDate.toISOString()}
                ${targetEndDate ? `- Target end date: ${targetEndDate.toISOString()}` : ''}
                - Priorities: ${JSON.stringify(priorities)}
                
                Generate a timeline with:
                1. Suggested start and end dates for each task
                2. Critical path identification
                3. Milestone recommendations
                4. Resource allocation suggestions
                
                Return JSON with timeline structure.
            `;

            const response = await openaiClient.generateCompletion(prompt);
            const timeline = JSON.parse(response);

            return {
                ...timeline,
                generatedAt: new Date(),
                parameters: {
                    startDate,
                    targetEndDate,
                    priorities
                }
            };

        } catch (error) {
            logger.error('Timeline generation error:', error);
            throw new Error('Failed to generate space timeline');
        }
    }

    // Get smart recommendations based on user behavior
    async getSmartRecommendations({ userId, spaceId, type }) {
        try {
            // Get user's task patterns from analytics
            const userAnalytics = await Analytics.find({
                user: userId,
                space: spaceId,
                date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
            });

            const currentTasks = await Task.find({
                space: spaceId,
                assignees: userId,
                status: { $ne: 'completed' },
                archived: false
            });

            switch (type) {
                case 'next_tasks':
                    return await this.getNextTaskRecommendations(userId, currentTasks, userAnalytics);
                case 'optimization':
                    return await this.getOptimizationRecommendations(userId, userAnalytics);
                default:
                    return await this.getGeneralRecommendations(userId, currentTasks);
            }

        } catch (error) {
            logger.error('Smart recommendations error:', error);
            return [];
        }
    }

    // Generate task description based on title
    async generateTaskDescription({ title, spaceContext, taskType }) {
        try {
            const prompt = `
                Generate a detailed description for this task:
                Title: "${title}"
                Space context: ${spaceContext || 'General space'}
                Task type: ${taskType || 'General task'}
                
                Create a description that includes:
                1. What needs to be done (2-3 sentences)
                2. Acceptance criteria (2-3 bullet points)
                3. Any important considerations
                
                Keep it professional and actionable.
            `;

            const response = await openaiClient.generateCompletion(prompt);
            
            return response.trim();

        } catch (error) {
            logger.error('Task description generation error:', error);
            return `Complete the task: ${title}`;
        }
    }

    // Calculate risk score based on identified risks
    calculateRiskScore(risks) {
        const severityWeights = { low: 1, medium: 3, high: 5 };
        return risks.reduce((score, risk) => score + (severityWeights[risk.severity] || 1), 0);
    }

    // Helper method for next task recommendations
    async getNextTaskRecommendations(userId, currentTasks, analytics) {
        const now = new Date();
        
        // Prioritize by due date and priority
        const taskScores = currentTasks.map(task => {
            let score = 0;
            
            // Due date scoring
            if (task.dueDate) {
                const daysUntilDue = Math.ceil((task.dueDate - now) / (24 * 60 * 60 * 1000));
                if (daysUntilDue <= 1) score += 10;
                else if (daysUntilDue <= 3) score += 7;
                else if (daysUntilDue <= 7) score += 4;
            }
            
            // Priority scoring
            const priorityScores = { urgent: 8, high: 6, medium: 3, low: 1 };
            score += priorityScores[task.priority] || 3;
            
            return { task, score };
        });

        return taskScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(item => ({
                task: item.task,
                reason: this.generateRecommendationReason(item.task, item.score),
                score: item.score
            }));
    }

    // Generate recommendation reason
    generateRecommendationReason(task, score) {
        const now = new Date();
        const reasons = [];

        if (task.priority === 'urgent') reasons.push('Urgent priority');
        if (task.priority === 'high') reasons.push('High priority');
        
        if (task.dueDate) {
            const daysUntilDue = Math.ceil((task.dueDate - now) / (24 * 60 * 60 * 1000));
            if (daysUntilDue <= 1) reasons.push('Due very soon');
            else if (daysUntilDue <= 3) reasons.push('Due soon');
        }

        return reasons.join(', ') || 'Recommended for completion';
    }

    // Analyze space metrics and generate AI insights
    async analyzeSpaceMetrics(spaceId, analytics) {
        try {
            const space = await Space.findById(spaceId);
            if (!space) {
                throw new Error('Space not found');
            }

            const prompt = `
                Analyze this space's performance metrics:
                
                Space: ${space.name}
                Goal: ${space.goal}
                
                Metrics:
                - Total Tasks: ${analytics.totalTasks || 0}
                - Completed Tasks: ${analytics.completedTasks || 0}
                - In Progress Tasks: ${analytics.inProgressTasks || 0}
                - Overdue Tasks: ${analytics.overdueTasks || 0}
                - Completion Rate: ${analytics.completionRate || 0}%
                
                Generate 3-5 actionable insights and recommendations to improve space performance.
                Focus on:
                1. Task completion efficiency
                2. Risk mitigation
                3. Team productivity
                4. Space timeline optimization
                
                Format as JSON with array of insight objects containing: title, description, priority, action
            `;

            const response = await openaiClient.generateCompletion(prompt);
            const insights = JSON.parse(response);

            // Validate and clean insights
            const cleanedInsights = insights.map(insight => ({
                title: insight.title?.substring(0, 100) || 'Performance Insight',
                description: insight.description?.substring(0, 500) || '',
                priority: ['low', 'medium', 'high'].includes(insight.priority) 
                    ? insight.priority : 'medium',
                action: insight.action?.substring(0, 200) || '',
                aiGenerated: true,
                timestamp: new Date()
            }));

            logger.info('AI space metrics analysis completed');
            return cleanedInsights;

        } catch (error) {
            logger.error('AI space metrics analysis error:', error);
            // Return default insights if AI analysis fails
            return [
                {
                    title: 'Monitor Task Completion',
                    description: 'Track task completion rates to identify bottlenecks',
                    priority: 'medium',
                    action: 'Review task assignments and deadlines',
                    aiGenerated: true,
                    timestamp: new Date()
                }
            ];
        }
    }
}

module.exports = new AIService();
