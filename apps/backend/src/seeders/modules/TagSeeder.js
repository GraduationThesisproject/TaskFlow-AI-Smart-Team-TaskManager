/**
 * Tag Seeder
 * Handles seeding of tags for tasks and boards
 */

const BaseSeeder = require('../base/BaseSeeder');
const { faker } = require('@faker-js/faker');
const Tag = require('../../models/Tag');

class TagSeeder extends BaseSeeder {
  constructor(userSeeder = null) {
    super();
    this.tagModel = Tag;
    this.userSeeder = userSeeder;
  }

  /**
   * Main seeding method for tags
   */
  async seed() {
    const config = this.getConfig('tags');
    const total = config.count || 20;
    
    if (total === 0) {
      this.log('Skipping tag seeding (count: 0)');
      return [];
    }

    await this.initialize(total, 'Tag Seeding');

    try {
      const createdTags = [];

      for (let i = 0; i < total; i++) {
        const tagData = this.generateTagData();
        
        if (this.validate(tagData, 'validateTag')) {
          const tag = await this.createTag(tagData);
          createdTags.push(tag);
          
          this.addCreatedData('tags', tag);
          this.updateProgress(1, `Created tag: ${tag.name}`);
        }
      }

      this.completeProgress('Tag seeding completed');
      this.printSummary();
      
      return createdTags;

    } catch (error) {
      this.error(`Tag seeding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate tag data
   */
  generateTagData() {
    const tagCategories = this.getTagCategories();
    const category = this.getRandomItem(Object.keys(tagCategories));
    const tagName = this.getRandomItem(tagCategories[category]);

    return {
      name: tagName,
      description: this.generateTagDescription(tagName, category),
      color: this.generateTagColor(category),
      textColor: '#FFFFFF',
      scope: this.getRandomItem(['global', 'workspace', 'space', 'board']),
      createdBy: this.getRandomUserId(),
      category: category,
      icon: this.getRandomItem(['bug', 'star', 'flag', 'tag', 'label', 'bookmark', 'pin', 'check']),
      group: this.getRandomItem(['Development', 'Design', 'Testing', 'Documentation', 'Management']),
      settings: {
        isSystemTag: faker.datatype.boolean({ probability: 0.2 }),
        autoAssign: {
          enabled: faker.datatype.boolean({ probability: 0.3 }),
          rules: []
        },
        notifications: {
          onAssign: faker.datatype.boolean({ probability: 0.4 }),
          onRemove: faker.datatype.boolean({ probability: 0.3 }),
          notifyUsers: []
        },
        permissions: {
          canUse: this.getRandomItem(['everyone', 'members', 'admins', 'creator']),
          canEdit: this.getRandomItem(['creator', 'admins', 'everyone']),
          canDelete: this.getRandomItem(['creator', 'admins'])
        }
      },
      stats: {
        totalUsage: 0,
        taskUsage: 0,
        commentUsage: 0,
        attachmentUsage: 0,
        checklistUsage: 0,
        lastUsed: null,
        popularityScore: 0,
        usedBy: []
      },
      isActive: true,
      isArchived: false
    };
  }

  /**
   * Get tag categories with predefined tags
   */
  getTagCategories() {
    return {
      'priority': [
        'High Priority',
        'Medium Priority',
        'Low Priority',
        'Urgent',
        'Critical',
        'Important',
        'Nice to Have'
      ],
      'status': [
        'In Progress',
        'Completed',
        'On Hold',
        'Cancelled',
        'Pending Review',
        'Blocked',
        'Ready for Testing'
      ],
      'type': [
        'Bug',
        'Feature',
        'Enhancement',
        'Documentation',
        'Design',
        'Research',
        'Maintenance',
        'Refactoring'
      ],
      'department': [
        'Frontend',
        'Backend',
        'Design',
        'QA',
        'DevOps',
        'Marketing',
        'Sales',
        'Support'
      ],
      'skill': [
        'JavaScript',
        'Python',
        'React',
        'Node.js',
        'UI/UX',
        'DevOps',
        'Testing',
        'Database'
      ],
      'custom': [
        'Custom Tag 1',
        'Custom Tag 2',
        'Custom Tag 3',
        'Custom Tag 4',
        'Custom Tag 5'
      ],
      'development': [
        'Frontend',
        'Backend',
        'Full Stack',
        'Mobile',
        'API',
        'Database',
        'Infrastructure'
      ],
      'quality': [
        'High Quality',
        'Needs Review',
        'Tested',
        'Bug Free',
        'Performance',
        'Security'
      ],
      'ui': [
        'UI Design',
        'UX Design',
        'Responsive',
        'Accessibility',
        'Mobile First',
        'Dark Mode'
      ]
    };
  }

  /**
   * Generate tag description
   */
  generateTagDescription(tagName, category) {
    const descriptions = {
      'priority': [
        'High priority items that require immediate attention.',
        'Tasks that need to be completed as soon as possible.',
        'Critical issues that block other work.',
        'Important features for user experience.'
      ],
      'status': [
        'Work items currently being worked on.',
        'Completed tasks and deliverables.',
        'Items temporarily paused or waiting for dependencies.',
        'Tasks ready for review and approval.'
      ],
      'type': [
        'Issues and problems that need to be fixed.',
        'New functionality and features to be added.',
        'Improvements to existing features.',
        'Documentation and knowledge base updates.',
        'Design and user interface work.',
        'Research and investigation tasks.'
      ],
      'department': [
        'Frontend development and user interface work.',
        'Backend development and server-side logic.',
        'Design and user experience work.',
        'Quality assurance and testing.',
        'Infrastructure and deployment work.',
        'Marketing and promotion activities.',
        'Sales and business development.',
        'Customer support and help desk.'
      ],
      'skill': [
        'Skills and expertise required for this work.',
        'Technical skills and knowledge areas.',
        'Professional competencies and capabilities.',
        'Expertise and specialization areas.'
      ],
      'custom': [
        'Custom tags for specific project needs.',
        'User-defined tags for organization.',
        'Project-specific categorization.',
        'Custom labeling and classification.'
      ],
      'development': [
        'Development-related work and tasks.',
        'Software development activities.',
        'Technical implementation work.',
        'Code and system development.'
      ],
      'quality': [
        'Quality assurance and testing work.',
        'Quality standards and requirements.',
        'Testing and validation activities.',
        'Quality improvement initiatives.'
      ],
      'ui': [
        'User interface design and development.',
        'User experience and design work.',
        'Frontend and visual design tasks.',
        'UI/UX improvements and enhancements.'
      ]
    };

    return this.getRandomItem(descriptions[category] || ['Tag for organizing and categorizing work items.']);
  }

  /**
   * Generate tag color based on category
   */
  generateTagColor(category) {
    const colorSchemes = {
      'priority': ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
      'status': ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'],
      'type': ['#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
      'department': ['#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6'],
      'skill': ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'],
      'custom': ['#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'],
      'development': ['#3B82F6', '#1D4ED8', '#2563EB', '#1E40AF', '#1E3A8A'],
      'quality': ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
      'ui': ['#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843']
    };

    return this.getRandomItem(colorSchemes[category] || ['#6B7280']);
  }

  /**
   * Create tag in database
   */
  async createTag(data) {
    try {
      const tag = new this.tagModel(data);
      const savedTag = await tag.save();
      
      this.success(`Created tag: ${savedTag.name} (${savedTag.category})`);
      return savedTag;
      
    } catch (error) {
      this.error(`Failed to create tag: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get configuration for this seeder
   */
  getConfig(path) {
    const config = require('../config/seeder.config');
    const environment = process.env.NODE_ENV || 'development';
    const envConfig = config.environments[environment];
    return path ? path.split('.').reduce((obj, key) => obj?.[key], envConfig) : envConfig;
  }

  /**
   * Get random user ID from created users
   */
  getRandomUserId() {
    if (this.userSeeder && this.userSeeder.getCreatedData('user')) {
      const userData = this.userSeeder.getCreatedData('user');
      // Extract user objects from the { user, preferences, roles, sessions } structure
      const users = userData.map(data => data.user);
      if (users.length > 0) {
        return this.getRandomItem(users)._id;
      }
    }
    
    // Fallback to placeholder ObjectId
    const mongoose = require('mongoose');
    return new mongoose.Types.ObjectId();
  }

  /**
   * Validate tag data
   */
  validateTag(data) {
    const validator = require('../utils/validator');
    const result = validator.validateTag(data);
    
    if (result.errors.length > 0) {
      this.error(`Tag validation errors: ${result.errors.join(', ')}`);
      return false;
    }
    
    if (result.warnings.length > 0) {
      this.warning(`Tag validation warnings: ${result.warnings.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Get created tags
   */
  getCreatedTags() {
    return this.getCreatedData('tags') || [];
  }

  /**
   * Get tags by category
   */
  getTagsByCategory(category) {
    const tags = this.getCreatedTags();
    return tags.filter(tag => tag.category === category);
  }

  /**
   * Print seeding summary
   */
  printSummary() {
    const tags = this.getCreatedTags();
    
    this.success('\n=== Tag Seeding Summary ===');
    this.log(`✅ Created ${tags.length} tags`);
    
    if (tags.length > 0) {
      this.log('\n📋 Created Tags by Category:');
      const tagGroups = {};
      tags.forEach(tag => {
        if (!tagGroups[tag.category]) {
          tagGroups[tag.category] = [];
        }
        tagGroups[tag.category].push(tag.name);
      });
      
      Object.entries(tagGroups).forEach(([category, tagNames]) => {
        this.log(`  ${category}: ${tagNames.join(', ')}`);
      });
    }
    
    this.success('=== End Tag Seeding Summary ===\n');
  }
}

module.exports = TagSeeder;
