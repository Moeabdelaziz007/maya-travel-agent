/**
 * Mock Data Factories for Frontend Testing
 * Provides realistic test data for components and API responses
 */

import { TestDataGenerator } from './test-utils';

// Mock API Responses
export const mockApiResponses = {
  tripPlanning: {
    success: {
      success: true,
      data: {
        tripId: 'trip-123',
        destination: 'Tokyo',
        itinerary: [
          {
            day: 1,
            activities: ['Visit Senso-ji Temple', 'Shibuya Crossing'],
            meals: ['Sushi dinner'],
          },
          {
            day: 2,
            activities: ['Tokyo Skytree', 'Akihabara'],
            meals: ['Ramen lunch', 'Tempura dinner'],
          },
        ],
        estimatedCost: 2500,
        recommendations: [
          'Book JR Pass',
          'Get travel insurance',
          'Learn basic Japanese phrases',
        ],
        duration: 7,
        travelers: 2,
      },
      metadata: {
        requestId: 'req-123',
        responseTime: 1500,
        processingTime: 1500,
        enhanced: true,
        skills_enabled: true,
      },
    },
    error: {
      success: false,
      error: 'Invalid destination',
      metadata: {
        requestId: 'req-456',
        processingTime: 500,
      },
    },
  },

  chat: {
    success: {
      success: true,
      reply:
        'مرحباً! أهلاً وسهلاً بك في رحلتك إلى طوكيو! سأكون رفيقتك في هذه التجربة المثيرة.',
      conversationId: 'conv-123',
      emotional_context: {
        primary_emotion: 'excitement',
        confidence: 0.85,
        suggested_tone: 'enthusiastic_welcoming',
      },
      friendship_level: 'new_acquaintance',
      metadata: {
        requestId: 'req-789',
        responseTime: 1200,
        skillsUsed: ['EmpathyDetection', 'PersonalizedFriendship'],
      },
    },
    error: {
      success: false,
      error: 'Chat service temporarily unavailable',
      metadata: {
        requestId: 'req-999',
        processingTime: 300,
      },
    },
  },

  skills: {
    empathy: {
      success: true,
      data: {
        primary_emotion: 'anxiety',
        confidence: 0.82,
        suggested_tone: 'calm_reassuring',
        empathy_score: 0.9,
        detected_keywords: ['قلق', 'سفر', 'أول مرة'],
      },
    },
    friendship: {
      success: true,
      data: {
        friendship_level: 'acquaintance',
        personalized_greeting: 'مرحباً صديقي!',
        interaction_count: 5,
        last_interaction: '2024-01-15T10:30:00Z',
        suggested_topics: ['travel_tips', 'cultural_insights'],
      },
    },
    voice: {
      success: true,
      data: {
        selected_voice_style: 'warm_supportive',
        response_template: 'supportive_response',
        tone_modifiers: ['empathetic', 'encouraging'],
        language_adaptations: ['formal_arabic'],
      },
    },
  },

  health: {
    success: {
      success: true,
      health: {
        overall_status: 'healthy',
        boss_agent: {
          status: 'connected',
          response_time: 150,
          last_check: '2024-01-15T10:30:00Z',
        },
        skill_system: {
          status: 'operational',
          skills_loaded: 8,
          active_skills: [
            'EmpathyDetection',
            'PersonalizedFriendship',
            'DynamicVoiceAdaptation',
          ],
        },
        cache: {
          status: 'connected',
          hit_rate: 0.85,
          size: 1024,
        },
      },
      timestamp: '2024-01-15T10:30:00Z',
    },
  },
};

