/**
 * Sentry Error Tracking Instrumentation
 * This file must be required before any other modules!
 */

const Sentry = require('@sentry/node');
require('dotenv').config();

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Environment (development, staging, production)
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  
  // Send user IP addresses and other PII data
  sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === 'true',
  
  // Performance monitoring - capture 100% of transactions in dev, 10% in prod
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Set release version for better tracking
  release: `amrikyy-backend@${require('./package.json').version}`,
  
  // Additional context
  initialScope: {
    tags: {
      'service': 'amrikyy-backend',
      'runtime': 'node',
      'organization': process.env.SENTRY_ORG_SLUG || 'aaas-6y'
    }
  },
  
  // Error filtering - don't send these to Sentry
  beforeSend(event, hint) {
    // Filter out expected errors
    const error = hint.originalException;
    
    if (error && error.message) {
      // Don't send validation errors
      if (error.message.includes('Validation failed')) {
        return null;
      }
      
      // Don't send rate limit errors (they're expected)
      if (error.message.includes('Too many requests')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Integrations for better error tracking
  integrations: [
    // Capture console.log, console.error, etc.
    new Sentry.Integrations.Console({
      levels: ['error']
    }),
    
    // Capture HTTP requests
    new Sentry.Integrations.Http({
      tracing: true
    }),
    
    // Capture unhandled promise rejections
    new Sentry.Integrations.OnUncaughtException({
      exitEvenIfOtherHandlersAreRegistered: false
    }),
    
    new Sentry.Integrations.OnUnhandledRejection({
      mode: 'warn'
    })
  ]
});

// Log successful initialization
if (process.env.SENTRY_DSN) {
  console.log('✅ Sentry error tracking initialized');
  console.log(`📊 Environment: ${Sentry.getCurrentScope().getClient()?.getOptions().environment}`);
  console.log(`🔍 Organization: ${process.env.SENTRY_ORG_SLUG}`);
} else {
  console.warn('⚠️  Sentry DSN not configured - error tracking disabled');
}

// Export Sentry instance for manual error capturing
module.exports = Sentry;

