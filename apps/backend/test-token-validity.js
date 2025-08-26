const jwt = require('./src/utils/jwt');
const User = require('./src/models/User');
const Admin = require('./src/models/Admin');

async function testTokenValidity() {
  try {
    console.log('Testing token validity...');
    
    // You can paste a token here to test it
    const tokenToTest = process.argv[2];
    
    if (!tokenToTest) {
      console.log('❌ Please provide a token to test as an argument');
      console.log('Usage: node test-token-validity.js <token>');
      return;
    }
    
    console.log('Testing token:', tokenToTest.substring(0, 20) + '...');
    
    try {
      // Verify the token
      const decoded = jwt.verifyToken(tokenToTest);
      console.log('✅ Token is valid');
      console.log('Decoded payload:', decoded);
      
      // Check if user exists and is admin
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('❌ User not found');
        return;
      }
      
      console.log('✅ User found:', user.email);
      
      // Check if user is active
      if (!user.isActive) {
        console.log('❌ User is not active');
        return;
      }
      
      console.log('✅ User is active');
      
      // Check admin record
      const adminRecord = await Admin.findOne({ userId: user._id });
      if (!adminRecord) {
        console.log('❌ User is not an admin');
        return;
      }
      
      console.log('✅ User is admin, role:', adminRecord.role);
      
      // Check if admin is active
      if (!adminRecord.isActive) {
        console.log('❌ Admin record is not active');
        return;
      }
      
      console.log('✅ Admin record is active');
      
      console.log('\n✅ Token validation completed successfully');
      
    } catch (tokenError) {
      if (tokenError.name === 'JsonWebTokenError') {
        console.log('❌ Invalid token');
      } else if (tokenError.name === 'TokenExpiredError') {
        console.log('❌ Token has expired');
        console.log('Expired at:', tokenError.expiredAt);
      } else {
        console.log('❌ Token verification failed:', tokenError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during token validation:', error);
  }
}

testTokenValidity();
