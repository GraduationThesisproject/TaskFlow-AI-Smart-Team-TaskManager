const mongoose = require('mongoose');

async function testDatabase() {
  try {
    console.log('🧪 Testing Database Connection...\n');
    
    // Connect to MongoDB
    const conn = await mongoose.connect('mongodb://localhost:27017/taskflow');
    console.log('✅ MongoDB Connected:', conn.connection.host);
    
    // Check if Admin collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    // Check Admin collection
    if (collections.some(c => c.name === 'admins')) {
      console.log('\n👑 Admin collection found');
      
      // Get admin count
      const adminCount = await mongoose.connection.db.collection('admins').countDocuments();
      console.log('📊 Total admin users:', adminCount);
      
      if (adminCount > 0) {
        // Get all admins
        const admins = await mongoose.connection.db.collection('admins').find({}).toArray();
        console.log('\n👥 All admins:');
        admins.forEach((admin, index) => {
          console.log(`  ${index + 1}. ${admin.userEmail} (${admin.userName}) - Role: ${admin.role} - Active: ${admin.isActive}`);
        });
      }
    } else {
      console.log('\n❌ Admin collection not found');
    }
    
    // Check Templates collection
    if (collections.some(c => c.name === 'templates')) {
      console.log('\n📋 Templates collection found');
      const templateCount = await mongoose.connection.db.collection('templates').countDocuments();
      console.log('📊 Total templates:', templateCount);
      
      if (templateCount > 0) {
        const templates = await mongoose.connection.db.collection('templates').find({}).limit(5).toArray();
        console.log('\n📄 Sample templates:');
        templates.forEach((template, index) => {
          console.log(`  ${index + 1}. ${template.name} - Type: ${template.type} - Active: ${template.isActive}`);
        });
      }
    }
    
    console.log('\n✅ Database test completed');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

// Run the test
testDatabase();
