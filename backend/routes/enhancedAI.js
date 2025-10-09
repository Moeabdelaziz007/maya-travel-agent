/**
 * Enhanced AI Routes for Maya Trips
 * Advanced AI chatbot with knowledge base, user profiles, and reasoning
 */

const express = require('express');
const router = express.Router();
const ZaiClient = require('../src/ai/zaiClient');
const KnowledgeBaseService = require('../src/ai/knowledgeBase');
const UserProfileService = require('../src/ai/userProfileService');
const ReasoningEngine = require('../src/ai/reasoningEngine');
const ContextService = require('../src/ai/contextService');

// Initialize services
const zaiClient = new ZaiClient();
const knowledgeBase = new KnowledgeBaseService();
const userProfile = new UserProfileService();
const reasoningEngine = new ReasoningEngine();
const contextService = new ContextService();

// Middleware for API key validation
const validateApiKey = (req, res, next) => {
  if (!process.env.ZAI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Z.ai API key not configured'
    });
  }
  next();
};

// Apply API key validation to all routes
router.use(validateApiKey);

/**
 * POST /api/enhanced-ai/chat
 * Enhanced context-aware chat with user profiles and reasoning
 */
router.post('/chat', async (req, res) => {
  try {
    const {
      message,
      userId,
      conversationId,
      useReasoning = true,
      includeKnowledge = true,
      region = 'ar'
    } = req.body;

    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Message and userId are required'
      });
    }

    console.log(`🤖 Enhanced AI Chat - User: ${userId}, Message: ${message.substring(0, 50)}...`);

    // Generate context-aware response
    const response = await contextService.generateContextAwareResponse(
      userId,
      message,
      {
        conversationId,
        useReasoning,
        includeKnowledge,
        region
      }
    );

    res.json({
      success: true,
      reply: response.response,
      conversationId: response.conversationId,
      suggestions: response.suggestions,
      reasoningTrace: response.reasoningTrace,
      metadata: response.metadata,
      timestamp: new Date().toISOString(),
      model: 'glm-4.6-enhanced'
    });

  } catch (error) {
    console.error('Enhanced AI Chat Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/enhanced-ai/knowledge/search
 * Search knowledge base with semantic similarity
 */
router.post('/knowledge/search', async (req, res) => {
  try {
    const { query, categories = [], language = 'en', limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    console.log(`📚 Knowledge Search - Query: ${query.substring(0, 50)}...`);

    const results = await knowledgeBase.semanticSearch(query, {
      categories,
      language,
      limit
    });

    res.json({
      success: true,
      results,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Knowledge Search Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/enhanced-ai/knowledge/add
 * Add new knowledge article
 */
router.post('/knowledge/add', async (req, res) => {
  try {
    const article = req.body;

    if (!article.title || !article.content || !article.category_id) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and category_id are required'
      });
    }

    console.log(`📝 Adding Knowledge Article: ${article.title}`);

    const result = await knowledgeBase.addKnowledgeArticle(article);

    res.json({
      success: true,
      article: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Add Knowledge Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/enhanced-ai/knowledge/categories
 * Get all knowledge categories
 */
router.get('/knowledge/categories', async (req, res) => {
  try {
    const categories = await knowledgeBase.getCategories();

    res.json({
      success: true,
      categories,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/enhanced-ai/user/profile/:userId
 * Get user profile with personas
 */
router.get('/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await userProfile.getUserProfile(userId);

    res.json({
      success: true,
      profile,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * PUT /api/enhanced-ai/user/profile/:userId
 * Update user profile
 */
router.put('/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const profile = await userProfile.updateUserProfile(userId, updates);

    res.json({
      success: true,
      profile,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/enhanced-ai/user/behavior
 * Record user behavior for learning
 */
router.post('/user/behavior', async (req, res) => {
  try {
    const { userId, interactionType, interactionData, sessionId } = req.body;

    if (!userId || !interactionType || !interactionData) {
      return res.status(400).json({
        success: false,
        error: 'userId, interactionType, and interactionData are required'
      });
    }

    await userProfile.recordUserBehavior(userId, interactionType, interactionData, sessionId);

    res.json({
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Record Behavior Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/enhanced-ai/user/feedback
 * Record user feedback
 */
router.post('/user/feedback', async (req, res) => {
  try {
    const { userId, feedbackType, feedbackData, conversationId, aiResponseId } = req.body;

    if (!userId || !feedbackType || !feedbackData) {
      return res.status(400).json({
        success: false,
        error: 'userId, feedbackType, and feedbackData are required'
      });
    }

    await userProfile.recordFeedback(userId, feedbackType, feedbackData, conversationId, aiResponseId);

    res.json({
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Record Feedback Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/enhanced-ai/personas
 * Get all available personas
 */
router.get('/personas', async (req, res) => {
  try {
    const personas = await userProfile.getAllPersonas();

    res.json({
      success: true,
      personas,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get Personas Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/enhanced-ai/reasoning/trace
 * Generate reasoning trace for a query
 */
router.post('/reasoning/trace', async (req, res) => {
  try {
    const { userId, query, context = {} } = req.body;

    if (!userId || !query) {
      return res.status(400).json({
        success: false,
        error: 'userId and query are required'
      });
    }

    console.log(`🧠 Reasoning Trace - User: ${userId}, Query: ${query.substring(0, 50)}...`);

    const trace = await reasoningEngine.generateReasoningTrace(userId, query, context);

    res.json({
      success: true,
      trace,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reasoning Trace Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/enhanced-ai/travel-plan/generate
 * Generate personalized travel plan
 */
router.post('/travel-plan/generate', async (req, res) => {
  try {
    const { userId, destination, duration, budget, preferences = [] } = req.body;

    if (!userId || !destination || !duration || !budget) {
      return res.status(400).json({
        success: false,
        error: 'userId, destination, duration, and budget are required'
      });
    }

    console.log(`📋 Travel Plan Generation - User: ${userId}, Destination: ${destination}`);

    // Get user profile for personalization
    const userProfileData = await userProfile.getUserProfile(userId);

    // Generate reasoning trace for travel planning
    const reasoningTrace = await reasoningEngine.generateReasoningTrace(
      userId,
      `Plan a ${duration} trip to ${destination} with budget $${budget}`,
      {
        conversationId: `plan_${Date.now()}`,
        preferences,
        userProfile: userProfileData
      }
    );

    // Create travel plan record
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: travelPlan, error } = await supabase
      .from('ai_travel_plans')
      .insert({
        user_id: userId,
        conversation_id: reasoningTrace.conversationId,
        destination,
        duration_days: parseInt(duration),
        budget_range: budget,
        travel_style: preferences,
        itinerary_data: reasoningTrace.finalRecommendation,
        reasoning_trace: reasoningTrace
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      travelPlan,
      reasoningTrace,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Travel Plan Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/enhanced-ai/conversation/history/:userId
 * Get conversation history for user
 */
router.get('/conversation/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const history = await contextService.getConversationHistory(userId, parseInt(limit));

    res.json({
      success: true,
      history,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get Conversation History Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/enhanced-ai/knowledge/populate
 * Populate knowledge base with initial data
 */
router.post('/knowledge/populate', async (req, res) => {
  try {
    console.log('🌱 Populating knowledge base...');

    await knowledgeBase.populateInitialData();

    res.json({
      success: true,
      message: 'Knowledge base populated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Populate Knowledge Base Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/enhanced-ai/health
 * Health check for enhanced AI services
 */
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 Enhanced AI Health Check...');

    // Check Z.ai API
    const zaiHealth = await zaiClient.healthCheck();

    // Check knowledge base
    const kbCategories = await knowledgeBase.getCategories();
    const kbHealth = kbCategories.length > 0;

    // Check user profile service
    const personas = await userProfile.getAllPersonas();
    const profileHealth = personas.length > 0;

    const overallHealth = zaiHealth.success && kbHealth && profileHealth;

    res.json({
      success: overallHealth,
      services: {
        zai_api: zaiHealth,
        knowledge_base: { healthy: kbHealth, categories: kbCategories.length },
        user_profiles: { healthy: profileHealth, personas: personas.length }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced AI Health Check Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;