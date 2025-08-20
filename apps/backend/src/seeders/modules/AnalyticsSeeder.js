/**
 * Analytics Seeder
 * Handles seeding of analytics data for workspaces and users
 */

const BaseSeeder = require('../base/BaseSeeder');
const { faker } = require('@faker-js/faker');
const Analytics = require('../../models/Analytics');
const User = require('../../models/User');
const Workspace = require('../../models/Workspace');
const Task = require('../../models/Task');

class AnalyticsSeeder extends BaseSeeder {
  constructor(userSeeder = null, workspaceSeeder = null, taskSeeder = null) {
    super();
    this.userSeeder = userSeeder;
    this.workspaceSeeder = workspaceSeeder;
    this.taskSeeder = taskSeeder;
    this.analyticsModel = Analytics;
    this.userModel = User;
    this.workspaceModel = Workspace;
    this.taskModel = Task;
  }

  /**
   * Main seeding method for analytics
   */
  async seed() {
    const users = await this.getAvailableUsers();
    const workspaces = await this.getAvailableWorkspaces();
    
    if (users.length === 0 || workspaces.length === 0) {
      this.log('Skipping analytics seeding (no users or workspaces available)');
      return [];
    }

    const totalAnalytics = this.calculateTotalAnalytics(users, workspaces);
    await this.initialize(totalAnalytics, 'Analytics Seeding');

    try {
      const createdAnalytics = [];

      // Create workspace analytics
      for (const workspace of workspaces) {
        const workspaceAnalytics = await this.generateWorkspaceAnalytics(workspace);
        createdAnalytics.push(workspaceAnalytics);
        this.addCreatedData('analytics', workspaceAnalytics);
        this.updateProgress(1, `Created analytics for workspace: ${workspace.name}`);
      }

      // Create user analytics
      for (const user of users) {
        const userAnalytics = await this.generateUserAnalytics(user);
        createdAnalytics.push(userAnalytics);
        this.addCreatedData('analytics', userAnalytics);
        this.updateProgress(1, `Created analytics for user: ${user.name}`);
      }

      // Create system-wide analytics
      const systemAnalytics = await this.generateSystemAnalytics();
      createdAnalytics.push(systemAnalytics);
      this.addCreatedData('analytics', systemAnalytics);
      this.updateProgress(1, 'Created system-wide analytics');

      this.completeProgress('Analytics seeding completed');
      this.printSummary();
      
      return createdAnalytics;

    } catch (error) {
      this.error(`Analytics seeding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate total number of analytics records to create
   */
  calculateTotalAnalytics(users, workspaces) {
    return users.length + workspaces.length + 1; // +1 for system analytics
  }

  /**
   * Generate workspace analytics
   */
  async generateWorkspaceAnalytics(workspace) {
    const tasks = await this.getAvailableTasks();
    const workspaceTasks = tasks.filter(task => task.workspace?.toString() === workspace._id.toString());
    
    const totalTasks = workspaceTasks.length;
    const completedTasks = workspaceTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = workspaceTasks.filter(task => task.status === 'in_progress').length;
    const overdueTasks = workspaceTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
    ).length;

    return {
      type: 'workspace',
      entityId: workspace._id,
      entityName: workspace.name,
      period: 'monthly',
      date: new Date(),
      metrics: {
        totalTasks: totalTasks,
        completedTasks: completedTasks,
        inProgressTasks: inProgressTasks,
        overdueTasks: overdueTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        averageTaskDuration: this.calculateAverageTaskDuration(workspaceTasks),
        totalHoursSpent: this.calculateTotalHoursSpent(workspaceTasks),
        totalHoursEstimated: this.calculateTotalHoursEstimated(workspaceTasks),
        productivityScore: this.calculateProductivityScore(workspaceTasks),
        teamVelocity: this.calculateTeamVelocity(workspaceTasks),
        taskDistribution: {
          todo: workspaceTasks.filter(t => t.status === 'todo').length,
          inProgress: inProgressTasks,
          review: workspaceTasks.filter(t => t.status === 'review').length,
          completed: completedTasks
        },
        priorityDistribution: {
          low: workspaceTasks.filter(t => t.priority === 'low').length,
          medium: workspaceTasks.filter(t => t.priority === 'medium').length,
          high: workspaceTasks.filter(t => t.priority === 'high').length,
          urgent: workspaceTasks.filter(t => t.priority === 'urgent').length
        }
      },
      trends: {
        taskCompletionTrend: this.generateTrendData(30),
        productivityTrend: this.generateTrendData(30),
        teamActivityTrend: this.generateTrendData(30),
        overdueTasksTrend: this.generateTrendData(30)
      },
      insights: this.generateWorkspaceInsights(workspaceTasks),
      recommendations: this.generateWorkspaceRecommendations(workspaceTasks),
      metadata: {
        lastUpdated: new Date(),
        dataSource: 'taskflow_system',
        confidence: faker.number.float({ min: 0.8, max: 1.0, precision: 0.01 }),
        sampleSize: totalTasks
      }
    };
  }

  /**
   * Generate user analytics
   */
  async generateUserAnalytics(user) {
    const tasks = await this.getAvailableTasks();
    const userTasks = tasks.filter(task => 
      task.assignee?.toString() === user._id.toString() || 
      task.reporter?.toString() === user._id.toString()
    );
    
    const assignedTasks = tasks.filter(task => task.assignee?.toString() === user._id.toString());
    const completedTasks = assignedTasks.filter(task => task.status === 'completed').length;
    const overdueTasks = assignedTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
    ).length;

    return {
      type: 'user',
      entityId: user._id,
      entityName: user.name,
      period: 'monthly',
      date: new Date(),
      metrics: {
        totalTasksAssigned: assignedTasks.length,
        completedTasks: completedTasks,
        overdueTasks: overdueTasks,
        completionRate: assignedTasks.length > 0 ? (completedTasks / assignedTasks.length) * 100 : 0,
        averageTaskDuration: this.calculateAverageTaskDuration(assignedTasks),
        totalHoursSpent: this.calculateTotalHoursSpent(assignedTasks),
        totalHoursEstimated: this.calculateTotalHoursEstimated(assignedTasks),
        productivityScore: this.calculateUserProductivityScore(assignedTasks),
        responseTime: this.calculateAverageResponseTime(assignedTasks),
        taskQuality: this.calculateTaskQuality(assignedTasks),
        collaborationScore: this.calculateCollaborationScore(userTasks),
        taskDistribution: {
          todo: assignedTasks.filter(t => t.status === 'todo').length,
          inProgress: assignedTasks.filter(t => t.status === 'in_progress').length,
          review: assignedTasks.filter(t => t.status === 'review').length,
          completed: completedTasks
        },
        priorityHandling: {
          low: assignedTasks.filter(t => t.priority === 'low').length,
          medium: assignedTasks.filter(t => t.priority === 'medium').length,
          high: assignedTasks.filter(t => t.priority === 'high').length,
          urgent: assignedTasks.filter(t => t.priority === 'urgent').length
        }
      },
      trends: {
        productivityTrend: this.generateTrendData(30),
        taskCompletionTrend: this.generateTrendData(30),
        responseTimeTrend: this.generateTrendData(30),
        qualityTrend: this.generateTrendData(30)
      },
      insights: this.generateUserInsights(assignedTasks),
      recommendations: this.generateUserRecommendations(assignedTasks),
      metadata: {
        lastUpdated: new Date(),
        dataSource: 'taskflow_system',
        confidence: faker.number.float({ min: 0.8, max: 1.0, precision: 0.01 }),
        sampleSize: assignedTasks.length
      }
    };
  }

  /**
   * Generate system-wide analytics
   */
  async generateSystemAnalytics() {
    const users = await this.getAvailableUsers();
    const workspaces = await this.getAvailableWorkspaces();
    const tasks = await this.getAvailableTasks();

    const totalUsers = users.length;
    const totalWorkspaces = workspaces.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;

    return {
      type: 'system',
      entityId: 'system',
      entityName: 'TaskFlow System',
      period: 'monthly',
      date: new Date(),
      metrics: {
        totalUsers: totalUsers,
        totalWorkspaces: totalWorkspaces,
        totalTasks: totalTasks,
        completedTasks: completedTasks,
        overallCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        averageTasksPerUser: totalUsers > 0 ? totalTasks / totalUsers : 0,
        averageTasksPerWorkspace: totalWorkspaces > 0 ? totalTasks / totalWorkspaces : 0,
        systemUptime: faker.number.float({ min: 99.5, max: 99.9, precision: 0.01 }),
        averageResponseTime: faker.number.float({ min: 100, max: 500, precision: 0.1 }),
        activeUsers: Math.floor(totalUsers * faker.number.float({ min: 0.7, max: 0.9, precision: 0.01 })),
        newUsersThisMonth: Math.floor(totalUsers * faker.number.float({ min: 0.1, max: 0.3, precision: 0.01 })),
        taskCreationRate: this.calculateTaskCreationRate(tasks),
        userEngagement: this.calculateUserEngagement(users, tasks)
      },
      trends: {
        userGrowthTrend: this.generateTrendData(12),
        taskCreationTrend: this.generateTrendData(12),
        completionRateTrend: this.generateTrendData(12),
        systemPerformanceTrend: this.generateTrendData(12)
      },
      insights: this.generateSystemInsights(users, workspaces, tasks),
      recommendations: this.generateSystemRecommendations(users, workspaces, tasks),
      metadata: {
        lastUpdated: new Date(),
        dataSource: 'taskflow_system',
        confidence: faker.number.float({ min: 0.9, max: 1.0, precision: 0.01 }),
        sampleSize: totalTasks + totalUsers + totalWorkspaces
      }
    };
  }

  /**
   * Calculate average task duration
   */
  calculateAverageTaskDuration(tasks) {
    const completedTasks = tasks.filter(task => task.status === 'completed' && task.startedAt && task.completedAt);
    if (completedTasks.length === 0) return 0;

    const totalDuration = completedTasks.reduce((sum, task) => {
      const duration = new Date(task.completedAt) - new Date(task.startedAt);
      return sum + duration;
    }, 0);

    return totalDuration / completedTasks.length / (1000 * 60 * 60); // Convert to hours
  }

  /**
   * Calculate total hours spent
   */
  calculateTotalHoursSpent(tasks) {
    return tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
  }

  /**
   * Calculate total hours estimated
   */
  calculateTotalHoursEstimated(tasks) {
    return tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  }

  /**
   * Calculate productivity score
   */
  calculateProductivityScore(tasks) {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;
    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
    ).length;

    if (totalTasks === 0) return 0;

    const completionScore = (completedTasks / totalTasks) * 50;
    const timelinessScore = Math.max(0, 50 - (overdueTasks / totalTasks) * 50);

    return Math.min(100, completionScore + timelinessScore);
  }

  /**
   * Calculate team velocity
   */
  calculateTeamVelocity(tasks) {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentCompletedTasks = completedTasks.filter(task => 
      task.completedAt && new Date(task.completedAt) > thirtyDaysAgo
    );

    return recentCompletedTasks.length;
  }

  /**
   * Calculate user productivity score
   */
  calculateUserProductivityScore(tasks) {
    return this.calculateProductivityScore(tasks);
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime(tasks) {
    const tasksWithStart = tasks.filter(task => task.startedAt && task.createdAt);
    if (tasksWithStart.length === 0) return 0;

    const totalResponseTime = tasksWithStart.reduce((sum, task) => {
      const responseTime = new Date(task.startedAt) - new Date(task.createdAt);
      return sum + responseTime;
    }, 0);

    return totalResponseTime / tasksWithStart.length / (1000 * 60 * 60); // Convert to hours
  }

  /**
   * Calculate task quality
   */
  calculateTaskQuality(tasks) {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    if (completedTasks.length === 0) return 0;

    // Simulate quality based on task complexity and completion time
    const qualityScores = completedTasks.map(task => {
      const estimatedHours = task.estimatedHours || 1;
      const actualHours = task.actualHours || 1;
      const efficiency = Math.min(1, estimatedHours / actualHours);
      return efficiency * 100;
    });

    return qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
  }

  /**
   * Calculate collaboration score
   */
  calculateCollaborationScore(tasks) {
    const tasksWithComments = tasks.filter(task => task.comments && task.comments.length > 0);
    const tasksWithWatchers = tasks.filter(task => task.watchers && task.watchers.length > 0);
    
    const totalTasks = tasks.length;
    if (totalTasks === 0) return 0;

    const commentScore = (tasksWithComments.length / totalTasks) * 50;
    const watcherScore = (tasksWithWatchers.length / totalTasks) * 50;

    return commentScore + watcherScore;
  }

  /**
   * Calculate task creation rate
   */
  calculateTaskCreationRate(tasks) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentTasks = tasks.filter(task => 
      task.createdAt && new Date(task.createdAt) > thirtyDaysAgo
    );

    return recentTasks.length / 30; // Tasks per day
  }

  /**
   * Calculate user engagement
   */
  calculateUserEngagement(users, tasks) {
    const activeUsers = users.filter(user => {
      const userTasks = tasks.filter(task => 
        task.assignee?.toString() === user._id.toString() || 
        task.reporter?.toString() === user._id.toString()
      );
      return userTasks.length > 0;
    });

    return users.length > 0 ? (activeUsers.length / users.length) * 100 : 0;
  }

  /**
   * Generate trend data
   */
  generateTrendData(days) {
    const trend = [];
    const baseValue = faker.number.float({ min: 50, max: 100, precision: 0.1 });
    
    for (let i = 0; i < days; i++) {
      const variation = faker.number.float({ min: -10, max: 10, precision: 0.1 });
      trend.push({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
        value: Math.max(0, baseValue + variation)
      });
    }
    
    return trend;
  }

  /**
   * Generate workspace insights
   */
  generateWorkspaceInsights(tasks) {
    const insights = [];
    
    if (tasks.length > 0) {
      const completionRate = (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100;
      
      if (completionRate > 80) {
        insights.push('High task completion rate indicates excellent team productivity');
      } else if (completionRate < 50) {
        insights.push('Low completion rate suggests potential bottlenecks or resource constraints');
      }

      const overdueTasks = tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
      );
      
      if (overdueTasks.length > 0) {
        insights.push(`${overdueTasks.length} tasks are overdue and need immediate attention`);
      }
    }

    return insights;
  }

  /**
   * Generate workspace recommendations
   */
  generateWorkspaceRecommendations(tasks) {
    const recommendations = [];
    
    if (tasks.length > 0) {
      const overdueTasks = tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
      );
      
      if (overdueTasks.length > 0) {
        recommendations.push('Prioritize overdue tasks and consider extending deadlines');
      }

      const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
      if (highPriorityTasks.length > tasks.length * 0.3) {
        recommendations.push('Consider reducing high-priority task load to improve focus');
      }
    }

    return recommendations;
  }

  /**
   * Generate user insights
   */
  generateUserInsights(tasks) {
    const insights = [];
    
    if (tasks.length > 0) {
      const completionRate = (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100;
      
      if (completionRate > 90) {
        insights.push('Excellent task completion rate - maintaining high productivity');
      } else if (completionRate < 60) {
        insights.push('Task completion rate could be improved with better time management');
      }
    }

    return insights;
  }

  /**
   * Generate user recommendations
   */
  generateUserRecommendations(tasks) {
    const recommendations = [];
    
    if (tasks.length > 0) {
      const overdueTasks = tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
      );
      
      if (overdueTasks.length > 0) {
        recommendations.push('Focus on completing overdue tasks to improve productivity score');
      }
    }

    return recommendations;
  }

  /**
   * Generate system insights
   */
  generateSystemInsights(users, workspaces, tasks) {
    const insights = [];
    
    if (tasks.length > 0) {
      const completionRate = (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100;
      insights.push(`Overall system completion rate: ${completionRate.toFixed(1)}%`);
    }

    if (users.length > 0 && workspaces.length > 0) {
      const avgUsersPerWorkspace = users.length / workspaces.length;
      insights.push(`Average users per workspace: ${avgUsersPerWorkspace.toFixed(1)}`);
    }

    return insights;
  }

  /**
   * Generate system recommendations
   */
  generateSystemRecommendations(users, workspaces, tasks) {
    const recommendations = [];
    
    if (tasks.length > 0) {
      const completionRate = (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100;
      
      if (completionRate < 70) {
        recommendations.push('Consider implementing productivity improvement initiatives');
      }
    }

    return recommendations;
  }

  /**
   * Create analytics in database
   */
  async createAnalytics(data) {
    try {
      const analytics = new this.analyticsModel(data);
      const savedAnalytics = await analytics.save();
      
      this.success(`Created ${savedAnalytics.type} analytics for ${savedAnalytics.entityName}`);
      return savedAnalytics;
      
    } catch (error) {
      this.error(`Failed to create analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available users for analytics creation
   */
  async getAvailableUsers() {
    // First try to get users from the user seeder if available
    if (this.userSeeder && this.userSeeder.getCreatedData('user')) {
      const userData = this.userSeeder.getCreatedData('user');
      return userData.map(data => data.user);
    }

    // Fallback to database query
    try {
      const users = await this.userModel.find({}).limit(50);
      return users;
    } catch (error) {
      this.error(`Failed to fetch users: ${error.message}`);
      return [];
    }
  }

  /**
   * Get available workspaces for analytics creation
   */
  async getAvailableWorkspaces() {
    // First try to get workspaces from the workspace seeder if available
    if (this.workspaceSeeder && this.workspaceSeeder.getCreatedWorkspaces()) {
      return this.workspaceSeeder.getCreatedWorkspaces();
    }

    // Fallback to database query
    try {
      const workspaces = await this.workspaceModel.find({}).limit(50);
      return workspaces;
    } catch (error) {
      this.error(`Failed to fetch workspaces: ${error.message}`);
      return [];
    }
  }

  /**
   * Get available tasks for analytics creation
   */
  async getAvailableTasks() {
    // First try to get tasks from the task seeder if available
    if (this.taskSeeder && this.taskSeeder.getCreatedTasks()) {
      return this.taskSeeder.getCreatedTasks();
    }

    // Fallback to database query
    try {
      const tasks = await this.taskModel.find({}).limit(100);
      return tasks;
    } catch (error) {
      this.warning(`Failed to fetch tasks: ${error.message}`);
      return [];
    }
  }

  /**
   * Validate analytics data
   */
  validateAnalytics(data) {
    const validator = require('../utils/validator');
    const result = validator.validateAnalytics(data);
    
    if (result.errors.length > 0) {
      this.error(`Analytics validation errors: ${result.errors.join(', ')}`);
      return false;
    }
    
    if (result.warnings.length > 0) {
      this.warning(`Analytics validation warnings: ${result.warnings.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Get created analytics
   */
  getCreatedAnalytics() {
    return this.getCreatedData('analytics') || [];
  }

  /**
   * Get analytics by type
   */
  getAnalyticsByType(type) {
    const analytics = this.getCreatedAnalytics();
    return analytics.filter(analytic => analytic.type === type);
  }

  /**
   * Print seeding summary
   */
  printSummary() {
    const analytics = this.getCreatedAnalytics();
    
    this.success('\n=== Analytics Seeding Summary ===');
    this.log(`✅ Created ${analytics.length} analytics records`);
    
    if (analytics.length > 0) {
      this.log('\n📋 Analytics Type Distribution:');
      const typeGroups = {};
      analytics.forEach(analytic => {
        if (!typeGroups[analytic.type]) {
          typeGroups[analytic.type] = 0;
        }
        typeGroups[analytic.type]++;
      });
      
      Object.entries(typeGroups).forEach(([type, count]) => {
        this.log(`  ${type}: ${count} records`);
      });

      const workspaceAnalytics = analytics.filter(a => a.type === 'workspace');
      const userAnalytics = analytics.filter(a => a.type === 'user');
      const systemAnalytics = analytics.filter(a => a.type === 'system');

      this.log(`\n📋 Analytics Coverage:`);
      this.log(`  Workspace analytics: ${workspaceAnalytics.length}`);
      this.log(`  User analytics: ${userAnalytics.length}`);
      this.log(`  System analytics: ${systemAnalytics.length}`);
    }
    
    this.success('=== End Analytics Seeding Summary ===\n');
  }
}

module.exports = AnalyticsSeeder;
