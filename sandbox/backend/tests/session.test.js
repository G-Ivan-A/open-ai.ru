import request from 'supertest';
import app from '../src/index.js';

describe('Session API', () => {
  let sessionId;

  describe('POST /api/sessions', () => {
    it('should create a new session', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({
          agentType: 'text-analysis',
          metadata: { test: true }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('sessionId');
      expect(res.body.data.agentType).toBe('text-analysis');

      sessionId = res.body.data.sessionId;
    });

    it('should reject invalid agent type', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({
          agentType: 'invalid-agent'
        });

      expect(res.status).toBe(400);
    });

    it('should reject missing agent type', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/sessions/:sessionId', () => {
    it('should get session information', async () => {
      const res = await request(app)
        .get(`/api/sessions/${sessionId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessionId).toBe(sessionId);
    });

    it('should return 404 for non-existent session', async () => {
      const res = await request(app)
        .get('/api/sessions/non-existent-id');

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/sessions/:sessionId', () => {
    it('should destroy a session', async () => {
      const res = await request(app)
        .delete(`/api/sessions/${sessionId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
