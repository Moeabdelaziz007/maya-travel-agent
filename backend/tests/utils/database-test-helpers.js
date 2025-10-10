/**
 * Database Test Helpers for Supabase Operations
 * Provides utilities for setting up test database, managing test data, and cleanup
 */

const { createClient } = require('@supabase/supabase-js');

// Test database configuration
const TEST_SUPABASE_CONFIG = {
  url: process.env.TEST_SUPABASE_URL || 'http://localhost:54321',
  serviceRoleKey: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key',
  anonKey: process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key'
};

/**
 * Test database client with service role for full access
 */
let testSupabaseClient = null;

/**
 * Initialize test database connection
 */
const setupTestDatabase = async () => {
  try {
    // Skip database connection in test environment if no real Supabase configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_URL.includes('your_supabase') ||
        process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your_supabase')) {
      console.log('⚠️ Skipping real database connection - using mock mode');
      testSupabaseClient = null;
      return null;
    }

    // Create test client with service role for full access
    testSupabaseClient = createClient(
      TEST_SUPABASE_CONFIG.url,
      TEST_SUPABASE_CONFIG.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create tables if they don't exist
    const tables = ['profiles', 'messages', 'travel_offers', 'offer_interactions', 'trips', 'destinations', 'expenses', 'payments', 'ai_conversations'];
    for (const table of tables) {
      const { error } = await testSupabaseClient.from(table).select('count').limit(1);
      //If the table doesn't exist, the error will contain "relation not found"
      if (error?.message.includes('relation') && error.message.includes('not found')) await createTable(table);
    }

    console.log('✅ Test database connection established');
    return testSupabaseClient;
  } catch (error) {
    console.error('❌ Failed to setup test database:', error.message);
    // Don't throw error - allow tests to run in mock mode
    testSupabaseClient = null;
    return null;
  }
};


const createTable = async (table) => {
  console.log('Attempting to create table:', table);

  try {
    switch (table) {
      case 'profiles':
        await testSupabaseClient.schema.hasTable('profiles').then(async (exists) => {
          if (!exists) {
            await testSupabaseClient.schema.createTable('profiles', (tableDef) => {
              tableDef.uuid('id').primaryKey().default('uuid_generate_v4()');
              tableDef.bigint('telegram_id').notNullable().unique();
              tableDef.string('username');
              tableDef.string('avatar_url');
              tableDef.jsonb('preferences');
              tableDef.jsonb('travel_history');
              tableDef.timestamp('created_at').default('now()');
              tableDef.timestamp('updated_at').default('now()');
            });
          }
        });
        break;
      case 'messages':
          await testSupabaseClient.schema.hasTable('messages').then(async (exists) => {
            if (!exists) {
              await testSupabaseClient.schema.createTable('messages', (tableDef) => {
                tableDef.uuid('id').primaryKey().default('uuid_generate_v4()');
                tableDef.bigint('telegram_id');
                tableDef.text('content');
                tableDef.string('role');
                tableDef.boolean('is_telegram');
                tableDef.timestamp('created_at').default('now()');
              });
            }
          });
        break;
      case 'travel_offers':
          await testSupabaseClient.schema.hasTable('travel_offers').then(async (exists) => {
            if (!exists) {
              await testSupabaseClient.schema.createTable('travel_offers', (tableDef) => {
                tableDef.uuid('id').primaryKey().default('uuid_generate_v4()');
                tableDef.string('title');
                tableDef.string('destination');
                tableDef.text('description');
                tableDef.decimal('price');
                tableDef.decimal('original_price');
                tableDef.integer('discount_percentage');
                tableDef.string('category');
                tableDef.integer('duration_days');
                tableDef.specificType('includes', 'text[]');
                tableDef.string('image_url');
                tableDef.boolean('is_active');
                tableDef.integer('priority');
                tableDef.timestamp('valid_until');
                tableDef.timestamp('created_at').default('now()');
              });
            }
          });
        break;
        // Add other table creation scripts here
    }
  } catch (e) {
    console.error('Error creating table:', table, e.message);
  }
}
/**
 * Clean up all test data
 */
const cleanupTestData = async () => {
  if (!testSupabaseClient) {
    console.log('⚠️ Test database not initialized, skipping cleanup');
    return;
  }

  try {
    const tables = ['offer_interactions', 'messages', 'travel_offers', 'expenses', 'trips', 'ai_conversations', 'payments', 'destinations', 'profiles', 'users'];
    for (const table of tables) {
      await testSupabaseClient.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');//This does not work for the users table since it does not have the id field, this will need to be fixed
    }

    console.log('✅ Test data cleanup completed');
  } catch (error) {
    console.error('❌ Error during test data cleanup:', error.message);
    throw error;
  }
};

/**
 * Create test user for authentication testing
 */
