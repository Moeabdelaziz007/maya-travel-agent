/**
 * Input validation middleware for Maya Travel Agent
 */

const Joi = require('joi');

// Analytics event validation schema
const analyticsEventSchema = Joi.object({
  type: Joi.string().min(1).max(100).required(),
  userId: Joi.string().max(100).allow(null).optional(),
  payload: Joi.object().optional()
});

// Generic input sanitization
function sanitizeInput(input) {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters
    return input.replace(/[<>'"&]/g, '');
  }
  return input;
}

// Analytics validation middleware
function validateAnalyticsEvent(req, res, next) {
  const { error } = analyticsEventSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Invalid analytics event data',
      details: error.details[0].message
    });
  }

  // Sanitize inputs
  if (req.body.type) req.body.type = sanitizeInput(req.body.type);
  if (req.body.userId) req.body.userId = sanitizeInput(req.body.userId);

  next();
}

// Generic validation middleware factory
function createValidationMiddleware(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    // Sanitize string fields
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });

    next();
  };
}

// Common validation schemas
const schemas = {
  aiChat: Joi.object({
    message: Joi.string().min(1).max(2000).required(),
    userId: Joi.string().max(100).optional(),
    conversationHistory: Joi.array().items(Joi.object()).optional(),
    useTools: Joi.boolean().optional(),
    region: Joi.string().valid('ar', 'en').optional()
  }),

  travelRecommendations: Joi.object({
    destination: Joi.string().min(1).max(100).required(),
    budget: Joi.number().min(0).max(100000).required(),
    duration: Joi.number().min(1).max(365).required(),
    preferences: Joi.array().items(Joi.string()).optional()
  }),

  payment: Joi.object({
    amount: Joi.number().min(0.01).required(),
    currency: Joi.string().valid('usd', 'eur', 'aed').optional(),
    description: Joi.string().max(500).optional()
  })
};

module.exports = {
  validateAnalyticsEvent,
  createValidationMiddleware,
  schemas,
  sanitizeInput
};