const mongoose = require('mongoose');
const User = require('./src/models/User.model');
require('dotenv').config();

async function testUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clean up
    await User.deleteMany({ email: 'test@example.com' });
    console.log('✅ Cleaned up existing test user');

    // Create user
    console.log('🔄 Creating new user...');
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    // Save user (triggers pre-save middleware)
    console.log('🔄 Saving user (this triggers pre-save)...');
    await user.save();
    console.log('✅ User created successfully!');
    console.log('User ID:', user._id);
    console.log('Hashed password:', user.password);

    // Test password comparison
    const isMatch = await user.comparePassword('password123');
    console.log('✅ Password match test:', isMatch ? 'PASSED ✅' : 'FAILED ❌');

    // Test JWT token
    const token = user.getSignedJwtToken();
    console.log('✅ JWT Token generated:', token.substring(0, 50) + '...');
    console.log('🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

testUser();