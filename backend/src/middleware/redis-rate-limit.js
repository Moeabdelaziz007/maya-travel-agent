/**
 * Redis-based Rate Limiting Middleware
 * Replaces memory store with Redis for distributed rate limiting
 */

const redisService = require('../services/redis-service');
const redisConfig = require('../config/redis-config');

class RedisStore {
  constructor(options = {}) {
    this.prefix = options.prefix || redisConfig.rateLimit.prefix;
    this.resetTime = options.resetTime || null;
  }

  /**
   * Increment counter for key
   */
  async incr(key, callback) {
    try {
      const fullKey = this.prefix + key;
      const count = await redisService.incr(fullKey.replace(redisConfig.cache.prefix, ''));

      if (count === 1 && this.resetTime) {
        // Set expiration for first request
        await redisService.expire(fullKey.replace(redisConfig.cache.prefix, ''), this.resetTime);
      }

      callback(null, count);
    } catch (error) {
      console.error('❌ Redis rate limit incr error:', error.message);
      callback(error, 0);
    }
  }

  /**
   * Decrement counter for key
   */
  async decr(key, callback) {
    try {
      const fullKey = this.prefix + key;
      const count = await redisService.decr(fullKey.replace(redisConfig.cache.prefix, ''));

      callback(null, count);
    } catch (error) {
      console.error('❌ Redis rate limit decr error:', error.message);
      callback(error, 0);
    }
  }

  /**
   * Reset counter for key
   */
  async resetKey(key, callback) {
    try {
      const fullKey = this.prefix + key;
      const result = await redisService.del(fullKey.replace(redisConfig.cache.prefix, ''));

      callback(null, result);
    } catch (error) {
      console.error('❌ Redis rate limit resetKey error:', error.message);
      callback(error, 0);
    }
  }
}

/**
 * Create Redis-based rate limiter
 */
function createRedisRateLimiter(options = {}) {
  const rateLimit = require('express-rate-limit');

  return rateLimit({
    // Redis store configuration
    store: new RedisStore({
      prefix: options.prefix || redisConfig.rateLimit.prefix,
      resetTime: Math.ceil((options.windowMs || redisConfig.rateLimit.windowMs) / 1000),
    }),

    // Rate limiting settings
    windowMs: options.windowMs || redisConfig.rateLimit.windowMs,
    max: options.max || redisConfig.rateLimit.maxRequests,

    // Response configuration
    message: options.message || {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: `${Math.ceil((options.windowMs || redisConfig.rateLimit.windowMs) / 1000 / 60)} minutes`
    },

    // Headers
    standardHeaders: options.standardHeaders !== false,
    legacyHeaders: options.legacyHeaders || false,

    // Skip function
    skip: options.skip || ((req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health' ||
             req.path === '/health' ||
             req.path === '/api/public/ping';
    }),

    // Request handler for rate limit exceeded
    handler: options.handler || ((req, res) => {
      console.warn(`⚠️  Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);

      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: `${Math.ceil((options.windowMs || redisConfig.rateLimit.windowMs) / 1000 / 60)} minutes`,
        limit: options.max || redisConfig.rateLimit.maxRequests,
        windowMs: options.windowMs || redisConfig.rateLimit.windowMs,
      });
    }),

    // Request handler for successful requests
    onLimitReached: options.onLimitReached || ((req, res, options) => {
      console.warn(`🚫 Rate limit reached for IP: ${req.ip}, Path: ${req.path}`);
    }),
  });
}

/**
 * Enhanced rate limiting configuration with Redis
 */
function configureRedisRateLimiting(app) {
  console.log('🔴 Setting up Redis-based rate limiting...');

  // General rate limiter - more permissive for production
  const generalLimiter = createRedisRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 500 : 1000, // Higher limit for production
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    prefix: 'ratelimit:general:',
  });

  // API rate limiter - stricter for API endpoints
  const apiLimiter = createRedisRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 200 : 500, // Stricter for API routes
    message: {
      error: 'Too many API requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    prefix: 'ratelimit:api:',
  });

  // AI endpoints rate limiter - very strict
  const aiLimiter = createRedisRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'production' ? 30 : 60, // Very strict for AI
    message: {
      error: 'Too many AI requests, please slow down.',
      retryAfter: '1 minute'
    },
    prefix: 'ratelimit:ai:',
  });

  // Payment endpoints rate limiter - strict
  const paymentLimiter = createRedisRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: process.env.NODE_ENV === 'production' ? 20 : 50, // Strict for payments
    message: {
      error: 'Too many payment requests, please try again later.',
      retryAfter: '5 minutes'
    },
    prefix: 'ratelimit:payment:',
  });

  // Apply general rate limiting to all routes
  app.use(generalLimiter);

  // Apply stricter rate limiting to API routes
  app.use('/api/', apiLimiter);

  // Apply very strict rate limiting to AI endpoints
  app.use('/api/ai/', aiLimiter);

  // Apply strict rate limiting to payment endpoints
  app.use('/api/payment/', paymentLimiter);

  console.log('✅ Redis-based rate limiting configured');
}

/**
 * Get rate limit status for an IP/key
 */
async function getRateLimitStatus(key, type = 'general') {
  try {
    const prefix = `ratelimit:${type}:`;
    const fullKey = prefix + key;

    const count = await redisService.get(fullKey.replace(redisConfig.cache.prefix, ''));
    const ttl = await redisService.ttl(fullKey.replace(redisConfig.cache.prefix, ''));

    return {
      current: count || 0,
      remaining: Math.max(0, redisConfig.rateLimit.maxRequests - (count || 0)),
      resetTime: ttl,
      limit: redisConfig.rateLimit.maxRequests,
    };
  } catch (error) {
    console.error('❌ Failed to get rate limit status:', error.message);
    return {
      current: 0,
      remaining: redisConfig.rateLimit.maxRequests,
      resetTime: -1,
      limit: redisConfig.rateLimit.maxRequests,
      error: error.message,
    };
  }
}

/**
 * Reset rate limit for a key
 */
async function resetRateLimit(key, type = 'general') {
  try {
    const prefix = `ratelimit:${type}:`;
    const fullKey = prefix + key;

    return await redisService.del(fullKey.replace(redisConfig.cache.prefix, ''));
  } catch (error) {
    console.error('❌ Failed to reset rate limit:', error.message);
    return false;
  }
}

module.exports = {
  RedisStore,
  createRedisRateLimiter,
  configureRedisRateLimiting,
  getRateLimitStatus,
  resetRateLimit,
};
