/**
 * Jest test setup for E-CMW
 */

// Mock console methods to reduce noise during testing
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Helper to create mock user context
  createMockUserContext: (overrides = {}) => ({
    userId: 'test_user',
    sessionId: 'test_session',
    preferences: {},
    emotionalState: 'neutral',
    travelHistory: [],
    ...overrides
  }),

  // Helper to create mock intent analysis
  createMockIntentAnalysis: (overrides = {}) => ({
    primaryIntent: 'book_flight',
    secondaryIntents: ['get_recommendations'],
    confidence: 0.85,
    quantumStates: [],
    contextFactors: [],
    emotionalWeight: 0.5,
    temporalContext: {
      timeOfDay: 14,
      dayOfWeek: 1,
      season: 'spring',
      urgency: 'medium'
    },
    ...overrides
  }),

  // Helper to wait for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to mock LLM responses
  mockLLMResponse: (text = 'Mock response', cost = 0.001) => ({
    id: 'mock_response',
    requestId: 'mock_request',
    provider: 'mock_provider',
    text,
    tokens: text.split(' ').length * 1.3,
    cost,
    responseTime: 100,
    quality: 0.8,
    cached: false,
    timestamp: new Date()
  })
};

// Extend Jest matchers if needed
expect.extend({
  toBeValidWorkflowResult(received) {
    const pass = received &&
      typeof received.success === 'boolean' &&
      typeof received.workflowId === 'string' &&
      Array.isArray(received.agents) &&
      typeof received.output === 'object' &&
      typeof received.executionTime === 'number' &&
      typeof received.cost === 'number';

    return {
      message: () => `expected ${received} to be a valid workflow result`,
      pass
    };
  }
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidWorkflowResult(): R;
    }
  }

  const testUtils: typeof global.testUtils;
}