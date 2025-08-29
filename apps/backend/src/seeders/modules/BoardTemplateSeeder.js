/**
 * Board Template Seeder
 * Creates board templates with default lists and cards for various use cases
 */

const BaseSeeder = require('../base/BaseSeeder');
const BoardTemplate = require('../../models/BoardTemplate');
const { faker } = require('@faker-js/faker');

class BoardTemplateSeeder extends BaseSeeder {
  constructor(userSeeder = null) {
    super();
    this.userSeeder = userSeeder;
    this.templateData = this.getTemplateData();
  }

  /**
   * Get predefined template data
   */
  getTemplateData() {
    return [
      // Agile Development Template
      {
        name: 'Agile Sprint Board',
        description: 'Complete agile sprint management with user stories, tasks, and sprint planning',
        categories: ['Development', 'IT', 'Business'],
        defaultLists: [
          { title: 'Backlog', order: 0, color: '#6B7280' },
          { title: 'Sprint Planning', order: 1, color: '#3B82F6' },
          { title: 'In Progress', order: 2, color: '#F59E0B' },
          { title: 'Code Review', order: 3, color: '#8B5CF6' },
          { title: 'Testing', order: 4, color: '#10B981' },
          { title: 'Done', order: 5, color: '#059669' }
        ],
        defaultCards: [
          {
            title: 'Setup Development Environment',
            description: 'Configure local development environment with all necessary tools and dependencies',
            listId: 'Sprint Planning',
            order: 0,
            priority: 'high',
            estimatedHours: 4,
            tags: ['setup', 'environment']
          },
          {
            title: 'Write Unit Tests',
            description: 'Create comprehensive unit tests for new features',
            listId: 'Testing',
            order: 0,
            priority: 'medium',
            estimatedHours: 6,
            tags: ['testing', 'quality']
          },
          {
            title: 'Code Review Session',
            description: 'Review pull requests and provide feedback to team members',
            listId: 'Code Review',
            order: 0,
            priority: 'high',
            estimatedHours: 2,
            tags: ['review', 'collaboration']
          }
        ],
        tags: ['agile', 'sprint', 'development', 'scrum'],
        isPublic: true,
        isActive: true
      },

      // Marketing Campaign Template
      {
        name: 'Marketing Campaign Tracker',
        description: 'Track marketing campaigns from ideation to execution and analysis',
        categories: ['Marketing', 'Business', 'Sales'],
        defaultLists: [
          { title: 'Campaign Ideas', order: 0, color: '#EC4899' },
          { title: 'Planning', order: 1, color: '#3B82F6' },
          { title: 'Content Creation', order: 2, color: '#F59E0B' },
          { title: 'Review & Approval', order: 3, color: '#8B5CF6' },
          { title: 'Live', order: 4, color: '#10B981' },
          { title: 'Analysis', order: 5, color: '#059669' }
        ],
        defaultCards: [
          {
            title: 'Campaign Brief Creation',
            description: 'Develop comprehensive campaign brief with objectives, target audience, and key messages',
            listId: 'Planning',
            order: 0,
            priority: 'high',
            estimatedHours: 8,
            tags: ['planning', 'strategy']
          },
          {
            title: 'Social Media Content',
            description: 'Create engaging social media posts and visual content',
            listId: 'Content Creation',
            order: 0,
            priority: 'medium',
            estimatedHours: 12,
            tags: ['content', 'social-media']
          },
          {
            title: 'Performance Analytics',
            description: 'Analyze campaign metrics and generate performance reports',
            listId: 'Analysis',
            order: 0,
            priority: 'medium',
            estimatedHours: 6,
            tags: ['analytics', 'reporting']
          }
        ],
        tags: ['marketing', 'campaign', 'content', 'analytics'],
        isPublic: true,
        isActive: true
      },

      // Project Management Template
      {
        name: 'Project Management Hub',
        description: 'Comprehensive project management with phases, milestones, and resource allocation',
        categories: ['Business', 'Operations', 'General'],
        defaultLists: [
          { title: 'Project Initiation', order: 0, color: '#6B7280' },
          { title: 'Planning Phase', order: 1, color: '#3B82F6' },
          { title: 'Execution', order: 2, color: '#F59E0B' },
          { title: 'Monitoring', order: 3, color: '#8B5CF6' },
          { title: 'Closing', order: 4, color: '#10B981' }
        ],
        defaultCards: [
          {
            title: 'Stakeholder Analysis',
            description: 'Identify and analyze project stakeholders and their requirements',
            listId: 'Project Initiation',
            order: 0,
            priority: 'high',
            estimatedHours: 6,
            tags: ['stakeholders', 'analysis']
          },
          {
            title: 'Project Schedule Creation',
            description: 'Develop detailed project timeline with milestones and dependencies',
            listId: 'Planning Phase',
            order: 0,
            priority: 'high',
            estimatedHours: 10,
            tags: ['planning', 'schedule']
          },
          {
            title: 'Risk Assessment',
            description: 'Identify potential project risks and develop mitigation strategies',
            listId: 'Planning Phase',
            order: 1,
            priority: 'medium',
            estimatedHours: 4,
            tags: ['risk', 'planning']
          }
        ],
        tags: ['project', 'management', 'planning', 'execution'],
        isPublic: true,
        isActive: true
      },

      // Customer Support Template
      {
        name: 'Customer Support Workflow',
        description: 'Streamlined customer support process from ticket creation to resolution',
        categories: ['Support', 'Business', 'Operations'],
        defaultLists: [
          { title: 'New Tickets', order: 0, color: '#EF4444' },
          { title: 'In Progress', order: 1, color: '#F59E0B' },
          { title: 'Awaiting Customer', order: 2, color: '#8B5CF6' },
          { title: 'Escalated', order: 3, color: '#DC2626' },
          { title: 'Resolved', order: 4, color: '#10B981' }
        ],
        defaultCards: [
          {
            title: 'Initial Response',
            description: 'Send first response to customer acknowledging their ticket',
            listId: 'New Tickets',
            order: 0,
            priority: 'high',
            estimatedHours: 0.5,
            tags: ['response', 'acknowledgment']
          },
          {
            title: 'Technical Investigation',
            description: 'Investigate technical issues and gather necessary information',
            listId: 'In Progress',
            order: 0,
            priority: 'medium',
            estimatedHours: 2,
            tags: ['investigation', 'technical']
          },
          {
            title: 'Solution Implementation',
            description: 'Implement the solution and test it thoroughly',
            listId: 'In Progress',
            order: 1,
            priority: 'high',
            estimatedHours: 4,
            tags: ['solution', 'implementation']
          }
        ],
        tags: ['support', 'customer', 'tickets', 'resolution'],
        isPublic: true,
        isActive: true
      },

      // Design Project Template
      {
        name: 'Design Project Pipeline',
        description: 'Creative design workflow from concept to final deliverables',
        categories: ['Design', 'Business', 'General'],
        defaultLists: [
          { title: 'Brief & Research', order: 0, color: '#6B7280' },
          { title: 'Concept Development', order: 1, color: '#EC4899' },
          { title: 'Design Creation', order: 2, color: '#3B82F6' },
          { title: 'Client Review', order: 3, color: '#F59E0B' },
          { title: 'Revisions', order: 4, color: '#8B5CF6' },
          { title: 'Final Delivery', order: 5, color: '#10B981' }
        ],
        defaultCards: [
          {
            title: 'Client Brief Analysis',
            description: 'Analyze client requirements and create project brief',
            listId: 'Brief & Research',
            order: 0,
            priority: 'high',
            estimatedHours: 4,
            tags: ['brief', 'analysis']
          },
          {
            title: 'Mood Board Creation',
            description: 'Create visual mood board with inspiration and style direction',
            listId: 'Concept Development',
            order: 0,
            priority: 'medium',
            estimatedHours: 6,
            tags: ['concept', 'inspiration']
          },
          {
            title: 'Design Mockups',
            description: 'Create initial design mockups and concepts',
            listId: 'Design Creation',
            order: 0,
            priority: 'high',
            estimatedHours: 12,
            tags: ['design', 'mockups']
          }
        ],
        tags: ['design', 'creative', 'concept', 'deliverables'],
        isPublic: true,
        isActive: true
      },

      // Sales Pipeline Template
      {
        name: 'Sales Pipeline Tracker',
        description: 'Track sales opportunities from lead generation to deal closure',
        categories: ['Sales', 'Business', 'Marketing'],
        defaultLists: [
          { title: 'Lead Generation', order: 0, color: '#6B7280' },
          { title: 'Qualification', order: 1, color: '#3B82F6' },
          { title: 'Proposal', order: 2, color: '#F59E0B' },
          { title: 'Negotiation', order: 3, color: '#8B5CF6' },
          { title: 'Closing', order: 4, color: '#10B981' },
          { title: 'Won', order: 5, color: '#059669' }
        ],
        defaultCards: [
          {
            title: 'Lead Research',
            description: 'Research potential leads and gather company information',
            listId: 'Lead Generation',
            order: 0,
            priority: 'medium',
            estimatedHours: 2,
            tags: ['research', 'leads']
          },
          {
            title: 'Needs Assessment',
            description: 'Conduct discovery call to understand prospect needs',
            listId: 'Qualification',
            order: 0,
            priority: 'high',
            estimatedHours: 1,
            tags: ['discovery', 'assessment']
          },
          {
            title: 'Proposal Development',
            description: 'Create customized proposal based on prospect requirements',
            listId: 'Proposal',
            order: 0,
            priority: 'high',
            estimatedHours: 8,
            tags: ['proposal', 'customization']
          }
        ],
        tags: ['sales', 'pipeline', 'leads', 'opportunities'],
        isPublic: true,
        isActive: true
      },

      // Event Planning Template
      {
        name: 'Event Planning Checklist',
        description: 'Comprehensive event planning from concept to execution',
        categories: ['Business', 'Operations', 'Marketing'],
        defaultLists: [
          { title: 'Event Concept', order: 0, color: '#EC4899' },
          { title: 'Planning & Logistics', order: 1, color: '#3B82F6' },
          { title: 'Marketing & Promotion', order: 2, color: '#F59E0B' },
          { title: 'Execution', order: 3, color: '#10B981' },
          { title: 'Post-Event', order: 4, color: '#6B7280' }
        ],
        defaultCards: [
          {
            title: 'Venue Selection',
            description: 'Research and select appropriate venue for the event',
            listId: 'Planning & Logistics',
            order: 0,
            priority: 'high',
            estimatedHours: 8,
            tags: ['venue', 'logistics']
          },
          {
            title: 'Marketing Campaign',
            description: 'Develop and execute marketing campaign to promote the event',
            listId: 'Marketing & Promotion',
            order: 0,
            priority: 'high',
            estimatedHours: 16,
            tags: ['marketing', 'promotion']
          },
          {
            title: 'Vendor Coordination',
            description: 'Coordinate with vendors for catering, AV, and other services',
            listId: 'Planning & Logistics',
            order: 1,
            priority: 'medium',
            estimatedHours: 6,
            tags: ['vendors', 'coordination']
          }
        ],
        tags: ['event', 'planning', 'logistics', 'execution'],
        isPublic: true,
        isActive: true
      },

      // Content Creation Template
      {
        name: 'Content Creation Workflow',
        description: 'Streamlined content creation process from ideation to publication',
        categories: ['Marketing', 'General', 'Business'],
        defaultLists: [
          { title: 'Content Ideas', order: 0, color: '#EC4899' },
          { title: 'Research', order: 1, color: '#3B82F6' },
          { title: 'Writing', order: 2, color: '#F59E0B' },
          { title: 'Editing', order: 3, color: '#8B5CF6' },
          { title: 'Review', order: 4, color: '#10B981' },
          { title: 'Published', order: 5, color: '#059669' }
        ],
        defaultCards: [
          {
            title: 'Topic Research',
            description: 'Research trending topics and gather relevant information',
            listId: 'Research',
            order: 0,
            priority: 'medium',
            estimatedHours: 4,
            tags: ['research', 'topics']
          },
          {
            title: 'Content Writing',
            description: 'Write engaging and informative content based on research',
            listId: 'Writing',
            order: 0,
            priority: 'high',
            estimatedHours: 8,
            tags: ['writing', 'content']
          },
          {
            title: 'SEO Optimization',
            description: 'Optimize content for search engines and readability',
            listId: 'Editing',
            order: 0,
            priority: 'medium',
            estimatedHours: 3,
            tags: ['seo', 'optimization']
          }
        ],
        tags: ['content', 'creation', 'writing', 'publishing'],
        isPublic: true,
        isActive: true
      }
    ];
  }

