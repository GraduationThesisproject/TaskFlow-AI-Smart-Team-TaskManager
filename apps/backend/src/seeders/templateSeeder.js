const mongoose = require('mongoose');
const Template = require('../models/Template');
const BoardTemplate = require('../models/BoardTemplate');
const logger = require('../config/logger');

// Sample template data - using only valid enum values
const projectTemplates = [
  {
    name: 'Kanban Project Management',
    description: 'A comprehensive Kanban board template for project management with predefined lists and workflow stages',
    type: 'board',
    category: 'Development',
    content: {
      lists: [
        { title: 'Backlog', order: 0, color: '#6B7280' },
        { title: 'To Do', order: 1, color: '#3B82F6' },
        { title: 'In Progress', order: 2, color: '#F59E0B' },
        { title: 'Review', order: 3, color: '#8B5CF6' },
        { title: 'Done', order: 4, color: '#10B981' }
      ],
      cards: [
        {
          title: 'Project Setup',
          description: 'Initialize project repository and basic structure',
          listId: 'To Do',
          order: 0,
          priority: 'high',
          estimatedHours: 2,
          tags: ['setup', 'initialization']
        },
        {
          title: 'Requirements Gathering',
          description: 'Collect and document project requirements',
          listId: 'To Do',
          order: 1,
          priority: 'high',
          estimatedHours: 4,
          tags: ['requirements', 'planning']
        }
      ]
    },
    structure: {
      version: '1.0',
      schema: {
        lists: 'array',
        cards: 'array'
      },
      required: ['lists', 'cards'],
      optional: ['thumbnail', 'metadata']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 45,
      lastUsed: new Date(),
      rating: { average: 4.5, count: 12 }
    }
  },
  {
    name: 'Scrum Sprint Board',
    description: 'Scrum methodology template with sprint planning, daily standups, and sprint review phases',
    type: 'board',
    category: 'Development',
    content: {
      lists: [
        { title: 'Product Backlog', order: 0, color: '#6B7280' },
        { title: 'Sprint Backlog', order: 1, color: '#3B82F6' },
        { title: 'In Progress', order: 2, color: '#F59E0B' },
        { title: 'Testing', order: 3, color: '#8B5CF6' },
        { title: 'Done', order: 4, color: '#10B981' }
      ],
      cards: [
        {
          title: 'Sprint Planning',
          description: 'Plan sprint goals and select user stories',
          listId: 'Sprint Backlog',
          order: 0,
          priority: 'high',
          estimatedHours: 3,
          tags: ['planning', 'sprint']
        },
        {
          title: 'Daily Standup',
          description: 'Daily team synchronization meeting',
          listId: 'In Progress',
          order: 0,
          priority: 'medium',
          estimatedHours: 0.5,
          tags: ['meeting', 'sync']
        }
      ]
    },
    structure: {
      version: '1.0',
      schema: {
        lists: 'array',
        cards: 'array'
      },
      required: ['lists', 'cards'],
      optional: ['sprintDuration', 'teamSize']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 32,
      lastUsed: new Date(),
      rating: { average: 4.8, count: 8 }
    }
  },
  {
    name: 'Bug Tracking System',
    description: 'Specialized template for tracking and resolving software bugs with priority levels and resolution tracking',
    type: 'board',
    category: 'Support',
    content: {
      lists: [
        { title: 'New Bugs', order: 0, color: '#EF4444' },
        { title: 'Investigating', order: 1, color: '#F59E0B' },
        { title: 'In Progress', order: 2, color: '#3B82F6' },
        { title: 'Testing Fix', order: 3, color: '#8B5CF6' },
        { title: 'Resolved', order: 4, color: '#10B981' }
      ],
      cards: [
        {
          title: 'Bug Report Template',
          description: 'Standard template for reporting new bugs',
          listId: 'New Bugs',
          order: 0,
          priority: 'high',
          estimatedHours: 0.5,
          tags: ['template', 'bug-report']
        },
        {
          title: 'Bug Investigation',
          description: 'Investigate root cause of reported bug',
          listId: 'Investigating',
          order: 0,
          priority: 'medium',
          estimatedHours: 2,
          tags: ['investigation', 'debugging']
        }
      ]
    },
    structure: {
      version: '1.0',
      schema: {
        lists: 'array',
        cards: 'array'
      },
      required: ['lists', 'cards'],
      optional: ['severityLevels', 'bugTypes']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 28,
      lastUsed: new Date(),
      rating: { average: 4.2, count: 15 }
    }
  }
];

