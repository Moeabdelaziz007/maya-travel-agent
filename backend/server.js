const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Stripe webhook requires raw body; mount raw parser just for that route
app.use('/api/payment/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(express.json());

// MongoDB Connection (Optional - using Supabase instead)
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maya-trips';

// mongoose.connect(MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
// .then(() => console.log('✅ Connected to MongoDB'))
// .catch(err => console.error('❌ MongoDB connection error:', err));

console.log('✅ Using Supabase as database (MongoDB not required)');

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Maya Trips API Server',
        version: '1.0.0',
        status: 'running',
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
        memory: process.memoryUsage()
    });
});

// Trip routes
app.get('/api/trips', (req, res) => {
    res.json({
        trips: [],
        message: 'Trips endpoint ready'
    });
});

// AI Assistant routes
app.post('/api/ai/chat', (req, res) => {
    const { message } = req.body;
    
    // Placeholder AI response
    res.json({
        response: `مرحباً! أنا Maya، مساعد السفر الذكي الخاص بك. سأساعدك في تخطيط رحلتك المثالية. ${message}`,
        timestamp: new Date().toISOString()
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

// AI routes (Z.ai GLM-4.6)
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// Telegram Bot (only start if token is provided)
if (process.env.TELEGRAM_BOT_TOKEN) {
  const telegramBot = require('./telegram-bot');
  console.log('🤖 Telegram Bot integration enabled');
} else {
  console.log('⚠️ Telegram Bot token not provided - Bot integration disabled');
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Maya Trips server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:3000`);
    console.log(`🔧 Backend API: http://localhost:${PORT}`);
});

module.exports = app;
