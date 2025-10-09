/**
 * Rate Limiting Middleware for Maya Trips API
 * Protects endpoints from abuse and ensures fair usage
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Applies to all API routes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests, please slow down.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Strict rate limiter for AI endpoints
 * AI calls are expensive, so we limit them more strictly
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 AI requests per minute
  message: {
    success: false,
    error: 'Too many AI requests. Please wait before making more requests.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.warn(`⚠️ AI rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'AI request limit exceeded. Please wait before trying again.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: 10,
      window: '1 minute'
    });
  }
});

/**
 * Payment endpoint rate limiter
 * Prevent payment spam and fraud attempts
 */
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 payment requests per hour
  message: {
    success: false,
    error: 'Too many payment requests. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true, // Don't count failed requests
  handler: (req, res) => {
    console.warn(`⚠️ Payment rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Payment request limit exceeded. Please contact support if you need assistance.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Authentication rate limiter
 * Prevent brute force attacks on login/signup
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per 15 minutes
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    console.warn(`⚠️ Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Account temporarily locked.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Webhook rate limiter
 * Protect webhook endpoints from spam
 */
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 webhook calls per minute
  message: {
    success: false,
    error: 'Webhook rate limit exceeded.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️ Webhook rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Webhook rate limit exceeded.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Analytics rate limiter
 * Prevent analytics spam
 */
const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // Limit each IP to 50 analytics events per minute
  message: {
    success: false,
    error: 'Analytics rate limit exceeded.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️ Analytics rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many analytics events. Please slow down.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Multimodal AI rate limiter
 * Image/video analysis is very expensive
 */
const multimodalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 multimodal requests per hour
  message: {
    success: false,
    error: 'Multimodal AI request limit exceeded.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️ Multimodal rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Image/video analysis limit exceeded. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: 20,
      window: '1 hour'
    });
  }
});

/**
 * Create custom rate limiter with specific options
 */
const createCustomLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      success: false,
      error: 'Rate limit exceeded.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  });
};

module.exports = {
  generalLimiter,
  aiLimiter,
  paymentLimiter,
  authLimiter,
  webhookLimiter,
  analyticsLimiter,
  multimodalLimiter,
  createCustomLimiter
};
