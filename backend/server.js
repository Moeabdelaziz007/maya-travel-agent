// Sentry must be required FIRST to capture all errors!
const Sentry = require('./instrument');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import monitoring modules
const metrics = require('./src/monitoring/metrics');
const HealthChecker = require('./src/monitoring/health-check');
const logger = require('./src/utils/logger');

// Import Redis service
const redisService = require('./src/services/redis-service');
const RedisSessionStore = require('./src/services/redis-session-store');

// Import Enhanced AI services
const enhancedAIService = require('./src/services/enhanced-ai-service');
const vllmService = require('./src/services/vllm-service');
const quantumService = require('./src/services/quantum-service');

// Import new security middleware
const {
  securityHeaders,
  configureCORS,
  configureRateLimiting,
} = require('./src/middleware/security');
const {
  validateAnalyticsEvent,
  createValidationMiddleware,
  schemas,
} = require('./src/middleware/validation');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize health checker
const healthChecker = new HealthChecker();

// Initialize Redis service (if configured)
let redisInitialized = false;
if (process.env.REDIS_HOST || process.env.REDIS_URL) {
  console.log('🔴 Redis configured, will initialize on first request...');
  redisInitialized = true;
} else {
  console.log('💾 Redis not configured, using memory stores');
}

// Configure security middleware
console.log('🛡️ Configuring security middleware...');
configureCORS(app);
app.use(securityHeaders);
configureRateLimiting(app);
console.log('✅ Security middleware configured');

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for enhanced requests

// Add metrics middleware for HTTP request monitoring
app.use(metrics.httpMetricsMiddleware);

// Serve static files from frontend directory (login, signup pages)
app.use(express.static(path.join(__dirname, '../frontend')));

// Stripe webhook requires raw body; mount raw parser just for that route
app.use('/api/payment/webhook', bodyParser.raw({ type: 'application/json' }));

console.log('✅ Using Supabase as database (MongoDB not required)');
console.log('🌐 Serving static auth pages from frontend directory');

// Routes
app.get('/', (req, res) => {
  res.json({
    message:
      'Amrikyy AI Automation Platform API Server - Enhanced with Boss Agent & Dataiku ML',
    version: '2.0.0',
    status: 'running',
    features: [
      'Boss Agent Orchestration',
      'Skill Plugin System',
      'Emotional Intelligence',
      'Real-time Price Monitoring',
      'Dataiku ML Integration',
      'Flight & Hotel Price Prediction',
      'User Churn Prediction',
      'Arabic/English Support',
      'Travel Services Module',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Public API: ping
app.get('/api/public/ping', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// OpenAPI spec
app.get('/api/openapi.json', (req, res) => {
  try {
    const spec = require('./openapi.json');
    res.json(spec);
  } catch (e) {
    res.status(500).json({ error: 'Spec not found' });
  }
});

// Health check endpoint (for Railway and load balancers)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'amrikyy-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
  });
});

// Health check endpoint (API version)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0',
  });
});

// Comprehensive health check endpoint
app.get('/api/health/detailed', async (req, res) => {
  try {
    const healthReport = await healthChecker.getHealthReport();

    // Update metrics with health status
    metrics.updateSystemHealth(healthReport.overall_status);

    // Update dependency health metrics
    Object.entries(healthReport.checks).forEach(([dependency, check]) => {
      metrics.updateDependencyHealth(dependency, check.status);
    });

    const statusCode =
      healthReport.overall_status === 'healthy'
        ? 200
        : healthReport.overall_status === 'degraded'
        ? 200
        : 503;

    res.status(statusCode).json(healthReport);
  } catch (error) {
    console.error('Detailed health check error:', error);
    metrics.recordError('health_check_failed', 'monitoring');
    res.status(503).json({
      overall_status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metricsData = await metrics.getMetrics();
    res.set('Content-Type', metrics.getRegistry().contentType);
    res.end(metricsData);
  } catch (error) {
    console.error('Metrics endpoint error:', error);
    res.status(500).end('# Error generating metrics\n');
  }
});

// Trip routes (legacy - will be replaced by orchestration)
app.get('/api/trips', (req, res) => {
  res.json({
    trips: [],
    message:
      'Trips endpoint ready - Use /api/orchestration/plan-trip for enhanced planning',
    legacy: true,
  });
});

// Destinations routes
app.get('/api/destinations', (req, res) => {
  res.json({
    destinations: [
      {
        id: 1,
        name: 'Tokyo',
        country: 'Japan',
        image:
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
        rating: 4.8,
        priceRange: '$$$',
        bestTime: 'Mar-May, Sep-Nov',
      },
      {
        id: 2,
        name: 'Paris',
        country: 'France',
        image:
          'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
        rating: 4.9,
        priceRange: '$$$$',
        bestTime: 'Apr-Jun, Sep-Oct',
      },
      {
        id: 3,
        name: 'Dubai',
        country: 'UAE',
        image:
          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
        rating: 4.7,
        priceRange: '$$$',
        bestTime: 'Nov-Mar',
      },
    ],
  });
});

// Analytics ingestion (in-memory demo)
const analyticsEvents = [];
app.post('/api/analytics/events', validateAnalyticsEvent, (req, res) => {
  const { type, userId, payload } = req.body || {};
  analyticsEvents.push({
    type: type || 'unknown',
    userId: userId || null,
    payload: payload || {},
    ts: Date.now(),
    ua: req.headers['user-agent'] || '',
  });
  res.json({ success: true });
});

app.get('/api/analytics/summary', (req, res) => {
  const byType = analyticsEvents.reduce((acc, ev) => {
    acc[ev.type] = (acc[ev.type] || 0) + 1;
    return acc;
  }, {});
  const total = analyticsEvents.length;
  res.json({ total, byType, last10: analyticsEvents.slice(-10).reverse() });
});

// Payment routes
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

// Stripe webhook route - mount specifically to webhook endpoint
const stripeWebhook = require('./routes/stripe-webhook');
app.use('/api/payment/webhook', stripeWebhook);

// Mini App routes
const miniappRoutes = require('./routes/miniapp');
app.use('/api/telegram', miniappRoutes);

// AI routes (Z.ai GLM-4.6) - Enhanced with Boss Agent
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// Enhanced AI routes (vLLM + Quantum)
app.post('/api/enhanced-ai/chat', async (req, res) => {
  try {
    const { query, userData, options } = req.body;
    const response = await enhancedAIService.processTravelQuery(query, userData || {}, options || {});

    res.json({
      success: true,
      ...response,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Enhanced AI chat error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: Date.now()
    });
  }
});

app.get('/api/enhanced-ai/stream/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { query, userData } = req.query;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await enhancedAIService.getStreamingResponse(query, userData || {}, (chunk) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    });

    res.end();
  } catch (error) {
    console.error('Enhanced AI streaming error:', error.message);
    res.status(500).end();
  }
});

