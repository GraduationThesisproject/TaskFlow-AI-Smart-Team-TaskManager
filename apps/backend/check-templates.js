require('dotenv').config();
const mongoose = require('mongoose');

// Import models
require('./src/models/BoardTemplate');
require('./src/models/Admin');

async function checkTemplates() {
  try {
    console.log('🔍 Checking board templates in database...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const BoardTemplate = mongoose.model('BoardTemplate');
    
    // Get all templates
    const templates = await BoardTemplate.find({}).lean();
    
    console.log(`\n📊 Template Statistics:`);
    console.log(`   Total templates: ${templates.length}`);
    
    if (templates.length > 0) {
      console.log('\n📋 Templates found:');
      templates.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.name}`);
        console.log(`      Active: ${template.isActive ? 'Yes' : 'No'}`);
        console.log(`      Public: ${template.isPublic ? 'Yes' : 'No'}`);
        console.log(`      Categories: ${template.categories?.join(', ') || 'None'}`);
        console.log(`      Lists: ${template.defaultLists?.length || 0}`);
        console.log(`      Cards: ${template.defaultCards?.length || 0}`);
        console.log(`      Created: ${template.createdAt}`);
        console.log('');
      });
    } else {
      console.log('\n❌ No templates found in database');
    }
    
    // Check if there are any admin users
    const Admin = mongoose.model('Admin');
    const admins = await Admin.find({}).lean();
    console.log(`\n👥 Admin users: ${admins.length}`);
    if (admins.length > 0) {
      admins.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.email}) - ${admin.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking templates:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

checkTemplates();
