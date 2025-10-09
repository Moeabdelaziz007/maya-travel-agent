/**
 * Rate Limiter Service
 * Manages rate limiting for API requests across multiple platforms
 */

class RateLimiter {
  constructor() {
    this.limiters = new Map();
    this.requestQueue = new Map();
  }

  /**
   * Initialize rate limiter for a platform
   * @param {string} platform - Platform name
   * @param {number} rateLimitMs - Rate limit in milliseconds
   */
  initializePlatform(platform, rateLimitMs) {
    this.limiters.set(platform, {
      lastRequest: 0,
      rateLimit: rateLimitMs,
      queue: []
    });
  }

  /**
   * Enforce rate limit for a platform
   * @param {string} platform - Platform name
   * @returns {Promise} Resolves when rate limit allows request
   */
  async enforceRateLimit(platform) {
    return new Promise((resolve) => {
      const limiter = this.limiters.get(platform);
      if (!limiter) {
        // No rate limiting configured for this platform
        resolve();
        return;
      }

      const now = Date.now();
      const timeSinceLastRequest = now - limiter.lastRequest;

      if (timeSinceLastRequest >= limiter.rateLimit) {
        // Can make request immediately
        limiter.lastRequest = now;
        resolve();
      } else {
        // Need to wait
        const delay = limiter.rateLimit - timeSinceLastRequest;
        setTimeout(() => {
          limiter.lastRequest = Date.now();
          resolve();
        }, delay);
      }
    });
  }

  /**
   * Get rate limiter stats for a platform
   * @param {string} platform - Platform name
   * @returns {Object} Rate limiter statistics
   */
  getStats(platform) {
    const limiter = this.limiters.get(platform);
    if (!limiter) {
      return null;
    }

    const now = Date.now();
    const timeSinceLastRequest = now - limiter.lastRequest;

    return {
      platform,
      rateLimit: limiter.rateLimit,
      lastRequest: limiter.lastRequest,
      timeSinceLastRequest,
      canRequest: timeSinceLastRequest >= limiter.rateLimit,
      nextRequestIn: Math.max(0, limiter.rateLimit - timeSinceLastRequest)
    };
  }

  /**
   * Get stats for all platforms
   * @returns {Object} All rate limiter statistics
   */
  getAllStats() {
    const stats = {};
    for (const platform of this.limiters.keys()) {
      stats[platform] = this.getStats(platform);
    }
    return stats;
  }

  /**
   * Reset rate limiter for a platform
   * @param {string} platform - Platform name
   */
  resetPlatform(platform) {
    if (this.limiters.has(platform)) {
      this.limiters.get(platform).lastRequest = 0;
    }
  }

  /**
   * Reset all rate limiters
   */
  resetAll() {
    for (const limiter of this.limiters.values()) {
      limiter.lastRequest = 0;
    }
  }
}

module.exports = RateLimiter;