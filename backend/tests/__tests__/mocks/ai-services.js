/**
 * AI Services mocks for testing
 */

const mockZaiClient = jest.fn().mockImplementation(() => ({
  healthCheck: jest.fn().mockResolvedValue({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }),

  chat: jest.fn().mockResolvedValue({
    success: true,
    message: 'مرحبا! كيف يمكنني مساعدتك في رحلتك؟',
    usage: {
      prompt_tokens: 15,
      completion_tokens: 25,
      total_tokens: 40
    }
  }),

  analyzeIntent: jest.fn().mockImplementation((message) => {
    if (message.includes('سفر') || message.includes('رحلة')) {
      return {
        intent: 'travel_planning',
        confidence: 0.9,
        entities: {
          action: 'travel',
          destination: message.match(/إلى\s+([^\s]+)/)?.[1] || null
        }
      };
    }

    if (message.includes('ميزانية') || message.includes('سعر')) {
      return {
        intent: 'budget_inquiry',
        confidence: 0.85,
        entities: {
          action: 'budget',
          type: 'inquiry'
        }
      };
    }

    if (message.includes('متى') || message.includes('وقت')) {
      return {
        intent: 'time_inquiry',
        confidence: 0.8,
        entities: {
          action: 'time',
          type: 'inquiry'
        }
      };
    }

    return {
      intent: 'general_inquiry',
      confidence: 0.5,
      entities: {}
    };
  }),

  generateResponse: jest.fn().mockResolvedValue({
    success: true,
    response: 'هذا رد مولد من الذكاء الاصطناعي',
    suggestions: [
      'اقتراح 1',
      'اقتراح 2',
      'اقتراح 3'
    ]
  }),

  translateText: jest.fn().mockImplementation((text, targetLang) => {
    return Promise.resolve(`[${targetLang}] ${text}`);
  })
}));

const mockGeminiClient = jest.fn().mockImplementation(() => ({
  generateContent: jest.fn().mockResolvedValue({
    response: {
      text: () => 'رد من Gemini AI'
    }
  }),

  analyzeSentiment: jest.fn().mockResolvedValue({
    sentiment: 'positive',
    confidence: 0.8,
    score: 0.6
  }),

  extractEntities: jest.fn().mockResolvedValue({
    entities: [
      { type: 'location', value: 'تركيا' },
      { type: 'date', value: '2024' }
    ]
  })
}));

const mockTelegramBot = jest.fn().mockImplementation(() => ({
  sendMessage: jest.fn().mockResolvedValue({
    message_id: 123
  }),

  editMessageText: jest.fn().mockResolvedValue({
    message_id: 123
  }),

  deleteMessage: jest.fn().mockResolvedValue(true),

  sendPhoto: jest.fn().mockResolvedValue({
    message_id: 124
  }),

  onText: jest.fn(),

  on: jest.fn(),

  processUpdate: jest.fn()
}));

const mockWhatsAppClient = jest.fn().mockImplementation(() => ({
  sendMessage: jest.fn().mockResolvedValue({
    id: 'msg-123'
  }),

  sendTemplate: jest.fn().mockResolvedValue({
    id: 'template-123'
  }),

  markAsRead: jest.fn().mockResolvedValue(true),

  getProfile: jest.fn().mockResolvedValue({
    name: 'Test User',
    phone: '+1234567890'
  })
}));

describe('AI Services Mocks', () => {
  test('should export mock functions', () => {
    expect(typeof mockZaiClient).toBe('function');
    expect(typeof mockGeminiClient).toBe('function');
    expect(typeof mockTelegramBot).toBe('function');
    expect(typeof mockWhatsAppClient).toBe('function');
  });
});

module.exports = {
  mockZaiClient,
  mockGeminiClient,
  mockTelegramBot,
  mockWhatsAppClient
};