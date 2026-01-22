const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

describe('Job API - Integration Execution', () => {
  
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset the "market" (DB)
  });

  afterAll(async () => {
    await sequelize.close(); // Clean exit
  });

  describe('POST /api/v1/jobs', () => {
    test('Execution: Success (Take Profit)', async () => {
      const response = await request(app)
        .post('/api/v1/jobs')
        .send({
          title: 'Blockchain Engineer',
          salary: 8000
        });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('Blockchain Engineer');
    });

    test('Execution: Validation Failure', async () => {
      const response = await request(app)
        .post('/api/v1/jobs')
        .send({ salary: 8000 }); // Missing title

      expect(response.status).toBe(400);
    });
  });
});