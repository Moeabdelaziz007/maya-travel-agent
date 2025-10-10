/**
 * Mock Data Factories for Backend Testing
 * Provides realistic test data for backend services and API responses
 */

const { TestDataFactory } = require('./test-utils')

// Mock API Responses
const mockApiResponses = {
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
            meals: ['Sushi dinner']
          },
          {
            day: 2,
            activities: ['Tokyo Skytree', 'Akihabara'],
            meals: ['Ramen lunch', 'Tempura dinner']
          }
        ],
        estimatedCost: 2500,
        recommendations: ['Book JR Pass', 'Get travel insurance', 'Learn basic Japanese phrases'],
        duration: 7,
        travelers: 2
      },
      metadata: {
        requestId: 'req-123',
        responseTime: 1500,
        processingTime: 1500,
        enhanced: true,
        skills_enabled: true,
        agents: ['flight_search', 'hotel_search'],
        skillsUsed: ['EmpathyDetection', 'PersonalizedFriendship']
      }
    },
    error: {
      success: false,
      error: 'Invalid destination',
      metadata: {
        requestId: 'req-456',
        processingTime: 500
      }
    }
  },

  chat: {
    success: {
      success: true,
      reply: 'مرحباً! أهلاً وسهلاً بك في رحلتك إلى طوكيو! سأكون رفيقتك في هذه التجربة المثيرة.',
      conversationId: 'conv-123',
      emotional_context: {
        primary_emotion: 'excitement',
        confidence: 0.85,
        suggested_tone: 'enthusiastic_welcoming'
      },
      friendship_level: 'new_acquaintance',
      metadata: {
        requestId: 'req-789',
        responseTime: 1200,
        skillsUsed: ['EmpathyDetection', 'PersonalizedFriendship']
      }
    },
    error: {
      success: false,
      error: 'Chat service temporarily unavailable',
      metadata: {
        requestId: 'req-999',
        processingTime: 300
      }
    }
  },

  skills: {
    empathy: {
      success: true,
      data: {
        primary_emotion: 'anxiety',
        confidence: 0.82,
        suggested_tone: 'calm_reassuring',
        empathy_score: 0.9,
        detected_keywords: ['قلق', 'سفر', 'أول مرة']
      }
    },
    friendship: {
      success: true,
      data: {
        friendship_level: 'acquaintance',
        personalized_greeting: 'مرحباً صديقي!',
        interaction_count: 5,
        last_interaction: '2024-01-15T10:30:00Z',
        suggested_topics: ['travel_tips', 'cultural_insights']
      }
    },
    voice: {
      success: true,
      data: {
        selected_voice_style: 'warm_supportive',
        response_template: 'supportive_response',
        tone_modifiers: ['empathetic', 'encouraging'],
        language_adaptations: ['formal_arabic']
      }
    }
  },

  health: {
    success: {
      success: true,
      health: {
        overall_status: 'healthy',
        boss_agent: {
          status: 'connected',
          response_time: 150,
          last_check: '2024-01-15T10:30:00Z'
        },
        skill_system: {
          status: 'operational',
          skills_loaded: 8,
          active_skills: ['EmpathyDetection', 'PersonalizedFriendship', 'DynamicVoiceAdaptation']
        },
        cache: {
          status: 'connected',
          hit_rate: 0.85,
          size: 1024
        }
      },
      timestamp: '2024-01-15T10:30:00Z'
    }
  }
}

// Mock Database Records
const mockDatabaseRecords = {
  users: [
    {
      id: 'user-1',
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      preferences: {
        language: 'ar',
        currency: 'SAR',
        tripTypes: ['cultural', 'adventure'],
        budgetRange: { min: 1000, max: 5000 }
      },
      tier: 'standard',
      createdAt: '2024-01-01T00:00:00Z',
      trips: []
    },
    {
      id: 'user-2',
      firstName: 'فاطمة',
      lastName: 'علي',
      email: 'fatima@example.com',
      phone: '+966507654321',
      preferences: {
        language: 'ar',
        currency: 'SAR',
        tripTypes: ['relaxation', 'cultural'],
        budgetRange: { min: 2000, max: 8000 }
      },
      tier: 'premium',
      createdAt: '2024-01-05T00:00:00Z',
      trips: ['trip-1', 'trip-2']
    }
  ],

  trips: [
    {
      id: 'trip-1',
      userId: 'user-2',
      destination: 'Tokyo',
      departureDate: '2024-02-01',
      returnDate: '2024-02-07',
      travelers: 2,
      budget: 3000,
      status: 'completed',
      itinerary: [
        {
          day: 1,
          activities: ['Visit Senso-ji Temple', 'Shibuya Crossing'],
          meals: ['Sushi dinner']
        }
      ],
      createdAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 'trip-2',
      userId: 'user-2',
      destination: 'Dubai',
      departureDate: '2024-03-01',
      returnDate: '2024-03-05',
      travelers: 1,
      budget: 2000,
      status: 'planned',
      itinerary: [],
      createdAt: '2024-01-15T00:00:00Z'
    }
  ],

  conversations: [
    {
      id: 'conv-1',
      userId: 'user-1',
      messages: [
        {
          id: 'msg-1',
          content: 'مرحباً مايا! أريد السفر إلى طوكيو',
          sender: 'user',
          timestamp: '2024-01-15T10:00:00Z'
        },
        {
          id: 'msg-2',
          content: 'مرحباً! طوكيو وجهة رائعة! كم عدد الأشخاص وما ميزانيتك؟',
          sender: 'assistant',
          timestamp: '2024-01-15T10:00:05Z',
          emotionalContext: { primary_emotion: 'excited', confidence: 0.9 }
        }
      ],
      friendshipLevel: 'new_acquaintance',
      interactionCount: 2,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:05Z'
    }
  ]
}