const createTestUser = async (overrides = {}) => {
  if (!testSupabaseClient) {
    throw new Error('Test database not initialized');
  }

  const testUserData = {
    telegram_id: Date.now(), // Use timestamp for unique ID
    username: `testuser_${Date.now()}`,
    avatar_url: 'https://example.com/avatar.jpg',
    preferences: {
      language: 'ar',
      currency: 'USD',
      travel_style: 'budget',
      ...overrides.preferences
    },
    travel_history: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };

  try {
    const { data, error } = await testSupabaseClient
      .from('profiles')
      .insert([testUserData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
};

/**
 * Create test trip data
 */
const createTestTrip = async (userId, overrides = {}) => {
  if (!testSupabaseClient) {
    throw new Error('Test database not initialized');
  }

  const testTripData = {
    user_id: userId,
    destination: 'Test Destination',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 1000.00,
    status: 'planned',
    image_url: 'https://example.com/trip.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };

  try {
    const { data, error } = await testSupabaseClient
      .from('trips')
      .insert([testTripData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test trip:', error);
    throw error;
  }
};

/**
 * Create test travel offer
 */
const createTestTravelOffer = async (overrides = {}) => {
  if (!testSupabaseClient) {
    throw new Error('Test database not initialized');
  }

  const testOfferData = {
    title: 'Test Travel Offer',
    destination: 'Test City, Test Country',
    description: 'A test travel offer for testing purposes',
    price: 999.99,
    original_price: 1299.99,
    discount_percentage: 23,
    category: 'budget',
    duration_days: 7,
    includes: ['Flight', 'Hotel', 'Breakfast'],
    image_url: 'https://example.com/offer.jpg',
    is_active: true,
    priority: 5,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    ...overrides
  };

  try {
    const { data, error } = await testSupabaseClient
      .from('travel_offers')
      .insert([testOfferData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test travel offer:', error);
    throw error;
  }
};

/**
 * Create test destination
 */
const createTestDestination = async (overrides = {}) => {
  if (!testSupabaseClient) {
    throw new Error('Test database not initialized');
  }

  const testDestinationData = {
    name: 'Test City',
    country: 'Test Country',
    image_url: 'https://example.com/destination.jpg',
    rating: 4.5,
    price_range: '$$',
    best_time: 'Apr-Oct',
    description: 'A beautiful test destination for testing purposes',
    created_at: new Date().toISOString(),
    ...overrides
  };

  try {
    const { data, error } = await testSupabaseClient
      .from('destinations')
      .insert([testDestinationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test destination:', error);
    throw error;
  }
};

/**
 * Create test expense
 */
const createTestExpense = async (tripId, userId, overrides = {}) => {
  if (!testSupabaseClient) {
    throw new Error('Test database not initialized');
  }

  const testExpenseData = {
    trip_id: tripId,
    user_id: userId,
    category: 'food',
    amount: 50.00,
    description: 'Test meal expense',
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    ...overrides
  };

  try {
    const { data, error } = await testSupabaseClient
      .from('expenses')
      .insert([testExpenseData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test expense:', error);
    throw error;
  }
};

/**
 * Create test message
 */
const createTestMessage = async (userId, overrides = {}) => {
  if (!testSupabaseClient) {
    throw new Error('Test database not initialized');
  }

  const testMessageData = {
    user_id: userId,
    content: 'Test message content',
    role: 'user',
    created_at: new Date().toISOString(),
    ...overrides
  };

  try {
    const { data, error } = await testSupabaseClient
      .from('messages')
      .insert([testMessageData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test message:', error);
    throw error;
  }
};

/**
 * Create test payment
 */
const createTestPayment = async (userId, overrides = {}) => {
  if (!testSupabaseClient) {
    throw new Error('Test database not initialized');
  }

  const testPaymentData = {
    user_id: userId,
    amount: 100.00,
    currency: 'USD',
    status: 'completed',
    stripe_session_id: `test_session_${Date.now()}`,
    description: 'Test payment for trip booking',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };

  try {
    const { data, error } = await testSupabaseClient
      .from('payments')
      .insert([testPaymentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test payment:', error);
    throw error;
  }
};

/**
 * Get test user by telegram ID
 */
const getTestUser = async (telegramId) => {
  if (!testSupabaseClient) {
    throw new Error('Test database not initialized');
  }

  try {
    const { data, error } = await testSupabaseClient
      .from('profiles')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting test user:', error);
    return null;
  }
};

/**
 * Delete test user and all related data
 */
const deleteTestUser = async (telegramId) => {
  if (!testSupabaseClient) {
    throw new Error('Test database not initialized');
  }

  try {
    // Get user profile first
    const user = await getTestUser(telegramId);
    if (!user) return;

    // Delete in reverse dependency order
    await testSupabaseClient.from('offer_interactions').delete().eq('telegram_id', telegramId);
    await testSupabaseClient.from('messages').delete().eq('telegram_id', telegramId);
    await testSupabaseClient.from('profiles').delete().eq('telegram_id', telegramId);

    console.log(`✅ Test user ${telegramId} and related data deleted`);
  } catch (error) {
    console.error('Error deleting test user:', error);
    throw error;
  }
};

/**
 * Generate unique test identifiers
 */
const generateTestId = () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const generateTestTelegramId = () => Date.now() + Math.floor(Math.random() * 1000);

module.exports = {
  setupTestDatabase,
  cleanupTestData,
  createTestUser,
  createTestTrip,
  createTestTravelOffer,
  createTestDestination,
  createTestExpense,
  createTestMessage,
  createTestPayment,
  getTestUser,
  deleteTestUser,
  generateTestId,
  generateTestTelegramId,
  testSupabaseClient,

  TEST_SUPABASE_CONFIG
};