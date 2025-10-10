/**
 * Prometheus Metrics Collection for Amriyy Travel Agent
 * Comprehensive monitoring for Boss Agent, Skills, API performance, and system health
 */

const promClient = require('prom-client');
const logger = require('../utils/logger');

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'maya-travel-agent',
  environment: process.env.NODE_ENV || 'development'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics for HTTP requests
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

// Boss Agent orchestration metrics
const bossAgentOrchestrationTotal = new promClient.Counter({
  name: 'boss_agent_orchestration_total',
  help: 'Total number of Boss Agent orchestrations',
  labelNames: ['status', 'intent'],
  registers: [register]
});

const bossAgentOrchestrationDuration = new promClient.Histogram({
  name: 'boss_agent_orchestration_duration_seconds',
  help: 'Duration of Boss Agent orchestrations',
  labelNames: ['intent'],
  buckets: [1, 5, 10, 30, 60, 120],
  registers: [register]
});

// Skill execution metrics
const skillExecutionTotal = new promClient.Counter({
  name: 'skill_execution_total',
  help: 'Total number of skill executions',
  labelNames: ['skill_name', 'status'],
  registers: [register]
});

const skillExecutionDuration = new promClient.Histogram({
  name: 'skill_execution_duration_seconds',
  help: 'Duration of skill executions',
  labelNames: ['skill_name'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

// Cache metrics
const cacheHits = new promClient.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
  registers: [register]
});

const cacheMisses = new promClient.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
  registers: [register]
});

// Error metrics
const errorsTotal = new promClient.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['error_type', 'component'],
  registers: [register]
});

// Business metrics
const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of currently active users',
  registers: [register]
});

const friendshipLevels = new promClient.Gauge({
  name: 'friendship_levels',
  help: 'Current friendship levels distribution',
  labelNames: ['level'],
  registers: [register]
});

// External API metrics
const externalApiCallsTotal = new promClient.Counter({
  name: 'external_api_calls_total',
  help: 'Total number of external API calls',
  labelNames: ['api_name', 'status'],
  registers: [register]
});

const externalApiCallDuration = new promClient.Histogram({
  name: 'external_api_call_duration_seconds',
  help: 'Duration of external API calls',
  labelNames: ['api_name'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

// System health metrics
const systemHealthStatus = new promClient.Gauge({
  name: 'system_health_status',
  help: 'Overall system health status (0=unhealthy, 1=degraded, 2=healthy)',
  registers: [register]
});

const dependencyHealthStatus = new promClient.Gauge({
  name: 'dependency_health_status',
  help: 'Dependency health status (0=unhealthy, 1=degraded, 2=healthy)',
  labelNames: ['dependency'],
  registers: [register]
});

/**
 * Middleware to collect HTTP metrics
 */
function httpMetricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode.toString()
    });

    httpRequestDuration.observe({
      method: req.method,
      route: route
    }, duration);

    // Log slow requests
    if (duration > 5) {
      logger.warn('Slow HTTP request detected', {
        method: req.method,
        route: route,
        duration: duration,
        statusCode: res.statusCode
      });
    }
  });

  next();
}

/**
 * Record Boss Agent orchestration metrics
 */
function recordBossAgentOrchestration(intent, duration, success = true) {
  bossAgentOrchestrationTotal.inc({
    status: success ? 'success' : 'failure',
    intent: intent || 'unknown'
  });

  bossAgentOrchestrationDuration.observe({
    intent: intent || 'unknown'
  }, duration / 1000);
}

/**
 * Record skill execution metrics
 */
function recordSkillExecution(skillName, duration, success = true) {
  skillExecutionTotal.inc({
    skill_name: skillName,
    status: success ? 'success' : 'failure'
  });

  skillExecutionDuration.observe({
    skill_name: skillName
  }, duration / 1000);
}

/**
 * Record cache metrics
 */
function recordCacheHit(cacheType = 'default') {
  cacheHits.inc({ cache_type: cacheType });
}

function recordCacheMiss(cacheType = 'default') {
  cacheMisses.inc({ cache_type: cacheType });
}

/**
 * Record error metrics
 */
function recordError(errorType, component = 'unknown') {
  errorsTotal.inc({
    error_type: errorType,
    component: component
  });
}

/**
 * Record external API call metrics
 */
function recordExternalApiCall(apiName, duration, success = true) {
  externalApiCallsTotal.inc({
    api_name: apiName,
    status: success ? 'success' : 'failure'
  });

  externalApiCallDuration.observe({
    api_name: apiName
  }, duration / 1000);
}

/**
 * Update active users gauge
 */
function updateActiveUsers(count) {
  activeUsers.set(count);
}

/**
 * Update friendship levels distribution
 */
function updateFriendshipLevels(levels) {
  // Reset all levels first
  friendshipLevels.reset();

  // Set new values
  Object.entries(levels).forEach(([level, count]) => {
    friendshipLevels.set({ level }, count);
  });
}

/**
 * Update system health status
 */
function updateSystemHealth(status) {
  const statusValue = status === 'healthy' ? 2 : status === 'degraded' ? 1 : 0;
  systemHealthStatus.set(statusValue);
}

/**
 * Update dependency health status
 */
function updateDependencyHealth(dependency, status) {
  const statusValue = status === 'healthy' ? 2 : status === 'degraded' ? 1 : 0;
  dependencyHealthStatus.set({ dependency }, statusValue);
}

/**
 * Get metrics in Prometheus format
 */
function getMetrics() {
  return register.metrics();
}

/**
 * Get registry for advanced operations
 */
function getRegistry() {
  return register;
}

module.exports = {
  httpMetricsMiddleware,
  recordBossAgentOrchestration,
  recordSkillExecution,
  recordCacheHit,
  recordCacheMiss,
  recordError,
  recordExternalApiCall,
  updateActiveUsers,
  updateFriendshipLevels,
  updateSystemHealth,
  updateDependencyHealth,
  getMetrics,
  getRegistry,
  register
};