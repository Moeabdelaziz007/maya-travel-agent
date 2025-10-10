/**
 * Backend Test Utilities and Helpers
 * Provides utilities for enhanced backend testing
 */

const axios = require('axios');
const Joi = require('joi');

// Test data factories
class TestDataFactory {
  static createUser(overrides = {}) {
    const baseUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: 'أحمد',
      lastName: 'محمد',
      email: `test.user.${Date.now()}@example.com`,
      phone: '+966501234567',
      preferences: {
        language: 'ar',
        currency: 'SAR',
        tripTypes: ['cultural', 'adventure'],
        budgetRange: { min: 1000, max: 5000 }
      },
      tier: 'standard',
      createdAt: new Date().toISOString(),
      ...overrides
    }

    return baseUser
  }

  static createTripRequest(overrides = {}) {
    const destinations = ['Tokyo', 'Dubai', 'Istanbul', 'Paris', 'London', 'New York', 'Barcelona', 'Rome']
    const messages = [
      'أريد رحلة إلى دبي لشخصين',
      'أخطط لرحلة عائلية إلى اسطنبول',
      'أبحث عن رحلة اقتصادية إلى لندن',
      'أريد قضاء إجازة في باريس',
      'رحلة عمل إلى نيويورك'
    ]

    const baseRequest = {
      message: messages[Math.floor(Math.random() * messages.length)],
      userId: `user_${Date.now()}`,
      origin: 'الرياض',
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      departure_date: this.generateFutureDate(),
      return_date: this.generateFutureDate(7),
      travelers: Math.floor(Math.random() * 4) + 1,
      budget: Math.floor(Math.random() * 4000) + 1000,
      tripType: 'cultural',
      preferences: {
        accommodation: 'hotel',
        meal_plan: 'breakfast',
        pace: 'moderate'
      },
      ...overrides
    }

    return baseRequest
  }

  static createChatMessage(overrides = {}) {
    const messages = [
      'مرحباً مايا! كيف حالك؟',
      'ما هي أفضل الأماكن السياحية في دبي؟',
      'أحتاج مساعدة في حجز فندق',
      'متحمس جداً للرحلة!',
      'هل يمكنك اقتراح خط سير للرحلة؟',
      'أشعر بالقلق من السفر لوحدي',
      'شكراً لمساعدتك مايا!'
    ]

    const baseMessage = {
      message: messages[Math.floor(Math.random() * messages.length)],
      userId: `user_${Date.now()}`,
      conversationId: `conv_${Date.now()}`,
      language: 'ar',
      timestamp: new Date().toISOString(),
      ...overrides
    }

    return baseMessage
  }

  static createSkillExecutionRequest(skillName, overrides = {}) {
    const skillRequests = {
      EmpathyDetection: {
        message: 'أشعر بالقلق من السفر لوحدي',
        language: 'ar',
        context: 'trip_planning'
      },
      PersonalizedFriendship: {
        userId: `user_${Date.now()}`,
        userName: 'أحمد',
        message: 'مرحباً مايا',
        interactionCount: 1
      },
      DynamicVoiceAdaptation: {
        emotional_context: {
          primary_emotion: 'excitement',
          confidence: 0.8
        },
        friendship_level: 'new_acquaintance',
        situation: 'general'
      }
    }

    const baseRequest = {
      skillName,
      context: skillRequests[skillName] || {},
      startTime: Date.now(),
      ...overrides
    }

    return baseRequest
  }

  static generateFutureDate(daysFromNow = 1) {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
  }

  static createBulkTestData(count, factoryMethod, overrides = {}) {
    return Array.from({ length: count }, (_, index) =>
      factoryMethod({ ...overrides, index, id: `${overrides.prefix || 'test'}_${index}` })
    )
  }
}

// API test client
class ApiTestClient {
  constructor(baseURL = 'http://localhost:3001', apiKey = 'test-key') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    })
  }

  async post(endpoint, data = {}) {
    const response = await this.client.post(endpoint, data)
    return response
  }

  async get(endpoint, params = {}) {
    const response = await this.client.get(endpoint, { params })
    return response
  }

  async put(endpoint, data = {}) {
    const response = await this.client.put(endpoint, data)
    return response
  }

  async delete(endpoint) {
    const response = await this.client.delete(endpoint)
    return response
  }

  // Specialized methods for common operations
  async planTrip(tripRequest) {
    return this.post('/api/orchestration/plan-trip', tripRequest)
  }

  async sendChatMessage(chatMessage) {
    return this.post('/api/orchestration/chat', chatMessage)
  }

  async getHealth() {
    return this.get('/api/orchestration/health')
  }

  async getSkills() {
    return this.get('/api/orchestration/skills')
  }

  async executeSkill(skillName, context) {
    return this.post(`/api/orchestration/skills/${skillName}/execute`, context)
  }
}

