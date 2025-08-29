/**
 * Standalone Board Template Seeder
 * Run this script to seed board templates independently
 */

require('dotenv').config();
const mongoose = require('mongoose');
const BoardTemplateSeeder = require('./src/seeders/modules/BoardTemplateSeeder');
const UserSeeder = require('./src/seeders/modules/UserSeeder');

async function seedBoardTemplates() {
  try {
    console.log('🚀 Starting Board Template Seeding...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Get existing users to find admin for createdBy field
    const User = require('./src/models/User');
    const UserRoles = require('./src/models/UserRoles');
    
    // Find existing admin users
    const adminUsers = await User.aggregate([
      {
        $lookup: {
          from: 'userroles',
          localField: 'roles',
          foreignField: '_id',
          as: 'userRoles'
        }
      },
      {
        $match: {
          'userRoles.systemRole': { $in: ['admin', 'super_admin'] }
        }
      },
      {
        $limit: 1
      }
    ]);
    
    if (adminUsers.length === 0) {
      console.log('⚠️  No admin users found in database');
      console.log('💡 Please ensure you have admin users before running this seeder');
      return;
    }
    
    const adminUser = adminUsers[0];
    console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.email})`);
    
    // Create board template seeder (without userSeeder dependency)
    const boardTemplateSeeder = new BoardTemplateSeeder();
    
    // Override the seed method to manually set createdBy
    const originalSeed = boardTemplateSeeder.seed.bind(boardTemplateSeeder);
    boardTemplateSeeder.seed = async function(count = null) {
      const targetCount = count || this.templateData.length;
      
      await this.initialize(targetCount, 'Board Templates');
      
      try {
        // Clear existing templates
        const BoardTemplate = require('./src/models/BoardTemplate');
        await BoardTemplate.deleteMany({});
        this.log('🗑️  Cleared existing board templates');

        const createdTemplates = [];

        // Create predefined templates
        for (const templateData of this.templateData) {
          try {
            const template = new BoardTemplate({
              ...templateData,
              createdBy: adminUser._id,
              createdAt: new Date(),
              updatedAt: new Date()
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
              
              const template = new BoardTemplate({
                ...randomTemplateData,
                createdBy: adminUser._id,
                createdAt: new Date(),
                updatedAt: new Date()
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
    };
    
    // Seed board templates
    const templates = await boardTemplateSeeder.seed();
    
    console.log('\n🎉 Board Template Seeding Completed!');
    console.log(`✅ Created ${templates.length} board templates`);
    
    // Get statistics
    const stats = await boardTemplateSeeder.getStatistics();
    if (stats) {
      console.log('\n📊 Template Statistics:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   Public: ${stats.public}`);
      console.log(`   Active: ${stats.active}`);
      console.log('\n   Categories:');
      stats.categories.forEach(cat => {
        console.log(`     ${cat._id}: ${cat.count}`);
      });
    }
    
    // List created templates
    console.log('\n📋 Created Templates:');
    templates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name}`);
      console.log(`      Categories: ${template.categories.join(', ')}`);
      console.log(`      Lists: ${template.defaultLists.length}`);
      console.log(`      Cards: ${template.defaultCards.length}`);
      console.log(`      Public: ${template.isPublic ? 'Yes' : 'No'}`);
      console.log(`      Active: ${template.isActive ? 'Yes' : 'No'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Board Template Seeding Failed:', error.message);
    console.error(error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the seeder
seedBoardTemplates();
