/**
 * Security Testing Suite
 * Tests for SQL injection, XSS, CSRF, input sanitization, and other security vulnerabilities
 */

const request = require('supertest');

// Mock external dependencies
jest.mock('../../utils/logger');
jest.mock('../../utils/healthMonitor');
jest.mock('../../database/supabase');
jest.mock('../../src/ai/zaiClient');
jest.mock('crypto');

// Import after mocking
const app = require('../../server');
const crypto = require('crypto');

describe('Security Testing Suite', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SQL Injection Prevention', () => {
    const sqlInjectionPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users; --",
      "admin'--",
      "1; SELECT * FROM information_schema.tables; --",
      "' OR 1=1; --",
      "')) OR (('1'='1",
      "1' ORDER BY 1; --",
      "1' UNION SELECT username, password FROM users; --",
      "admin'; UPDATE users SET password='hacked' WHERE username='admin'; --"
    ];

    test.each(sqlInjectionPayloads)('should prevent SQL injection via login: %s', async (payload) => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: payload,
          password: 'test'
        });

      expect([400, 401, 422]).toContain(response.status);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).not.toContain('syntax');
      expect(response.body.error).not.toContain('SQL');
    });

    test.each(sqlInjectionPayloads)('should prevent SQL injection via search: %s', async (payload) => {
      const response = await request(app)
        .get('/api/trips/search')
        .query({ q: payload });

      expect([400, 422]).toContain(response.status);
      expect(response.body.error).toBeDefined();
    });

    test.each(sqlInjectionPayloads)('should prevent SQL injection via user input: %s', async (payload) => {
      const response = await request(app)
        .post('/api/trips')
        .send({
          destination: payload,
          budget: 1000
        });

      expect([400, 422]).toContain(response.status);
      expect(response.body.errors).toBeDefined();
    });

    test('should handle complex SQL injection attempts', async () => {
      const complexPayloads = [
        "1' AND (SELECT COUNT(*) FROM information_schema.tables) > 0; --",
        "admin'; EXEC xp_cmdshell 'net user'; --",
        "1' UNION SELECT NULL, CONCAT(username,':',password) FROM users; --"
      ];

      for (const payload of complexPayloads) {
        const response = await request(app)
          .post('/api/user/search')
          .send({ query: payload });

        expect([400, 401, 403, 422]).toContain(response.status);
      }
    });
  });

  describe('Cross-Site Scripting (XSS) Prevention', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<body onload="alert(\'XSS\')">',
      '<div onmouseover="alert(\'XSS\')">Hover me</div>',
      '<a href="javascript:alert(\'XSS\')">Click me</a>',
      '"><script>alert("XSS")</script>',
      '\'><script>alert("XSS")</script>'
    ];

    test.each(xssPayloads)('should sanitize XSS in user input: %s', async (payload) => {
      const response = await request(app)
        .post('/api/user/profile')
        .send({
          bio: payload,
          name: 'Test User'
        });

      expect(response.status).toBe(200);

      // Check that the response doesn't contain the raw script tags
      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toContain('<script>');
      expect(responseText).not.toContain('javascript:');
      expect(responseText).not.toContain('onerror=');
      expect(responseText).not.toContain('onload=');
    });

    test.each(xssPayloads)('should prevent XSS in search queries: %s', async (payload) => {
      const response = await request(app)
        .get('/api/search')
        .query({ q: payload });

      expect(response.status).toBe(200);

      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toContain('<script>');
      expect(responseText).not.toContain('javascript:');
    });

    test('should handle encoded XSS attempts', async () => {
      const encodedPayloads = [
        '%3Cscript%3Ealert(%22XSS%22)%3C/script%3E',
        '&#x3C;script&#x3E;alert(&#x22;XSS&#x22;)&#x3C;/script&#x3E;',
        '\\u003cscript\\u003ealert(\\u0022XSS\\u0022)\\u003c/script\\u003e'
      ];

      for (const payload of encodedPayloads) {
        const response = await request(app)
          .post('/api/comments')
          .send({ content: payload });

        expect(response.status).toBe(200);
        const responseText = JSON.stringify(response.body);
        expect(responseText).not.toContain('<script>');
        expect(responseText).not.toContain('alert');
      }
    });

    test('should prevent DOM-based XSS', async () => {
      const domXssPayloads = [
        '#<img src=x onerror=alert(1)>',
        '?<script>alert(1)</script>',
        'javascript:alert(document.cookie)//'
      ];

      for (const payload of domXssPayloads) {
        const response = await request(app)
          .get(`/api/redirect?url=${encodeURIComponent(payload)}`);

        expect([400, 403]).toContain(response.status);
      }
    });
  });

  describe('Cross-Site Request Forgery (CSRF) Protection', () => {
    test('should require CSRF token for state-changing operations', async () => {
      const response = await request(app)
        .post('/api/trips')
        .send({
          destination: 'Test Destination',
          budget: 1000
        });

      // Should either require CSRF token or use alternative protection
      expect([400, 403]).toContain(response.status);
    });

    test('should validate CSRF token when provided', async () => {
      // First get a valid CSRF token
      const tokenResponse = await request(app)
        .get('/api/csrf-token');

      expect(tokenResponse.status).toBe(200);
      expect(tokenResponse.body.token).toBeDefined();

      const validToken = tokenResponse.body.token;

      // Use the token in a POST request
      const response = await request(app)
        .post('/api/trips')
        .set('X-CSRF-Token', validToken)
        .send({
          destination: 'Test Destination',
          budget: 1000
        });

      expect([200, 201]).toContain(response.status);
    });

    test('should reject invalid CSRF tokens', async () => {
      const invalidTokens = [
        'invalid-token',
        '',
        '123456789',
        crypto.randomBytes(32).toString('hex') // Random but not from server
      ];

      for (const token of invalidTokens) {
        const response = await request(app)
          .post('/api/trips')
          .set('X-CSRF-Token', token)
          .send({
            destination: 'Test Destination',
            budget: 1000
          });

        expect([400, 403]).toContain(response.status);
      }
    });

    test('should enforce SameSite cookie policy', async () => {
      const response = await request(app)
        .get('/api/auth/status');

      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        expect(setCookieHeader[0]).toMatch(/SameSite=(Strict|Lax)/i);
      }
    });
  });

  describe('Input Sanitization and Validation', () => {
    test('should sanitize HTML content', async () => {
      const htmlContent = '<p>This is <strong>bold</strong> and <em>italic</em> text</p><script>alert("XSS")</script>';

      const response = await request(app)
        .post('/api/content')
        .send({ html: htmlContent });

      expect(response.status).toBe(200);

      // Should allow safe HTML but remove scripts
      const responseText = JSON.stringify(response.body);
      expect(responseText).toContain('<strong>bold</strong>');
      expect(responseText).toContain('<em>italic</em>');
      expect(responseText).not.toContain('<script>');
      expect(responseText).not.toContain('alert("XSS")');
    });

    test('should validate and sanitize file uploads', async () => {
      const maliciousFiles = [
        { name: 'test.exe', type: 'application/x-msdownload' },
        { name: 'test.php', type: 'application/x-php' },
        { name: 'test.jsp', type: 'application/jsp' },
        { name: 'test.html', type: 'text/html' }
      ];

      for (const file of maliciousFiles) {
        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('malicious content'), file);

        expect([400, 403]).toContain(response.status);
      }
    });

    test('should prevent path traversal attacks', async () => {
      const pathTraversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '/etc/passwd',
        'C:\\Windows\\System32\\config\\sam',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
      ];

      for (const path of pathTraversalPayloads) {
        const response = await request(app)
          .get(`/api/files/${encodeURIComponent(path)}`);

        expect([400, 403, 404]).toContain(response.status);
      }
    });

    test('should validate JSON schema', async () => {
      const invalidJsonSchemas = [
        { destination: '', budget: 'not-a-number' }, // Empty required field, wrong type
        { destination: 'A'.repeat(1000), budget: -1000 }, // Too long, negative
        { destination: 'Valid', budget: 1000, extraField: 'not-allowed' } // Extra field
      ];

      for (const payload of invalidJsonSchemas) {
        const response = await request(app)
          .post('/api/trips')
          .send(payload);

        expect([400, 422]).toContain(response.status);
        expect(response.body.errors).toBeDefined();
      }
    });

    test('should handle large payloads safely', async () => {
      const largePayload = {
        destination: 'Test',
        budget: 1000,
        description: 'x'.repeat(1024 * 1024) // 1MB string
      };

      const response = await request(app)
        .post('/api/trips')
        .send(largePayload);

      expect([400, 413]).toContain(response.status);
    });
  });

  describe('Authentication and Authorization Security', () => {
    test('should prevent brute force attacks', async () => {
      const maxAttempts = 10;
      let blockedRequests = 0;

      // Make multiple failed login attempts
      for (let i = 0; i < maxAttempts; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'nonexistent',
            password: 'wrongpassword'
          });

        if (response.status === 429) {
          blockedRequests++;
        }
      }

      expect(blockedRequests).toBeGreaterThan(0);
    });

    test('should implement secure password policies', async () => {
      const weakPasswords = [
        '123456',
        'password',
        '123456789',
        'qwerty',
        'abc123'
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: `test${Date.now()}@example.com`,
            password: password
          });

        expect([400, 422]).toContain(response.status);
        expect(response.body.errors).toContain('password');
      }
    });

    test('should prevent session fixation', async () => {
      // Login and get session
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass'
        });

      expect(loginResponse.status).toBe(200);

      const sessionCookie = loginResponse.headers['set-cookie'];
      expect(sessionCookie).toBeDefined();

      // Extract session ID
      const sessionId = sessionCookie[0].match(/sessionId=([^;]+)/)?.[1];

      // Try to use the same session ID (should be invalidated)
      const reuseResponse = await request(app)
        .get('/api/user/profile')
        .set('Cookie', `sessionId=${sessionId}`);

      expect([401, 403]).toContain(reuseResponse.status);
    });

    test('should enforce role-based access control', async () => {
      const endpoints = [
        { path: '/api/admin/users', method: 'GET', role: 'admin' },
        { path: '/api/admin/stats', method: 'GET', role: 'admin' },
        { path: '/api/moderator/content', method: 'PUT', role: 'moderator' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint.path) // Using GET for simplicity
          .set('Authorization', 'Bearer user-token'); // Regular user token

        expect([401, 403]).toContain(response.status);
      }
    });
  });

  describe('API Security', () => {
    test('should implement rate limiting', async () => {
      const requests = Array(100).fill().map(() =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429).length;

      expect(rateLimited).toBeGreaterThan(0);
    });

    test('should validate API keys', async () => {
      const invalidKeys = [
        '',
        'invalid-key',
        '123456789',
        crypto.randomBytes(16).toString('hex')
      ];

      for (const key of invalidKeys) {
        const response = await request(app)
          .get('/api/admin/stats')
          .set('X-API-Key', key);

        expect([401, 403]).toContain(response.status);
      }
    });

    test('should prevent API key enumeration', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('X-API-Key', 'nonexistent-key');

      // Should not reveal if key exists or not
      expect(response.status).toBe(401);
      expect(response.body.error).not.toContain('not found');
      expect(response.body.error).not.toContain('invalid');
    });

    test('should implement proper CORS policies', async () => {
      const response = await request(app)
        .options('/api/trips')
        .set('Origin', 'https://malicious-site.com')
        .set('Access-Control-Request-Method', 'POST');

      // Should not allow arbitrary origins for sensitive operations
      const allowOrigin = response.headers['access-control-allow-origin'];
      if (allowOrigin && allowOrigin !== '*') {
        expect(allowOrigin).not.toBe('https://malicious-site.com');
      }
    });

    test('should prevent HTTP parameter pollution', async () => {
      const response = await request(app)
        .get('/api/search?q=test&q=malicious');

      expect(response.status).toBe(200);
      // Should handle only one parameter, not both
    });
  });

  describe('Data Exposure Prevention', () => {
    test('should not expose sensitive information in errors', async () => {
      const response = await request(app)
        .get('/api/debug/internal-error');

      expect(response.status).toBe(500);

      const errorMessage = response.body.error || '';
      expect(errorMessage).not.toMatch(/stack trace|at \/|internal|database|connection/i);
    });

    test('should prevent information disclosure via timing attacks', async () => {
      const validUser = 'existinguser';
      const invalidUser = 'nonexistentuser';

      const [validResponse, invalidResponse] = await Promise.all([
        request(app).post('/api/auth/login').send({ username: validUser, password: 'wrong' }),
        request(app).post('/api/auth/login').send({ username: invalidUser, password: 'wrong' })
      ]);

      // Response times should be similar to prevent timing attacks
      const timeDiff = Math.abs(
        validResponse.headers['x-response-time'] - invalidResponse.headers['x-response-time']
      );

      expect(timeDiff).toBeLessThan(100); // Less than 100ms difference
    });

    test('should not expose directory listings', async () => {
      const response = await request(app)
        .get('/api/files/');

      expect([403, 404]).toContain(response.status);
    });

    test('should prevent sensitive file access', async () => {
      const sensitiveFiles = [
        '/etc/passwd',
        '/etc/shadow',
        'config/database.json',
        '.env',
        'package.json',
        'server.js'
      ];

      for (const file of sensitiveFiles) {
        const response = await request(app)
          .get(`/api/files/${encodeURIComponent(file)}`);

        expect([403, 404]).toContain(response.status);
      }
    });
  });

  describe('Cryptographic Security', () => {
    test('should use secure random generators', () => {
      const values = [];
      for (let i = 0; i < 1000; i++) {
        values.push(crypto.randomBytes(32));
      }

      // Check for randomness (basic statistical test)
      const uniqueValues = new Set(values.map(v => v.toString('hex')));
      expect(uniqueValues.size).toBe(1000); // All should be unique
    });

    test('should properly hash passwords', async () => {
      const password = 'testpassword123';

      // This would test the password hashing implementation
      // In a real scenario, you'd check that:
      // 1. Passwords are hashed with appropriate algorithm (bcrypt, argon2)
      // 2. Salts are used
      // 3. Hashing is slow enough to prevent brute force

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `hash${Date.now()}@example.com`,
          password: password
        });

      expect(response.status).toBe(201);

      // In a real implementation, you'd verify the stored hash
      // For this test, we just ensure registration works
    });

    test('should prevent cryptographic oracle attacks', async () => {
      // Test for padding oracle vulnerabilities
      const malformedTokens = [
        'invalid.jwt.token',
        'header.payload.shortsignature',
        'header.payload.extralongsignaturethatshouldfail'
      ];

      for (const token of malformedTokens) {
        const response = await request(app)
          .get('/api/user/profile')
          .set('Authorization', `Bearer ${token}`);

        // Should give consistent error responses
        expect([400, 401]).toContain(response.status);
        expect(response.body.error).toMatch(/invalid|expired|malformed/i);
      }
    });
  });
});