// Response validators
class ResponseValidator {
  static validateTripPlanningResponse(response) {
    const schema = Joi.object({
      success: Joi.boolean().valid(true).required(),
      data: Joi.object({
        tripId: Joi.string().required(),
        destination: Joi.string().required(),
        itinerary: Joi.array().items(
          Joi.object({
            day: Joi.number().integer().positive().required(),
            activities: Joi.array().items(Joi.string()).required(),
            meals: Joi.array().items(Joi.string()).optional()
          })
        ).required(),
        estimatedCost: Joi.number().positive().required(),
        recommendations: Joi.array().items(Joi.string()).optional()
      }).required(),
      metadata: Joi.object({
        requestId: Joi.string().required(),
        responseTime: Joi.number().positive().required(),
        processingTime: Joi.number().positive().required(),
        enhanced: Joi.boolean().valid(true).required(),
        skills_enabled: Joi.boolean().valid(true).required()
      }).required()
    })

    return this.validateSchema(response.data, schema, 'Trip Planning Response')
  }

  static validateChatResponse(response) {
    const schema = Joi.object({
      success: Joi.boolean().valid(true).required(),
      reply: Joi.string().required(),
      conversationId: Joi.string().optional(),
      emotional_context: Joi.object({
        primary_emotion: Joi.string().required(),
        confidence: Joi.number().min(0).max(1).required(),
        suggested_tone: Joi.string().required()
      }).optional(),
      friendship_level: Joi.string().optional(),
      metadata: Joi.object({
        requestId: Joi.string().required(),
        responseTime: Joi.number().positive().required()
      }).required()
    })

    return this.validateSchema(response.data, schema, 'Chat Response')
  }

  static validateHealthResponse(response) {
    const schema = Joi.object({
      success: Joi.boolean().valid(true).required(),
      health: Joi.object({
        overall_status: Joi.string().valid('healthy', 'degraded', 'unhealthy').required(),
        boss_agent: Joi.object({
          status: Joi.string().valid('connected', 'disconnected', 'error').required()
        }).required(),
        skill_system: Joi.object({
          status: Joi.string().valid('operational', 'degraded', 'failed').required(),
          skills_loaded: Joi.number().integer().min(0).required()
        }).required(),
        cache: Joi.object({
          status: Joi.string().valid('connected', 'disconnected', 'error').required()
        }).required()
      }).required(),
      timestamp: Joi.string().isoDate().required()
    })

    return this.validateSchema(response.data, schema, 'Health Response')
  }