  /**
   * Generate random template data
   */
  generateRandomTemplate() {
    const categories = [
      'Business', 'IT', 'Personal', 'Marketing', 'Development', 
      'Design', 'Sales', 'Support', 'Operations', 'HR', 'Finance', 'General'
    ];
    
    const listTitles = [
      'To Do', 'In Progress', 'Review', 'Testing', 'Done',
      'Backlog', 'Planning', 'Execution', 'Monitoring', 'Completed',
      'Pending', 'Active', 'Blocked', 'Ready', 'Deployed'
    ];

    const cardTitles = [
      'Setup Project Environment', 'Create Project Plan', 'Review Requirements',
      'Implement Core Features', 'Write Documentation', 'Conduct Testing',
      'Deploy to Production', 'Gather Feedback', 'Update Documentation',
      'Monitor Performance', 'Optimize Code', 'Fix Bugs'
    ];

    const randomCategories = faker.helpers.arrayElements(categories, faker.number.int({ min: 1, max: 3 }));
    const randomLists = faker.helpers.arrayElements(listTitles, faker.number.int({ min: 3, max: 6 }));
    
    const defaultLists = randomLists.map((title, index) => ({
      title,
      order: index,
      color: faker.internet.color()
    }));

    const defaultCards = [];
    if (defaultLists.length > 0) {
      const cardCount = faker.number.int({ min: 2, max: 6 });
      for (let i = 0; i < cardCount; i++) {
        const randomList = faker.helpers.arrayElement(defaultLists);
        defaultCards.push({
          title: faker.helpers.arrayElement(cardTitles),
          description: faker.lorem.sentence(),
          listId: randomList.title,
          order: i,
          priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
          estimatedHours: faker.number.int({ min: 1, max: 16 }),
          tags: faker.helpers.arrayElements(['feature', 'bug', 'improvement', 'documentation'], faker.number.int({ min: 1, max: 3 }))
        });
      }
    }

    return {
      name: `${faker.company.buzzPhrase()} Template`,
      description: faker.lorem.paragraph(),
      categories: randomCategories,
      defaultLists,
      defaultCards,
      tags: faker.helpers.arrayElements(['template', 'workflow', 'process', 'management'], faker.number.int({ min: 2, max: 4 })),
      isPublic: faker.datatype.boolean(0.8), // 80% chance of being public
      isActive: faker.datatype.boolean(0.9)   // 90% chance of being active
    };
  }