// Mock External Service Responses
const mockExternalServices = {
  flightSearch: {
    success: {
      flights: [
        {
          id: 'flight-1',
          airline: 'Saudi Airlines',
          flightNumber: 'SV123',
          departure: {
            airport: 'RUH',
            time: '2024-02-01T08:00:00Z'
          },
          arrival: {
            airport: 'NRT',
            time: '2024-02-01T22:00:00Z'
          },
          price: 1200,
          currency: 'SAR',
          duration: '14h'
        },
        {
          id: 'flight-2',
          airline: 'Emirates',
          flightNumber: 'EK456',
          departure: {
            airport: 'RUH',
            time: '2024-02-01T10:00:00Z'
          },
          arrival: {
            airport: 'NRT',
            time: '2024-02-02T00:00:00Z'
          },
          price: 1400,
          currency: 'SAR',
          duration: '14h'
        }
      ]
    },
    error: {
      error: 'Flight search service unavailable',
      code: 'FLIGHT_SEARCH_ERROR'
    }
  },

  hotelSearch: {
    success: {
      hotels: [
        {
          id: 'hotel-1',
          name: 'Tokyo Grand Hotel',
          rating: 4.5,
          pricePerNight: 200,
          currency: 'SAR',
          amenities: ['WiFi', 'Pool', 'Gym'],
          location: 'Shibuya',
          imageUrl: '/images/hotels/tokyo-grand.jpg'
        },
        {
          id: 'hotel-2',
          name: 'Shinjuku Plaza',
          rating: 4.0,
          pricePerNight: 150,
          currency: 'SAR',
          amenities: ['WiFi', 'Restaurant'],
          location: 'Shinjuku',
          imageUrl: '/images/hotels/shinjuku-plaza.jpg'
        }
      ]
    },
    error: {
      error: 'Hotel search service unavailable',
      code: 'HOTEL_SEARCH_ERROR'
    }
  },

  jsonbin: {
    success: {
      success: true,
      binId: 'bin-123',
      data: { test: 'cached data' },
      createdAt: '2024-01-15T10:00:00Z'
    },
    error: {
      success: false,
      error: 'JSONbin service error',
      code: 'JSONBIN_ERROR'
    }
  },

  openai: {
    success: {
      choices: [
        {
          message: {
            content: 'مرحباً! أهلاً وسهلاً بك في رحلتك إلى طوكيو!',
            role: 'assistant'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 100,
        total_tokens: 150
      }
    },
    error: {
      error: {
        message: 'OpenAI API rate limit exceeded',
        type: 'rate_limit_error',
        code: 'rate_limit_exceeded'
      }
    }
  }
}

// Mock Error Scenarios
const mockErrors = {
  networkError: {
    message: 'Network Error',
    code: 'NETWORK_ERROR',
    status: 0
  },
  validationError: {
    message: 'Invalid input data',
    code: 'VALIDATION_ERROR',
    status: 400,
    details: {
      field: 'destination',
      message: 'Destination is required'
    }
  },
  serverError: {
    message: 'Internal server error',
    code: 'SERVER_ERROR',
    status: 500
  },
  authenticationError: {
    message: 'Authentication required',
    code: 'AUTH_ERROR',
    status: 401
  },
  rateLimitError: {
    message: 'Too many requests',
    code: 'RATE_LIMIT_ERROR',
    status: 429,
    retryAfter: 60
  },
  serviceUnavailable: {
    message: 'Service temporarily unavailable',
    code: 'SERVICE_UNAVAILABLE',
    status: 503
  }
}

// Mock Performance Data
const mockPerformanceData = {
  fastResponse: {
    responseTime: 500,
    processingTime: 450,
    timestamp: '2024-01-15T10:30:00Z'
  },
  slowResponse: {
    responseTime: 5000,
    processingTime: 4800,
    timestamp: '2024-01-15T10:30:00Z'
  },
  concurrentLoad: {
    totalRequests: 100,
    successfulRequests: 95,
    failedRequests: 5,
    averageResponseTime: 800,
    percentile95: 1200,
    percentile99: 1500
  }
}

// Factory Functions for Dynamic Mock Data
class MockDataFactory {
  static createRandomTrip(overrides = {}) {
    return TestDataFactory.createTripRequest(overrides)
  }

  static createRandomUser(overrides = {}) {
    return TestDataFactory.createUser(overrides)
  }

  static createChatMessage(overrides = {}) {
    return {
      id: `msg-${Date.now()}`,
      content: TestDataFactory.createChatMessage(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      ...overrides
    }
  }

  static createApiResponse(endpoint, status = 'success', overrides = {}) {
    const baseResponse = mockApiResponses[endpoint]?.[status] || {}
    return { ...baseResponse, ...overrides }
  }

  static createExternalServiceResponse(service, operation, status = 'success', overrides = {}) {
    const baseResponse = mockExternalServices[service]?.[operation]?.[status] || {}
    return { ...baseResponse, ...overrides }
  }

  static createErrorResponse(errorType, overrides = {}) {
    return { ...mockErrors[errorType], ...overrides }
  }

  static createBulkData(count, factoryMethod, overrides = {}) {
    return Array.from({ length: count }, (_, index) =>
      factoryMethod({ ...overrides, index, id: `${overrides.prefix || 'mock'}_${index}` })
    )
  }

  static createDatabaseRecord(table, overrides = {}) {
    const baseRecord = mockDatabaseRecords[table]?.[0] || {}
    return { ...baseRecord, ...overrides }
  }
}

// Export everything
module.exports = {
  mockApiResponses,
  mockDatabaseRecords,
  mockExternalServices,
  mockErrors,
  mockPerformanceData,
  MockDataFactory
}