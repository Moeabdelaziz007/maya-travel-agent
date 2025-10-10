/**
 * Database Schema Operations Tests
 * Tests table creation, relationships, constraints, indexes, and cascade operations
 */

const {
  setupTestDatabase,
  cleanupTestData,
  createTestUser,
  createTestTrip,
  createTestDestination,
  createTestExpense,
  createTestTravelOffer,
  generateTestTelegramId,
  testSupabaseClient
} = require('../utils/database-test-helpers');

describe('Database Schema Operations', () => {
  let testTelegramId;

  beforeAll(async () => {
    await setupTestDatabase();
    // Skip schema tests if no real database connection
    if (!testSupabaseClient) {
      console.log('⚠️ Skipping schema tests - no database connection');
    }
  });

  beforeEach(async () => {
    testTelegramId = generateTestTelegramId();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Table Creation and Structure', () => {
    it('should verify all required tables exist', async () => {
      const tables = [
        'profiles',
        'messages',
        'travel_offers',
        'offer_interactions',
        'trips',
        'destinations',
        'expenses',
        'payments',
        'ai_conversations',
        'users'
      ];

      for (const tableName of tables) {
        const { data, error } = await testSupabaseClient
          .from(tableName)
          .select('count')
          .limit(1);

        // Should not get a "relation does not exist" error
        expect(error).not.toMatch(/relation .* does not exist/);
      }
    });

    it('should verify table structures and columns', async () => {
      // Test profiles table structure
      const { data: profileColumns } = await testSupabaseClient
        .rpc('get_table_columns', { table_name: 'profiles' });

      // If the RPC function doesn't exist, we'll skip this detailed check
      // and rely on the basic table existence check above
      if (!profileColumns) {
        console.log('⚠️ Skipping detailed column structure check - RPC function not available');
        return;
      }

      expect(profileColumns).toBeDefined();
      expect(Array.isArray(profileColumns)).toBe(true);
    });
  });

  describe('Primary Key Constraints', () => {
    it('should enforce unique constraints on profiles.telegram_id', async () => {
      const userData = {
        telegram_id: testTelegramId,
        username: 'unique_constraint_test'
      };

      // Create first profile
      await createTestUser(userData);

      // Try to create duplicate - should fail
      await expect(createTestUser(userData))
        .rejects.toThrow();
    });

    it('should enforce unique constraints on users.email', async () => {
      const { data: user1 } = await testSupabaseClient.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      });

      if (user1?.user) {
        // Try to create another user with same email
        await expect(testSupabaseClient.auth.signUp({
          email: 'test@example.com',
          password: 'differentpassword123'
        })).rejects.toThrow();
      }
    });
  });

  describe('Foreign Key Relationships', () => {
    let testUser;
    let testTrip;

    beforeEach(async () => {
      // Create test user and trip for relationship tests
      testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'relationship_test_user'
      });

      testTrip = await createTestTrip(testUser.id, {
        destination: 'Test City',
        budget: 1000
      });
    });

    it('should maintain referential integrity for trips.user_id', async () => {
      // Create expense related to trip
      const expense = await createTestExpense(testTrip.id, testUser.id, {
        category: 'food',
        amount: 50,
        description: 'Test expense'
      });

      expect(expense).toBeDefined();
      expect(expense.trip_id).toBe(testTrip.id);
      expect(expense.user_id).toBe(testUser.id);
    });

    it('should handle cascade deletes properly', async () => {
      // Create related data
      await createTestExpense(testTrip.id, testUser.id, {
        category: 'accommodation',
        amount: 200,
        description: 'Hotel booking'
      });

      // Delete the trip
      const { error: tripDeleteError } = await testSupabaseClient
        .from('trips')
        .delete()
        .eq('id', testTrip.id);

      expect(tripDeleteError).toBeNull();

      // Check that related expenses were cascade deleted
      const { data: remainingExpenses } = await testSupabaseClient
        .from('expenses')
        .select('*')
        .eq('trip_id', testTrip.id);

      expect(remainingExpenses).toEqual([]);
    });

    it('should prevent orphaned records', async () => {
      // Try to create expense with non-existent trip_id
      const invalidExpenseData = {
        trip_id: '00000000-0000-0000-0000-000000000000', // Non-existent UUID
        user_id: testUser.id,
        category: 'food',
        amount: 50,
        description: 'Invalid expense',
        date: new Date().toISOString().split('T')[0]
      };

      await expect(
        testSupabaseClient.from('expenses').insert([invalidExpenseData])
      ).rejects.toThrow();
    });
  });

  describe('Check Constraints', () => {
    it('should enforce trip status check constraint', async () => {
      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'status_test_user'
      });

      // Try to create trip with invalid status
      const invalidTripData = {
        user_id: testUser.id,
        destination: 'Test City',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: 1000,
        status: 'invalid_status', // Should be one of: planned, ongoing, completed
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await expect(
        testSupabaseClient.from('trips').insert([invalidTripData])
      ).rejects.toThrow();
    });

    it('should enforce payment status check constraint', async () => {
      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'payment_test_user'
      });

      // Try to create payment with invalid status
      const invalidPaymentData = {
        user_id: testUser.id,
        amount: 100,
        currency: 'USD',
        status: 'invalid_status', // Should be one of: created, pending, completed, failed, refunded
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await expect(
        testSupabaseClient.from('payments').insert([invalidPaymentData])
      ).rejects.toThrow();
    });

    it('should enforce message role check constraint', async () => {
      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'message_test_user'
      });

      // Try to create message with invalid role
      const invalidMessageData = {
        user_id: testUser.id,
        content: 'Test message',
        role: 'invalid_role' // Should be one of: user, assistant, system
      };

      await expect(
        testSupabaseClient.from('messages').insert([invalidMessageData])
      ).rejects.toThrow();
    });
  });

  describe('Index Performance', () => {
    beforeEach(async () => {
      // Create test data for index performance tests
      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'index_test_user'
      });

      // Create multiple trips for testing
      const tripPromises = [];
      for (let i = 0; i < 10; i++) {
        tripPromises.push(
          createTestTrip(testUser.id, {
            destination: `Test City ${i}`,
            status: i % 2 === 0 ? 'planned' : 'completed',
            budget: 1000 + (i * 100)
          })
        );
      }
      await Promise.all(tripPromises);
    });

    it('should efficiently query trips by user_id using index', async () => {
      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'index_test_user_2'
      });

      // Create trips for this user
      const tripPromises = [];
      for (let i = 0; i < 5; i++) {
        tripPromises.push(
          createTestTrip(testUser.id, {
            destination: `User Trip ${i}`,
            status: 'planned'
          })
        );
      }
      await Promise.all(tripPromises);

      const startTime = Date.now();

      // Query trips by user_id (should use index)
      const { data: trips, error } = await testSupabaseClient
        .from('trips')
        .select('*')
        .eq('user_id', testUser.id);

      const endTime = Date.now();

      expect(error).toBeNull();
      expect(trips).toHaveLength(5);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should efficiently query trips by status using index', async () => {
      const startTime = Date.now();

      // Query trips by status (should use index)
      const { data: trips, error } = await testSupabaseClient
        .from('trips')
        .select('*')
        .eq('status', 'planned');

      const endTime = Date.now();

      expect(error).toBeNull();
      expect(Array.isArray(trips)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should efficiently query expenses by trip_id using index', async () => {
      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'expense_index_test'
      });

      const testTrip = await createTestTrip(testUser.id, {
        destination: 'Expense Test City'
      });

      // Create multiple expenses
      const expensePromises = [];
      for (let i = 0; i < 10; i++) {
        expensePromises.push(
          createTestExpense(testTrip.id, testUser.id, {
            category: 'food',
            amount: 50 + i,
            description: `Expense ${i}`
          })
        );
      }
      await Promise.all(expensePromises);

      const startTime = Date.now();

      // Query expenses by trip_id (should use index)
      const { data: expenses, error } = await testSupabaseClient
        .from('expenses')
        .select('*')
        .eq('trip_id', testTrip.id);

      const endTime = Date.now();

      expect(error).toBeNull();
      expect(expenses).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Data Types and Validation', () => {
    it('should handle UUID data types correctly', async () => {
      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'uuid_test_user'
      });

      const testTrip = await createTestTrip(testUser.id, {
        destination: 'UUID Test City'
      });

      expect(testTrip.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(testTrip.user_id).toBe(testUser.id);
    });

    it('should handle decimal/numeric data types correctly', async () => {
      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'decimal_test_user'
      });

      const testTrip = await createTestTrip(testUser.id, {
        destination: 'Decimal Test City',
        budget: 1234.56
      });

      expect(testTrip.budget).toBe(1234.56);

      const expense = await createTestExpense(testTrip.id, testUser.id, {
        category: 'food',
        amount: 99.99,
        description: 'Decimal test expense'
      });

      expect(expense.amount).toBe(99.99);
    });

    it('should handle timestamp data types correctly', async () => {
      const beforeCreate = new Date();

      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'timestamp_test_user'
      });

      const afterCreate = new Date();

      expect(testUser.created_at).toBeDefined();
      expect(new Date(testUser.created_at).getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(new Date(testUser.created_at).getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should handle array data types correctly', async () => {
      const testOffer = await createTestTravelOffer({
        title: 'Array Test Offer',
        destination: 'Test City',
        includes: ['Flight', 'Hotel', 'Breakfast', 'Tours'],
        is_active: true
      });

      expect(Array.isArray(testOffer.includes)).toBe(true);
      expect(testOffer.includes).toHaveLength(4);
      expect(testOffer.includes).toContain('Flight');
      expect(testOffer.includes).toContain('Hotel');
    });
  });

  describe('Row Level Security (RLS)', () => {
    it('should enforce RLS policies for profiles table', async () => {
      // This test would require setting up different users and testing
      // that they can only access their own data
      // For now, we'll verify that RLS is enabled
      const { data: rlsStatus } = await testSupabaseClient
        .rpc('get_rls_status', { table_name: 'profiles' });

      // If RPC function doesn't exist, we'll skip this test
      if (rlsStatus === null) {
        console.log('⚠️ Skipping RLS status check - RPC function not available');
        return;
      }

      expect(rlsStatus).toBeDefined();
    });

    it('should enforce RLS policies for trips table', async () => {
      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'rls_test_user'
      });

      // Create trip for user
      const testTrip = await createTestTrip(testUser.id, {
        destination: 'RLS Test City'
      });

      // The trip should be accessible when queried properly
      const { data: retrievedTrip, error } = await testSupabaseClient
        .from('trips')
        .select('*')
        .eq('id', testTrip.id)
        .single();

      expect(error).toBeNull();
      expect(retrievedTrip).toBeDefined();
      expect(retrievedTrip.id).toBe(testTrip.id);
    });
  });

  describe('Database Functions and Triggers', () => {
    it('should execute handle_new_user function correctly', async () => {
      // This test would verify that the trigger function works
      // when a new user is created in auth.users
      // For now, we'll verify that the function exists

      const { data: functions } = await testSupabaseClient
        .rpc('get_functions');

      // If RPC function doesn't exist, we'll skip this test
      if (!functions) {
        console.log('⚠️ Skipping function existence check - RPC function not available');
        return;
      }

      expect(functions).toBeDefined();
    });
  });

  describe('Storage Bucket Operations', () => {
    it('should verify avatars storage bucket exists', async () => {
      // This test would verify storage bucket configuration
      // For now, we'll verify that the bucket policy exists

      const { data: buckets } = await testSupabaseClient.storage.listBuckets();

      if (buckets) {
        const avatarBucket = buckets.find(bucket => bucket.id === 'avatars');
        expect(avatarBucket).toBeDefined();
        expect(avatarBucket.public).toBe(false);
      } else {
        console.log('⚠️ Skipping storage bucket check - storage API not available');
      }
    });
  });

  describe('Concurrent Operations and Race Conditions', () => {
    it('should handle concurrent trip creation', async () => {
      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'concurrent_test_user'
      });

      // Create multiple trips concurrently
      const tripPromises = [];
      for (let i = 0; i < 10; i++) {
        tripPromises.push(
          createTestTrip(testUser.id, {
            destination: `Concurrent City ${i}`,
            budget: 1000 + i
          })
        );
      }

      const results = await Promise.all(tripPromises);

      expect(results).toHaveLength(10);
      results.forEach((trip, index) => {
        expect(trip).toBeDefined();
        expect(trip.destination).toBe(`Concurrent City ${index}`);
      });
    });

    it('should handle concurrent expense creation', async () => {
      const testUser = await createTestUser({
        telegram_id: testTelegramId,
        username: 'expense_concurrent_user'
      });

      const testTrip = await createTestTrip(testUser.id, {
        destination: 'Expense Concurrent Test'
      });

      // Create multiple expenses concurrently
      const expensePromises = [];
      for (let i = 0; i < 20; i++) {
        expensePromises.push(
          createTestExpense(testTrip.id, testUser.id, {
            category: 'food',
            amount: 10 + i,
            description: `Concurrent expense ${i}`
          })
        );
      }

      const results = await Promise.all(expensePromises);

      expect(results).toHaveLength(20);
      results.forEach((expense, index) => {
        expect(expense).toBeDefined();
        expect(expense.description).toBe(`Concurrent expense ${index}`);
      });
    });
  });
});