const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import monitoring modules
const metrics = require('./src/monitoring/metrics');
const HealthChecker = require('./src/monitoring/health-check');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize health checker
const healthChecker = new HealthChecker();

// Middleware
app.use(cors());
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
    message: 'Maya Travel Agent API Server - Enhanced with Boss Agent & Dataiku ML',
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
      'Arabic/English Support'
    ],
    timestamp: new Date().toISOString()
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
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

    const statusCode = healthReport.overall_status === 'healthy' ? 200 :
      healthReport.overall_status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthReport);
  } catch (error) {
    console.error('Detailed health check error:', error);
    metrics.recordError('health_check_failed', 'monitoring');
    res.status(503).json({
      overall_status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
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
    message: 'Trips endpoint ready - Use /api/orchestration/plan-trip for enhanced planning',
    legacy: true
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
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
        rating: 4.8,
        priceRange: '$$$',
        bestTime: 'Mar-May, Sep-Nov'
      },
      {
        id: 2,
        name: 'Paris',
        country: 'France',
        image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
        rating: 4.9,
        priceRange: '$$$$',
        bestTime: 'Apr-Jun, Sep-Oct'
      },
      {
        id: 3,
        name: 'Dubai',
        country: 'UAE',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
        rating: 4.7,
        priceRange: '$$$',
        bestTime: 'Nov-Mar'
      }
    ]
  });
});

// Analytics ingestion (in-memory demo)
const analyticsEvents = [];
app.post('/api/analytics/events', (req, res) => {
  const { type, userId, payload } = req.body || {};
  analyticsEvents.push({
    type: type || 'unknown',
    userId: userId || null,
    payload: payload || {},
    ts: Date.now(),
    ua: req.headers['user-agent'] || ''
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

// Stripe webhook route
const stripeWebhook = require('./routes/stripe-webhook');
app.use('/api/payment', stripeWebhook);

// Mini App routes
const miniappRoutes = require('./routes/miniapp');
app.use('/api/telegram', miniappRoutes);

// AI routes (Z.ai GLM-4.6) - Enhanced with Boss Agent
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// Enhanced Orchestration routes (NEW)
const orchestrationRoutes = require('./routes/orchestration');
app.use('/api/orchestration', orchestrationRoutes);

// Fivetran data pipeline routes (NEW)
const fivetranRoutes = require('./routes/fivetran');
app.use('/api/fivetran', fivetranRoutes);

// Dataiku ML Model routes (NEW)
const dataikuRoutes = require('./routes/dataiku');
app.use('/api/dataiku', dataikuRoutes);

// Advanced Telegram Bot (only start if token is provided and not in test mode)
if (process.env.TELEGRAM_BOT_TOKEN && process.env.NODE_ENV !== 'test') {
  try {
    const advancedTelegramBot = require('./advanced-telegram-bot');
    console.log('🤖 Advanced Maya Telegram Bot integration enabled');
    console.log('🧠 AI Persona: Maya - Professional Travel Agent with Emotional Intelligence');
    console.log('🎯 Boss Agent: Enhanced orchestration with skill plugins');
    console.log('💰 Price Monitoring: Real-time alerts and optimization');
    console.log('🔮 Dataiku ML: Flight & Hotel Price Prediction, User Churn Analysis');
    console.log('🛠️ MCP Tools: Weather, Flights, Hotels, Halal Restaurants, Prayer Times');
    console.log('👤 User Profiling: Advanced personalization and data collection');
  } catch (error) {
    console.log('⚠️ Failed to initialize Telegram Bot:', error.message);
    console.log('📊 Monitoring setup will continue without Telegram Bot');
  }
} else {
  console.log('⚠️ Telegram Bot token not provided or in test mode - Advanced Bot integration disabled');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
    timestamp: new Date().toISOString()
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
      'GET /api/openapi.json',
      'GET /api/destinations',
      'GET /api/trips',
      'POST /api/analytics/events',
      'GET /api/analytics/summary',
      'POST /api/ai/chat',
      'POST /api/ai/travel-recommendations',
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
      'GET /api/dataiku/health'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Maya Travel Agent v2.0 - Enhanced Server with Dataiku ML');
  console.log(`📍 Port: ${PORT}`);
  console.log('🌐 Frontend: http://localhost:3000');
  console.log(`🔧 Backend API: http://localhost:${PORT}`);
  console.log(`🎯 Boss Agent: http://localhost:${PORT}/api/orchestration`);
  console.log(`🔮 Dataiku ML: http://localhost:${PORT}/api/dataiku`);
  console.log('🧠 Skills System: Enabled');
  console.log('💰 Price Monitoring: Ready');
  console.log('📊 Enhanced Analytics: Active');
  console.log('🤖 AI Integration: Z.ai GLM-4.6 + Boss Agent');
  console.log('🔮 ML Models: Flight & Hotel Price Prediction, User Churn Analysis');
});

module.exports = app;