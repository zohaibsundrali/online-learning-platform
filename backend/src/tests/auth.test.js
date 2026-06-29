const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User.model');

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test123',
  confirmPassword: 'Test123'
};

const testUser2 = {
  name: 'Another User',
  email: 'another@example.com',
  password: 'Test123',
  confirmPassword: 'Test123'
};

// Increase timeout for all tests in this file
jest.setTimeout(30000);

describe('Authentication API Tests', () => {
  // Clean up before tests
  beforeAll(async () => {
    try {
      await User.deleteMany({});
    } catch (error) {
      console.log('Error cleaning up:', error.message);
    }
  });

  afterAll(async () => {
    try {
      await User.deleteMany({});
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    } catch (error) {
      console.log('Error in cleanup:', error.message);
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', testUser.email);
      expect(res.body.data).toHaveProperty('name', testUser.name);
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body).toHaveProperty('token');
    }, 10000);

    it('should not register with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already exists');
    }, 10000);

    it('should not register with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('valid email');
    }, 10000);

    it('should not register with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser2,
          password: '12345',
          confirmPassword: '12345'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('at least 6 characters');
    }, 10000);

    it('should not register with mismatched passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser2,
          confirmPassword: 'Different123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('do not match');
    }, 10000);
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', testUser.email);
      expect(res.body).toHaveProperty('token');
      expect(res.headers['set-cookie']).toBeDefined();
    }, 10000);

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    }, 10000);

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    }, 10000);

    it('should not login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Password is required');
    }, 10000);
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      token = res.body.token;
    }, 10000);

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', testUser.email);
      expect(res.body.data).toHaveProperty('name', testUser.name);
    }, 10000);

    it('should not get user without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('not logged in');
    }, 10000);

    it('should not get user with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.statusCode).toBe(401);
      // Check if error message exists
      expect(res.body.message).toBeDefined();
    }, 10000);
  });

  describe('GET /api/auth/logout', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      token = res.body.token;
    }, 10000);

    it('should logout successfully', async () => {
      const res = await request(app)
        .get('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Logged out');
      expect(res.headers['set-cookie']).toBeDefined();
    }, 10000);
  });
});