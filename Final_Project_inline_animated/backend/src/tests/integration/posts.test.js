const request = require('supertest');
const app = require('../../server');
const prisma = require('../../config/database');

describe('Posts Integration Tests', () => {
  let authToken;
  let testPostId;

  beforeAll(async () => {
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'writer@devinsights.com',
        password: 'writer123'
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Clean up test posts
    if (testPostId) {
      await prisma.post.deleteMany({
        where: { title: { contains: 'Test Post' } }
      });
    }
    await prisma.$disconnect();
  });

  describe('GET /api/posts/published', () => {
    it('should get published posts without authentication', async () => {
      const response = await request(app)
        .get('/api/posts/published');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/posts/published?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/posts', () => {
    it('should create post with authentication', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post for Integration Testing',
          excerpt: 'This is a test excerpt for the integration test post',
          content: 'This is test content. '.repeat(50), // Make it long enough
          tags: ['Test', 'Integration'],
          status: 'DRAFT'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Post for Integration Testing');
      testPostId = response.body.data.id;
    });

    it('should not create post without authentication', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: 'Test Post',
          excerpt: 'Test excerpt',
          content: 'Test content'
        });

      expect(response.status).toBe(401);
    });

    it('should validate post data', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Short', // Too short
          excerpt: 'Too short', // Too short
          content: 'Too short' // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/posts/my-posts', () => {
    it('should get user posts with authentication', async () => {
      const response = await request(app)
        .get('/api/posts/my-posts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toBeInstanceOf(Array);
    });

    it('should not get posts without authentication', async () => {
      const response = await request(app)
        .get('/api/posts/my-posts');

      expect(response.status).toBe(401);
    });
  });
});