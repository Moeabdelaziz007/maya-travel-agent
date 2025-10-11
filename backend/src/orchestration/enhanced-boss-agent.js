/**
 * Enhanced Boss Agent - Boss Agent + Skill Plugin System Integration
 * Combines intelligent orchestration with emotional intelligence
 */

const BossAgent = require('./boss-agent');
const SkillSystem = require('../skills/skill-system');
const EmpathyDetectionSkill = require('../skills/empathy-detection-skill');
const PersonalizedFriendshipSkill = require('../skills/personalized-friendship-skill');
const DynamicVoiceAdaptationSkill = require('../skills/dynamic-voice-adaptation-skill');
const HybridCache = require('../cache/hybrid-cache');
const ServiceBus = require('../services/service-bus');
const { registerDummyAgents } = require('../agents/dummy-agents');
const logger = require('../utils/logger');

class EnhancedBossAgent extends BossAgent {
  constructor(config = {}) {
    super(config);

    // Initialize enhanced systems
    this.skillSystem = new SkillSystem({
      storage: config.storage,
      jsonbinApiKey: config.jsonbinApiKey || process.env.JSONBIN_API_KEY,
      enablePersistence: config.enableSkillPersistence !== false,
      serviceBus: this.serviceBus // Share Service Bus instance
    });

    // Use hybrid cache for resilience
    this.hybridCache = new HybridCache({
      apiKey: config.jsonbinApiKey || process.env.JSONBIN_API_KEY,
      testMode: config.testMode || process.env.NODE_ENV === 'test'
    });

    // Initialize Service Bus for event streaming
    this.serviceBus = new ServiceBus({
      bootstrapServers: config.confluentBootstrapServers,
      saslUsername: config.confluentSaslUsername,
      saslPassword: config.confluentSaslPassword,
      groupId: config.confluentGroupId || 'amrikyy-enhanced-boss-agent'
    });

    // Register core skills
    this.registerCoreSkills();

    // Register mock agents for testing (if in test mode)
    if (config.testMode || process.env.NODE_ENV === 'test') {
      this.registerMockAgents();
    }

    // Initialize Service Bus and Skill System event subscriptions
    // This will be called via initialize() method

    // Enhanced conversation states with skills
    this.enhancedConversationStates = new Map();

    // Service Bus will be initialized later via initialize() method

    logger.info('🚀 Enhanced Boss Agent initialized with Skill System', {
      skillsRegistered: this.skillSystem.listSkills().length,
      agentsRegistered: this.agents.size,
      cacheEnabled: !!this.hybridCache.apiKey,
      eventStreamingEnabled: this.serviceBus.isConnected
    });
  }

  /**
   * Initialize async components (Service Bus connection)
   */
  async initialize() {
    // Connect to Service Bus if credentials are available
    if (process.env.CONFLUENT_BOOTSTRAP_SERVERS &&
        process.env.CONFLUENT_SASL_USERNAME &&
        process.env.CONFLUENT_SASL_PASSWORD) {
      try {
        await this.serviceBus.connect();
        await this.serviceBus.createTopics();
        logger.info('✅ Service Bus connected and topics created');

        // Initialize Skill System with Service Bus
        await this.skillSystem.initialize();
        logger.info('✅ Skill System initialized with event subscriptions');

      } catch (error) {
        logger.warn('⚠️ Service Bus/Skill System initialization failed, continuing without event streaming:', error.message);
      }
    } else {
      logger.info('ℹ️ Service Bus credentials not configured, event streaming disabled');
    }
  }

  /**
   * Register core skills for enhanced functionality
   */
  registerCoreSkills() {
    try {
      this.skillSystem.registerSkill(new EmpathyDetectionSkill());
      this.skillSystem.registerSkill(new PersonalizedFriendshipSkill(this.storage));
      this.skillSystem.registerSkill(new DynamicVoiceAdaptationSkill());

      logger.info('✅ Core skills registered successfully');
    } catch (error) {
      logger.error('❌ Failed to register core skills:', error.message);
      throw error;
    }
  }

