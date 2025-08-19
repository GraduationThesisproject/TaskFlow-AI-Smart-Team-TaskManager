const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup test database
const setupTestDB = async () => {
  // Set test environment variables
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';
  
  // Use in-memory MongoDB for faster tests
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }
  
  const uri = mongoServer.getUri();
  
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(uri);
  
  // Drop all existing collections and indexes to ensure clean state
  try {
    await mongoose.connection.db.dropDatabase();
  } catch (error) {
    // Ignore if database doesn't exist
  }
};

// Clean up test database
const teardownTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

// Clear all collections
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = {
  setupTestDB,
  teardownTestDB,
  clearDatabase
};