  static validateErrorResponse(response, expectedStatus = 400) {
    const schema = Joi.object({
      success: Joi.boolean().valid(false).required(),
      error: Joi.string().required(),
      metadata: Joi.object({
        requestId: Joi.string().optional(),
        processingTime: Joi.number().positive().optional(),
        enhanced: Joi.boolean().valid(true).optional()
      }).optional()
    })

    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`)
    }

    return this.validateSchema(response.data, schema, 'Error Response')
  }

  static validateSchema(data, schema, schemaName) {
    const { error } = schema.validate(data, {
      allowUnknown: false,
      stripUnknown: false
    })

    if (error) {
      throw new Error(`${schemaName} validation failed: ${error.details[0].message}`)
    }

    return true
  }
}

// Performance measurement utilities
class PerformanceUtils {
  static async measureExecutionTime(operation) {
    const startTime = process.hrtime.bigint()
    const result = await operation()
    const endTime = process.hrtime.bigint()
    const executionTime = Number(endTime - startTime) / 1000000 // Convert to milliseconds

    return {
      result,
      executionTime,
      startTime: new Date().toISOString()
    }
  }

  static async measureConcurrentOperations(operations, concurrency = 5) {
    const results = []
    const batches = []

    // Split operations into batches
    for (let i = 0; i < operations.length; i += concurrency) {
      batches.push(operations.slice(i, i + concurrency))
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async (operation, index) => {
        const measurement = await this.measureExecutionTime(operation)
        return { ...measurement, batchIndex: batches.indexOf(batch), operationIndex: index }
      })

      const batchResults = await Promise.allSettled(batchPromises)

      results.push(...batchResults.map(result =>
        result.status === 'fulfilled'
          ? result.value
          : { error: result.reason, executionTime: 0 }
      ))
    }

    return results
  }

  static calculatePerformanceStats(measurements) {
    const executionTimes = measurements
      .filter(m => !m.error)
      .map(m => m.executionTime)

    if (executionTimes.length === 0) {
      return {
        total: measurements.length,
        successful: 0,
        failed: measurements.length,
        averageTime: 0,
        minTime: 0,
        maxTime: 0,
        percentiles: {}
      }
    }

    executionTimes.sort((a, b) => a - b)

    return {
      total: measurements.length,
      successful: executionTimes.length,
      failed: measurements.length - executionTimes.length,
      averageTime: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
      minTime: executionTimes[0],
      maxTime: executionTimes[executionTimes.length - 1],
      percentiles: {
        p50: executionTimes[Math.floor(executionTimes.length * 0.5)],
        p90: executionTimes[Math.floor(executionTimes.length * 0.9)],
        p95: executionTimes[Math.floor(executionTimes.length * 0.95)],
        p99: executionTimes[Math.floor(executionTimes.length * 0.99)]
      }
    }
  }
}

// Mock utilities
class MockUtils {
  static createMockSupabaseClient() {
    const data = new Map()

    return {
      from: (table) => ({
        select: (columns) => ({
          eq: (key, value) => ({
            single: async () => ({
              data: data.get(`${table}_${key}_${value}`) || null,
              error: null
            })
          }),
          upsert: async (data) => ({
            error: null
          })
        }),
        insert: async (data) => ({
          error: null
        }),
        update: async (data) => ({
          eq: (key, value) => ({
            error: null
          })
        }),
        delete: async () => ({
          eq: (key, value) => ({
            error: null
          })
        })
      }),
      setTestData: (table, key, value, data) => {
        data.set(`${table}_${key}_${value}`, data)
      }
    }
  }

  static createMockBossAgent() {
    return {
      orchestrate: async (request, context) => ({
        success: true,
        data: {
          tripId: 'mock-trip-123',
          destination: request.destination || 'Test Destination',
          itinerary: [
            {
              day: 1,
              activities: ['Mock Activity 1', 'Mock Activity 2'],
              meals: ['Breakfast', 'Dinner']
            }
          ],
          estimatedCost: 2000,
          recommendations: ['Mock recommendation']
        },
        metadata: {
          requestId: context?.requestId || 'mock-req-123',
          responseTime: 1500,
          processingTime: 1500,
          enhanced: true,
          skills_enabled: true,
          agents: ['mock_agent'],
          skillsUsed: ['EmpathyDetection']
        }
      }),
      skillSystem: {
        executeSkill: async (skillName, context) => ({
          success: true,
          data: {
            primary_emotion: 'excitement',
            confidence: 0.8,
            suggested_tone: 'enthusiastic_welcoming'
          }
        }),
        listSkills: () => [
          {
            name: 'EmpathyDetection',
            description: 'Detects user emotions',
            version: '1.0.0',
            enabled: true,
            capabilities: ['emotion_detection']
          }
        ]
      },
      getConversationStateById: (id) => ({
        conversationId: id,
        interactionCount: 1,
        friendshipLevel: 'new_acquaintance',
        history: []
      })
    }
  }
}

// Database test utilities
class DatabaseTestUtils {
  static async cleanupTestUsers(connection) {
    // Implementation depends on your database
    console.log('Cleaning up test users...')
  }

  static async cleanupTestTrips(connection) {
    // Implementation depends on your database
    console.log('Cleaning up test trips...')
  }

  static async cleanupTestConversations(connection) {
    // Implementation depends on your database
    console.log('Cleaning up test conversations...')
  }

  static async seedTestUsers(connection, count = 5) {
    // Implementation depends on your database
    console.log(`Seeding ${count} test users...`)
  }
}

// Configuration utilities
class TestConfigUtils {
  static getTestConfig() {
    return {
      api: {
        baseURL: process.env.TEST_API_URL || 'http://localhost:3001',
        timeout: parseInt(process.env.TEST_API_TIMEOUT || '30000'),
        retries: parseInt(process.env.TEST_API_RETRIES || '3')
      },
      database: {
        url: process.env.TEST_DB_URL || 'postgresql://localhost:5432/test',
        poolSize: parseInt(process.env.TEST_DB_POOL_SIZE || '10')
      },
      performance: {
        maxResponseTime: parseInt(process.env.TEST_MAX_RESPONSE_TIME || '10000'),
        maxConcurrentUsers: parseInt(process.env.TEST_MAX_CONCURRENT_USERS || '50')
      },
      environment: process.env.TEST_ENV || 'development'
    }
  }

  static isCI() {
    return process.env.CI === 'true'
  }

  static shouldRunPerformanceTests() {
    return process.env.RUN_PERFORMANCE_TESTS === 'true'
  }

  static shouldRunIntegrationTests() {
    return process.env.RUN_INTEGRATION_TESTS !== 'false'
  }
}

// Export all utilities
module.exports = {
  TestDataFactory,
  ApiTestClient,
  ResponseValidator,
  PerformanceUtils,
  MockUtils,
  DatabaseTestUtils,
  TestConfigUtils
}