const taskTemplates = [
  {
    name: 'Feature Development Task',
    description: 'Standard template for developing new features with planning, development, and testing phases',
    type: 'task',
    category: 'Development',
    content: {
      stages: ['Planning', 'Development', 'Testing', 'Review', 'Deployment'],
      estimatedHours: 16,
      priority: 'medium',
      tags: ['feature', 'development'],
      checklist: [
        'Requirements analysis',
        'Technical design',
        'Implementation',
        'Unit testing',
        'Integration testing',
        'Code review',
        'Documentation'
      ]
    },
    structure: {
      version: '1.0',
      schema: {
        stages: 'array',
        estimatedHours: 'number',
        priority: 'string',
        tags: 'array',
        checklist: 'array'
      },
      required: ['stages', 'estimatedHours'],
      optional: ['priority', 'tags', 'checklist']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 67,
      lastUsed: new Date(),
      rating: { average: 4.6, count: 23 }
    }
  },
  {
    name: 'Bug Fix Task',
    description: 'Template for fixing software bugs with investigation, fix, and verification steps',
    type: 'task',
    category: 'Support',
    content: {
      stages: ['Investigation', 'Fix Development', 'Testing', 'Code Review', 'Deployment'],
      estimatedHours: 8,
      priority: 'high',
      tags: ['bug-fix', 'support'],
      checklist: [
        'Reproduce the bug',
        'Identify root cause',
        'Develop fix',
        'Test fix',
        'Code review',
        'Deploy fix'
      ]
    },
    structure: {
      version: '1.0',
      schema: {
        stages: 'array',
        estimatedHours: 'number',
        priority: 'string',
        tags: 'array',
        checklist: 'array'
      },
      required: ['stages', 'estimatedHours'],
      optional: ['priority', 'tags', 'checklist']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 89,
      lastUsed: new Date(),
      rating: { average: 4.4, count: 31 }
    }
  },
  {
    name: 'Content Creation Task',
    description: 'Template for creating marketing content, documentation, or creative assets',
    type: 'task',
    category: 'Marketing',
    content: {
      stages: ['Research', 'Drafting', 'Review', 'Revision', 'Final Approval'],
      estimatedHours: 12,
      priority: 'medium',
      tags: ['content', 'marketing'],
      checklist: [
        'Topic research',
        'Outline creation',
        'First draft',
        'Internal review',
        'Stakeholder review',
        'Final revisions',
        'Approval and publishing'
      ]
    },
    structure: {
      version: '1.0',
      schema: {
        stages: 'array',
        estimatedHours: 'number',
        priority: 'string',
        tags: 'array',
        checklist: 'array'
      },
      required: ['stages', 'estimatedHours'],
      optional: ['priority', 'tags', 'checklist']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 34,
      lastUsed: new Date(),
      rating: { average: 4.7, count: 12 }
    }
  }
];

