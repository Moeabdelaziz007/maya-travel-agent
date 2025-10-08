/**
 * Comprehensive Conversation Manager for Maya Travel Agent
 * Handles conversation state, context, and history
 */

const logger = require('./logger');
const SupabaseDB = require('../database/supabase');

class ConversationManager {
  constructor() {
    this.db = new SupabaseDB();
    this.activeConversations = new Map();
    this.conversationTimeout = 30 * 60 * 1000; // 30 minutes
    this.maxHistoryLength = 50;
    
    // Conversation states
    this.states = {
      IDLE: 'idle',
      COLLECTING_DESTINATION: 'collecting_destination',
      COLLECTING_DATES: 'collecting_dates',
      COLLECTING_BUDGET: 'collecting_budget',
      COLLECTING_PREFERENCES: 'collecting_preferences',
      GENERATING_PLAN: 'generating_plan',
      PAYMENT_FLOW: 'payment_flow',
      SUPPORT: 'support'
    };
    
    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Get or create conversation context
   */
  async getContext(userId) {
    // Check active conversations first
    if (this.activeConversations.has(userId)) {
      const context = this.activeConversations.get(userId);
      context.lastActivity = Date.now();
      return context;
    }

    // Load from database
    const profile = await this.db.getUserProfile(userId);
    const history = await this.db.getConversationHistory(userId, 20);

    const context = {
      userId,
      state: this.states.IDLE,
      data: {},
      history: history || [],
      profile: profile || null,
      lastActivity: Date.now(),
      metadata: {
        sessionStart: Date.now(),
        messageCount: 0,
        lastCommand: null
      }
    };

    this.activeConversations.set(userId, context);
    return context;
  }

  /**
   * Update conversation state
   */
  async setState(userId, newState, data = {}) {
    const context = await this.getContext(userId);
    
    logger.debug(`State transition: ${context.state} -> ${newState}`, {
      user_id: userId,
      data
    });

    context.state = newState;
    context.data = { ...context.data, ...data };
    context.lastActivity = Date.now();

    this.activeConversations.set(userId, context);
    return context;
  }

  /**
   * Add message to conversation history
   */
  async addMessage(userId, message, isUser = true) {
    const context = await this.getContext(userId);
    
    const messageObj = {
      message,
      is_user: isUser,
      timestamp: new Date().toISOString()
    };

    // Add to context history
    context.history.push(messageObj);
    
    // Trim history if too long
    if (context.history.length > this.maxHistoryLength) {
      context.history = context.history.slice(-this.maxHistoryLength);
    }

    context.metadata.messageCount++;
    context.lastActivity = Date.now();

    // Save to database
    await this.db.saveConversationMessage(userId, message, isUser);

    logger.botMessage(userId, isUser ? 'incoming' : 'outgoing', message);

    return context;
  }

  /**
   * Get conversation history
   */
  async getHistory(userId, limit = 20) {
    const context = await this.getContext(userId);
    return context.history.slice(-limit);
  }

  /**
   * Clear conversation history
   */
  async clearHistory(userId) {
    const context = await this.getContext(userId);
    context.history = [];
    context.state = this.states.IDLE;
    context.data = {};
    
    logger.info('Conversation history cleared', { user_id: userId });
    return context;
  }

  /**
   * Get conversation summary
   */
  async getSummary(userId) {
    const context = await this.getContext(userId);
    
    return {
      userId,
      state: context.state,
      messageCount: context.metadata.messageCount,
      sessionDuration: Date.now() - context.metadata.sessionStart,
      lastActivity: context.lastActivity,
      hasProfile: !!context.profile,
      dataCollected: Object.keys(context.data).length
    };
  }

  /**
   * Extract travel intent from conversation
   */
  analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Destination intent
    const destinations = ['تركيا', 'دبي', 'مصر', 'السعودية', 'ماليزيا', 'تايلاند', 'اليونان', 'إيطاليا'];
    const foundDestination = destinations.find(dest => lowerMessage.includes(dest.toLowerCase()));
    
    // Budget intent
    const budgetKeywords = ['ميزانية', 'سعر', 'تكلفة', 'كم', 'رخيص', 'غالي'];
    const hasBudgetIntent = budgetKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Date intent
    const dateKeywords = ['متى', 'تاريخ', 'موعد', 'يوم', 'شهر', 'أسبوع'];
    const hasDateIntent = dateKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Activity intent
    const activityKeywords = ['شاطئ', 'جبال', 'تسوق', 'مغامرة', 'استرخاء', 'ثقافة', 'تاريخ'];
    const foundActivity = activityKeywords.find(keyword => lowerMessage.includes(keyword));
    
    return {
      destination: foundDestination || null,
      hasBudgetIntent,
      hasDateIntent,
      activity: foundActivity || null,
      isQuestion: lowerMessage.includes('؟') || lowerMessage.includes('كيف') || lowerMessage.includes('ماذا'),
      isGreeting: lowerMessage.includes('مرحبا') || lowerMessage.includes('السلام') || lowerMessage.includes('أهلا')
    };
  }

