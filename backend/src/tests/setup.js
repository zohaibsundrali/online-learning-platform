// Increase timeout for all tests
jest.setTimeout(30000);

// Global setup for tests
beforeAll(async () => {
  // Wait for MongoDB connection
  await new Promise(resolve => setTimeout(resolve, 1000));
});

// Clean up after all tests
afterAll(async () => {
  // Close MongoDB connection
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
});