  /**
   * Register mock agents for testing
   */
  registerMockAgents() {
    try {
      // Use Amadeus Flight Agent for production flight search
      const AmadeusFlightAgent = require('../agents/amadeus-flight-agent');
      this.registerAgent('flight_search', new AmadeusFlightAgent());

      // Keep mock flight agent as fallback
      const MockFlightAgent = require('../agents/mock-flight-agent');
      this.registerAgent('mock_flight_search', new MockFlightAgent());

      // Register additional mock agents for testing
      this.registerAgent('hotel_search', {
        execute: async (context) => ({
          agent: 'hotel_search',
          success: true,
          results: [
            { name: 'Test Hotel', price: 200, rating: 4.5 },
            { name: 'Another Hotel', price: 150, rating: 4.0 }
          ]
        }),
        capabilities: ['hotel_search'],
        priority: 1
      });

      this.registerAgent('conversation', {
        execute: async (context) => ({
          agent: 'conversation',
          success: true,
          data: { context: 'enhanced' }
        }),
        capabilities: ['conversation'],
        priority: 1
      });

      logger.info('✅ Mock agents registered for testing');
    } catch (error) {
      logger.warn('⚠️ Mock agents not available for testing:', error.message);
    }
  }

  /**
   * Enhanced orchestration with skill system integration
   */
  async orchestrate(request, context = {}) {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.metrics.totalRequests++;

    try {
      logger.info(`🎯 Enhanced orchestration started: ${requestId}`, {
        userId: context.userId,
        messageLength: request.message?.length || 0
      });

      // Step 1: Enhanced analysis with skills
      const analysis = await this.analyzeRequestWithSkills(request, context);
      logger.info(`📊 Enhanced analysis completed: ${requestId}`, {
        intent: analysis.intent,
        emotional_state: analysis.emotional_state?.primary_emotion,
        friendship_level: analysis.friendship_context?.friendship_level
      });

      // Step 2: Execute agents with skill context
      const agentResults = await this.executeAgentsWithSkills(analysis, context);
      logger.info(`⚡ Agents executed with skills: ${requestId}`, {
        resultCount: agentResults.length,
        successful: agentResults.filter(r => r.success).length
      });

      // Step 3: Synthesize with emotional intelligence
      const synthesizedResult = await this.synthesizeWithSkills(
        agentResults,
        analysis,
        context
      );

      // Step 4: Post-processing with voice adaptation
      const finalResult = await this.postProcessWithSkills(synthesizedResult, analysis, context);

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, true);

      // Publish orchestration result to event stream
      if (this.serviceBus.isConnected) {
        try {
          await this.serviceBus.publishOrchestrationResult({
            success: true,
            data: finalResult,
            metadata: {
              requestId,
              responseTime,
              agentsUsed: analysis.executionPlan?.agents?.map(a => a.name) || [],
              skillsUsed: analysis.skills_used || [],
              strategy: analysis.executionPlan?.strategy || 'parallel',
              emotional_context: analysis.emotional_state,
              friendship_context: analysis.friendship_context
            }
          }, {
            userId: context.userId,
            sessionId: context.sessionId,
            userName: context.userName
          });
        } catch (error) {
          logger.warn('⚠️ Failed to publish orchestration result:', error.message);
        }
      }

      // Emit success event with enhanced data
      this.emit('request:complete', {
        requestId,
        analysis,
        result: finalResult,
        responseTime,
        agentResults,
        skillsUsed: analysis.skills_used || []
      });

      logger.info(`✅ Enhanced orchestration completed: ${requestId}`, {
        responseTime,
        success: true,
        skillsApplied: analysis.skills_used?.length || 0
      });

      return {
        success: true,
        data: finalResult,
        metadata: {
          requestId,
          responseTime,
          agentsUsed: analysis.executionPlan?.agents?.map(a => a.name) || [],
          skillsUsed: analysis.skills_used || [],
          strategy: analysis.executionPlan?.strategy || 'parallel',
          emotional_context: analysis.emotional_state,
          friendship_context: analysis.friendship_context
        }
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error(`❌ Enhanced orchestration failed: ${requestId}`, {
        error: error.message,
        stack: error.stack,
        responseTime
      });

      this.updateMetrics(responseTime, false);
      this.emit('request:failed', { requestId, error, responseTime });

      // Attempt enhanced fallback strategy
      return this.handleEnhancedFailure(request, context, error);
    }
  }

