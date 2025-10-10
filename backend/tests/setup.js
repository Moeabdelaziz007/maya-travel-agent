/**
 * Global test setup and configuration
 * This file runs before each test suite
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.ZAI_API_KEY = 'test-zai-key';
process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
process.env.PAYPAL_CLIENT_ID = 'test-paypal-id';
process.env.PAYPAL_CLIENT_SECRET = 'test-paypal-secret';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods for cleaner test output (optional)
global.testLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

// Mock external dependencies
jest.mock('../database/supabase', () => {
  return jest.fn().mockImplementation(() => ({
    getTravelOffers: jest.fn().mockResolvedValue([
      { id: 1, title: 'Test Trip', price: 100 },
      { id: 2, title: 'Another Trip', price: 200 }
    ]),
    createUser: jest.fn().mockResolvedValue({ id: 'test-user-id' }),
    getUserProfile: jest.fn().mockResolvedValue({
      id: 'test-user-id',
      name: 'Test User',
      preferences: {}
    })
  }));
});

jest.mock('../src/ai/zaiClient', () => {
  return jest.fn().mockImplementation(() => ({
    healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
    chat: jest.fn().mockResolvedValue({
      success: true,
      message: 'Test AI response'
    }),
    analyzeIntent: jest.fn().mockReturnValue({
      intent: 'travel_info',
      confidence: 0.9,
      entities: {}
    })
  }));
});

// Setup global test utilities
global.testUtils = {
  // Helper to create mock request/response objects
  createMockReq: (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query,
    headers: {},
    get: jest.fn()
  }),

  createMockRes: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    return res;
  },

  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate test user data
  createTestUser: (overrides = {}) => ({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    preferences: {
      language: 'ar',
      currency: 'USD',
      ...overrides.preferences
    },
    ...overrides
  }),

  // Helper to generate test trip data
  createTestTrip: (overrides = {}) => ({
    id: 'test-trip-id',
    title: 'Test Trip',
    destination: 'Test Destination',
    price: 100,
    currency: 'USD',
    duration: 7,
    ...overrides
  })
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promises in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});