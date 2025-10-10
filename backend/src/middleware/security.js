/**
 * Security middleware for Maya Travel Agent
 */

const helmet = require('helmet');

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['self'],
      styleSrc: ['self', 'unsafe-inline', 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
      fontSrc: ['self', 'https://fonts.gstatic.com'],
      scriptSrc: ['self', 'unsafe-inline', 'https://cdn.jsdelivr.net'],
      imgSrc: ['self', 'data:', 'https:', 'blob:'],
      connectSrc: ['self', 'https://api.z.ai', 'https://*.supabase.co', 'https://api.stripe.com'],
      frameSrc: ['self', 'https://js.stripe.com', 'https://hooks.stripe.com'],
      objectSrc: ['none'],
      upgradeInsecureRequests: []
    }
  }
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// CORS configuration
function configureCORS(app) {
  const cors = require('cors');

  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://maya-travel-agent.vercel.app',
        'https://maya-travel-agent.com',
        'https://www.maya-travel-agent.com',
        /^https:\/\/maya-travel-agent-.*\.vercel\.app$/ // Vercel preview deployments
      ];

      // Check if origin matches allowed patterns
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return allowed === origin;
        } else if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'Stripe-Signature'
    ],
    exposedHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400 // 24 hours
  };

  app.use(cors(corsOptions));
}

// Rate limiting configuration
function configureRateLimiting(app) {
  const rateLimit = require('express-rate-limit');

  // General rate limiter - more permissive for production
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 500 : 1000, // Higher limit for production
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    }
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health' || req.path === '/api/public/ping';
    }
  });

  // API rate limiter - stricter for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 200 : 500, // Stricter for API routes
    message: {
      error: 'Too many API requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    }
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health' || req.path === '/api/public/ping';
    }
  });

  // Apply general rate limiting to all routes
  app.use(generalLimiter);

  // Apply stricter rate limiting to API routes
  app.use('/api/', apiLimiter);
}

module.exports = {
  securityHeaders,
  configureCORS,
  configureRateLimiting
};