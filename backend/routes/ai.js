/**
 * AI Routes for Maya Trips
 * Z.ai GLM-4.6 Integration
 */

const express = require('express');
const router = express.Router();
const ZaiClient = require('../src/ai/zaiClient');

// Initialize Z.ai client
const zaiClient = new ZaiClient();

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
 * POST /api/ai/chat
 * General chat with Maya AI
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, userId, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log(`🤖 Maya AI Chat - User: ${userId}, Message: ${message.substring(0, 50)}...`);

    const response = await zaiClient.generateChatResponse(message, conversationHistory);

    if (response.success) {
      res.json({
        success: true,
        reply: response.content,
        timestamp: new Date().toISOString(),
        model: 'glm-4.6'
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'AI service error',
        reply: response.content
      });
    }

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/travel-recommendations
 * Generate travel recommendations
 */
router.post('/travel-recommendations', async (req, res) => {
  try {
    const { destination, budget, duration, preferences = [] } = req.body;

    if (!destination || !budget || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Destination, budget, and duration are required'
      });
    }

    console.log(`🗺️ Travel Recommendations - ${destination}, Budget: $${budget}, Duration: ${duration} days`);

    const response = await zaiClient.generateTravelRecommendations(
      destination, 
      budget, 
      duration, 
      preferences
    );

    if (response.success) {
      res.json({
        success: true,
        recommendations: response.content,
        destination,
        budget,
        duration,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to generate recommendations',
        recommendations: response.content
      });
    }

  } catch (error) {
    console.error('Travel Recommendations Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/budget-analysis
 * Generate budget analysis
 */
router.post('/budget-analysis', async (req, res) => {
  try {
    const { tripData, totalBudget } = req.body;

    if (!tripData || !totalBudget) {
      return res.status(400).json({
        success: false,
        error: 'Trip data and total budget are required'
      });
    }

    console.log(`💰 Budget Analysis - ${tripData.destination}, Budget: $${totalBudget}`);

    const response = await zaiClient.generateBudgetAnalysis(tripData, totalBudget);

    if (response.success) {
      res.json({
        success: true,
        analysis: response.content,
        tripData,
        totalBudget,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to generate budget analysis',
        analysis: response.content
      });
    }

  } catch (error) {
    console.error('Budget Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/destination-insights
 * Generate destination insights
 */
router.post('/destination-insights', async (req, res) => {
  try {
    const { destination, travelType = 'leisure' } = req.body;

    if (!destination) {
      return res.status(400).json({
        success: false,
        error: 'Destination is required'
      });
    }

    console.log(`🌍 Destination Insights - ${destination}, Type: ${travelType}`);

    const response = await zaiClient.generateDestinationInsights(destination, travelType);

    if (response.success) {
      res.json({
        success: true,
        insights: response.content,
        destination,
        travelType,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to generate destination insights',
        insights: response.content
      });
    }

  } catch (error) {
    console.error('Destination Insights Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/payment-recommendations
 * Generate payment recommendations
 */
router.post('/payment-recommendations', async (req, res) => {
  try {
    const { tripDetails, paymentMethod = 'credit_card' } = req.body;

    if (!tripDetails) {
      return res.status(400).json({
        success: false,
        error: 'Trip details are required'
      });
    }

    console.log(`💳 Payment Recommendations - ${tripDetails.destination}, Method: ${paymentMethod}`);

    const response = await zaiClient.generatePaymentRecommendations(tripDetails, paymentMethod);

    if (response.success) {
      res.json({
        success: true,
        recommendations: response.content,
        tripDetails,
        paymentMethod,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to generate payment recommendations',
        recommendations: response.content
      });
    }

  } catch (error) {
    console.error('Payment Recommendations Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/health
 * Health check for AI service
 */
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 AI Health Check...');
    
    const healthStatus = await zaiClient.healthCheck();

    res.json({
      success: healthStatus.success,
      status: healthStatus.status,
      service: 'Z.ai GLM-4.6',
      timestamp: new Date().toISOString(),
      error: healthStatus.error || null
    });

  } catch (error) {
    console.error('AI Health Check Error:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      service: 'Z.ai GLM-4.6'
    });
  }
});

/**
 * GET /api/ai/models
 * Get available models and capabilities
 */
router.get('/models', (req, res) => {
  res.json({
    success: true,
    models: {
      primary: 'glm-4.6',
      capabilities: [
        'text_generation',
        'travel_planning',
        'budget_analysis',
        'destination_insights',
        'payment_recommendations',
        'multilingual_support'
      ],
      languages: ['Arabic', 'English'],
      maxTokens: 2000,
      temperature: 0.7
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