// AI Prompts will be stored as workflow templates since 'ai-prompt' is not a valid type
const aiPrompts = [
  {
    name: 'Sprint Backlog Generator',
    description: 'Generate a comprehensive sprint backlog based on user stories and team capacity',
    type: 'workflow',
    category: 'Development',
    content: {
      prompt: 'Generate a sprint backlog for a [project_type] project with [team_size] team members. The sprint duration is [sprint_duration] weeks. Include user stories with proper story points, acceptance criteria, and estimated effort. Prioritize based on business value and dependencies.',
      variables: ['project_type', 'team_size', 'sprint_duration'],
      outputFormat: 'JSON',
      examples: [
        'Generate a sprint backlog for a mobile app development project with 6 team members. The sprint duration is 2 weeks.',
        'Generate a sprint backlog for a website redesign project with 4 team members. The sprint duration is 1 week.'
      ]
    },
    structure: {
      version: '1.0',
      schema: {
        prompt: 'string',
        variables: 'array',
        outputFormat: 'string',
        examples: 'array'
      },
      required: ['prompt', 'variables'],
      optional: ['outputFormat', 'examples']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 156,
      lastUsed: new Date(),
      rating: { average: 4.8, count: 45 }
    }
  },
  {
    name: 'Task Description Writer',
    description: 'Create detailed and actionable task descriptions from brief requirements',
    type: 'workflow',
    category: 'Development',
    content: {
      prompt: 'Write a detailed task description for: [task_summary]. Include: 1) Clear objectives, 2) Acceptance criteria, 3) Technical requirements, 4) Estimated effort, 5) Dependencies, 6) Success metrics. Make it actionable for developers.',
      variables: ['task_summary'],
      outputFormat: 'Structured Text',
      examples: [
        'Write a detailed task description for: Implement user authentication system',
        'Write a detailed task description for: Create responsive navigation menu'
      ]
    },
    structure: {
      version: '1.0',
      schema: {
        prompt: 'string',
        variables: 'array',
        outputFormat: 'string',
        examples: 'array'
      },
      required: ['prompt', 'variables'],
      optional: ['outputFormat', 'examples']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 203,
      lastUsed: new Date(),
      rating: { average: 4.6, count: 67 }
    }
  },
  {
    name: 'Code Review Assistant',
    description: 'Generate code review checklists and questions based on the type of code being reviewed',
    type: 'workflow',
    category: 'Development',
    content: {
      prompt: 'Generate a comprehensive code review checklist for [code_type] code. Include: 1) Security considerations, 2) Performance checks, 3) Code quality standards, 4) Testing requirements, 5) Documentation needs, 6) Best practices for [programming_language].',
      variables: ['code_type', 'programming_language'],
      outputFormat: 'Markdown',
      examples: [
        'Generate a comprehensive code review checklist for API endpoint code. Include: 1) Security considerations, 2) Performance checks, 3) Code quality standards, 4) Testing requirements, 5) Documentation needs, 6) Best practices for Node.js.',
        'Generate a comprehensive code review checklist for frontend component code. Include: 1) Security considerations, 2) Performance checks, 3) Code quality standards, 4) Testing requirements, 5) Documentation needs, 6) Best practices for React.'
      ]
    },
    structure: {
      version: '1.0',
      schema: {
        prompt: 'string',
        variables: 'array',
        outputFormat: 'string',
        examples: 'array'
      },
      required: ['prompt', 'variables'],
      optional: ['outputFormat', 'examples']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 89,
      lastUsed: new Date(),
      rating: { average: 4.9, count: 28 }
    }
  }
];

// Branding assets will be stored as workflow templates since they don't fit other categories
const brandingAssets = [
  {
    name: 'Primary Brand Colors',
    description: 'Main brand color palette for consistent visual identity',
    type: 'workflow',
    category: 'Design',
    content: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      neutral: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    structure: {
      version: '1.0',
      schema: {
        primary: 'string',
        secondary: 'string',
        accent: 'string',
        neutral: 'string',
        success: 'string',
        warning: 'string',
        error: 'string',
        info: 'string'
      },
      required: ['primary', 'secondary'],
      optional: ['accent', 'neutral', 'success', 'warning', 'error', 'info']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 234,
      lastUsed: new Date(),
      rating: { average: 4.7, count: 89 }
    }
  },
  {
    name: 'Typography System',
    description: 'Consistent typography scale and font hierarchy for the platform',
    type: 'workflow',
    category: 'Design',
    content: {
      fontFamily: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'Georgia, serif',
        mono: 'JetBrains Mono, monospace'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      }
    },
    structure: {
      version: '1.0',
      schema: {
        fontFamily: 'object',
        fontSize: 'object',
        fontWeight: 'object'
      },
      required: ['fontFamily', 'fontSize'],
      optional: ['fontWeight']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 189,
      lastUsed: new Date(),
      rating: { average: 4.8, count: 56 }
    }
  },
  {
    name: 'Icon Library',
    description: 'Standard icon set for consistent user interface elements',
    type: 'workflow',
    category: 'Design',
    content: {
      iconStyle: 'outline',
      iconSize: {
        xs: '16px',
        sm: '20px',
        md: '24px',
        lg: '32px',
        xl: '48px'
      },
      iconColor: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      categories: ['navigation', 'actions', 'status', 'communication', 'files']
    },
    structure: {
      version: '1.0',
      schema: {
        iconStyle: 'string',
        iconSize: 'object',
        iconColor: 'object',
        categories: 'array'
      },
      required: ['iconStyle', 'iconSize'],
      optional: ['iconColor', 'categories']
    },
    isPublic: true,
    isSystem: true,
    status: 'active',
    usage: {
      totalUses: 145,
      lastUsed: new Date(),
      rating: { average: 4.5, count: 34 }
    }
  }
];