  /**
   * Enhanced request analysis with skill system
   */
  async analyzeRequestWithSkills(request, context) {
    // Base analysis from Boss Agent
    const analysis = await super.analyzeRequest(request, context);

    // Add emotional intelligence
    const empathyResult = await this.skillSystem.executeSkill('EmpathyDetection', {
      message: request.message,
      language: this.detectLanguage(request.message),
      startTime: Date.now()
    });

    if (empathyResult.success) {
      analysis.emotional_state = empathyResult.data;
      analysis.skills_used = (analysis.skills_used || []).concat('EmpathyDetection');

      // Publish user emotion event
      if (this.serviceBus.isConnected) {
        try {
          await this.serviceBus.publishUserEmotion(empathyResult.data, {
            userId: context.userId,
            userName: context.userName,
            message: request.message,
            sessionId: context.sessionId
          });
        } catch (error) {
          logger.warn('⚠️ Failed to publish user emotion:', error.message);
        }
      }
    }

    // Add friendship context
    const friendshipResult = await this.skillSystem.executeSkill('PersonalizedFriendship', {
      userId: context.userId,
      userName: context.userName,
      message: request.message,
      conversationHistory: context.conversationHistory || [],
      startTime: Date.now()
    });

    if (friendshipResult.success) {
      analysis.friendship_context = friendshipResult.data;
      analysis.skills_used = (analysis.skills_used || []).concat('PersonalizedFriendship');
    }

    // Enhanced intent detection with emotional context
    analysis.intent = this.refineIntentWithEmotions(analysis.intent, analysis.emotional_state);

    // Enhanced complexity assessment with emotional factors
    analysis.complexity = this.refineComplexityWithEmotions(analysis.complexity, analysis.emotional_state);

    return analysis;
  }

  /**
   * Detect language from message
   */
  detectLanguage(message) {
    if (!message) return 'en';

    // Simple Arabic detection
    const arabicChars = message.match(/[\u0600-\u06FF]/g);
    return arabicChars && arabicChars.length > message.length * 0.3 ? 'ar' : 'en';
  }

  /**
   * Refine intent based on emotional state
   */
  refineIntentWithEmotions(baseIntent, emotionalState) {
    if (!emotionalState) return baseIntent;

    const emotion = emotionalState.primary_emotion;
    const intensity = emotionalState.intensity;

    // Adjust intent based on emotion
    if (emotion === 'anxiety' && intensity === 'high') {
      return 'support'; // Provide more hand-holding
    }

    if (emotion === 'excitement' && intensity === 'high') {
      return 'celebration'; // Share excitement
    }

    if (emotion === 'confusion' && intensity === 'high') {
      return 'education'; // Provide clear explanations
    }

    return baseIntent;
  }

  /**
   * Refine complexity based on emotional state
   */
  refineComplexityWithEmotions(baseComplexity, emotionalState) {
    if (!emotionalState) return baseComplexity;

    const emotion = emotionalState.primary_emotion;

    // Adjust complexity based on emotion
    if (emotion === 'anxiety' || emotion === 'confusion') {
      return baseComplexity === 'low' ? 'low' : 'medium'; // Simplify if possible
    }

    if (emotion === 'excitement' && baseComplexity === 'medium') {
      return 'low'; // Can handle more complexity when excited
    }

    return baseComplexity;
  }

  /**
   * Execute agents with skill-enhanced context
   */
  async executeAgentsWithSkills(analysis, context) {
    // Enhance context with skill data
    const enhancedContext = {
      ...context,
      emotional_state: analysis.emotional_state,
      friendship_context: analysis.friendship_context,
      skills_context: {
        empathy: analysis.emotional_state,
        friendship: analysis.friendship_context
      }
    };

    // Execute agents with enhanced context
    const executionPlan = await this.createExecutionPlan(analysis);
    return this.executeAgents(executionPlan, enhancedContext);
  }

  /**
   * Synthesize results with emotional intelligence
   */
  async synthesizeWithSkills(agentResults, analysis, context) {
    // Base synthesis from Boss Agent
    const baseResult = await super.synthesizeResults(agentResults, analysis, context);

    // Enhance with skill-based insights
    if (analysis.emotional_state) {
      baseResult.emotional_enhancements = {
        tone_suggestion: analysis.emotional_state.suggested_tone,
        empathy_insights: analysis.emotional_state.empathy_insights,
        requires_special_handling: analysis.emotional_state.requires_special_handling
      };
    }

    if (analysis.friendship_context) {
      baseResult.friendship_enhancements = {
        relationship_level: analysis.friendship_context.friendship_level,
        personalization_level: analysis.friendship_context.response_style?.personalization,
        greeting: analysis.friendship_context.personalized_greeting
      };
    }

    return baseResult;
  }

