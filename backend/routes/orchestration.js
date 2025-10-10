/**
 * Enhanced Orchestration Routes
 * Exposes Boss Agent functionality via REST API
 */

const express = require('express');
const router = express.Router();
const EnhancedBossAgent = require('../src/orchestration/enhanced-boss-agent');
const supabase = require('../src/utils/supabase');
const logger = require('../src/utils/logger');
const metrics = require('../src/monitoring/metrics');

// Initialize Enhanced Boss Agent
const bossAgent = new EnhancedBossAgent({
  timeout: 30000,
  maxRetries: 3,
  parallelExecution: true,
  storage: supabase,
  jsonbinApiKey: process.env.JSONBIN_API_KEY,
  enableSkillPersistence: true
});

// Middleware for request validation
const validateOrchestrationRequest = (req, res, next) => {
  const { message, userId } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Message is required and must be a string'
    });
  }

  if (message.length > 2000) {
    return res.status(400).json({
      success: false,
      error: 'Message is too long (max 2000 characters)'
    });
  }

  next();
};

// Middleware for user context enhancement
const enhanceUserContext = async (req, res, next) => {
  try {
    const context = req.body;

    // Add request metadata
    context.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    context.timestamp = new Date().toISOString();
    context.ip = req.ip;
    context.userAgent = req.get('User-Agent');

    // Add user tier if available
    if (req.user) {
      context.userTier = req.user.tier || 'standard';
      context.repeatCustomer = req.user.trips?.length > 0;
      context.loyalCustomer = req.user.trips?.length > 5;
    }

    // Add conversation history if available
    if (context.userId) {
      const conversationState = bossAgent.getConversationStateById(context.conversationId);
      if (conversationState) {
        context.conversationHistory = conversationState.history || [];
      }
    }

    req.enhancedContext = context;
    next();
  } catch (error) {
    logger.error('Context enhancement failed:', error.message);
    next();
  }
};

/**
 * POST /api/orchestration/plan-trip
 * Main orchestration endpoint for trip planning
 */
