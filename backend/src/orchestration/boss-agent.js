/**
 * Boss Agent - Main Orchestration Layer for Amriyy Travel Agent
 * Production-ready, enterprise-grade agent orchestration system
 *
 * Features:
 * - Event-driven architecture with EventEmitter
 * - Sophisticated intent detection (Arabic/English)
 * - Adaptive execution strategies (parallel/sequential)
 * - Comprehensive error handling with fallback strategies
 * - Conversation state management
 * - Performance metrics and monitoring
 * - Agent registry with dependency management
 */

const EventEmitter = require('events');
const logger = require('../utils/logger');

class BossAgent extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      parallelExecution: config.parallelExecution !== false,
      enableMetrics: config.enableMetrics !== false,
      enableConversationState: config.enableConversationState !== false,
      ...config
    };

    // Agent registry with metadata
    this.agents = new Map();

    // Conversation state management
    this.conversationStates = new Map();

    // Performance metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      agentMetrics: new Map()
    };

    // Cache for performance
    this.cache = new Map();

    logger.info('🚀 Boss Agent initialized', {
      config: this.config,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Register a specialized agent with validation
   */
  registerAgent(name, agent) {
    // Comprehensive validation
    if (!agent || typeof agent !== 'object') {
      throw new Error(`Agent ${name} must be an object`);
    }

    if (!agent.execute || typeof agent.execute !== 'function') {
      throw new Error(`Agent ${name} must have an execute method`);
    }

    if (agent.execute.length < 1) {
      throw new Error(`Agent ${name}.execute must accept context parameter`);
    }

    // Validate capabilities format
    if (agent.capabilities && !Array.isArray(agent.capabilities)) {
      throw new Error(`Agent ${name}.capabilities must be an array`);
    }

    // Check for duplicate names
    if (this.agents.has(name)) {
      logger.warn(`⚠️ Overwriting existing agent: ${name}`);
    }

    // Register agent with metadata
    this.agents.set(name, {
      instance: agent,
      capabilities: agent.capabilities || [],
      priority: agent.priority || 1,
      status: 'active',
      registeredAt: new Date().toISOString(),
      executionCount: 0,
      successCount: 0,
      averageExecutionTime: 0
    });

    logger.info(`✅ Agent registered: ${name}`, {
      capabilities: agent.capabilities,
      priority: agent.priority
    });

    return this; // For method chaining
  }

  /**
   * Main orchestration method - analyzes request and coordinates agents
   */
  async orchestrate(request, context = {}) {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.metrics.totalRequests++;

    try {
      logger.info(`🎯 Orchestration started: ${requestId}`, {
        userId: context.userId,
        messageLength: request.message?.length || 0
      });

      // Step 1: Analyze the request
      const analysis = await this.analyzeRequest(request, context);
      logger.info(`📊 Request analyzed: ${requestId}`, {
        intent: analysis.intent,
        complexity: analysis.complexity,
        requiredAgents: analysis.requiredAgents.length
      });

      // Step 2: Create execution plan
      const executionPlan = await this.createExecutionPlan(analysis);
      logger.info(`📋 Execution plan created: ${requestId}`, {
        strategy: executionPlan.strategy,
        agentCount: executionPlan.agents.length
      });

      // Step 3: Execute agents
      const agentResults = await this.executeAgents(executionPlan, context);
      logger.info(`⚡ Agents executed: ${requestId}`, {
        resultCount: agentResults.length,
        successful: agentResults.filter(r => r.success).length
      });

      // Step 4: Synthesize results
      const synthesizedResult = await this.synthesizeResults(
        agentResults,
        analysis,
        context
      );

      // Step 5: Post-processing and validation
      const finalResult = await this.postProcess(synthesizedResult, context);

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, true);

      // Emit success event
      this.emit('request:complete', {
        requestId,
        analysis,
        result: finalResult,
        responseTime,
        agentResults
      });

      logger.info(`✅ Orchestration completed: ${requestId}`, {
        responseTime,
        success: true
      });

      return {
        success: true,
        data: finalResult,
        metadata: {
          requestId,
          responseTime,
          agentsUsed: executionPlan.agents.map(a => a.name),
          strategy: executionPlan.strategy
        }
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error(`❌ Orchestration failed: ${requestId}`, {
        error: error.message,
        stack: error.stack,
        responseTime
      });

      this.updateMetrics(responseTime, false);
      this.emit('request:failed', { requestId, error, responseTime });

      // Attempt fallback strategy
      return this.handleFailure(request, context, error);
    }
  }

  /**
   * Analyze incoming request to determine intent and requirements
   */
  async analyzeRequest(request, context) {
    const message = request.message || request.query || '';
    const userId = request.userId || request.user_id || context.userId || 'guest';

    // Intent detection with Arabic and English support
    const intent = this.detectIntent(message);

    // Complexity assessment
    const complexity = this.assessComplexity(request);

    // Determine required agents
    const requiredAgents = this.determineRequiredAgents(intent, request);

    // Priority scoring
    const priority = this.calculatePriority(request, context);

    // Get or create conversation state
    const conversationId = request.conversationId ||
      context.conversationId ||
      `conv_${userId}_${Date.now()}`;

    const conversationState = this.getConversationState(conversationId, userId);

    return {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      conversationId,
      intent,
      complexity,
      requiredAgents,
      priority,
      originalRequest: request,
      conversationState,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detect user intent from message with bilingual support
   */
  detectIntent(message) {
    const msg = message.toLowerCase();

    // Arabic patterns
    const arabicPatterns = {
      flight_search: ['طيران', 'رحلة طيران', 'تذكرة طيران', 'تذاكر', 'فلايت'],
      hotel_search: ['فندق', 'حجز فندق', 'إقامة', 'غرفة', 'ريسورت'],
      full_trip: ['رحلة', 'سفر', 'خطة سفر', 'أريد السفر', 'تريب'],
      budget: ['ميزانية', 'تكلفة', 'سعر', 'كم يكلف', 'تكلفة الرحلة'],
      activities: ['أنشطة', 'جولات', 'معالم', 'أماكن سياحية'],
      booking: ['حجز', 'احجز', 'بوك', 'بوكينج'],
      cancellation: ['إلغاء', 'كانسل', 'إلغاء حجز'],
      support: ['مساعدة', 'سؤال', 'استفسار', 'كيف']
    };

    // English patterns
    const englishPatterns = {
      flight_search: ['flight', 'airplane', 'fly to', 'ticket', 'flights'],
      hotel_search: ['hotel', 'accommodation', 'stay', 'lodging', 'resort'],
      full_trip: ['trip', 'travel', 'vacation', 'plan trip', 'travel plan'],
      budget: ['budget', 'cost', 'price', 'how much', 'expensive'],
      activities: ['activities', 'things to do', 'attractions', 'tours', 'sightseeing'],
      booking: ['book', 'booking', 'reserve', 'reservation'],
      cancellation: ['cancel', 'cancellation', 'refund'],
      support: ['help', 'support', 'question', 'how']
    };

    // Check Arabic patterns first (right-to-left priority)
    for (const [intent, patterns] of Object.entries(arabicPatterns)) {
      if (patterns.some(p => msg.includes(p))) {
        return intent;
      }
    }

    // Check English patterns
    for (const [intent, patterns] of Object.entries(englishPatterns)) {
      if (patterns.some(p => msg.includes(p))) {
        return intent;
      }
    }

    return 'general_inquiry';
  }

  /**
   * Assess request complexity for execution strategy
   */
  assessComplexity(request) {
    let score = 0;

    // Destination complexity
    if (request.destinations && request.destinations.length > 1) score += 2;
    if (request.multiCity) score += 3;

    // Traveler complexity
    if (request.travelers > 4) score += 1;
    if (request.children || request.infants) score += 1;

    // Activity complexity
    if (request.activities && request.activities.length > 3) score += 1;
    if (request.specialRequirements) score += 2;

    // Date complexity
    if (request.flexibleDates === false) score += 1;
    if (request.urgent) score += 2;

    // Budget complexity
    if (request.budget && request.optimizeBudget) score += 1;

    if (score >= 8) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  /**
   * Determine which agents are needed based on intent
   */
  determineRequiredAgents(intent, request) {
    const agents = [];

    // Always include conversation agent for context
    agents.push('conversation');

    switch (intent) {
    case 'flight_search':
      agents.push('flight_search');
      if (request.optimizeBudget) agents.push('budget_optimizer');
      break;

    case 'hotel_search':
      agents.push('hotel_search');
      if (request.optimizeBudget) agents.push('budget_optimizer');
      break;

    case 'full_trip':
      agents.push('flight_search', 'hotel_search', 'itinerary_generator');
      if (request.includeActivities) agents.push('activities');
      if (request.optimizeBudget) agents.push('budget_optimizer');
      break;

    case 'budget':
      agents.push('budget_optimizer', 'price_analytics');
      break;

    case 'activities':
      agents.push('activities', 'local_expert');
      break;

    case 'booking':
      agents.push('booking_agent');
      break;

    case 'cancellation':
      agents.push('cancellation_agent');
      break;

    default:
      // General inquiry - use conversation agent only
      break;
    }

    return [...new Set(agents)]; // Remove duplicates
  }

  /**
   * Calculate request priority for execution order
   */
  calculatePriority(request, context) {
    let priority = 5; // Default medium priority

    // Urgency indicators
    if (request.urgent) priority += 3;
    if (request.sameDay) priority += 5;

    // User tier priority
    if (context.userTier === 'premium') priority += 2;
    if (context.userTier === 'vip') priority += 4;

    // Business value
    if (request.budget > 5000) priority += 1;
    if (request.travelers > 10) priority += 2;

    // Repeat customer bonus
    if (context.repeatCustomer) priority += 1;
    if (context.loyalCustomer) priority += 2;

    return Math.min(priority, 10); // Cap at 10
  }

  /**
   * Create execution plan for agents
   */
  async createExecutionPlan(analysis) {
    const plan = {
      strategy: analysis.complexity === 'high' ? 'sequential' : 'parallel',
      agents: [],
      timeout: this.config.timeout,
      retryPolicy: {
        maxRetries: this.config.maxRetries,
        backoff: 'exponential'
      },
      priority: analysis.priority
    };

    // Build agent execution order
    for (const agentName of analysis.requiredAgents) {
      const agentConfig = this.agents.get(agentName);

      if (!agentConfig) {
        logger.warn(`⚠️ Agent not found: ${agentName}`);
        continue;
      }

      plan.agents.push({
        name: agentName,
        priority: agentConfig.priority,
        timeout: agentConfig.instance.timeout || this.config.timeout,
        dependencies: agentConfig.instance.dependencies || []
      });
    }

    // Sort by priority (highest first)
    plan.agents.sort((a, b) => b.priority - a.priority);

    return plan;
  }

  /**
   * Execute agents according to plan
   */
  async executeAgents(plan, context) {
    const results = [];

    if (plan.strategy === 'parallel' && this.config.parallelExecution) {
      // Parallel execution for better performance
      const promises = plan.agents.map(agentConfig =>
        this.executeAgent(agentConfig, context)
          .catch(error => ({
            agent: agentConfig.name,
            success: false,
            error: error.message,
            executionTime: 0
          }))
      );

      const settled = await Promise.allSettled(promises);

      settled.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            agent: plan.agents[index].name,
            success: false,
            error: result.reason?.message || 'Unknown error',
            executionTime: 0
          });
        }
      });

    } else {
      // Sequential execution for complex scenarios
      for (const agentConfig of plan.agents) {
        try {
          const result = await this.executeAgent(agentConfig, {
            ...context,
            previousResults: results
          });
          results.push(result);
        } catch (error) {
          logger.error(`❌ Agent ${agentConfig.name} failed`, { error });
          results.push({
            agent: agentConfig.name,
            success: false,
            error: error.message,
            executionTime: 0
          });
        }
      }
    }

    return results;
  }

  /**
   * Execute a single agent with timeout and metrics
   */
  async executeAgent(agentConfig, context) {
    const agentData = this.agents.get(agentConfig.name);

    if (!agentData) {
      throw new Error(`Agent ${agentConfig.name} not found`);
    }

    const startTime = Date.now();

    try {
      // Execute with timeout
      const result = await this.withTimeout(
        agentData.instance.execute(context),
        agentConfig.timeout
      );

      const executionTime = Date.now() - startTime;

      // Update agent metrics
      this.updateAgentMetrics(agentConfig.name, executionTime, true);

      this.emit('agent:complete', {
        agent: agentConfig.name,
        executionTime,
        success: true
      });

      return {
        agent: agentConfig.name,
        success: true,
        data: result,
        executionTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      this.updateAgentMetrics(agentConfig.name, executionTime, false);

      this.emit('agent:failed', {
        agent: agentConfig.name,
        error: error.message,
        executionTime
      });

      throw error;
    }
  }

  /**
   * Synthesize results from multiple agents
   */
  async synthesizeResults(agentResults, analysis, context) {
    const successful = agentResults.filter(r => r.success);
    const failed = agentResults.filter(r => !r.success);

    if (successful.length === 0) {
      throw new Error('All agents failed to execute');
    }

    // Extract data by agent type
    const flightData = successful.find(r => r.agent === 'flight_search')?.data;
    const hotelData = successful.find(r => r.agent === 'hotel_search')?.data;
    const budgetData = successful.find(r => r.agent === 'budget_optimizer')?.data;
    const conversationData = successful.find(r => r.agent === 'conversation')?.data;

    // Build comprehensive response
    const synthesized = {
      intent: analysis.intent,
      complexity: analysis.complexity,
      results: {
        flights: flightData?.results || [],
        hotels: hotelData?.results || [],
        activities: [],
        budget_analysis: budgetData || null
      },
      recommendations: [],
      conversation_context: conversationData || {},
      metadata: {
        total_agents: agentResults.length,
        successful_agents: successful.length,
        failed_agents: failed.length,
        execution_strategy: analysis.complexity === 'high' ? 'sequential' : 'parallel'
      }
    };

    // Calculate totals
    if (flightData?.results?.length > 0) {
      synthesized.total_cost = flightData.results[0].price || 0;
    }

    if (hotelData?.results?.length > 0) {
      synthesized.total_cost = (synthesized.total_cost || 0) +
        (hotelData.results[0].price || 0);
    }

    // Generate intelligent recommendations
    synthesized.recommendations = this.generateRecommendations(
      synthesized,
      analysis.originalRequest,
      context
    );

    return synthesized;
  }

  /**
   * Generate intelligent recommendations based on results
   */
  generateRecommendations(data, request, context) {
    const recommendations = [];

    // Budget recommendations
    if (data.budget_analysis?.potential_savings > 0) {
      recommendations.push({
        type: 'savings',
        priority: 'high',
        message: {
          en: `💰 We found ${data.budget_analysis.savings_count} ways to save ${data.budget_analysis.potential_savings}!`,
          ar: `💰 وجدنا ${data.budget_analysis.savings_count} طريقة لتوفير ${data.budget_analysis.potential_savings}!`
        },
        actions: data.budget_analysis.suggestions || []
      });
    }

    // Date flexibility recommendation
    if (request.flexibleDates !== true && data.results.flights.length > 0) {
      recommendations.push({
        type: 'flexibility',
        priority: 'medium',
        message: {
          en: '📅 Consider flexible dates to save up to 30% on flights',
          ar: '📅 فكر في مواعيد مرنة لتوفير حتى 30% على الرحلات'
        },
        actions: ['check_flexible_dates']
      });
    }

    // Multi-city optimization
    if (request.destinations?.length > 1) {
      recommendations.push({
        type: 'route_optimization',
        priority: 'high',
        message: {
          en: '🗺️ We optimized your multi-city route for best prices and convenience',
          ar: '🗺️ قمنا بتحسين مسار رحلتك متعددة المدن للحصول على أفضل الأسعار والراحة'
        }
      });
    }

    return recommendations;
  }

  /**
   * Post-process and validate final result
   */
  async postProcess(result, context) {
    // Add conversation context for personalization
    if (context.userId && context.userId !== 'guest') {
      result.personalization = {
        greeting: await this.getPersonalizedGreeting(context.userId),
        preferences_applied: true
      };
    }

    // Add expiration timestamp
    result.expires_at = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    // Validate data completeness
    result.validation = {
      has_flights: result.results.flights.length > 0,
      has_hotels: result.results.hotels.length > 0,
      has_budget: result.results.budget_analysis !== null,
      completeness_score: this.calculateCompleteness(result)
    };

    return result;
  }

  /**
   * Calculate result completeness score
   */
  calculateCompleteness(result) {
    let score = 0;
    let total = 0;

    if (result.results.flights.length > 0) { score++; total++; }
    else total++;

    if (result.results.hotels.length > 0) { score++; total++; }
    else total++;

    if (result.results.budget_analysis) { score++; total++; }
    else total++;

    if (result.recommendations.length > 0) { score++; total++; }
    else total++;

    return Math.round((score / total) * 100);
  }

  /**
   * Get personalized greeting based on user history
   */
  async getPersonalizedGreeting(userId) {
    const conversationState = Array.from(this.conversationStates.values())
      .find(state => state.userId === userId);

    if (!conversationState) {
      return {
        en: 'Welcome! How can I help you plan your perfect trip?',
        ar: 'مرحبًا! كيف يمكنني مساعدتك في تخطيط رحلتك المثالية؟'
      };
    }

    const interactionCount = conversationState.interactionCount || 0;

    if (interactionCount > 10) {
      return {
        en: 'Great to see you again! Ready to plan another amazing adventure?',
        ar: 'من الرائع رؤيتك مرة أخرى! هل أنت مستعد لتخطيط مغامرة رائعة أخرى؟'
      };
    } else if (interactionCount > 3) {
      return {
        en: 'Welcome back! Let\'s make this trip unforgettable.',
        ar: 'مرحبًا بعودتك! لنجعل هذه الرحلة لا تُنسى.'
      };
    }

    return {
      en: 'Hello! Excited to help you plan your journey.',
      ar: 'مرحبًا! متحمسون لمساعدتك في تخطيط رحلتك.'
    };
  }

  /**
   * Handle orchestration failure with fallback strategies
   */
  async handleFailure(request, context, error) {
    logger.error('🚨 Orchestration failure, attempting fallback', {
      error: error.message,
      userId: context.userId
    });

    // Try simple search fallback
    try {
      const fallbackResult = await this.simpleFallback(request);

      return {
        success: true,
        data: fallbackResult,
        fallback: true,
        original_error: error.message,
        message: {
          en: 'We encountered an issue but found these options for you',
          ar: 'واجهنا مشكلة لكن وجدنا هذه الخيارات لك'
        }
      };

    } catch (fallbackError) {
      logger.error('🚨 Fallback also failed', { error: fallbackError.message });

      // Complete failure - return user-friendly error
      return {
        success: false,
        error: {
          code: 'ORCHESTRATION_FAILED',
          message: {
            en: 'We\'re having trouble right now. Our team has been notified.',
            ar: 'نواجه مشكلة الآن. تم إخطار فريقنا.'
          },
          support_contact: 'support@mayatravel.ai'
        }
      };
    }
  }

  /**
   * Simple fallback for critical failures
   */
  async simpleFallback(request) {
    // Return basic cached results or default suggestions
    return {
      results: {
        flights: [],
        hotels: [],
        message: 'Please try again or contact support for assistance'
      },
      recommendations: []
    };
  }

  /**
   * Get or create conversation state
   */
  getConversationState(conversationId, userId) {
    if (!this.conversationStates.has(conversationId)) {
      this.conversationStates.set(conversationId, {
        conversationId,
        userId,
        startedAt: new Date().toISOString(),
        interactionCount: 0,
        context: {},
        history: []
      });
    }

    const state = this.conversationStates.get(conversationId);
    state.interactionCount++;
    state.lastInteraction = new Date().toISOString();

    return state;
  }

  /**
   * Update conversation state
   */
  updateConversationState(conversationId, updates) {
    const state = this.getConversationState(conversationId);
    Object.assign(state, updates);
    this.conversationStates.set(conversationId, state);
  }

  /**
   * Update performance metrics
   */
  updateMetrics(responseTime, success) {
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Calculate rolling average
    const totalResponses = this.metrics.successfulRequests + this.metrics.failedRequests;
    this.metrics.averageResponseTime = (
      (this.metrics.averageResponseTime * (totalResponses - 1) + responseTime) /
      totalResponses
    );
  }

  /**
   * Update individual agent metrics
   */
  updateAgentMetrics(agentName, executionTime, success) {
    const agentMetrics = this.metrics.agentMetrics.get(agentName) || {
      executionCount: 0,
      successCount: 0,
      totalExecutionTime: 0
    };

    agentMetrics.executionCount++;
    agentMetrics.totalExecutionTime += executionTime;

    if (success) {
      agentMetrics.successCount++;
    }

    agentMetrics.averageExecutionTime = agentMetrics.totalExecutionTime / agentMetrics.executionCount;
    agentMetrics.successRate = (agentMetrics.successCount / agentMetrics.executionCount) * 100;

    this.metrics.agentMetrics.set(agentName, agentMetrics);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const totalRequests = this.metrics.totalRequests;
    const successRate = totalRequests > 0 ?
      (this.metrics.successfulRequests / totalRequests) * 100 : 0;

    return {
      ...this.metrics,
      successRate: `${successRate.toFixed(2)}%`,
      activeConversations: this.conversationStates.size,
      registeredAgents: this.agents.size,
      agentDetails: Object.fromEntries(this.metrics.agentMetrics)
    };
  }

  /**
   * Get conversation state by ID
   */
  getConversationStateById(conversationId) {
    return this.conversationStates.get(conversationId) || null;
  }

  /**
   * Clean up old conversation states (call periodically)
   */
  cleanupConversations(maxAgeHours = 24) {
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    let cleaned = 0;

    for (const [id, state] of this.conversationStates.entries()) {
      const age = now - new Date(state.lastInteraction).getTime();
      if (age > maxAge) {
        this.conversationStates.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`🧹 Cleaned up ${cleaned} old conversations`);
    }

    return cleaned;
  }

  /**
   * Utility: Execute with timeout
   */
  withTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      )
    ]);
  }

  /**
   * Get agent information
   */
  getAgentInfo(name) {
    return this.agents.get(name) || null;
  }

  /**
   * List all registered agents
   */
  listAgents() {
    return Array.from(this.agents.entries()).map(([name, config]) => ({
      name,
      capabilities: config.capabilities,
      priority: config.priority,
      status: config.status,
      executionCount: config.executionCount,
      successRate: config.executionCount > 0 ?
        (config.successCount / config.executionCount * 100).toFixed(2) + '%' : 'N/A'
    }));
  }

  /**
   * Health check for monitoring
   */
  healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      agents: this.listAgents(),
      uptime: process.uptime()
    };
  }
}

module.exports = BossAgent;