  /**
   * Post-process with voice adaptation
   */
  async postProcessWithSkills(result, analysis, context) {
    const skillStartTime = Date.now();

    // Base post-processing from Boss Agent
    const baseResult = await super.postProcess(result, context);

    // Apply voice adaptation if skills are available
    try {
      const voiceResult = await this.skillSystem.executeSkill('DynamicVoiceAdaptation', {
        emotional_context: analysis.emotional_state,
        friendship_level: analysis.friendship_context?.friendship_level,
        situation: this.determineSituation(analysis, context),
        user_culture: context.userCulture || 'mixed',
        time_of_day: this.getTimeOfDay(),
        startTime: Date.now()
      });

      if (voiceResult.success) {
        baseResult.voice_adaptation = voiceResult.data;
        baseResult.skills_used = (baseResult.skills_used || []).concat('DynamicVoiceAdaptation');

        // Publish skill execution event
        if (this.serviceBus.isConnected) {
          try {
            await this.serviceBus.publishSkillExecution('DynamicVoiceAdaptation', {
              success: true,
              input: {
                emotional_context: analysis.emotional_state,
                friendship_level: analysis.friendship_context?.friendship_level,
                situation: this.determineSituation(analysis, context)
              },
              output: voiceResult.data,
              executionTime: Date.now() - skillStartTime
            }, {
              userId: context.userId,
              sessionId: context.sessionId
            });
          } catch (error) {
            logger.warn('⚠️ Failed to publish skill execution:', error.message);
          }
        }

        // Apply adapted communication style to response
        baseResult.enhanced_response = this.applyVoiceAdaptation(
          baseResult,
          voiceResult.data
        );
      }
    } catch (error) {
      logger.warn('⚠️ Voice adaptation failed, using base response:', error.message);
    }

    return baseResult;
  }

  /**
   * Determine current situation for voice adaptation
   */
  determineSituation(analysis, context) {
    if (analysis.intent === 'booking') return 'booking';
    if (analysis.intent === 'support') return 'support';
    if (analysis.emotional_state?.primary_emotion === 'anxiety') return 'anxiety';
    if (analysis.emotional_state?.primary_emotion === 'excitement') return 'celebration';

    return 'general';
  }

  /**
   * Get current time of day for adaptation
   */
  getTimeOfDay() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Apply voice adaptation to response
   */
  applyVoiceAdaptation(baseResult, voiceData) {
    const adapted = { ...baseResult };

    // Apply selected voice style
    if (voiceData.selected_voice_style) {
      adapted.communication_style = voiceData.selected_voice_style;
    }

    // Apply response template
    if (voiceData.response_template) {
      adapted.response_templates = voiceData.response_template;
    }

    // Apply style guidelines
    if (voiceData.style_guidelines) {
      adapted.style_guidelines = voiceData.style_guidelines;
    }

    return adapted;
  }

  /**
   * Enhanced failure handling with skill-based recovery
   */
  async handleEnhancedFailure(request, context, error) {
    logger.error('🚨 Enhanced orchestration failure, attempting skill-based recovery', {
      error: error.message,
      userId: context.userId
    });

    try {
      // Try empathy-based error response
      const empathyResult = await this.skillSystem.executeSkill('EmpathyDetection', {
        message: request.message,
        startTime: Date.now()
      });

      // Try friendship-based error response
      const friendshipResult = await this.skillSystem.executeSkill('PersonalizedFriendship', {
        userId: context.userId,
        message: request.message,
        startTime: Date.now()
      });

      // Generate empathetic error response
      const errorResponse = {
        success: false,
        error: {
          code: 'ENHANCED_ORCHESTRATION_FAILED',
          message: this.generateEmpatheticErrorMessage(empathyResult, friendshipResult),
          original_error: error.message,
          support_contact: 'support@amrikyytravel.ai',
          suggested_actions: [
            'Try rephrasing your request',
            'Contact our support team',
            'Try again in a few minutes'
          ]
        },
        emotional_support: empathyResult.success ? empathyResult.data : null,
        friendship_context: friendshipResult.success ? friendshipResult.data : null
      };

      return errorResponse;

    } catch (fallbackError) {
      logger.error('🚨 Enhanced fallback also failed', { error: fallbackError.message });

      // Return basic error response
      return {
        success: false,
        error: {
          code: 'SYSTEM_ERROR',
          message: {
            en: 'We\'re experiencing technical difficulties. Please try again later.',
            ar: 'نواجه صعوبات فنية. يرجى المحاولة مرة أخرى لاحقاً.'
          },
          support_contact: 'support@amrikyytravel.ai'
        }
      };
    }
  }

