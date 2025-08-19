const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testValidation() {
  try {
    // Connect to test database
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    
    const password = 'TestPass123!';
    console.log('Testing password:', password);
    
    // Test the regex directly
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    console.log('Regex test result:', regex.test(password));
    
    // Test the validation function from the schema
    const userSchema = User.schema;
    const passwordField = userSchema.path('password');
    console.log('Password field validators:', passwordField.validators);
    
    // Test each validator
    for (const validator of passwordField.validators) {
      console.log('Testing validator:', validator.message);
      const result = validator.validator.call(null, password);
      console.log('Validator result:', result);
    }
    
    // Test creating a user
    const user = new User({
      name: 'Test User',
      email: 'test@test.com',
      password: password
    });
    
    console.log('User object created');
    
    // Try to save
    await user.save();
    console.log('User saved successfully');
    
    await mongoose.disconnect();
    await mongoServer.stop();
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testValidation();
