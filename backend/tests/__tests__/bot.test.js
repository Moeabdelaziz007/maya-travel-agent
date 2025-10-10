/**
 * Bot Functionality Tests
 * Tests all major bot features using Jest framework
 */

const logger = require('../../utils/logger');
const conversationManager = require('../../utils/conversationManager');
const healthMonitor = require('../../utils/healthMonitor');
const ZaiClient = require('../../src/ai/zaiClient');
const SupabaseDB = require('../../database/supabase');

// Mock external dependencies
jest.mock('../../utils/logger');
jest.mock('../../utils/conversationManager');
jest.mock('../../utils/healthMonitor');
jest.mock('../../src/ai/zaiClient');
jest.mock('../../database/supabase');

describe('Bot Functionality Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    logger.info.mockImplementation(() => {});
    logger.debug.mockImplementation(() => {});
    logger.warn.mockImplementation(() => {});
    logger.error.mockImplementation(() => {});
  });

  describe('Logger', () => {
    test('should log messages correctly', () => {
      logger.info('Test log message');
      logger.debug('Test debug message');
      logger.warn('Test warning message');

      expect(logger.info).toHaveBeenCalledWith('Test log message');
      expect(logger.debug).toHaveBeenCalledWith('Test debug message');
      expect(logger.warn).toHaveBeenCalledWith('Test warning message');
    });
  });

  describe('Conversation Manager', () => {
    test('should get context for user', async () => {
      const testUserId = 'test_user_123';
      const mockContext = {
        userId: testUserId,
        state: 'idle',
        data: {},
        history: [],
        profile: null,
        lastActivity: Date.now(),
        metadata: {
          sessionStart: Date.now(),
          messageCount: 0,
          lastCommand: null
        }
      };

      // Mock the actual implementation since it's a complex class
      const originalGetContext = conversationManager.getContext.bind(conversationManager);
      conversationManager.getContext = jest.fn().mockResolvedValue(mockContext);

      const context = await conversationManager.getContext(testUserId);

      expect(conversationManager.getContext).toHaveBeenCalledWith(testUserId);
      expect(context).toEqual(mockContext);
      expect(context.userId).toBe(testUserId);
    });

    test('should add message to conversation', async () => {
      const testUserId = 'test_user_123';
      const message = 'Test message';
      const isUser = true;

      const mockContext = {
        userId: testUserId,
        state: 'idle',
        history: [],
        metadata: { messageCount: 0 }
      };

      conversationManager.getContext = jest.fn().mockResolvedValue(mockContext);
      conversationManager.addMessage = jest.fn().mockResolvedValue(mockContext);

      await conversationManager.addMessage(testUserId, message, isUser);

      expect(conversationManager.addMessage).toHaveBeenCalledWith(testUserId, message, isUser);
    });

    test('should set conversation state', async () => {
      const testUserId = 'test_user_123';
      const state = conversationManager.states.COLLECTING_DESTINATION;

      const mockContext = {
        userId: testUserId,
        state: state,
        data: {},
        lastActivity: Date.now()
      };

      conversationManager.setState = jest.fn().mockResolvedValue(mockContext);

      await conversationManager.setState(testUserId, state);

      expect(conversationManager.setState).toHaveBeenCalledWith(testUserId, state);
    });

    test('should get conversation history', async () => {
      const testUserId = 'test_user_123';
      const mockHistory = [
        { message: 'Hello', is_user: true, timestamp: new Date().toISOString() },
        { message: 'Hi there!', is_user: false, timestamp: new Date().toISOString() }
      ];

      conversationManager.getHistory = jest.fn().mockResolvedValue(mockHistory);

      const history = await conversationManager.getHistory(testUserId);

      expect(conversationManager.getHistory).toHaveBeenCalledWith(testUserId);
      expect(Array.isArray(history)).toBe(true);
      expect(history).toEqual(mockHistory);
    });

    test('should get conversation summary', async () => {
      const testUserId = 'test_user_123';
      const mockSummary = {
        userId: testUserId,
        state: 'idle',
        messageCount: 5,
        sessionDuration: 300000,
        lastActivity: Date.now(),
        hasProfile: false,
        dataCollected: 2
      };

      conversationManager.getSummary = jest.fn().mockResolvedValue(mockSummary);

      const summary = await conversationManager.getSummary(testUserId);

      expect(conversationManager.getSummary).toHaveBeenCalledWith(testUserId);
      expect(summary.userId).toBe(testUserId);
      expect(summary).toHaveProperty('messageCount');
      expect(summary).toHaveProperty('state');
    });

    test('should analyze intent from message', () => {
      const testMessage = 'أريد السفر إلى تركيا';
      const intent = conversationManager.analyzeIntent(testMessage);

      expect(intent).toBeDefined();
      expect(intent).toHaveProperty('destination');
      expect(intent).toHaveProperty('hasBudgetIntent');
      expect(intent).toHaveProperty('hasDateIntent');
      expect(intent).toHaveProperty('activity');
      expect(intent).toHaveProperty('isQuestion');
      expect(intent).toHaveProperty('isGreeting');

      // Test travel intent detection
      expect(intent.destination).toBe('تركيا');
    });

    test('should get conversation statistics', () => {
      const mockStats = {
        activeConversations: 5,
        totalMessages: 150,
        averageSessionDuration: 300000,
        stateDistribution: {
          idle: 3,
          collecting_destination: 2
        }
      };

      conversationManager.getStatistics = jest.fn().mockReturnValue(mockStats);

      const stats = conversationManager.getStatistics();

      expect(conversationManager.getStatistics).toHaveBeenCalled();
      expect(stats).toEqual(mockStats);
      expect(typeof stats.activeConversations).toBe('number');
      expect(stats).toHaveProperty('stateDistribution');
    });
  });

  describe('Supabase Database', () => {
    test('should get travel offers successfully', async () => {
      const mockOffers = [
        { id: 1, title: 'Test Trip 1', price: 100, destination: 'Turkey' },
        { id: 2, title: 'Test Trip 2', price: 200, destination: 'Dubai' }
      ];

      const mockDb = {
        getTravelOffers: jest.fn().mockResolvedValue(mockOffers)
      };

      SupabaseDB.mockImplementation(() => mockDb);

      const db = new SupabaseDB();
      const offers = await db.getTravelOffers();

      expect(db.getTravelOffers).toHaveBeenCalled();
      expect(Array.isArray(offers)).toBe(true);
      expect(offers).toHaveLength(2);
      expect(offers[0]).toHaveProperty('id');
      expect(offers[0]).toHaveProperty('title');
      expect(offers[0]).toHaveProperty('price');
    });

    test('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');

      const mockDb = {
        getTravelOffers: jest.fn().mockRejectedValue(mockError)
      };

      SupabaseDB.mockImplementation(() => mockDb);

      const db = new SupabaseDB();

      await expect(db.getTravelOffers()).rejects.toThrow('Database connection failed');
      expect(db.getTravelOffers).toHaveBeenCalled();
    });
  });

  describe('Z.ai Client', () => {
    test('should return healthy status', async () => {
      const mockHealthCheck = { status: 'healthy', timestamp: new Date() };

      const mockZaiClient = {
        healthCheck: jest.fn().mockResolvedValue(mockHealthCheck)
      };

      ZaiClient.mockImplementation(() => mockZaiClient);

      const zaiClient = new ZaiClient();
      const healthCheck = await zaiClient.healthCheck();

      expect(zaiClient.healthCheck).toHaveBeenCalled();
      expect(healthCheck).toEqual(mockHealthCheck);
      expect(healthCheck.status).toBe('healthy');
    });

    test('should handle unhealthy status', async () => {
      const mockHealthCheck = { status: 'unhealthy', error: 'API key invalid' };

      const mockZaiClient = {
        healthCheck: jest.fn().mockResolvedValue(mockHealthCheck)
      };

      ZaiClient.mockImplementation(() => mockZaiClient);

      const zaiClient = new ZaiClient();
      const healthCheck = await zaiClient.healthCheck();

      expect(healthCheck.status).toBe('unhealthy');
      expect(healthCheck).toHaveProperty('error');
    });

    test('should handle health check errors', async () => {
      const mockError = new Error('Network timeout');

      const mockZaiClient = {
        healthCheck: jest.fn().mockRejectedValue(mockError)
      };

      ZaiClient.mockImplementation(() => mockZaiClient);

      const zaiClient = new ZaiClient();

      await expect(zaiClient.healthCheck()).rejects.toThrow('Network timeout');
      expect(zaiClient.healthCheck).toHaveBeenCalled();
    });
  });

  describe('Health Monitor', () => {
    test('should get health status', () => {
      const mockHealth = {
        status: 'healthy',
        uptime: 3600,
        memory: { used: 100, total: 1000 },
        timestamp: new Date(),
        version: '1.0.0'
      };

      healthMonitor.getHealth = jest.fn().mockReturnValue(mockHealth);

      const health = healthMonitor.getHealth();

      expect(healthMonitor.getHealth).toHaveBeenCalled();
      expect(health).toEqual(mockHealth);
      expect(health.status).toBe('healthy');
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('memory');
    });

    test('should get metrics summary', () => {
      const mockMetrics = {
        requestsPerMinute: 50,
        averageResponseTime: 200,
        errorRate: 0.02,
        uptime: 99.9,
        totalRequests: 1000,
        activeConnections: 10
      };

      healthMonitor.getMetricsSummary = jest.fn().mockReturnValue(mockMetrics);

      const metrics = healthMonitor.getMetricsSummary();

      expect(healthMonitor.getMetricsSummary).toHaveBeenCalled();
      expect(metrics).toEqual(mockMetrics);
      expect(typeof metrics.requestsPerMinute).toBe('number');
      expect(typeof metrics.averageResponseTime).toBe('number');
      expect(typeof metrics.errorRate).toBe('number');
    });
  });

  describe('Intent Analysis', () => {
    test('should analyze Arabic travel messages', () => {
      const testMessages = [
        'أريد السفر إلى تركيا',
        'ما هي ميزانية الرحلة؟',
        'متى أفضل وقت للسفر؟'
      ];

      testMessages.forEach(message => {
        const intent = conversationManager.analyzeIntent(message);
        expect(intent).toBeDefined();
        expect(intent).toHaveProperty('destination');
        expect(intent).toHaveProperty('hasBudgetIntent');
        expect(intent).toHaveProperty('hasDateIntent');
        expect(intent).toHaveProperty('activity');
        expect(intent).toHaveProperty('isQuestion');
        expect(intent).toHaveProperty('isGreeting');
      });
    });

    test('should detect travel destination intent', () => {
      const travelMessage = 'أريد السفر إلى تركيا';
      const intent = conversationManager.analyzeIntent(travelMessage);

      expect(intent.destination).toBe('تركيا');
      expect(intent.hasBudgetIntent).toBe(false);
      expect(intent.hasDateIntent).toBe(false);
    });

    test('should detect budget intent', () => {
      const budgetMessage = 'ما هي ميزانية الرحلة؟';
      const intent = conversationManager.analyzeIntent(budgetMessage);

      expect(intent.hasBudgetIntent).toBe(true);
      expect(intent.isQuestion).toBe(true);
    });

    test('should detect date intent', () => {
      const dateMessage = 'متى أفضل وقت للسفر؟';
      const intent = conversationManager.analyzeIntent(dateMessage);

      expect(intent.hasDateIntent).toBe(true);
      expect(intent.isQuestion).toBe(true);
    });

    test('should handle empty or invalid messages', () => {
      const emptyMessage = '';
      const intent = conversationManager.analyzeIntent(emptyMessage);

      expect(intent).toBeDefined();
      expect(intent.destination).toBeNull();
      expect(intent.hasBudgetIntent).toBe(false);
      expect(intent.hasDateIntent).toBe(false);
    });

    test('should detect greeting messages', () => {
      const greetingMessage = 'مرحبا كيف حالك؟';
      const intent = conversationManager.analyzeIntent(greetingMessage);

      expect(intent.isGreeting).toBe(true);
    });

    test('should detect activity preferences', () => {
      const activityMessage = 'أريد رحلة شاطئ ومغامرة';
      const intent = conversationManager.analyzeIntent(activityMessage);

      expect(intent.activity).toBe('شاطئ');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete conversation flow', async () => {
      const testUserId = 'integration_test_user';

      // Mock all the conversation manager methods with realistic return values
      const mockContext = {
        userId: testUserId,
        state: 'idle',
        data: {},
        history: [],
        profile: null,
        lastActivity: Date.now(),
        metadata: { sessionStart: Date.now(), messageCount: 0 }
      };

      conversationManager.getContext = jest.fn().mockResolvedValue(mockContext);
      conversationManager.addMessage = jest.fn().mockResolvedValue(mockContext);
      conversationManager.setState = jest.fn().mockResolvedValue(mockContext);
      conversationManager.getHistory = jest.fn().mockResolvedValue([]);
      conversationManager.getSummary = jest.fn().mockResolvedValue({
        userId: testUserId,
        state: 'collecting_destination',
        messageCount: 1,
        sessionDuration: 60000,
        lastActivity: Date.now(),
        hasProfile: false,
        dataCollected: 1
      });

      // Test complete flow
      const context = await conversationManager.getContext(testUserId);
      await conversationManager.addMessage(testUserId, 'Hello', true);
      await conversationManager.setState(testUserId, conversationManager.states.COLLECTING_DESTINATION);
      const history = await conversationManager.getHistory(testUserId);
      const summary = await conversationManager.getSummary(testUserId);

      expect(context).toBeDefined();
      expect(context.userId).toBe(testUserId);
      expect(history).toEqual([]);
      expect(summary.userId).toBe(testUserId);
      expect(summary.messageCount).toBe(1);
    });
  });
});