/**
 * Redis Configuration
 * Centralized configuration for Redis connections and settings
 */

require('dotenv').config();

const redisConfig = {
  // Connection settings
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  url: process.env.REDIS_URL || 'redis://localhost:6379',

  // Connection options
  tls: process.env.REDIS_TLS === 'true' ? {} : false,
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT) || 60000,
  commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT) || 5000,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,

  // Connection pool
  maxConnections: parseInt(process.env.REDIS_MAX_CONNECTIONS) || 10,

  // Cache settings
  cache: {
    ttl: parseInt(process.env.REDIS_CACHE_TTL) || 3600, // 1 hour default
    prefix: process.env.REDIS_CACHE_PREFIX || 'amrikyy:',
  },

  // Session settings
  session: {
    ttl: parseInt(process.env.REDIS_SESSION_TTL) || 86400, // 24 hours default
    prefix: 'session:',
  },

  // Rate limiting settings
  rateLimit: {
    prefix: process.env.REDIS_RATE_LIMIT_PREFIX || 'ratelimit:',
    windowMs: parseInt(process.env.REDIS_RATE_LIMIT_WINDOW) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.REDIS_RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Environment-specific settings
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment:
    process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  isTest: process.env.NODE_ENV === 'test',

  // Monitoring settings
  monitoring: {
    enableMetrics: true,
    slowCommandThreshold: 100, // ms
    logSlowCommands: process.env.NODE_ENV !== 'test',
  },
};

// Validation
if (!redisConfig.host) {
  throw new Error('REDIS_HOST is required');
}

if (redisConfig.port < 1 || redisConfig.port > 65535) {
  throw new Error('REDIS_PORT must be between 1 and 65535');
}

if (redisConfig.db < 0 || redisConfig.db > 15) {
  throw new Error('REDIS_DB must be between 0 and 15');
}

// Production-specific validations
if (redisConfig.isProduction) {
  if (!redisConfig.password && !redisConfig.url.includes('rediss://')) {
    console.warn(
      '⚠️  WARNING: Redis password not set in production. Consider enabling authentication.'
    );
  }

  if (redisConfig.tls === false) {
    console.warn(
      '⚠️  WARNING: Redis TLS not enabled in production. Consider enabling TLS.'
    );
  }
}

console.log(
  `🔴 Redis Config: ${redisConfig.host}:${redisConfig.port} (DB: ${redisConfig.db})`
);

module.exports = redisConfig;