  /**
   * Generate empathetic error message based on user state
   */
  generateEmpatheticErrorMessage(empathyResult, friendshipResult) {
    let message = {
      en: 'I apologize for the inconvenience. ',
      ar: 'أعتذر عن الإزعاج. '
    };

    // Add empathy-based message
    if (empathyResult.success) {
      const emotion = empathyResult.data.primary_emotion;

      if (emotion === 'anxiety') {
        message.en += 'I understand this might be frustrating. ';
        message.ar += 'أفهم أن هذا قد يكون محبطاً. ';
      } else if (emotion === 'excitement') {
        message.en += 'I know you were excited about planning this trip. ';
        message.ar += 'أعلم أنك كنت متحمساً لتخطيط هذه الرحلة. ';
      }
    }

    // Add friendship-based message
    if (friendshipResult.success) {
      const level = friendshipResult.data.friendship_level;

      if (level === 'friend' || level === 'good_friend') {
        message.en += 'As your travel friend, I\'m here to help resolve this. ';
        message.ar += 'كصديق سفرك، أنا هنا لمساعدتك في حل هذا. ';
      }
    }

    // Add resolution message
    message.en += 'Our team has been notified and will assist you shortly.';
    message.ar += 'تم إخطار فريقنا وسيساعدك قريباً.';

    return message;
  }

  /**
   * Get enhanced conversation state with skills
   */
  async getEnhancedConversationState(conversationId, userId) {
    const baseState = this.getConversationState(conversationId, userId);

    try {
      // Enhance with friendship data
      const friendshipResult = await this.skillSystem.executeSkill('PersonalizedFriendship', {
        userId,
        conversationHistory: baseState.history,
        startTime: Date.now()
      });

      if (friendshipResult.success) {
        baseState.friendship_level = friendshipResult.data.friendship_level;
        baseState.relationship_strength = friendshipResult.data.relationship_score;
        baseState.response_style = friendshipResult.data.response_style;
      }

      // Cache enhanced state
      this.enhancedConversationStates.set(conversationId, baseState);

    } catch (error) {
      logger.warn('⚠️ Failed to enhance conversation state:', error.message);
    }

    return baseState;
  }

  /**
   * Get comprehensive system health
   */
  async getEnhancedHealth() {
    const baseHealth = this.healthCheck();
    const skillHealth = await this.skillSystem.healthCheck();
    const cacheHealth = await this.jsonbinCache.healthCheck();

    return {
      ...baseHealth,
      skill_system: skillHealth,
      cache_system: cacheHealth,
      overall_status: this.calculateOverallHealth(baseHealth, skillHealth, cacheHealth)
    };
  }

  /**
   * Calculate overall system health
   */
  calculateOverallHealth(baseHealth, skillHealth, cacheHealth) {
    const checks = [
      baseHealth.status === 'healthy',
      skillHealth.status === 'healthy',
      cacheHealth.status === 'healthy' || cacheHealth.status === 'disabled'
    ];

    if (checks.every(check => check)) return 'healthy';
    if (checks.filter(check => check).length >= 2) return 'degraded';
    return 'unhealthy';
  }

  /**
   * Get enhanced metrics with skill system data
   */
  getEnhancedMetrics() {
    const baseMetrics = this.getMetrics();
    const skillMetrics = this.skillSystem.getMetrics();

    return {
      ...baseMetrics,
      skill_system: skillMetrics,
      enhanced_features: {
        emotional_intelligence: true,
        friendship_tracking: true,
        voice_adaptation: true,
        caching_enabled: !!this.hybridCache.apiKey
      }
    };
  }

  /**
   * Cleanup enhanced conversation states
   */
  cleanupEnhancedConversations(maxAgeHours = 24) {
    const baseCleaned = this.cleanupConversations(maxAgeHours);
    let enhancedCleaned = 0;

    for (const [id, state] of this.enhancedConversationStates.entries()) {
      const age = Date.now() - new Date(state.lastInteraction).getTime();
      if (age > maxAgeHours * 60 * 60 * 1000) {
        this.enhancedConversationStates.delete(id);
        enhancedCleaned++;
      }
    }

    if (enhancedCleaned > 0) {
      logger.info(`🧹 Cleaned up ${enhancedCleaned} enhanced conversation states`);
    }

    return { base: baseCleaned, enhanced: enhancedCleaned };
  }
}

module.exports = EnhancedBossAgent;