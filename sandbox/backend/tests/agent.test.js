import request from 'supertest';
import app from '../src/index.js';

describe('Agent API', () => {
  let sessionId;

  beforeAll(async () => {
    // Create a session for testing
    const res = await request(app)
      .post('/api/sessions')
      .send({ agentType: 'text-analysis' });

    sessionId = res.body.data.sessionId;
  });

  afterAll(async () => {
    // Cleanup session
    await request(app).delete(`/api/sessions/${sessionId}`);
  });

  describe('POST /api/agents/:sessionId/execute', () => {
    it('should execute text analysis agent', async () => {
      const res = await request(app)
        .post(`/api/agents/${sessionId}/execute`)
        .send({
          input: 'This is a great platform for small business automation.',
          options: {
            sentiment: true,
            keywords: true,
            summary: true
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('result');
      expect(res.body.data.result).toHaveProperty('sentiment');
      expect(res.body.data.result).toHaveProperty('keywords');
      expect(res.body.data.result).toHaveProperty('summary');
    });

    it('should reject empty input', async () => {
      const res = await request(app)
        .post(`/api/agents/${sessionId}/execute`)
        .send({
          input: '',
          options: {}
        });

      expect(res.status).toBe(400);
    });

    it('should reject input exceeding max length', async () => {
      const longText = 'a'.repeat(10001);

      const res = await request(app)
        .post(`/api/agents/${sessionId}/execute`)
        .send({
          input: longText,
          options: {}
        });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent session', async () => {
      const res = await request(app)
        .post('/api/agents/non-existent-id/execute')
        .send({
          input: 'test',
          options: {}
        });

      expect(res.status).toBe(404);
    });
  });
});