// Mock Component Props
export const mockComponentProps = {
  tripPlanner: {
    onSubmit: jest.fn(),
    onDestinationChange: jest.fn(),
    onBudgetChange: jest.fn(),
    loading: false,
    error: null,
    data: null,
  },

  aiAssistant: {
    conversationId: 'conv-123',
    onSendMessage: jest.fn(),
    onEmotionDetected: jest.fn(),
    messages: [
      {
        id: 'msg-1',
        content: 'مرحباً مايا!',
        sender: 'user',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        id: 'msg-2',
        content: 'مرحباً! كيف يمكنني مساعدتك؟',
        sender: 'assistant',
        timestamp: '2024-01-15T10:30:05Z',
        emotionalContext: {
          primary_emotion: 'friendly',
          confidence: 0.9,
        },
      },
    ],
    isTyping: false,
    friendshipLevel: 'acquaintance',
  },

  budgetTracker: {
    trips: [
      {
        id: 'trip-1',
        destination: 'Tokyo',
        estimatedCost: 2500,
        actualCost: 2200,
        currency: 'SAR',
        status: 'completed',
      },
      {
        id: 'trip-2',
        destination: 'Dubai',
        estimatedCost: 1800,
        actualCost: null,
        currency: 'SAR',
        status: 'planned',
      },
    ],
    onUpdateCost: jest.fn(),
    onAddExpense: jest.fn(),
  },

  destinations: {
    destinations: [
      {
        id: 'dest-1',
        name: 'Tokyo',
        country: 'Japan',
        description: 'Modern city with rich culture',
        imageUrl: '/images/tokyo.jpg',
        averageCost: 2500,
        bestTimeToVisit: 'March-May',
        highlights: ['Senso-ji Temple', 'Shibuya', 'Tokyo Skytree'],
      },
      {
        id: 'dest-2',
        name: 'Dubai',
        country: 'UAE',
        description: 'Luxury destination with modern attractions',
        imageUrl: '/images/dubai.jpg',
        averageCost: 2000,
        bestTimeToVisit: 'November-March',
        highlights: ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Mall'],
      },
    ],
    onSelectDestination: jest.fn(),
    selectedDestination: null,
  },
};

// Mock User Data
export const mockUsers = {
  newUser: TestDataGenerator.generateUser(),
  premiumUser: TestDataGenerator.generateUser({
    tier: 'premium',
    trips: [
      { id: 'trip-1', destination: 'Paris', status: 'completed' },
      { id: 'trip-2', destination: 'London', status: 'completed' },
    ],
  }),
  returningUser: TestDataGenerator.generateUser({
    trips: [{ id: 'trip-1', destination: 'Tokyo', status: 'completed' }],
    preferences: {
      language: 'ar',
      currency: 'SAR',
      tripTypes: ['cultural', 'adventure'],
      budgetRange: { min: 2000, max: 5000 },
    },
  }),
};

// Mock Trip Data
export const mockTrips = {
  plannedTrip: TestDataGenerator.generateTripRequest({
    destination: 'Tokyo',
    travelers: 2,
    budget: 3000,
    tripType: 'cultural',
  }),
  completedTrip: {
    ...TestDataGenerator.generateTripRequest({
      destination: 'Paris',
      travelers: 1,
      budget: 2000,
    }),
    status: 'completed',
    actualCost: 1800,
    rating: 5,
    feedback: 'Amazing experience!',
  },
  budgetTrip: TestDataGenerator.generateTripRequest({
    destination: 'Istanbul',
    travelers: 4,
    budget: 1500,
    tripType: 'adventure',
  }),
};

