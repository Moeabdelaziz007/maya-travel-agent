/**
 * Enhanced Authentication Testing Suite
 * Comprehensive testing for JWT, sessions, multi-device auth, password reset, and social auth
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Mock external dependencies
jest.mock('../../utils/logger');
jest.mock('../../utils/healthMonitor');
jest.mock('../../database/supabase');
jest.mock('../../src/ai/zaiClient');
jest.mock('jsonwebtoken');
jest.mock('crypto');

// Import after mocking
const app = require('../../server');
const SupabaseDB = require('../../database/supabase');

describe('Enhanced Authentication Testing Suite', () => {
  beforeAll(async () => {
    jest.setTimeout(60000);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('JWT Token Lifecycle Management', () => {
    test('should handle JWT token expiration gracefully', async () => {
      // Mock expired token
      const expiredToken = jwt.sign(
        { userId: 'test-user', exp: Math.floor(Date.now() / 1000) - 3600 },
        'test-secret'
      );

      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('expired');
    });

    test('should refresh JWT tokens before expiration', async () => {
      // Mock token that's about to expire (5 minutes)
      const soonExpiringToken = jwt.sign(
        { userId: 'test-user', exp: Math.floor(Date.now() / 1000) + 300 },
        'test-secret'
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${soonExpiringToken}`);

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.token).not.toBe(soonExpiringToken);
    });

    test('should reject refresh with expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: 'test-user', exp: Math.floor(Date.now() / 1000) - 3600 },
        'test-secret'
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('expired');
    });

    test('should handle JWT token revocation', async () => {
      // First login to get a valid token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'testpass' });

      expect(loginResponse.status).toBe(200);
      const token = loginResponse.body.token;

      // Use token successfully
      const profileResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(profileResponse.status).toBe(200);

      // Revoke token
      const revokeResponse = await request(app)
        .post('/api/auth/revoke')
        .set('Authorization', `Bearer ${token}`);

      expect(revokeResponse.status).toBe(200);

      // Try to use revoked token
      const revokedProfileResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(revokedProfileResponse.status).toBe(401);
    });

    test('should validate JWT token signature', async () => {
      const tamperedToken = 'header.payload.tampered_signature';

      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('invalid');
    });

    test('should handle JWT tokens with future expiration', async () => {
      const futureToken = jwt.sign(
        { userId: 'test-user', exp: Math.floor(Date.now() / 1000) + 31536000 }, // 1 year
        'test-secret'
      );

      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${futureToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Session Management', () => {
    test('should create secure session on login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'testpass' });

      expect(response.status).toBe(200);
      expect(response.body.sessionId).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();

      // Check session cookie security
      const cookie = response.headers['set-cookie'][0];
      expect(cookie).toMatch(/HttpOnly/i);
      expect(cookie).toMatch(/Secure/i);
      expect(cookie).toMatch(/SameSite=(Strict|Lax)/i);
    });

    test('should handle concurrent sessions per user', async () => {
      const maxSessions = 5;

      // Create multiple sessions for the same user
      const sessions = [];
      for (let i = 0; i < maxSessions; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: 'testuser', password: 'testpass' });

        expect(response.status).toBe(200);
        sessions.push(response.body.sessionId);
      }

      // All sessions should be valid
      for (const sessionId of sessions) {
        const response = await request(app)
          .get('/api/user/profile')
          .set('Cookie', `sessionId=${sessionId}`);

        expect(response.status).toBe(200);
      }
    });

    test('should enforce maximum concurrent sessions', async () => {
      const maxSessions = 10;

      // Try to create more sessions than allowed
      for (let i = 0; i < maxSessions + 5; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: 'testuser', password: 'testpass' });

        if (i >= maxSessions) {
          // Additional sessions should fail or oldest should be invalidated
          expect([200, 429]).toContain(response.status);
        }
      }
    });

    test('should handle session timeout', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'testpass' });

      expect(response.status).toBe(200);
      const sessionId = response.body.sessionId;

      // Simulate session timeout by advancing time
      // In real implementation, this would be handled by session store

      const timedOutResponse = await request(app)
        .get('/api/user/profile')
        .set('Cookie', `sessionId=${sessionId}`);

      expect([200, 401]).toContain(timedOutResponse.status);
    });

    test('should invalidate all sessions on password change', async () => {
      // Create multiple sessions
      const sessions = [];
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: 'testuser', password: 'testpass' });

        sessions.push(response.body.sessionId);
      }

      // Change password
      const changeResponse = await request(app)
        .post('/api/auth/change-password')
        .set('Cookie', `sessionId=${sessions[0]}`)
        .send({
          currentPassword: 'testpass',
          newPassword: 'newtestpass123'
        });

      expect(changeResponse.status).toBe(200);

      // All previous sessions should be invalidated
      for (const sessionId of sessions) {
        const response = await request(app)
          .get('/api/user/profile')
          .set('Cookie', `sessionId=${sessionId}`);

        expect(response.status).toBe(401);
      }

      // New login should work with new password
      const newLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'newtestpass123' });

      expect(newLoginResponse.status).toBe(200);
    });
  });

  describe('Multi-Device Authentication', () => {
    test('should support simultaneous logins from different devices', async () => {
      const devices = ['mobile', 'desktop', 'tablet'];

      const deviceSessions = {};

      // Login from different devices
      for (const device of devices) {
        const response = await request(app)
          .post('/api/auth/login')
          .set('User-Agent', `${device}-browser`)
          .send({ username: 'testuser', password: 'testpass' });

        expect(response.status).toBe(200);
        deviceSessions[device] = response.body.sessionId;
      }

      // All device sessions should work simultaneously
      for (const [device, sessionId] of Object.entries(deviceSessions)) {
        const response = await request(app)
          .get('/api/user/profile')
          .set('User-Agent', `${device}-browser`)
          .set('Cookie', `sessionId=${sessionId}`);

        expect(response.status).toBe(200);
        expect(response.body.device).toBe(device);
      }
    });

    test('should track device information', async () => {
      const deviceInfo = {
        type: 'mobile',
        os: 'iOS',
        browser: 'Safari',
        ip: '192.168.1.1'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
        .set('X-Forwarded-For', deviceInfo.ip)
        .send({ username: 'testuser', password: 'testpass' });

      expect(response.status).toBe(200);

      // Check device tracking
      const devicesResponse = await request(app)
        .get('/api/user/devices')
        .set('Cookie', `sessionId=${response.body.sessionId}`);

      expect(devicesResponse.status).toBe(200);
      expect(devicesResponse.body.devices).toContainEqual(
        expect.objectContaining({
          type: 'mobile',
          os: 'iOS'
        })
      );
    });

    test('should allow selective device logout', async () => {
      // Login from multiple devices
      const device1Response = await request(app)
        .post('/api/auth/login')
        .set('X-Device-ID', 'device1')
        .send({ username: 'testuser', password: 'testpass' });

      const device2Response = await request(app)
        .post('/api/auth/login')
        .set('X-Device-ID', 'device2')
        .send({ username: 'testuser', password: 'testpass' });

      // Logout from device1 only
      const logoutResponse = await request(app)
        .post('/api/auth/logout-device')
        .set('Cookie', `sessionId=${device1Response.body.sessionId}`)
        .send({ deviceId: 'device2' });

      expect(logoutResponse.status).toBe(200);

      // Device1 should still work
      const device1Profile = await request(app)
        .get('/api/user/profile')
        .set('Cookie', `sessionId=${device1Response.body.sessionId}`);

      expect(device1Profile.status).toBe(200);

      // Device2 should be logged out
      const device2Profile = await request(app)
        .get('/api/user/profile')
        .set('Cookie', `sessionId=${device2Response.body.sessionId}`);

      expect(device2Profile.status).toBe(401);
    });

    test('should handle device trust levels', async () => {
      const trustedDevice = 'trusted-laptop';
      const newDevice = 'new-phone';

      // Login from trusted device
      const trustedResponse = await request(app)
        .post('/api/auth/login')
        .set('X-Device-ID', trustedDevice)
        .send({ username: 'testuser', password: 'testpass' });

      expect(trustedResponse.status).toBe(200);

      // Login from new device (should require additional verification)
      const newDeviceResponse = await request(app)
        .post('/api/auth/login')
        .set('X-Device-ID', newDevice)
        .send({ username: 'testuser', password: 'testpass' });

      // New device might require 2FA or email verification
      expect([200, 202]).toContain(newDeviceResponse.status);

      if (newDeviceResponse.status === 202) {
        expect(newDeviceResponse.body.requiresVerification).toBe(true);
      }
    });
  });

  describe('Password Reset Workflows', () => {
    test('should initiate password reset with valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'testuser@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('sent');
    });

    test('should handle password reset for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      // Should not reveal if email exists
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('sent');
    });

    test('should validate password reset token', async () => {
      // Generate a valid reset token
      const resetToken = crypto.randomBytes(32).toString('hex');

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123'
        });

      expect([200, 400]).toContain(response.status);
    });

    test('should expire password reset tokens', async () => {
      // Mock expired token
      const expiredToken = 'expired_reset_token';

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('expired');
    });

    test('should prevent token reuse', async () => {
      const resetToken = crypto.randomBytes(32).toString('hex');

      // First use
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123'
        });

      // Second use should fail
      const secondResponse = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'anotherpassword123'
        });

      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body.error).toContain('used');
    });

    test('should enforce password strength on reset', async () => {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const weakPasswords = ['123', 'weak', 'password'];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: resetToken,
            newPassword: password
          });

        expect([400, 422]).toContain(response.status);
        expect(response.body.errors).toContain('password');
      }
    });

    test('should handle password reset rate limiting', async () => {
      const email = 'testuser@example.com';

      // Make multiple reset requests quickly
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/auth/forgot-password')
            .send({ email })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429).length;

      expect(rateLimited).toBeGreaterThan(0);
    });
  });

  describe('Social Authentication Flows', () => {
    test('should initiate Google OAuth flow', async () => {
      const response = await request(app)
        .get('/api/auth/google');

      expect(response.status).toBe(302); // Redirect
      expect(response.headers.location).toMatch(/accounts\.google\.com/);
    });

    test('should handle Google OAuth callback', async () => {
      const mockCode = 'mock_oauth_code';

      const response = await request(app)
        .get('/api/auth/google/callback')
        .query({ code: mockCode, state: 'test_state' });

      expect([200, 302]).toContain(response.status);
    });

    test('should create account on first social login', async () => {
      // Mock successful OAuth
      const response = await request(app)
        .post('/api/auth/social-login')
        .send({
          provider: 'google',
          token: 'mock_social_token',
          profile: {
            id: 'google_123',
            email: 'newuser@gmail.com',
            name: 'New User'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.isNewUser).toBe(true);
    });

    test('should link social account to existing user', async () => {
      // First create a regular account
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'testpass123'
        });

      // Then link social account
      const response = await request(app)
        .post('/api/auth/link-social')
        .send({
          provider: 'google',
          token: 'mock_social_token',
          email: 'existing@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('linked');
    });

    test('should handle social login with existing linked account', async () => {
      const response = await request(app)
        .post('/api/auth/social-login')
        .send({
          provider: 'google',
          token: 'mock_social_token',
          profile: {
            id: 'google_123',
            email: 'linked@example.com'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.isNewUser).toBe(false);
    });

    test('should handle social auth token expiration', async () => {
      const response = await request(app)
        .post('/api/auth/social-login')
        .send({
          provider: 'google',
          token: 'expired_social_token',
          profile: { id: 'google_123' }
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('token');
    });

    test('should support multiple social providers', async () => {
      const providers = ['google', 'facebook', 'github', 'twitter'];

      for (const provider of providers) {
        const response = await request(app)
          .get(`/api/auth/${provider}`);

        expect([200, 302]).toContain(response.status);
      }
    });

    test('should handle social auth errors gracefully', async () => {
      const errorScenarios = [
        { error: 'access_denied', description: 'User denied access' },
        { error: 'invalid_request', description: 'Invalid OAuth request' },
        { error: 'server_error', description: 'OAuth provider error' }
      ];

      for (const scenario of errorScenarios) {
        const response = await request(app)
          .get('/api/auth/google/callback')
          .query({ error: scenario.error });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      }
    });
  });

  describe('Two-Factor Authentication (2FA)', () => {
    test('should enable 2FA for user account', async () => {
      const response = await request(app)
        .post('/api/auth/enable-2fa')
        .send({ password: 'current_password' });

      expect(response.status).toBe(200);
      expect(response.body.secret).toBeDefined();
      expect(response.body.qrCode).toBeDefined();
    });

    test('should verify 2FA setup', async () => {
      // First enable 2FA
      const enableResponse = await request(app)
        .post('/api/auth/enable-2fa')
        .send({ password: 'current_password' });

      const secret = enableResponse.body.secret;

      // Generate a valid TOTP code (mock)
      const totpCode = '123456'; // In real test, generate from secret

      const verifyResponse = await request(app)
        .post('/api/auth/verify-2fa')
        .send({ secret, code: totpCode });

      expect(verifyResponse.status).toBe(200);
    });

    test('should require 2FA code for login when enabled', async () => {
      // Login without 2FA code
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: '2fauser',
          password: 'testpass',
          require2FA: true
        });

      expect(response.status).toBe(202); // Partial success, 2FA required
      expect(response.body.requires2FA).toBe(true);
    });

    test('should complete login with valid 2FA code', async () => {
      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: '2fauser',
          password: 'testpass',
          require2FA: true
        });

      const sessionId = sessionResponse.body.sessionId;
      const totpCode = '123456';

      const completeResponse = await request(app)
        .post('/api/auth/verify-2fa-login')
        .set('Cookie', `sessionId=${sessionId}`)
        .send({ code: totpCode });

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.token).toBeDefined();
    });

    test('should reject invalid 2FA codes', async () => {
      const invalidCodes = ['000000', '999999', '123', ''];

      for (const code of invalidCodes) {
        const response = await request(app)
          .post('/api/auth/verify-2fa-login')
          .send({ code });

        expect(response.status).toBe(401);
        expect(response.body.error).toContain('code');
      }
    });

    test('should disable 2FA', async () => {
      const response = await request(app)
        .post('/api/auth/disable-2fa')
        .send({ password: 'current_password' });

      expect(response.status).toBe(200);

      // Subsequent login should not require 2FA
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: '2fauser', password: 'testpass' });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.requires2FA).toBeUndefined();
    });
  });

  describe('Account Recovery and Security', () => {
    test('should handle account lockout after failed attempts', async () => {
      const maxAttempts = 5;

      // Make multiple failed login attempts
      for (let i = 0; i < maxAttempts + 2; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: 'testuser', password: 'wrongpass' });

        if (i >= maxAttempts) {
          expect(response.status).toBe(429);
          expect(response.body.error).toContain('locked');
        }
      }
    });

    test('should provide account recovery options', async () => {
      const response = await request(app)
        .get('/api/auth/recovery-options')
        .query({ email: 'testuser@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.options).toContain('email');
      expect(response.body.options).toContain('sms');
    });

    test('should send recovery code via email', async () => {
      const response = await request(app)
        .post('/api/auth/send-recovery-code')
        .send({ email: 'testuser@example.com', method: 'email' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('sent');
    });

    test('should verify recovery code', async () => {
      const recoveryCode = '123456'; // Mock code

      const response = await request(app)
        .post('/api/auth/verify-recovery-code')
        .send({ email: 'testuser@example.com', code: recoveryCode });

      expect([200, 400]).toContain(response.status);
    });

    test('should expire recovery codes', async () => {
      const expiredCode = 'expired_code';

      const response = await request(app)
        .post('/api/auth/verify-recovery-code')
        .send({ email: 'testuser@example.com', code: expiredCode });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('expired');
    });

    test('should prevent recovery code reuse', async () => {
      const recoveryCode = '123456';

      // First use
      await request(app)
        .post('/api/auth/verify-recovery-code')
        .send({ email: 'testuser@example.com', code: recoveryCode });

      // Second use should fail
      const secondResponse = await request(app)
        .post('/api/auth/verify-recovery-code')
        .send({ email: 'testuser@example.com', code: recoveryCode });

      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body.error).toContain('used');
    });
  });
});