router.post('/plan-trip', validateOrchestrationRequest, enhanceUserContext, async (req, res) => {
  try {
    const startTime = Date.now();
    const context = req.enhancedContext;

    logger.info(`🎯 Trip planning request: ${context.requestId}`, {
      userId: context.userId,
      messageLength: context.message?.length || 0
    });

    // Execute orchestration
    const result = await bossAgent.orchestrate(req.body, context);

    const processingTime = Date.now() - startTime;

    if (result.success) {
      logger.info(`✅ Trip planning completed: ${context.requestId}`, {
        processingTime,
        agentsUsed: result.metadata?.agentsUsed?.length || 0,
        skillsUsed: result.metadata?.skillsUsed?.length || 0
      });

      // Record successful orchestration metrics
      metrics.recordBossAgentOrchestration(
        result.metadata?.intent || 'trip_planning',
        processingTime,
        true
      );

      res.json({
        success: true,
        data: result.data,
        metadata: {
          ...result.metadata,
          processingTime,
          enhanced: true,
          skills_enabled: true
        }
      });
    } else {
      logger.error(`❌ Trip planning failed: ${context.requestId}`, {
        error: result.error,
        processingTime
      });

      // Record failed orchestration metrics
      metrics.recordBossAgentOrchestration(
        'trip_planning',
        processingTime,
        false
      );
      metrics.recordError('orchestration_failed', 'boss_agent');

      res.status(500).json({
        success: false,
        error: result.error,
        metadata: {
          requestId: context.requestId,
          processingTime,
          enhanced: true
        }
      });
    }

  } catch (error) {
    logger.error('Orchestration route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/orchestration/chat
 * General chat with enhanced orchestration
 */
router.post('/chat', validateOrchestrationRequest, enhanceUserContext, async (req, res) => {
  try {
    const context = req.enhancedContext;

    // For general chat, we might want simpler processing
    const chatResult = await bossAgent.orchestrate(req.body, {
      ...context,
      chatMode: true // Flag for chat-specific processing
    });

    res.json(chatResult);

  } catch (error) {
    logger.error('Chat orchestration error:', error);
    res.status(500).json({
      success: false,
      error: 'Chat service error',
      message: error.message
    });
  }
});

/**
 * GET /api/orchestration/health
 * Enhanced health check including skill system
 */
router.get('/health', async (req, res) => {
  try {
    const health = await bossAgent.getEnhancedHealth();

    const statusCode = health.overall_status === 'healthy' ? 200 :
      health.overall_status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      health,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      success: false,
      health: { status: 'unhealthy', error: error.message },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/orchestration/metrics
 * Enhanced metrics including skill system
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = bossAgent.getEnhancedMetrics();

    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
      message: error.message
    });
  }
});

/**
 * GET /api/orchestration/skills
 * List all registered skills
 */
router.get('/skills', async (req, res) => {
  try {
    const skills = bossAgent.skillSystem.listSkills();

    res.json({
      success: true,
      skills,
      count: skills.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Skills list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve skills',
      message: error.message
    });
  }
});

/**
 * POST /api/orchestration/skills/:skillName/execute
 * Execute a specific skill for testing
 */
router.post('/skills/:skillName/execute', async (req, res) => {
  try {
    const { skillName } = req.params;
    const context = req.body;

    logger.info(`🧪 Executing skill: ${skillName}`, { context });

    const startTime = Date.now();
    const result = await bossAgent.skillSystem.executeSkill(skillName, {
      ...context,
      startTime
    });

    const executionTime = Date.now() - startTime;

    // Record skill execution metrics
    metrics.recordSkillExecution(skillName, executionTime, result.success !== false);

    res.json({
      success: result.success !== false,
      result,
      skill: skillName,
      executionTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Skill execution error: ${req.params.skillName}`, error);
    res.status(500).json({
      success: false,
      error: 'Skill execution failed',
      message: error.message
    });
  }
});

/**
 * GET /api/orchestration/conversations/:conversationId
 * Get conversation state
 */
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversationState = bossAgent.getConversationStateById(conversationId);

    if (!conversationState) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation: conversationState,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Conversation retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation',
      message: error.message
    });
  }
});

/**
 * DELETE /api/orchestration/conversations/:conversationId
 * Clear conversation state
 */
router.delete('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Remove from both base and enhanced states
    const baseState = bossAgent.conversationStates.get(conversationId);
    const enhancedState = bossAgent.enhancedConversationStates.get(conversationId);

    bossAgent.conversationStates.delete(conversationId);
    bossAgent.enhancedConversationStates.delete(conversationId);

    res.json({
      success: true,
      message: 'Conversation cleared',
      hadState: !!baseState,
      hadEnhancedState: !!enhancedState,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Conversation deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear conversation',
      message: error.message
    });
  }
});

/**
 * POST /api/orchestration/cache/clear
 * Clear all caches
 */
router.post('/cache/clear', async (req, res) => {
  try {
    const results = await Promise.allSettled([
      bossAgent.skillSystem.clearCaches(),
      bossAgent.cache.clearLocalCache()
    ]);

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    res.json({
      success: successCount > 0,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason }),
      clearedCount: successCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear caches',
      message: error.message
    });
  }
});

/**
 * GET /api/orchestration/agents
 * List all registered agents
 */
router.get('/agents', async (req, res) => {
  try {
    const agents = bossAgent.listAgents();

    res.json({
      success: true,
      agents,
      count: agents.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Agents list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agents',
      message: error.message
    });
  }
});

/**
 * POST /api/orchestration/test
 * Test orchestration with sample data
 */
router.post('/test', async (req, res) => {
  try {
    const testRequest = {
      message: req.body.message || 'أريد رحلة إلى دبي لشخصين',
      userId: req.body.userId || 'test_user',
      origin: req.body.origin || 'الرياض',
      destination: req.body.destination || 'دبي',
      departure_date: req.body.departure_date || '2025-11-01',
      return_date: req.body.return_date || '2025-11-05',
      travelers: req.body.travelers || 2,
      budget: req.body.budget || 5000,
      ...req.body
    };

    logger.info('🧪 Running orchestration test', { testRequest });

    const result = await bossAgent.orchestrate(testRequest, {
      userId: testRequest.userId,
      userTier: 'premium',
      testMode: true
    });

    res.json({
      success: true,
      testRequest,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Orchestration test error:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error.message
    });
  }
});

module.exports = router;