  /**
   * Determine next action based on context
   */
  async getNextAction(userId, message) {
    const context = await this.getContext(userId);
    const intent = this.analyzeIntent(message);

    // State machine logic
    switch (context.state) {
      case this.states.IDLE:
        if (intent.destination) {
          return {
            action: 'collect_dates',
            nextState: this.states.COLLECTING_DATES,
            data: { destination: intent.destination }
          };
        }
        if (intent.hasBudgetIntent) {
          return {
            action: 'collect_budget',
            nextState: this.states.COLLECTING_BUDGET
          };
        }
        if (intent.isGreeting) {
          return {
            action: 'greet',
            nextState: this.states.IDLE
          };
        }
        return {
          action: 'ask_destination',
          nextState: this.states.COLLECTING_DESTINATION
        };

      case this.states.COLLECTING_DESTINATION:
        if (intent.destination) {
          return {
            action: 'collect_dates',
            nextState: this.states.COLLECTING_DATES,
            data: { destination: intent.destination }
          };
        }
        return {
          action: 'clarify_destination',
          nextState: this.states.COLLECTING_DESTINATION
        };

      case this.states.COLLECTING_DATES:
        return {
          action: 'collect_budget',
          nextState: this.states.COLLECTING_BUDGET,
          data: { dates: message }
        };

      case this.states.COLLECTING_BUDGET:
        return {
          action: 'collect_preferences',
          nextState: this.states.COLLECTING_PREFERENCES,
          data: { budget: message }
        };

      case this.states.COLLECTING_PREFERENCES:
        return {
          action: 'generate_plan',
          nextState: this.states.GENERATING_PLAN,
          data: { preferences: message }
        };

      case this.states.GENERATING_PLAN:
        return {
          action: 'show_plan',
          nextState: this.states.IDLE
        };

      default:
        return {
          action: 'default_response',
          nextState: this.states.IDLE
        };
    }
  }

  /**
   * Update user profile from conversation
   */
  async updateProfileFromConversation(userId) {
    const context = await this.getContext(userId);
    
    if (!context.profile) {
      // Create new profile
      await this.db.createUserProfile(userId, {
        preferences: context.data
      });
    } else {
      // Update existing profile
      await this.db.updateUserProfile(userId, {
        preferences: { ...context.profile.preferences, ...context.data }
      });
    }

    logger.info('Profile updated from conversation', {
      user_id: userId,
      data_keys: Object.keys(context.data)
    });
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId) {
    const context = await this.getContext(userId);
    const profile = context.profile;

    if (!profile) {
      return await this.db.getTravelOffers();
    }

    return await this.db.getPersonalizedOffers(userId);
  }

  /**
   * Cleanup inactive conversations
   */
  startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [userId, context] of this.activeConversations.entries()) {
        if (now - context.lastActivity > this.conversationTimeout) {
          this.activeConversations.delete(userId);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        logger.info(`Cleaned up ${cleaned} inactive conversations`);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get active conversation count
   */
  getActiveCount() {
    return this.activeConversations.size;
  }

  /**
   * Get conversation statistics
   */
  getStatistics() {
    const contexts = Array.from(this.activeConversations.values());
    
    return {
      activeConversations: contexts.length,
      totalMessages: contexts.reduce((sum, ctx) => sum + ctx.metadata.messageCount, 0),
      averageSessionDuration: contexts.length > 0
        ? contexts.reduce((sum, ctx) => sum + (Date.now() - ctx.metadata.sessionStart), 0) / contexts.length
        : 0,
      stateDistribution: contexts.reduce((acc, ctx) => {
        acc[ctx.state] = (acc[ctx.state] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// Singleton instance
const conversationManager = new ConversationManager();

module.exports = conversationManager;
