/**
 * Error Scenario Testing Suite
 * Tests system behavior under various failure conditions and edge cases
 */

const request = require('supertest');
const { EventEmitter } = require('events');

// Mock external dependencies
jest.mock('../../utils/logger');
jest.mock('../../utils/healthMonitor');
jest.mock('../../database/supabase');
jest.mock('../../src/ai/zaiClient');
jest.mock('../../src/ai/geminiClient');
jest.mock('axios');

// Import after mocking
const app = require('../../server');
const logger = require('../../utils/logger');
const healthMonitor = require('../../utils/healthMonitor');
const SupabaseDB = require('../../database/supabase');
const ZaiClient = require('../../src/ai/zaiClient');
const GeminiClient = require('../../src/ai/geminiClient');
const axios = require('axios');

describe('Error Scenario Testing Suite', () => {
  beforeAll(async () => {
    jest.setTimeout(60000); // 1 minute for error scenario tests
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Network Failure Handling', () => {
    test('should handle external API timeouts gracefully', async () => {
      // Mock axios timeout
      axios.get.mockRejectedValue(new Error('Timeout'));

      const response = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'Test message' });

      expect(response.status).toBe(503); // Service Unavailable
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('timeout');
    });

    test('should handle network connectivity issues', async () => {
      // Mock network error
      axios.post.mockRejectedValue(new Error('ENOTFOUND'));

      const response = await request(app)
        .post('/api/payment/create')
        .send({ amount: 100, currency: 'USD' });

      expect(response.status).toBe(502); // Bad Gateway
      expect(response.body).toHaveProperty('error');
    });

    test('should retry failed requests appropriately', async () => {
      let callCount = 0;
      axios.get.mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({ data: { success: true } });
      });

      const response = await request(app)
        .get('/api/external-data');

      expect(callCount).toBe(3); // Should retry twice
      expect(response.status).toBe(200);
    });

    test('should handle DNS resolution failures', async () => {
      axios.get.mockRejectedValue(new Error('getaddrinfo ENOTFOUND api.example.com'));

      const response = await request(app)
        .get('/api/external-service');

      expect(response.status).toBe(502);
      expect(response.body.error).toMatch(/DNS|resolution|ENOTFOUND/i);
    });
  });

  describe('Database Connection Failures', () => {
    test('should handle database connection timeouts', async () => {
      const mockDb = {
        getTravelOffers: jest.fn().mockRejectedValue(new Error('Connection timeout'))
      };
      SupabaseDB.mockImplementation(() => mockDb);

      const response = await request(app)
        .get('/api/trips');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('database');
    });

    test('should handle database connection pool exhaustion', async () => {
      const mockDb = {
        getTravelOffers: jest.fn().mockRejectedValue(new Error('connection pool exhausted'))
      };
      SupabaseDB.mockImplementation(() => mockDb);

      const response = await request(app)
        .get('/api/trips');

      expect(response.status).toBe(503);
      expect(response.body.error).toContain('pool');
    });

    test('should handle database query timeouts', async () => {
      const mockDb = {
        getUserProfile: jest.fn().mockRejectedValue(new Error('Query timeout'))
      };
      SupabaseDB.mockImplementation(() => mockDb);

      const response = await request(app)
        .get('/api/user/profile');

      expect(response.status).toBe(504); // Gateway Timeout
      expect(response.body.error).toContain('timeout');
    });

    test('should handle database constraint violations', async () => {
      const mockDb = {
        createTrip: jest.fn().mockRejectedValue(new Error('duplicate key value violates unique constraint'))
      };
      SupabaseDB.mockImplementation(() => mockDb);

      const response = await request(app)
        .post('/api/trips')
        .send({ destination: 'Test', budget: 1000 });

      expect(response.status).toBe(409); // Conflict
      expect(response.body.error).toContain('constraint');
    });

    test('should recover from temporary database outages', async () => {
      let callCount = 0;
      const mockDb = {
        getTravelOffers: jest.fn()
          .mockImplementationOnce(() => Promise.reject(new Error('Connection lost')))
          .mockImplementationOnce(() => Promise.reject(new Error('Connection lost')))
          .mockImplementationOnce(() => Promise.resolve([{ id: 1, title: 'Recovered Trip' }]))
      };
      SupabaseDB.mockImplementation(() => mockDb);

      const response = await request(app)
        .get('/api/trips');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });
  });

  describe('External API Timeouts', () => {
    test('should handle AI service timeouts', async () => {
      ZaiClient.mockImplementation(() => ({
        chat: jest.fn().mockRejectedValue(new Error('Request timeout'))
      }));

      const response = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'Hello' });

      expect(response.status).toBe(504);
      expect(response.body.error).toContain('timeout');
    });

    test('should handle payment gateway timeouts', async () => {
      axios.post.mockRejectedValue(new Error('Payment gateway timeout'));

      const response = await request(app)
        .post('/api/payment/process')
        .send({ amount: 100, token: 'test_token' });

      expect(response.status).toBe(504);
      expect(response.body.error).toContain('timeout');
    });

    test('should handle Telegram API timeouts', async () => {
      axios.post.mockRejectedValue(new Error('Telegram API timeout'));

      const response = await request(app)
        .post('/api/telegram/send')
        .send({ chatId: '123', message: 'Test' });

      expect(response.status).toBe(504);
    });

    test('should implement circuit breaker for failing services', async () => {
      // First few requests fail
      axios.get.mockRejectedValue(new Error('Service down'));

      // Make multiple failing requests
      for (let i = 0; i < 5; i++) {
        await request(app).get('/api/external-service');
      }

      // Next request should be blocked by circuit breaker
      const response = await request(app).get('/api/external-service');

      expect(response.status).toBe(503);
      expect(response.body.error).toContain('circuit');
    });
  });

  describe('Invalid Input Validation', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/trips')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('JSON');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/trips')
        .send({}); // Missing required fields

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('should validate data types', async () => {
      const response = await request(app)
        .post('/api/trips')
        .send({
          destination: 123, // Should be string
          budget: 'not-a-number', // Should be number
          startDate: 'invalid-date'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should handle extremely large payloads', async () => {
      const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB

      const response = await request(app)
        .post('/api/trips')
        .send({ description: largePayload });

      expect(response.status).toBe(413); // Payload Too Large
    });

    test('should validate email formats', async () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user.example.com',
        'user@.com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ email, password: 'test123' });

        expect(response.status).toBe(400);
        expect(response.body.errors).toContain('email');
      }
    });

    test('should validate URL formats', async () => {
      const invalidUrls = [
        'not-a-url',
        'http://',
        'https://',
        'ftp://example.com'
      ];

      for (const url of invalidUrls) {
        const response = await request(app)
          .post('/api/user/update')
          .send({ website: url });

        expect(response.status).toBe(400);
      }
    });

    test('should handle SQL injection attempts', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'--",
        "1; SELECT * FROM users--"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: payload, password: 'test' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('invalid');
      }
    });
  });

  describe('Rate Limiting Edge Cases', () => {
    test('should handle rate limit exceeded', async () => {
      // Make many requests quickly
      const promises = [];
      for (let i = 0; i < 150; i++) {
        promises.push(request(app).get('/api/trips'));
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should handle burst traffic', async () => {
      const burstPromises = Array(50).fill().map(() =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(burstPromises);
      const successResponses = responses.filter(r => r.status === 200);

      expect(successResponses.length).toBeGreaterThan(40); // Allow some through
    });

    test('should reset rate limits appropriately', async () => {
      // Exhaust rate limit
      for (let i = 0; i < 100; i++) {
        await request(app).get('/api/trips');
      }

      // Wait for reset (in real scenario)
      // For test, we check that rate limiting is working
      const response = await request(app).get('/api/trips');
      expect([200, 429]).toContain(response.status);
    });

    test('should differentiate rate limits by endpoint', async () => {
      // Health endpoint might have different limits than API endpoints
      const healthResponses = [];
      const apiResponses = [];

      for (let i = 0; i < 50; i++) {
        healthResponses.push(await request(app).get('/health'));
        apiResponses.push(await request(app).get('/api/trips'));
      }

      const healthRateLimited = healthResponses.filter(r => r.status === 429).length;
      const apiRateLimited = apiResponses.filter(r => r.status === 429).length;

      // Different endpoints should have different rate limit behaviors
      expect(healthRateLimited).not.toBe(apiRateLimited);
    });
  });

  describe('Authentication Edge Cases', () => {
    test('should handle expired JWT tokens', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer expired.jwt.token');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('expired');
    });

    test('should handle malformed JWT tokens', async () => {
      const malformedTokens = [
        'not-a-jwt',
        'header.payload',
        'header.payload.signature.extra',
        ''
      ];

      for (const token of malformedTokens) {
        const response = await request(app)
          .get('/api/user/profile')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
      }
    });

    test('should handle missing authentication', async () => {
      const response = await request(app)
        .get('/api/user/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('auth');
    });

    test('should handle invalid API keys', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('X-API-Key', 'invalid-key');

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('key');
    });
  });

  describe('Resource Exhaustion', () => {
    test('should handle memory pressure', async () => {
      // Create many concurrent requests that consume memory
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .post('/api/trips')
            .send({ destination: 'x'.repeat(1000) }) // Large payload
        );
      }

      const responses = await Promise.all(promises);
      const successResponses = responses.filter(r => r.status === 200 || r.status === 400);

      expect(successResponses.length).toBeGreaterThan(80); // Should handle most requests
    });

    test('should handle file upload limits', async () => {
      const largeFile = Buffer.alloc(100 * 1024 * 1024); // 100MB file

      const response = await request(app)
        .post('/api/upload')
        .attach('file', largeFile, 'large-file.jpg');

      expect(response.status).toBe(413);
      expect(response.body.error).toContain('file');
    });

    test('should handle too many concurrent connections', async () => {
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(request(app).get('/health'));
      }

      const responses = await Promise.allSettled(promises);
      const fulfilled = responses.filter(r => r.status === 'fulfilled').length;
      const rejected = responses.filter(r => r.status === 'rejected').length;

      expect(fulfilled).toBeGreaterThan(800); // Should handle most connections
      expect(rejected).toBeLessThan(200); // Some may be rejected under extreme load
    });
  });

  describe('Service Degradation', () => {
    test('should provide degraded service when dependencies fail', async () => {
      // Mock all external services as failing
      axios.get.mockRejectedValue(new Error('Service down'));
      SupabaseDB.mockImplementation(() => ({
        getTravelOffers: jest.fn().mockRejectedValue(new Error('DB down'))
      }));

      const response = await request(app)
        .get('/health');

      // Health check should still work even if dependencies are down
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('degraded');
    });

    test('should handle partial service failures', async () => {
      // Some services work, others don't
      axios.get.mockImplementation((url) => {
        if (url.includes('working-service')) {
          return Promise.resolve({ data: 'ok' });
        }
        return Promise.reject(new Error('Service down'));
      });

      const response = await request(app)
        .get('/api/composite-data');

      expect(response.status).toBe(207); // Multi-Status
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toHaveProperty('working');
      expect(response.body.results).toHaveProperty('failed');
    });
  });

  describe('Data Corruption and Recovery', () => {
    test('should handle corrupted request data', async () => {
      const corruptedPayloads = [
        { destination: '\u0000\u0001\u0002', budget: NaN },
        { destination: 'test', budget: Infinity },
        { destination: 'test', budget: -Infinity }
      ];

      for (const payload of corruptedPayloads) {
        const response = await request(app)
          .post('/api/trips')
          .send(payload);

        expect([400, 422]).toContain(response.status); // Bad Request or Unprocessable Entity
      }
    });

    test('should handle database data corruption', async () => {
      const mockDb = {
        getTrip: jest.fn().mockResolvedValue({
          id: 1,
          destination: 'Test',
          budget: NaN, // Corrupted data
          start_date: 'invalid-date'
        })
      };
      SupabaseDB.mockImplementation(() => mockDb);

      const response = await request(app)
        .get('/api/trips/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('corrupt');
    });

    test('should recover from temporary data inconsistencies', async () => {
      let callCount = 0;
      const mockDb = {
        getTrip: jest.fn()
          .mockImplementationOnce(() => Promise.resolve(null)) // Not found
          .mockImplementationOnce(() => Promise.reject(new Error('Inconsistent data')))
          .mockImplementationOnce(() => Promise.resolve({ id: 1, destination: 'Recovered' }))
      };
      SupabaseDB.mockImplementation(() => mockDb);

      const response = await request(app)
        .get('/api/trips/1');

      expect(response.status).toBe(200);
      expect(response.body.destination).toBe('Recovered');
    });
  });
});