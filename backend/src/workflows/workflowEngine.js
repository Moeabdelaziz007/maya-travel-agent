/**
 * Workflow Engine - Processes messages and executes workflows
 */

const skillRegistry = require('./skillRegistry');
const logger = require('../utils/logger');

class WorkflowEngine {
  constructor() {
    this.sessions = new Map();
  }

  async processMessage(sessionId, message, context = {}) {
    try {
      // Get or create session
      let session = this.sessions.get(sessionId);
      if (!session) {
        session = {
          id: sessionId,
          messages: [],
          context: {},
          createdAt: Date.now()
        };
        this.sessions.set(sessionId, session);
      }

      // Store message
      session.messages.push({ text: message, timestamp: Date.now() });

      // Simple intent detection
      const intent = this.detectIntent(message);

      // Execute skill
      const result = await skillRegistry.execute(intent, { message }, session.context);

      logger.info('Workflow processed', { sessionId, intent });

      return {
        intent,
        result,
        sessionId
      };

    } catch (error) {
      logger.error('Workflow error', { error: error.message });
      return {
        error: error.message,
        sessionId
      };
    }
  }

  detectIntent(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('رحلة') || lower.includes('trip') || lower.includes('تخطيط')) {
      return 'plan_trip';
    }
    if (lower.includes('طيران') || lower.includes('flight')) {
      return 'search_flights';
    }
    if (lower.includes('ميزانية') || lower.includes('budget')) {
      return 'calculate_budget';
    }
    if (lower.includes('معلومات') || lower.includes('info')) {
      return 'get_destination_info';
    }
    if (lower.includes('طقس') || lower.includes('weather')) {
      return 'get_weather';
    }
    
    return 'simple_response';
  }
}

module.exports = new WorkflowEngine();
