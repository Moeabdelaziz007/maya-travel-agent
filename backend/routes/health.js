const express = require('express');
const router = express.Router();

/**
 * Health Check Endpoint
 * Used by Railway and monitoring services to verify server status
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'amrikyy-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0'
  });
});

module.exports = router;