  /**
   * Seed board templates
   */
  async seed(count = null) {
    const targetCount = count || this.templateData.length;
    
    await this.initialize(targetCount, 'Board Templates');
    
    try {
      // Clear existing templates
      await BoardTemplate.deleteMany({});
      this.log('🗑️  Cleared existing board templates');

      const createdTemplates = [];

      // Create predefined templates
      for (const templateData of this.templateData) {
        try {
          // Get admin user for createdBy field
          let createdBy = null;
          if (this.userSeeder) {
            const users = this.userSeeder.getCreatedData();
            // Find first admin user
            const adminUser = users.find(userData => 
              userData.roles && userData.roles.systemRole === 'admin'
            );
            if (adminUser) {
              createdBy = adminUser.user._id;
            }
          }

          const template = new BoardTemplate({
            ...templateData,
            createdBy,
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent()
          });

          await template.save();
          createdTemplates.push(template);
          
          this.updateProgress(1, `Created: ${template.name}`);
          this.success(`✅ Created template: ${template.name}`);
          
        } catch (error) {
          this.error(`Failed to create template ${templateData.name}: ${error.message}`);
        }
      }

      // Generate additional random templates if needed
      const remainingCount = targetCount - this.templateData.length;
      if (remainingCount > 0) {
        this.log(`🎲 Generating ${remainingCount} additional random templates...`);
        
        for (let i = 0; i < remainingCount; i++) {
          try {
            const randomTemplateData = this.generateRandomTemplate();
            
                         // Get admin user for createdBy field
             let createdBy = null;
             if (this.userSeeder) {
               const users = this.userSeeder.getCreatedData();
               // Find first admin user
               const adminUser = users.find(userData => 
                 userData.roles && userData.roles.systemRole === 'admin'
               );
               if (adminUser) {
                 createdBy = adminUser.user._id;
               }
             }

            const template = new BoardTemplate({
              ...randomTemplateData,
              createdBy,
              createdAt: faker.date.past(),
              updatedAt: faker.date.recent()
            });

            await template.save();
            createdTemplates.push(template);
            
            this.updateProgress(1, `Created random template: ${template.name}`);
            this.success(`✅ Created random template: ${template.name}`);
            
          } catch (error) {
            this.error(`Failed to create random template: ${error.message}`);
          }
        }
      }

      this.completeProgress(`✅ Successfully created ${createdTemplates.length} board templates`);
      this.createdData = createdTemplates;

      return createdTemplates;

    } catch (error) {
      this.error(`Failed to seed board templates: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get created templates
   */
  getCreatedData() {
    return this.createdData;
  }

  /**
   * Get template statistics
   */
  async getStatistics() {
    try {
      const totalTemplates = await BoardTemplate.countDocuments();
      const publicTemplates = await BoardTemplate.countDocuments({ isPublic: true });
      const activeTemplates = await BoardTemplate.countDocuments({ isActive: true });
      
      const categoryStats = await BoardTemplate.aggregate([
        { $unwind: '$categories' },
        { $group: { _id: '$categories', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return {
        total: totalTemplates,
        public: publicTemplates,
        active: activeTemplates,
        categories: categoryStats
      };
    } catch (error) {
      this.error(`Failed to get template statistics: ${error.message}`);
      return null;
    }
  }
}

module.exports = BoardTemplateSeeder;
