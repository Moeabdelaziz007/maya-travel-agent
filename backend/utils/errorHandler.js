/**
 * Enterprise-grade Error Handler for Maya Travel Agent
 * Provides centralized error handling with recovery strategies
 */

const logger = require('./logger');

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true, meta = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.errorThreshold = 10;
    this.timeWindow = 60000; // 1 minute
    this.circuitBreakers = new Map();
  }

  /**
   * Handle error with appropriate recovery strategy
   */
  async handle(error, context = {}) {
    const errorInfo = this.analyzeError(error, context);
    
    // Log error
    logger.error(errorInfo.message, error, {
      ...context,
      ...errorInfo
    });

    // Track error frequency
    this.trackError(errorInfo.type);

    // Check circuit breaker
    if (this.shouldTriggerCircuitBreaker(errorInfo.type)) {
      logger.warn(`Circuit breaker triggered for: ${errorInfo.type}`);
      this.triggerCircuitBreaker(errorInfo.type);
    }

    // Return user-friendly error
    return this.getUserFriendlyError(errorInfo);
  }

  /**
   * Analyze error and categorize it
   */
  analyzeError(error, context) {
    const errorInfo = {
      type: 'UNKNOWN_ERROR',
      severity: 'HIGH',
      message: error.message || 'An unexpected error occurred',
      recoverable: false,
      retryable: false,
      context
    };

    // Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      errorInfo.type = 'NETWORK_ERROR';
      errorInfo.severity = 'MEDIUM';
      errorInfo.recoverable = true;
      errorInfo.retryable = true;
    }

    // API errors
    if (error.response) {
      errorInfo.type = 'API_ERROR';
      errorInfo.severity = error.response.status >= 500 ? 'HIGH' : 'MEDIUM';
      errorInfo.recoverable = error.response.status < 500;
      errorInfo.retryable = error.response.status >= 500;
    }

    // Database errors
    if (error.code && error.code.startsWith('PG')) {
      errorInfo.type = 'DATABASE_ERROR';
      errorInfo.severity = 'HIGH';
      errorInfo.recoverable = false;
      errorInfo.retryable = true;
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      errorInfo.type = 'VALIDATION_ERROR';
      errorInfo.severity = 'LOW';
      errorInfo.recoverable = true;
      errorInfo.retryable = false;
    }

    // Telegram API errors
    if (error.response && error.response.description) {
      errorInfo.type = 'TELEGRAM_ERROR';
      errorInfo.severity = 'MEDIUM';
      errorInfo.recoverable = true;
      errorInfo.retryable = true;
    }

    // Rate limit errors
    if (error.response && error.response.status === 429) {
      errorInfo.type = 'RATE_LIMIT_ERROR';
      errorInfo.severity = 'MEDIUM';
      errorInfo.recoverable = true;
      errorInfo.retryable = true;
    }

    return errorInfo;
  }

  /**
   * Track error frequency for circuit breaker
   */
  trackError(errorType) {
    const now = Date.now();
    
    if (!this.errorCounts.has(errorType)) {
      this.errorCounts.set(errorType, []);
    }

    const errors = this.errorCounts.get(errorType);
    errors.push(now);

    // Remove old errors outside time window
    const recentErrors = errors.filter(time => now - time < this.timeWindow);
    this.errorCounts.set(errorType, recentErrors);
  }

  /**
   * Check if circuit breaker should be triggered
   */
  shouldTriggerCircuitBreaker(errorType) {
    const errors = this.errorCounts.get(errorType) || [];
    return errors.length >= this.errorThreshold;
  }

  /**
   * Trigger circuit breaker
   */
  triggerCircuitBreaker(errorType) {
    this.circuitBreakers.set(errorType, {
      triggered: true,
      timestamp: Date.now(),
      resetAfter: 300000 // 5 minutes
    });

    // Auto-reset after timeout
    setTimeout(() => {
      this.resetCircuitBreaker(errorType);
    }, 300000);
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(errorType) {
    this.circuitBreakers.delete(errorType);
    this.errorCounts.delete(errorType);
    logger.info(`Circuit breaker reset for: ${errorType}`);
  }

  /**
   * Check if circuit breaker is open
   */
  isCircuitBreakerOpen(errorType) {
    const breaker = this.circuitBreakers.get(errorType);
    if (!breaker) return false;

    const now = Date.now();
    if (now - breaker.timestamp > breaker.resetAfter) {
      this.resetCircuitBreaker(errorType);
      return false;
    }

    return true;
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyError(errorInfo) {
    const arabicMessages = {
      NETWORK_ERROR: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
      API_ERROR: 'عذراً، لا يمكن الوصول إلى الخدمة حالياً. يرجى المحاولة لاحقاً.',
      DATABASE_ERROR: 'عذراً، حدث خطأ في النظام. نحن نعمل على حله.',
      VALIDATION_ERROR: 'عذراً، البيانات المدخلة غير صحيحة. يرجى التحقق والمحاولة مرة أخرى.',
      TELEGRAM_ERROR: 'عذراً، حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.',
      RATE_LIMIT_ERROR: 'عذراً، تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قليلاً.',
      UNKNOWN_ERROR: 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
    };

    return {
      success: false,
      error: {
        type: errorInfo.type,
        message: arabicMessages[errorInfo.type] || arabicMessages.UNKNOWN_ERROR,
        recoverable: errorInfo.recoverable,
        retryable: errorInfo.retryable
      }
    };
  }

  /**
   * Retry operation with exponential backoff
   */
  async retry(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        const errorInfo = this.analyzeError(error);
        if (!errorInfo.retryable) {
          throw error;
        }

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          logger.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`, {
            error: error.message
          });
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute operation with timeout
   */
  async withTimeout(operation, timeoutMs = 30000) {
    return Promise.race([
      operation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ]);
  }

  /**
   * Execute operation with fallback
   */
  async withFallback(operation, fallback) {
    try {
      return await operation();
    } catch (error) {
      logger.warn('Operation failed, using fallback', { error: error.message });
      return await fallback();
    }
  }

  /**
   * Graceful shutdown handler
   */
  setupGracefulShutdown(cleanupFn) {
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      try {
        await cleanupFn();
        logger.info('Cleanup completed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during cleanup', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', new Error(reason), { promise });
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
const errorHandler = new ErrorHandler();

module.exports = {
  errorHandler,
  AppError
};
