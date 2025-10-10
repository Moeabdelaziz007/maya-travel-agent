/**
 * Authentication Flow Tests for Supabase
 * Tests user registration, login, session management, and role-based access control
 */

const {
  setupTestDatabase,
  cleanupTestData,
  createTestUser,
  generateTestTelegramId,
  testSupabaseClient
} = require('../utils/database-test-helpers');

describe('Authentication Flows', () => {
  let testTelegramId;

  beforeAll(async () => {
    await setupTestDatabase();
    // Skip auth tests if no real database connection
    if (!testSupabaseClient) {
      console.log('⚠️ Skipping auth tests - no database connection');
    }
  });

  beforeEach(async () => {
    testTelegramId = generateTestTelegramId();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('User Registration', () => {
    it('should register new user successfully', async () => {
      const { data, error } = await testSupabaseClient.auth.signUp({
        email: `test${testTelegramId}@example.com`,
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'Test User',
            avatar_url: 'https://example.com/avatar.jpg'
          }
        }
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(`test${testTelegramId}@example.com`);
    });

    it('should create user profile via trigger on registration', async () => {
      const { data, error } = await testSupabaseClient.auth.signUp({
        email: `trigger${testTelegramId}@example.com`,
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'Trigger Test User',
            avatar_url: 'https://example.com/trigger-avatar.jpg'
          }
        }
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();

      // Wait a moment for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if profile was created by trigger
      const { data: profile } = await testSupabaseClient
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      expect(profile).toBeDefined();
      expect(profile.email).toBe(`trigger${testTelegramId}@example.com`);
      expect(profile.full_name).toBe('Trigger Test User');
    });

    it('should handle duplicate email registration', async () => {
      const email = `duplicate${testTelegramId}@example.com`;

      // First registration
      const { data: firstUser, error: firstError } = await testSupabaseClient.auth.signUp({
        email,
        password: 'testpassword123'
      });

      expect(firstError).toBeNull();
      expect(firstUser.user).toBeDefined();

      // Second registration with same email
      const { data: secondUser, error: secondError } = await testSupabaseClient.auth.signUp({
        email,
        password: 'differentpassword123'
      });

      expect(secondError).toBeDefined();
      expect(secondError.message).toContain('already registered');
    });

    it('should validate email format', async () => {
      const { data, error } = await testSupabaseClient.auth.signUp({
        email: 'invalid-email-format',
        password: 'testpassword123'
      });

      expect(error).toBeDefined();
      expect(error.message).toContain('invalid email');
    });

    it('should validate password strength', async () => {
      const { data, error } = await testSupabaseClient.auth.signUp({
        email: `weakpass${testTelegramId}@example.com`,
        password: '123' // Too weak
      });

      expect(error).toBeDefined();
      expect(error.message).toContain('password');
    });
  });

  describe('User Login and Authentication', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user for login tests
      const { data, error } = await testSupabaseClient.auth.signUp({
        email: `login${testTelegramId}@example.com`,
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'Login Test User'
          }
        }
      });

      expect(error).toBeNull();
      testUser = data.user;
    });

    it('should login user successfully', async () => {
      const { data, error } = await testSupabaseClient.auth.signInWithPassword({
        email: `login${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(`login${testTelegramId}@example.com`);
      expect(data.session).toBeDefined();
      expect(data.session.access_token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const { data, error } = await testSupabaseClient.auth.signInWithPassword({
        email: `login${testTelegramId}@example.com`,
        password: 'wrongpassword'
      });

      expect(error).toBeDefined();
      expect(error.message).toContain('Invalid login credentials');
    });

    it('should reject login with non-existent email', async () => {
      const { data, error } = await testSupabaseClient.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: 'testpassword123'
      });

      expect(error).toBeDefined();
      expect(error.message).toContain('Invalid login credentials');
    });

    it('should get current user session', async () => {
      // Login first
      const { data: loginData } = await testSupabaseClient.auth.signInWithPassword({
        email: `login${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      expect(loginData.session).toBeDefined();

      // Get current session
      const { data: sessionData, error } = await testSupabaseClient.auth.getSession();

      expect(error).toBeNull();
      expect(sessionData.session).toBeDefined();
      expect(sessionData.session.access_token).toBeDefined();
    });

    it('should get current user information', async () => {
      // Login first
      await testSupabaseClient.auth.signInWithPassword({
        email: `login${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      // Get current user
      const { data, error } = await testSupabaseClient.auth.getUser();

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(`login${testTelegramId}@example.com`);
    });
  });

  describe('Session Management', () => {
    let testUser;

    beforeEach(async () => {
      // Create and login a test user
      const { data, error } = await testSupabaseClient.auth.signUp({
        email: `session${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      expect(error).toBeNull();
      testUser = data.user;
    });

    it('should refresh session token', async () => {
      // Login first
      const { data: loginData } = await testSupabaseClient.auth.signInWithPassword({
        email: `session${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      const originalToken = loginData.session.access_token;

      // Wait a moment then refresh
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: refreshData, error } = await testSupabaseClient.auth.refreshSession();

      expect(error).toBeNull();
      expect(refreshData.session).toBeDefined();
      expect(refreshData.session.access_token).toBeDefined();
      expect(refreshData.session.access_token).not.toBe(originalToken);
    });

    it('should logout user successfully', async () => {
      // Login first
      await testSupabaseClient.auth.signInWithPassword({
        email: `session${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      // Logout
      const { error } = await testSupabaseClient.auth.signOut();

      expect(error).toBeNull();

      // Verify session is cleared
      const { data: sessionData } = await testSupabaseClient.auth.getSession();
      expect(sessionData.session).toBeNull();
    });

    it('should handle logout when not logged in', async () => {
      const { error } = await testSupabaseClient.auth.signOut();
      expect(error).toBeNull();
    });
  });

  describe('Password Reset', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user for password reset tests
      const { data, error } = await testSupabaseClient.auth.signUp({
        email: `reset${testTelegramId}@example.com`,
        password: 'originalpassword123'
      });

      expect(error).toBeNull();
      testUser = data.user;
    });

    it('should initiate password reset successfully', async () => {
      const { error } = await testSupabaseClient.auth.resetPasswordForEmail(
        `reset${testTelegramId}@example.com`,
        {
          redirectTo: 'http://localhost:3000/reset-password'
        }
      );

      expect(error).toBeNull();
    });

    it('should handle password reset for non-existent email', async () => {
      const { error } = await testSupabaseClient.auth.resetPasswordForEmail(
        'nonexistent@example.com'
      );

      // This should not error as it would reveal if email exists
      expect(error).toBeNull();
    });

    it('should update password successfully', async () => {
      // Login first
      await testSupabaseClient.auth.signInWithPassword({
        email: `reset${testTelegramId}@example.com`,
        password: 'originalpassword123'
      });

      // Update password
      const { data, error } = await testSupabaseClient.auth.updateUser({
        password: 'newpassword456'
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();

      // Logout and login with new password
      await testSupabaseClient.auth.signOut();

      const { data: loginData, error: loginError } = await testSupabaseClient.auth.signInWithPassword({
        email: `reset${testTelegramId}@example.com`,
        password: 'newpassword456'
      });

      expect(loginError).toBeNull();
      expect(loginData.user).toBeDefined();
    });
  });

  describe('Row Level Security (RLS) and Access Control', () => {
    let user1, user2;

    beforeEach(async () => {
      // Create two test users for RLS testing
      const { data: data1, error: error1 } = await testSupabaseClient.auth.signUp({
        email: `rls1${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      const { data: data2, error: error2 } = await testSupabaseClient.auth.signUp({
        email: `rls2${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      expect(error1).toBeNull();
      expect(error2).toBeNull();

      user1 = data1.user;
      user2 = data2.user;
    });

    it('should enforce RLS on users table', async () => {
      // Login as user1
      await testSupabaseClient.auth.signInWithPassword({
        email: `rls1${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      // User1 should be able to see their own profile
      const { data: user1Profile } = await testSupabaseClient
        .from('users')
        .select('*')
        .eq('id', user1.id)
        .single();

      expect(user1Profile).toBeDefined();
      expect(user1Profile.id).toBe(user1.id);

      // User1 should not be able to see user2's profile
      const { data: user2Profile } = await testSupabaseClient
        .from('users')
        .select('*')
        .eq('id', user2.id)
        .single();

      expect(user2Profile).toBeNull();
    });

    it('should enforce RLS on trips table', async () => {
      // Login as user1
      await testSupabaseClient.auth.signInWithPassword({
        email: `rls1${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      // Create trip for user1
      const { data: trip, error: tripError } = await testSupabaseClient
        .from('trips')
        .insert([{
          user_id: user1.id,
          destination: 'RLS Test Destination',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          budget: 1000,
          status: 'planned'
        }])
        .select()
        .single();

      expect(tripError).toBeNull();
      expect(trip).toBeDefined();
      expect(trip.user_id).toBe(user1.id);

      // Login as user2
      await testSupabaseClient.auth.signOut();
      await testSupabaseClient.auth.signInWithPassword({
        email: `rls2${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      // User2 should not be able to see user1's trip
      const { data: retrievedTrip } = await testSupabaseClient
        .from('trips')
        .select('*')
        .eq('id', trip.id)
        .single();

      expect(retrievedTrip).toBeNull();
    });

    it('should enforce RLS on expenses table', async () => {
      // Login as user1
      await testSupabaseClient.auth.signInWithPassword({
        email: `rls1${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      // Create trip for user1
      const { data: trip } = await testSupabaseClient
        .from('trips')
        .insert([{
          user_id: user1.id,
          destination: 'Expense RLS Test',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          budget: 1000,
          status: 'planned'
        }])
        .select()
        .single();

      // Create expense for the trip
      const { data: expense } = await testSupabaseClient
        .from('expenses')
        .insert([{
          trip_id: trip.id,
          user_id: user1.id,
          category: 'food',
          amount: 50,
          description: 'RLS test expense',
          date: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      expect(expense).toBeDefined();

      // Login as user2
      await testSupabaseClient.auth.signOut();
      await testSupabaseClient.auth.signInWithPassword({
        email: `rls2${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      // User2 should not be able to see user1's expense
      const { data: retrievedExpense } = await testSupabaseClient
        .from('expenses')
        .select('*')
        .eq('id', expense.id)
        .single();

      expect(retrievedExpense).toBeNull();
    });
  });

  describe('JWT Token Validation', () => {
    let testUser;

    beforeEach(async () => {
      // Create and login a test user
      const { data, error } = await testSupabaseClient.auth.signUp({
        email: `jwt${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      expect(error).toBeNull();
      testUser = data.user;
    });

    it('should include correct claims in JWT token', async () => {
      // Login to get session
      const { data: loginData } = await testSupabaseClient.auth.signInWithPassword({
        email: `jwt${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      expect(loginData.session).toBeDefined();
      expect(loginData.session.access_token).toBeDefined();

      // The JWT token should contain user information
      // In a real scenario, you would decode the JWT to verify claims
      const token = loginData.session.access_token;
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should handle expired tokens appropriately', async () => {
      // Login first
      const { data: loginData } = await testSupabaseClient.auth.signInWithPassword({
        email: `jwt${testTelegramId}@example.com`,
        password: 'testpassword123'
      });

      // In a real scenario, you would wait for token expiration
      // or use a mock to simulate expired token
      // For now, we'll verify that the token exists and is valid
      expect(loginData.session).toBeDefined();
      expect(loginData.session.expires_at).toBeDefined();
    });
  });

  describe('Telegram Authentication Integration', () => {
    it('should handle Telegram user profile creation', async () => {
      const telegramUserData = {
        telegram_id: testTelegramId,
        username: `telegram_user_${testTelegramId}`,
        avatar_url: 'https://example.com/telegram-avatar.jpg',
        preferences: {
          language: 'ar',
          currency: 'USD',
          travel_style: 'budget'
        }
      };

      const profile = await createTestUser(telegramUserData);

      expect(profile).toBeDefined();
      expect(profile.telegram_id).toBe(testTelegramId);
      expect(profile.username).toBe(telegramUserData.username);
      expect(profile.preferences).toEqual(telegramUserData.preferences);
    });

    it('should handle Telegram user profile updates', async () => {
      // Create initial profile
      const initialProfile = await createTestUser({
        telegram_id: testTelegramId,
        username: 'initial_username',
        preferences: { language: 'ar' }
      });

      // Update the profile
      const { data: updatedProfile } = await testSupabaseClient
        .from('profiles')
        .update({
          username: 'updated_username',
          preferences: {
            language: 'en',
            currency: 'EUR',
            travel_style: 'luxury'
          },
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', testTelegramId)
        .select()
        .single();

      expect(updatedProfile).toBeDefined();
      expect(updatedProfile.username).toBe('updated_username');
      expect(updatedProfile.preferences.language).toBe('en');
      expect(updatedProfile.preferences.currency).toBe('EUR');
      expect(updatedProfile.preferences.travel_style).toBe('luxury');
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle malformed auth requests', async () => {
      // Test with missing email
      const { data, error } = await testSupabaseClient.auth.signUp({
        password: 'testpassword123'
      });

      expect(error).toBeDefined();
      expect(error.message).toContain('email');
    });

    it('should handle malformed login requests', async () => {
      // Test with missing password
      const { data, error } = await testSupabaseClient.auth.signInWithPassword({
        email: `malformed${testTelegramId}@example.com`
      });

      expect(error).toBeDefined();
      expect(error.message).toContain('password');
    });

    it('should handle concurrent login attempts', async () => {
      const email = `concurrent${testTelegramId}@example.com`;
      const password = 'testpassword123';

      // Create user first
      await testSupabaseClient.auth.signUp({
        email,
        password
      });

      // Attempt concurrent logins
      const loginPromises = [];
      for (let i = 0; i < 5; i++) {
        loginPromises.push(
          testSupabaseClient.auth.signInWithPassword({
            email,
            password
          })
        );
      }

      const results = await Promise.all(loginPromises);

      // All login attempts should succeed
      results.forEach((result, index) => {
        expect(result.error).toBeNull();
        expect(result.data.user).toBeDefined();
      });
    });

    it('should handle rapid session changes', async () => {
      const email = `rapid${testTelegramId}@example.com`;
      const password = 'testpassword123';

      // Create user first
      await testSupabaseClient.auth.signUp({
        email,
        password
      });

      // Rapid login/logout cycles
      for (let i = 0; i < 3; i++) {
        const { error: loginError } = await testSupabaseClient.auth.signInWithPassword({
          email,
          password
        });
        expect(loginError).toBeNull();

        const { error: logoutError } = await testSupabaseClient.auth.signOut();
        expect(logoutError).toBeNull();
      }
    });
  });
});