async function seedTemplates() {
  try {
    logger.info('🌱 Starting template seeding...');

    // Connect to database
    const conn = await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/taskflow');
    logger.info('✅ Database connected for seeding');

    // Clear existing templates
    await Template.deleteMany({});
    await BoardTemplate.deleteMany({});
    logger.info('🧹 Cleared existing templates');

    // Create a default admin user for templates (if not exists)
    const Admin = require('../models/Admin');
    let adminUser = await Admin.findOne({});
    
    if (!adminUser) {
      logger.warn('⚠️ No admin user found, creating default admin for templates');
      adminUser = new Admin({
        userEmail: 'admin@taskflow.com',
        userName: 'System Admin',
        password: 'admin123456',
        role: 'super_admin',
        isActive: true
      });
      await adminUser.save();
      logger.info('✅ Created default admin user for templates');
    }

    // Seed project templates (using Template model)
    const createdProjectTemplates = [];
    for (const template of projectTemplates) {
      const newTemplate = new Template({
        ...template,
        createdBy: adminUser._id,
        isPublic: true,
        isSystem: true
      });
      await newTemplate.save();
      createdProjectTemplates.push(newTemplate);
    }
    logger.info(`✅ Created ${createdProjectTemplates.length} project templates`);

    // Seed task templates (using Template model)
    const createdTaskTemplates = [];
    for (const template of taskTemplates) {
      const newTemplate = new Template({
        ...template,
        createdBy: adminUser._id,
        isPublic: true,
        isSystem: true
      });
      await newTemplate.save();
      createdTaskTemplates.push(newTemplate);
    }
    logger.info(`✅ Created ${createdTaskTemplates.length} task templates`);

    // Seed AI prompts (using Template model as workflow type)
    const createdAIPrompts = [];
    for (const template of aiPrompts) {
      const newTemplate = new Template({
        ...template,
        createdBy: adminUser._id,
        isPublic: true,
        isSystem: true
      });
      await newTemplate.save();
      createdAIPrompts.push(newTemplate);
    }
    logger.info(`✅ Created ${createdAIPrompts.length} AI prompt templates`);

    // Seed branding assets (using Template model as workflow type)
    const createdBrandingAssets = [];
    for (const template of brandingAssets) {
      const newTemplate = new Template({
        ...template,
        createdBy: adminUser._id,
        isPublic: true,
        isSystem: true
      });
      await newTemplate.save();
      createdBrandingAssets.push(newTemplate);
    }
    logger.info(`✅ Created ${createdBrandingAssets.length} branding asset templates`);

    // Seed board templates (using BoardTemplate model)
    const createdBoardTemplates = [];
    for (const template of projectTemplates) {
      if (template.type === 'board') {
        const boardTemplate = new BoardTemplate({
          name: template.name,
          description: template.description,
          categories: [template.category],
          defaultLists: template.content.lists.map((list, index) => ({
            title: list.title,
            order: list.order,
            color: list.color
          })),
          defaultCards: template.content.cards.map((card, index) => ({
            title: card.title,
            description: card.description,
            listId: card.listId,
            order: card.order,
            priority: card.priority,
            estimatedHours: card.estimatedHours,
            tags: card.tags
          })),
          isActive: true,
          isPublic: true,
          usageCount: template.usage.totalUses,
          createdBy: adminUser._id // Add the missing createdBy field
        });
        await boardTemplate.save();
        createdBoardTemplates.push(boardTemplate);
      }
    }
    logger.info(`✅ Created ${createdBoardTemplates.length} board templates`);

    logger.info('🎉 Template seeding completed successfully!');
    logger.info(`📊 Summary:`);
    logger.info(`   - Project Templates: ${createdProjectTemplates.length}`);
    logger.info(`   - Task Templates: ${createdTaskTemplates.length}`);
    logger.info(`   - AI Prompts: ${createdAIPrompts.length}`);
    logger.info(`   - Branding Assets: ${createdBrandingAssets.length}`);
    logger.info(`   - Board Templates: ${createdBoardTemplates.length}`);

    await mongoose.disconnect();
    logger.info('🔌 Database disconnected');

  } catch (error) {
    logger.error('❌ Template seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTemplates();
}

module.exports = { seedTemplates };