app.get('/api/enhanced-ai/health', async (req, res) => {
  try {
    const health = await enhancedAIService.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/enhanced-ai/clear-cache', async (req, res) => {
  try {
    const cleared = await enhancedAIService.clearCache();
    res.json({ success: true, cleared, timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quantum service routes
app.post('/api/quantum/encrypt', async (req, res) => {
  try {
    const { data } = req.body;
    const encrypted = await quantumService.encryptData(data);
    res.json({ success: true, encrypted, timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/quantum/decrypt', async (req, res) => {
  try {
    const { encryptedData } = req.body;
    const decrypted = await quantumService.decryptData(encryptedData);
    res.json({ success: true, decrypted, timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/quantum/sign', async (req, res) => {
  try {
    const { data } = req.body;
    const signature = await quantumService.signData(data);
    res.json({ success: true, signature, timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/quantum/health', async (req, res) => {
  try {
    const health = await quantumService.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// vLLM service routes
app.get('/api/vllm/health', async (req, res) => {
  try {
    const health = await vllmService.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vllm/generate', async (req, res) => {
  try {
    const { params } = req.body;
    const result = await vllmService.generateTravelPlan(params);
    res.json({ success: true, result, timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced Orchestration routes (NEW)
const orchestrationRoutes = require('./routes/orchestration');
app.use('/api/orchestration', orchestrationRoutes);

// Fivetran data pipeline routes (NEW)
const fivetranRoutes = require('./routes/fivetran');
app.use('/api/fivetran', fivetranRoutes);

// Dataiku ML Model routes (NEW)
const dataikuRoutes = require('./routes/dataiku');
app.use('/api/dataiku', dataikuRoutes);

// ============ QuantumFlow Orchestrator (QFO) Routes ============

// QFO Master API (Main Entry Point)
const qfoRoutes = require('./routes/qfo');
app.use('/api/qfo', qfoRoutes);

// Workflow Engine routes
const workflowRoutes = require('./routes/workflow');
app.use('/api/workflow', workflowRoutes);

// Gamification routes
const gamificationRoutes = require('./routes/gamification');
app.use('/api/gamification', gamificationRoutes);

// Super App routes
const superappRoutes = require('./routes/superapp');
app.use('/api/superapp', superappRoutes);

// Blockchain routes
const blockchainRoutes = require('./routes/blockchain');
app.use('/api/blockchain', blockchainRoutes);

// Live Stream routes
const livestreamRoutes = require('./routes/livestream');
app.use('/api/livestream', livestreamRoutes);

// Prediction routes
const predictionRoutes = require('./routes/prediction');
app.use('/api/prediction', predictionRoutes);

logger.info('✅ QFO Routes mounted successfully');

// Advanced Telegram Bot (only start if token is provided and not in test mode)
if (process.env.TELEGRAM_BOT_TOKEN && process.env.NODE_ENV !== 'test') {
  // Check if token is a placeholder
  if (process.env.TELEGRAM_BOT_TOKEN.includes('your_telegram_bot_token_here')) {
    console.log(
      '⚠️ Telegram Bot token not configured - skipping bot initialization'
    );
  } else {
    try {
      const advancedTelegramBot = require('./advanced-telegram-bot');
      console.log('🤖 Advanced Amrikyy Telegram Bot integration enabled');
      console.log(
        '🧠 AI Persona: Amrikyy - Professional AI Assistant with Emotional Intelligence'
      );
      console.log('🎯 Boss Agent: Enhanced orchestration with skill plugins');
      console.log('💰 Price Monitoring: Real-time alerts and optimization');
      console.log(
        '🔮 Dataiku ML: Flight & Hotel Price Prediction, User Churn Analysis'
      );
      console.log(
        '🛠️ MCP Tools: Weather, Flights, Hotels, Halal Restaurants, Prayer Times'
      );
      console.log(
        '👤 User Profiling: Advanced personalization and data collection'
      );
    } catch (error) {
      console.log('⚠️ Failed to initialize Telegram Bot:', error.message);
      console.log('📊 Monitoring setup will continue without Telegram Bot');
    }
  }
} else {
  console.log(
    '⚠️ Telegram Bot token not provided or in test mode - Advanced Bot integration disabled'
  );
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /api/public/ping',
      'GET /api/health',
      'GET /api/health/detailed',
      'GET /metrics',
      'GET /api/openapi.json',
      'GET /api/destinations',
      'GET /api/trips',
      'POST /api/analytics/events',
      'GET /api/analytics/summary',
      'POST /api/ai/chat',
      'POST /api/ai/travel-recommendations',
      'POST /api/ai/budget-analysis',
      'POST /api/ai/destination-insights',
      'POST /api/ai/payment-recommendations',
      'POST /api/ai/multimodal/analyze',
      'GET /api/ai/health',
      'GET /api/ai/models',
      'POST /api/ai/predict-intent',
      'POST /api/ai/intent-feedback',
      // Enhanced AI endpoints (vLLM + Quantum)
      'POST /api/enhanced-ai/chat',
      'GET /api/enhanced-ai/stream/:sessionId',
      'GET /api/enhanced-ai/health',
      'POST /api/enhanced-ai/clear-cache',
      // Quantum service endpoints
      'POST /api/quantum/encrypt',
      'POST /api/quantum/decrypt',
      'POST /api/quantum/sign',
      'GET /api/quantum/health',
      // vLLM service endpoints
      'GET /api/vllm/health',
      'POST /api/vllm/generate',
      'POST /api/orchestration/plan-trip',
      'POST /api/orchestration/chat',
      'GET /api/orchestration/health',
      'GET /api/orchestration/metrics',
      'POST /api/fivetran/connectors/telegram',
      'POST /api/fivetran/connectors/stripe',
      'POST /api/fivetran/destinations/supabase',
      'GET /api/fivetran/connectors',
      'GET /api/fivetran/connectors/:id/status',
      'POST /api/fivetran/connectors/:id/sync',
      'GET /api/fivetran/connectors/:id/logs',
      'PATCH /api/fivetran/connectors/:id/pause',
      'DELETE /api/fivetran/connectors/:id',
      'POST /api/fivetran/transform/telegram',
      'POST /api/fivetran/transform/stripe',
      'GET /api/dataiku/test-connection',
      'GET /api/dataiku/project-info',
      'POST /api/dataiku/train-flight-model',
      'POST /api/dataiku/predict-flight-price',
      'POST /api/dataiku/batch-predict-flights',
      'POST /api/dataiku/train-hotel-model',
      'POST /api/dataiku/predict-hotel-price',
      'POST /api/dataiku/batch-predict-hotels',
      'GET /api/dataiku/hotel-price-trends/:hotelName/:city',
      'POST /api/dataiku/train-churn-model',
      'POST /api/dataiku/predict-churn',
      'POST /api/dataiku/batch-predict-churn',
      'POST /api/dataiku/high-risk-users',
      'POST /api/dataiku/retention-insights',
      'GET /api/dataiku/model-metrics/:modelName',
      'GET /api/dataiku/health',
      'POST /api/payment/stripe/create-payment-intent',
      'POST /api/payment/stripe/confirm-payment',
      'GET /api/payment/stripe/payment-methods',
      'POST /api/payment/webhook',
      'GET /api/telegram/webhook',
      'POST /api/telegram/webhook',
      'GET /api/telegram/user/:userId',
      'POST /api/telegram/send-message',
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Amrikyy Travel Agent v2.0 - Enhanced Server with Dataiku ML');
  console.log(`📍 Port: ${PORT}`);
  console.log('🌐 Frontend: http://localhost:3000');
  console.log(`🔧 Backend API: http://localhost:${PORT}`);
  console.log(`🎯 Boss Agent: http://localhost:${PORT}/api/orchestration`);
  console.log(`🔮 Dataiku ML: http://localhost:${PORT}/api/dataiku`);
  console.log('🧠 Skills System: Enabled');
  console.log('💰 Price Monitoring: Ready');
  console.log('📊 Enhanced Analytics: Active');
  console.log('🤖 AI Integration: Z.ai GLM-4.6 + Boss Agent');
  console.log(
    '🔮 ML Models: Flight & Hotel Price Prediction, User Churn Analysis'
  );
});

module.exports = app;
