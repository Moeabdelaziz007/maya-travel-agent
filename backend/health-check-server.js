/**
 * Health Check HTTP Server
 * Provides HTTP endpoint for monitoring tools
 */

const http = require('http');
const healthMonitor = require('./utils/healthMonitor');
const conversationManager = require('./utils/conversationManager');
const logger = require('./utils/logger');

const PORT = process.env.HEALTH_CHECK_PORT || 3001;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Route handling
  if (req.url === '/health' || req.url === '/') {
    try {
      const health = healthMonitor.getHealth();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        ...health
      }, null, 2));
    } catch (error) {
      logger.error('Health check endpoint error', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
  }
  
  else if (req.url === '/metrics') {
    try {
      const metrics = healthMonitor.exportMetrics();
      const conversationStats = conversationManager.getStatistics();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        system: metrics,
        conversations: conversationStats
      }, null, 2));
    } catch (error) {
      logger.error('Metrics endpoint error', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
  }
  
  else if (req.url === '/status') {
    try {
      const summary = healthMonitor.getMetricsSummary();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        ...summary
      }, null, 2));
    } catch (error) {
      logger.error('Status endpoint error', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
  }
  
  else if (req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('pong');
  }
  
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Not found',
      availableEndpoints: [
        '/health',
        '/metrics',
        '/status',
        '/ping'
      ]
    }));
  }
});

server.listen(PORT, () => {
  logger.info(`Health check server listening on port ${PORT}`);
  logger.info('Available endpoints:');
  logger.info(`  - http://localhost:${PORT}/health`);
  logger.info(`  - http://localhost:${PORT}/metrics`);
  logger.info(`  - http://localhost:${PORT}/status`);
  logger.info(`  - http://localhost:${PORT}/ping`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing health check server...');
  server.close(() => {
    logger.info('Health check server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, closing health check server...');
  server.close(() => {
    logger.info('Health check server closed');
    process.exit(0);
  });
});

module.exports = server;
