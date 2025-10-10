/**
 * Input Validation - Prevent orchestration failures from bad input
 */

class RequestValidator {
  static validateOrchestrationRequest(request, context = {}) {
    const errors = [];

    // Basic validation
    if (!request || typeof request !== 'object') {
      errors.push('Request must be a valid object');
      return { valid: false, errors };
    }

    // Message validation
    if (!request.message && !request.query) {
      errors.push('Either message or query is required');
    }

    // User ID validation (warn only)
    if (!request.userId && !request.user_id && !context.userId) {
      console.warn('[Validator] ⚠️ No userId provided - using guest mode');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: errors.length === 0 ? [] : ['Some optional fields missing']
    };
  }

  static sanitizeRequest(request) {
    return {
      userId: request.userId || request.user_id || 'guest',
      message: (request.message || request.query || '').trim(),
      origin: request.origin || '',
      destination: request.destination || '',
      departure_date: request.departure_date || request.departureDate || '',
      return_date: request.return_date || request.returnDate || '',
      travelers: parseInt(request.travelers || 1),
      budget: parseFloat(request.budget || 0),
      optimize_budget: request.optimize_budget !== false,
      include_flights: request.include_flights !== false,
      include_hotels: request.include_hotels !== false,
      include_activities: request.include_activities === true
    };
  }
}

module.exports = RequestValidator;