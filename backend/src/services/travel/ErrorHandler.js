/**
 * Comprehensive Error Handler Service
 * Provides error classification, retry logic, circuit breaker, and recovery strategies
 * for travel platform APIs
 */

const EventEmitter = require('events');

class ErrorHandler extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      maxRetries: options.maxRetries || 3,
      baseDelay: options.baseDelay || 1000,
      maxDelay: options.maxDelay || 30000,
      backoffMultiplier: options.backoffMultiplier || 2,
      jitter: options.jitter !== false, // Enable jitter by default
      circuitBreakerThreshold: options.circuitBreakerThreshold || 5,
      circuitBreakerTimeout: options.circuitBreakerTimeout || 60000,
      enableLogging: options.enableLogging !== false,
      enableMetrics: options.enableMetrics !== false,
      ...options
    };

    this.circuitBreakers = new Map();
    this.metrics = new Map();
    this.retryQueue = [];

    // Error classification patterns
    this.errorPatterns = {
      // Network errors
      NETWORK: {
        patterns: [
          /ECONNRESET/,
          /ENOTFOUND/,
          /ETIMEDOUT/,
          /ECONNREFUSED/,
          /network.*error/i,
          /timeout/i,
          /connection.*error/i
        ],
        retryable: true,
        category: 'network'
      },

      // Rate limiting
      RATE_LIMIT: {
        patterns: [
          /rate.*limit/i,
          /too.*many.*requests/i,
          /429/,
          /quota.*exceeded/i
        ],
        retryable: true,
        category: 'rate_limit'
      },

      // Authentication errors
      AUTH: {
        patterns: [
          /unauthorized/i,
          /authentication.*failed/i,
          /invalid.*api.*key/i,
          /401/,
          /403/
        ],
        retryable: false,
        category: 'authentication'
      },

      // Server errors
      SERVER: {
        patterns: [
          /internal.*server.*error/i,
          /500/,
          /502/,
          /503/,
          /504/,
          /bad.*gateway/i,
          /service.*unavailable/i
        ],
        retryable: true,
        category: 'server'
      },

      // Data validation errors
      VALIDATION: {
        patterns: [
          /invalid.*parameter/i,
          /missing.*required/i,
          /bad.*request/i,
          /400/,
          /validation.*error/i
        ],
        retryable: false,
        category: 'validation'
      },

      // Platform specific errors
      PLATFORM: {
        patterns: [
          /booking.*error/i,
          /expedia.*error/i,
          /kayak.*error/i,
          /tripadvisor.*error/i
        ],
        retryable: true,
        category: 'platform'
      }
    };

    // Recovery strategies
    this.recoveryStrategies = {
      network: this._recoverFromNetworkError.bind(this),
      rate_limit: this._recoverFromRateLimit.bind(this),
      server: this._recoverFromServerError.bind(this),
      platform: this._recoverFromPlatformError.bind(this)
    };

    // Start metrics collection if enabled
    if (this.options.enableMetrics) {
      this._startMetricsCollection();
    }
  }

  /**
   * Classify error based on patterns and context
   * @param {Error} error - The error to classify
   * @param {string} platform - Platform name (optional)
   * @returns {Object} Classified error information
   */
  classifyError(error, platform = null) {
    const errorMessage = error.message || error.toString();
    const errorCode = error.code || error.status || error.statusCode;

    let classification = {
      type: 'UNKNOWN',
      category: 'unknown',
      retryable: false,
      severity: 'medium',
      platform: platform,
      originalError: error,
      timestamp: new Date().toISOString()
    };

    // Check against patterns
    for (const [type, config] of Object.entries(this.errorPatterns)) {
      const matches = config.patterns.some(pattern =>
        pattern.test(errorMessage) || pattern.test(errorCode)
      );

      if (matches) {
        classification = {
          ...classification,
          type,
          category: config.category,
          retryable: config.retryable,
          severity: this._determineSeverity(type, error)
        };
        break;
      }
    }

    // Platform-specific classification
    if (platform) {
      classification.platform = platform;
      classification = this._classifyPlatformError(error, platform, classification);
    }

    // Update metrics
    if (this.options.enableMetrics) {
      this._updateMetrics(classification);
    }

    return classification;
  }

  /**
   * Execute operation with retry logic and error handling
   * @param {Function} operation - Async operation to execute
   * @param {Object} options - Retry options
   * @returns {Promise} Operation result
   */
  async executeWithRetry(operation, options = {}) {
    const {
      platform = 'unknown',
      maxRetries = this.options.maxRetries,
      context = {}
    } = options;

    let lastError;
    let attempt = 0;

    // Check circuit breaker
    if (this._isCircuitOpen(platform)) {
      throw new Error(`Circuit breaker is OPEN for platform: ${platform}`);
    }

    while (attempt <= maxRetries) {
      try {
        const result = await operation();

        // Success - close circuit if it was half-open
        if (this._isCircuitHalfOpen(platform)) {
          this._closeCircuit(platform);
        }

        return result;

      } catch (error) {
        lastError = error;
        const classification = this.classifyError(error, platform);

        // Log error if enabled
        if (this.options.enableLogging) {
          this._logError(error, classification, attempt, context);
        }

        // Check if error is retryable
        if (!classification.retryable || attempt >= maxRetries) {
          // Record failure for circuit breaker
          this._recordCircuitBreakerFailure(platform);

          // Try recovery strategy
          const recovered = await this._attemptRecovery(error, classification, context);
          if (!recovered) {
            throw this._enhanceError(error, classification, attempt);
          }
        }

        // Wait before retry
        if (attempt < maxRetries) {
          const delay = this._calculateRetryDelay(attempt, classification);
          await this._sleep(delay);
        }

        attempt++;
      }
    }

    // All retries exhausted
    this._recordCircuitBreakerFailure(platform);
    throw this._enhanceError(lastError, this.classifyError(lastError, platform), attempt);
  }

  /**
   * Get circuit breaker status for a platform
   * @param {string} platform - Platform name
   * @returns {Object} Circuit breaker status
   */
  getCircuitBreakerStatus(platform) {
    const circuit = this.circuitBreakers.get(platform);
    if (!circuit) {
      return { state: 'CLOSED', failures: 0, lastFailureTime: null };
    }

    const now = Date.now();
    let state = 'CLOSED';

    if (circuit.failures >= this.options.circuitBreakerThreshold) {
      if (now - circuit.lastFailureTime >= this.options.circuitBreakerTimeout) {
        state = 'HALF_OPEN';
      } else {
        state = 'OPEN';
      }
    }

    return {
      state,
      failures: circuit.failures,
      lastFailureTime: circuit.lastFailureTime,
      threshold: this.options.circuitBreakerThreshold,
      timeout: this.options.circuitBreakerTimeout
    };
  }

  /**
   * Get error metrics
   * @param {string} platform - Platform name (optional)
   * @returns {Object} Error metrics
   */
  getMetrics(platform = null) {
    if (!this.options.enableMetrics) {
      return null;
    }

    if (platform) {
      return this.metrics.get(platform) || this._getDefaultMetrics();
    }

    const allMetrics = {};
    for (const [plat, metrics] of this.metrics.entries()) {
      allMetrics[plat] = metrics;
    }
    return allMetrics;
  }

  /**
   * Reset circuit breaker for a platform
   * @param {string} platform - Platform name
   */
  resetCircuitBreaker(platform) {
    if (this.circuitBreakers.has(platform)) {
      this.circuitBreakers.get(platform).failures = 0;
      this.circuitBreakers.get(platform).lastFailureTime = null;
    }
  }

  /**
   * Reset all circuit breakers and metrics
   */
  resetAll() {
    this.circuitBreakers.clear();
    this.metrics.clear();
  }

  /**
   * Health check for error handler
   * @returns {Object} Health status
   */
  healthCheck() {
    const platforms = Array.from(this.circuitBreakers.keys());
    const openCircuits = platforms.filter(platform =>
      this.getCircuitBreakerStatus(platform).state === 'OPEN'
    );

    return {
      status: openCircuits.length === 0 ? 'healthy' : 'degraded',
      openCircuits,
      totalPlatforms: platforms.length,
      metricsEnabled: this.options.enableMetrics,
      loggingEnabled: this.options.enableLogging
    };
  }

  // Private methods

  /**
   * Determine error severity
   * @param {string} type - Error type
   * @param {Error} error - Original error
   * @returns {string} Severity level
   */
  _determineSeverity(type, error) {
    const severityMap = {
      NETWORK: 'high',
      RATE_LIMIT: 'medium',
      AUTH: 'critical',
      SERVER: 'high',
      VALIDATION: 'low',
      PLATFORM: 'medium'
    };

    return severityMap[type] || 'medium';
  }

  /**
   * Classify platform-specific errors
   * @param {Error} error - Original error
   * @param {string} platform - Platform name
   * @param {Object} classification - Current classification
   * @returns {Object} Updated classification
   */
  _classifyPlatformError(error, platform, classification) {
    // Platform-specific error handling can be extended here
    switch (platform.toLowerCase()) {
      case 'booking':
        if (error.message.includes('dest_id')) {
          classification.retryable = false;
          classification.category = 'validation';
        }
        break;
      case 'expedia':
        if (error.message.includes('invalid region')) {
          classification.retryable = false;
          classification.category = 'validation';
        }
        break;
    }

    return classification;
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   * @param {number} attempt - Current attempt number
   * @param {Object} classification - Error classification
   * @returns {number} Delay in milliseconds
   */
  _calculateRetryDelay(attempt, classification) {
    let delay = this.options.baseDelay * Math.pow(this.options.backoffMultiplier, attempt);

    // Adjust delay based on error type
    if (classification.type === 'RATE_LIMIT') {
      delay *= 2; // Longer delay for rate limits
    } else if (classification.type === 'SERVER') {
      delay *= 1.5; // Medium delay for server errors
    }

    // Cap at max delay
    delay = Math.min(delay, this.options.maxDelay);

    // Add jitter if enabled
    if (this.options.jitter) {
      const jitterAmount = delay * 0.1; // 10% jitter
      delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }

    return Math.max(0, Math.floor(delay));
  }

  /**
   * Check if circuit breaker is open
   * @param {string} platform - Platform name
   * @returns {boolean} True if circuit is open
   */
  _isCircuitOpen(platform) {
    const status = this.getCircuitBreakerStatus(platform);
    return status.state === 'OPEN';
  }

  /**
   * Check if circuit breaker is half-open
   * @param {string} platform - Platform name
   * @returns {boolean} True if circuit is half-open
   */
  _isCircuitHalfOpen(platform) {
    const status = this.getCircuitBreakerStatus(platform);
    return status.state === 'HALF_OPEN';
  }

  /**
   * Record circuit breaker failure
   * @param {string} platform - Platform name
   */
  _recordCircuitBreakerFailure(platform) {
    const circuit = this.circuitBreakers.get(platform) || {
      failures: 0,
      lastFailureTime: null
    };

    circuit.failures++;
    circuit.lastFailureTime = Date.now();
    this.circuitBreakers.set(platform, circuit);
  }

  /**
   * Close circuit breaker
   * @param {string} platform - Platform name
   */
  _closeCircuit(platform) {
    if (this.circuitBreakers.has(platform)) {
      this.circuitBreakers.get(platform).failures = 0;
      this.circuitBreakers.get(platform).lastFailureTime = null;
    }
  }

  /**
   * Attempt error recovery
   * @param {Error} error - Original error
   * @param {Object} classification - Error classification
   * @param {Object} context - Operation context
   * @returns {Promise<boolean>} True if recovery successful
   */
  async _attemptRecovery(error, classification, context) {
    const strategy = this.recoveryStrategies[classification.category];
    if (strategy) {
      try {
        return await strategy(error, classification, context);
      } catch (recoveryError) {
        if (this.options.enableLogging) {
          console.warn(`Recovery strategy failed for ${classification.category}:`, recoveryError.message);
        }
      }
    }
    return false;
  }

  /**
   * Recovery strategy for network errors
   * @param {Error} error - Network error
   * @param {Object} classification - Error classification
   * @param {Object} context - Operation context
   * @returns {Promise<boolean>} Recovery success
   */
  async _recoverFromNetworkError(error, classification, context) {
    // For network errors, we might try alternative endpoints or wait for connectivity
    return false; // No specific recovery for now
  }

  /**
   * Recovery strategy for rate limit errors
   * @param {Error} error - Rate limit error
   * @param {Object} classification - Error classification
   * @param {Object} context - Operation context
   * @returns {Promise<boolean>} Recovery success
   */
  async _recoverFromRateLimit(error, classification, context) {
    // For rate limits, we could implement token bucket or wait longer
    return false; // Handled by retry logic
  }

  /**
   * Recovery strategy for server errors
   * @param {Error} error - Server error
   * @param {Object} classification - Error classification
   * @param {Object} context - Operation context
   * @returns {Promise<boolean>} Recovery success
   */
  async _recoverFromServerError(error, classification, context) {
    // For server errors, we might try alternative servers or failover
    return false; // No specific recovery for now
  }

  /**
   * Recovery strategy for platform errors
   * @param {Error} error - Platform error
   * @param {Object} classification - Error classification
   * @param {Object} context - Operation context
   * @returns {Promise<boolean>} Recovery success
   */
  async _recoverFromPlatformError(error, classification, context) {
    // Platform-specific recovery logic
    if (classification.platform === 'booking' && error.message.includes('dest_id')) {
      // Try to refresh destination mapping
      return false; // Would need destination service integration
    }
    return false;
  }

  /**
   * Enhance error with additional context
   * @param {Error} error - Original error
   * @param {Object} classification - Error classification
   * @param {number} attempts - Number of attempts made
   * @returns {Error} Enhanced error
   */
  _enhanceError(error, classification, attempts) {
    const enhancedError = new Error(`[${classification.type}] ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.classification = classification;
    enhancedError.attempts = attempts;
    enhancedError.platform = classification.platform;
    enhancedError.retryable = classification.retryable;

    return enhancedError;
  }

  /**
   * Log error with context
   * @param {Error} error - Error to log
   * @param {Object} classification - Error classification
   * @param {number} attempt - Current attempt
   * @param {Object} context - Additional context
   */
  _logError(error, classification, attempt, context) {
    const logData = {
      timestamp: new Date().toISOString(),
      error: error.message,
      type: classification.type,
      category: classification.category,
      platform: classification.platform,
      severity: classification.severity,
      attempt,
      retryable: classification.retryable,
      context
    };

    console.error(`[ErrorHandler] ${classification.type} error on ${classification.platform}:`, logData);

    // Emit error event for external listeners
    this.emit('error', logData);
  }

  /**
   * Update error metrics
   * @param {Object} classification - Error classification
   */
  _updateMetrics(classification) {
    const platform = classification.platform || 'unknown';
    const metrics = this.metrics.get(platform) || this._getDefaultMetrics();

    metrics.totalErrors++;
    metrics.errorsByType[classification.type] = (metrics.errorsByType[classification.type] || 0) + 1;
    metrics.errorsByCategory[classification.category] = (metrics.errorsByCategory[classification.category] || 0) + 1;

    if (classification.retryable) {
      metrics.retryableErrors++;
    }

    metrics.lastError = {
      type: classification.type,
      message: classification.originalError.message,
      timestamp: classification.timestamp
    };

    this.metrics.set(platform, metrics);
  }

  /**
   * Get default metrics structure
   * @returns {Object} Default metrics
   */
  _getDefaultMetrics() {
    return {
      totalErrors: 0,
      retryableErrors: 0,
      errorsByType: {},
      errorsByCategory: {},
      lastError: null,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Start metrics collection
   */
  _startMetricsCollection() {
    // Periodic cleanup of old metrics
    setInterval(() => {
      this._cleanupOldMetrics();
    }, 300000); // Every 5 minutes
  }

  /**
   * Cleanup old metrics data
   */
  _cleanupOldMetrics() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    for (const [platform, metrics] of this.metrics.entries()) {
      if (new Date(metrics.createdAt).getTime() < cutoffTime) {
        this.metrics.delete(platform);
      }
    }
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Sleep promise
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ErrorHandler;