// Mock Chat Conversations
export const mockConversations = {
  newUser: [
    {
      id: 'msg-1',
      content: 'مرحباً مايا! أريد السفر إلى طوكيو',
      sender: 'user',
      timestamp: '2024-01-15T10:00:00Z',
    },
    {
      id: 'msg-2',
      content: 'مرحباً! طوكيو وجهة رائعة! كم عدد الأشخاص وما ميزانيتك؟',
      sender: 'assistant',
      timestamp: '2024-01-15T10:00:05Z',
      emotionalContext: { primary_emotion: 'excited', confidence: 0.9 },
    },
  ],
  anxiousUser: [
    {
      id: 'msg-1',
      content: 'أشعر بالقلق من السفر لوحدي',
      sender: 'user',
      timestamp: '2024-01-15T11:00:00Z',
    },
    {
      id: 'msg-2',
      content:
        'لا تقلق! السفر لوحدك يمكن أن يكون تجربة رائعة. سأساعدك في كل خطوة.',
      sender: 'assistant',
      timestamp: '2024-01-15T11:00:03Z',
      emotionalContext: { primary_emotion: 'anxiety', confidence: 0.85 },
    },
  ],
  experiencedUser: [
    {
      id: 'msg-1',
      content: 'مرحباً صديقتي! أريد رحلة مميزة هذه المرة',
      sender: 'user',
      timestamp: '2024-01-15T12:00:00Z',
    },
    {
      id: 'msg-2',
      content:
        'أهلاً صديقي! أراك متحمساً لرحلة جديدة. ما نوع الوجهة التي تفكر فيها؟',
      sender: 'assistant',
      timestamp: '2024-01-15T12:00:02Z',
      emotionalContext: { primary_emotion: 'excitement', confidence: 0.9 },
      friendshipLevel: 'friend',
    },
  ],
};

// Mock Error Scenarios
export const mockErrors = {
  networkError: {
    message: 'Network Error',
    code: 'NETWORK_ERROR',
    status: 0,
  },
  validationError: {
    message: 'Invalid input data',
    code: 'VALIDATION_ERROR',
    status: 400,
    details: {
      field: 'destination',
      message: 'Destination is required',
    },
  },
  serverError: {
    message: 'Internal server error',
    code: 'SERVER_ERROR',
    status: 500,
  },
  authenticationError: {
    message: 'Authentication required',
    code: 'AUTH_ERROR',
    status: 401,
  },
  rateLimitError: {
    message: 'Too many requests',
    code: 'RATE_LIMIT_ERROR',
    status: 429,
    retryAfter: 60,
  },
};

// Mock Performance Data
export const mockPerformanceData = {
  fastResponse: {
    responseTime: 500,
    processingTime: 450,
    timestamp: '2024-01-15T10:30:00Z',
  },
  slowResponse: {
    responseTime: 5000,
    processingTime: 4800,
    timestamp: '2024-01-15T10:30:00Z',
  },
  concurrentLoad: {
    totalRequests: 100,
    successfulRequests: 95,
    failedRequests: 5,
    averageResponseTime: 800,
    percentile95: 1200,
    percentile99: 1500,
  },
};

// Factory Functions for Dynamic Mock Data
export class MockDataFactory {
  static createRandomTrip(overrides = {}) {
    return TestDataGenerator.generateTripRequest(overrides);
  }

  static createRandomUser(overrides = {}) {
    return TestDataGenerator.generateUser(overrides);
  }

  static createChatMessage(overrides = {}) {
    return {
      id: `msg-${Date.now()}`,
      content: TestDataGenerator.generateChatMessage(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      ...overrides,
    };
  }

  static createApiResponse(endpoint, status = 'success', overrides = {}) {
    const baseResponse = mockApiResponses[endpoint]?.[status] || {};
    return { ...baseResponse, ...overrides };
  }

  static createErrorResponse(errorType, overrides = {}) {
    return { ...mockErrors[errorType], ...overrides };
  }

  static createBulkData(count, factoryMethod, overrides = {}) {
    return Array.from({ length: count }, (_, index) =>
      factoryMethod({
        ...overrides,
        index,
        id: `${overrides.prefix || 'mock'}_${index}`,
      })
    );
  }
}

// Export everything as a single object for convenience
export const MockData = {
  responses: mockApiResponses,
  props: mockComponentProps,
  users: mockUsers,
  trips: mockTrips,
  conversations: mockConversations,
  errors: mockErrors,
  performance: mockPerformanceData,
  factory: MockDataFactory,
};
