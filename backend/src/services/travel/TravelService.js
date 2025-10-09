/**
 * Travel Service Orchestrator
 * Coordinates RateLimiter, CacheManager, ErrorHandler, and platform services
 * while maintaining the same public API as TravelPlatformClient
 */

const RateLimiter = require('./RateLimiter');
const CacheManager = require('./CacheManager');
const ErrorHandler = require('./ErrorHandler');
const {
  PlatformAdapter,
  BookingService,
  ExpediaService,
  TripAdvisorService,
  KayakService
} = require('./platforms');

// Platform configurations (same as TravelPlatformClient)
const PLATFORMS = {
  booking: {
    baseURL: 'https://booking-com.p.rapidapi.com/v1',
    apiKey: process.env.BOOKING_API_KEY,
    rateLimit: 1000, // ms between requests
    timeout: 10000,
    retryAttempts: 3
  },
  expedia: {
    baseURL: 'https://expedia-com-provider.p.rapidapi.com/v1',
    apiKey: process.env.EXPEDIA_API_KEY,
    rateLimit: 1000,
    timeout: 10000,
    retryAttempts: 3
  },
  tripadvisor: {
    baseURL: 'https://tripadvisor16.p.rapidapi.com/api/v1',
    apiKey: process.env.TRIPADVISOR_API_KEY,
    rateLimit: 1000,
    timeout: 10000,
    retryAttempts: 3
  },
  kayak: {
    baseURL: 'https://apidojo-kayak-v1.p.rapidapi.com',
    apiKey: process.env.KAYAK_API_KEY,
    rateLimit: 1000,
    timeout: 10000,
    retryAttempts: 3
  }
};

// Cache configuration (same as TravelPlatformClient)
const CACHE_TTL = {
  SEARCH: 1800, // 30 minutes
  HOTELS: 3600, // 1 hour
  FLIGHTS: 900, // 15 minutes
  DEALS: 600 // 10 minutes
};

class TravelService {
  constructor(options = {}) {
    // Initialize core services
    this.rateLimiter = new RateLimiter();
    this.cacheManager = new CacheManager({
      defaultTTL: 300000, // 5 minutes
      maxSize: 1000,
      maxMemoryMB: 100,
      enableMetrics: true,
      enableCompression: false
    });
    this.errorHandler = new ErrorHandler({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      enableLogging: true,
      enableMetrics: true
    });

    // Initialize platform services
    this.platforms = new Map();
    this.initializePlatforms();

    // Setup platform configurations in rate limiter
    this.initializeRateLimiters();
  }

  /**
   * Initialize platform service instances
   */
  initializePlatforms() {
    this.platforms.set('booking', new BookingService());
    this.platforms.set('expedia', new ExpediaService());
    this.platforms.set('tripadvisor', new TripAdvisorService());
    this.platforms.set('kayak', new KayakService());
  }

  /**
   * Initialize rate limiters for each platform
   */
  initializeRateLimiters() {
    Object.keys(PLATFORMS).forEach(platform => {
      this.rateLimiter.initializePlatform(platform, PLATFORMS[platform].rateLimit);
    });
  }

  /**
   * Unified search across all platforms
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results from all platforms
   */
  async searchAllPlatforms(searchParams) {
    const { destination, checkin, checkout, guests = 1, platform = 'all' } = searchParams;

    const results = {
      hotels: [],
      flights: [],
      activities: [],
      errors: [],
      timestamp: new Date().toISOString()
    };

    const platformsToSearch = platform === 'all' ? Object.keys(PLATFORMS) : [platform];

    const searchPromises = platformsToSearch.map(async (platformName) => {
      try {
        const platformResults = await this.searchPlatform(platformName, searchParams);
        return { platform: platformName, results: platformResults, error: null };
      } catch (error) {
        console.error(`Error searching ${platformName}:`, error.message);
        return {
          platform: platformName,
          results: null,
          error: error.message
        };
      }
    });

    const searchResults = await Promise.allSettled(searchPromises);

    searchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { platform: platformName, results: platformResults, error } = result.value;

        if (error) {
          results.errors.push({ platform: platformName, error });
        } else if (platformResults) {
          results.hotels.push(...(platformResults.hotels || []));
          results.flights.push(...(platformResults.flights || []));
          results.activities.push(...(platformResults.activities || []));
        }
      }
    });

    return results;
  }

  /**
   * Search specific platform
   * @param {string} platform - Platform name
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Platform-specific search results
   */
  async searchPlatform(platform, searchParams) {
    const cacheKey = this.generateCacheKey(`${platform}_search`, searchParams);
    const cached = this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const config = PLATFORMS[platform];
    if (!config || !config.apiKey) {
      throw new Error(`Platform ${platform} not configured or API key missing`);
    }

    // Use error handler with retry logic and rate limiting
    const operation = async () => {
      await this.rateLimiter.enforceRateLimit(platform);
      return await this.performPlatformSearch(platform, searchParams);
    };

    try {
      const results = await this.errorHandler.executeWithRetry(operation, {
        platform,
        context: { operation: 'search', searchParams }
      });

      this.cacheManager.set(cacheKey, results, {
        ttl: CACHE_TTL.SEARCH,
        namespace: 'search_results'
      });

      return results;
    } catch (error) {
      throw new Error(`Failed to search ${platform}: ${error.message}`);
    }
  }

  /**
   * Perform actual platform search using platform services
   * @param {string} platform - Platform name
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async performPlatformSearch(platform, searchParams) {
    const platformService = this.platforms.get(platform);
    if (!platformService) {
      throw new Error(`Platform service ${platform} not found`);
    }

    const { destination, checkin, checkout, guests = 1 } = searchParams;
    let results = { hotels: [], flights: [], activities: [] };

    try {
      switch (platform) {
        case 'booking':
          results.hotels = await platformService.searchHotels(searchParams);
          break;
        case 'expedia':
          results.hotels = await platformService.searchHotels(searchParams);
          break;
        case 'tripadvisor':
          results.activities = await platformService.searchActivities(searchParams);
          break;
        case 'kayak':
          results.flights = await platformService.searchFlights(searchParams);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      return results;
    } catch (error) {
      throw new Error(`Platform search failed: ${error.message}`);
    }
  }

  /**
   * Get best deals across all platforms
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Best deals results
   */
  async getBestDeals(params = {}) {
    const cacheKey = this.cacheManager.generateCacheKey('best_deals', params);
    const cached = this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const searchResults = await this.searchAllPlatforms({ ...params, platform: 'all' });
    const deals = {
      hotels: [],
      flights: [],
      activities: [],
      timestamp: new Date().toISOString()
    };

    // Process and rank results by price/rating
    if (searchResults.hotels.length > 0) {
      deals.hotels = searchResults.hotels
        .sort((a, b) => a.price - b.price)
        .slice(0, 10);
    }

    if (searchResults.flights.length > 0) {
      deals.flights = searchResults.flights
        .sort((a, b) => a.price - b.price)
        .slice(0, 10);
    }

    if (searchResults.activities.length > 0) {
      deals.activities = searchResults.activities
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10);
    }

    this.cacheManager.set(cacheKey, deals, {
      ttl: CACHE_TTL.DEALS,
      namespace: 'search_results'
    });

    return deals;
  }

  /**
   * Compare prices across platforms
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Price comparison results
   */
  async comparePrices(searchParams) {
    const results = await this.searchAllPlatforms(searchParams);
    const comparison = {
      hotels: {},
      flights: {},
      activities: {},
      summary: {
        totalPlatforms: Object.keys(PLATFORMS).length,
        platformsSearched: 0,
        bestPrices: {}
      }
    };

    // Group results by type and find best prices
    ['hotels', 'flights', 'activities'].forEach(type => {
      if (results[type].length > 0) {
        comparison[type] = this.groupByPlatform(results[type]);
        comparison.summary.bestPrices[type] = this.findBestPrice(results[type]);
        comparison.summary.platformsSearched++;
      }
    });

    return comparison;
  }

  /**
   * Group results by platform
   * @param {Array} items - Result items
   * @returns {Object} Grouped results
   */
  groupByPlatform(items) {
    return items.reduce((acc, item) => {
      if (!acc[item.platform]) {
        acc[item.platform] = [];
      }
      acc[item.platform].push(item);
      return acc;
    }, {});
  }

  /**
   * Find best price for a category
   * @param {Array} items - Items to search
   * @returns {Object|null} Best price item
   */
  findBestPrice(items) {
    if (items.length === 0) return null;

    return items.reduce((best, current) => {
      return (!best || current.price < best.price) ? current : best;
    });
  }

  /**
   * Health check for all platforms
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const health = {
      overall: 'healthy',
      platforms: {},
      timestamp: new Date().toISOString(),
      services: {
        rateLimiter: this.rateLimiter ? 'healthy' : 'error',
        cacheManager: this.cacheManager ? 'healthy' : 'error',
        errorHandler: this.errorHandler ? 'healthy' : 'error'
      }
    };

    // Check platform services
    for (const [platformName, platformService] of this.platforms.entries()) {
      try {
        const platformHealth = await platformService.healthCheck();
        health.platforms[platformName] = platformHealth;

        if (platformHealth.status !== 'healthy') {
          health.overall = 'degraded';
        }
      } catch (error) {
        health.platforms[platformName] = {
          status: 'error',
          error: error.message
        };
        health.overall = 'degraded';
      }
    }

    // Check circuit breakers
    const circuitBreakerHealth = this.errorHandler.healthCheck();
    health.circuitBreakers = circuitBreakerHealth;

    if (circuitBreakerHealth.status !== 'healthy') {
      health.overall = 'degraded';
    }

    return health;
  }

  /**
   * Clear cache
   * @returns {Object} Cache clear result
   */
  clearCache() {
    const clearedEntries = this.cacheManager.clear();
    return {
      success: true,
      message: `Cache cleared: ${clearedEntries} entries removed`
    };
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return this.cacheManager.getStats();
  }

  /**
   * Generate cache key from request parameters
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {string} Cache key
   */
  generateCacheKey(endpoint, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Get rate limiter statistics
   * @returns {Object} Rate limiter stats
   */
  getRateLimiterStats() {
    return this.rateLimiter.getAllStats();
  }

  /**
   * Get error handler metrics
   * @param {string} platform - Platform name (optional)
   * @returns {Object} Error metrics
   */
  getErrorMetrics(platform = null) {
    return this.errorHandler.getMetrics(platform);
  }

  /**
   * Reset circuit breakers
   * @param {string} platform - Platform name (optional)
   */
  resetCircuitBreakers(platform = null) {
    if (platform) {
      this.errorHandler.resetCircuitBreaker(platform);
    } else {
      this.errorHandler.resetAll();
    }
  }
}

module.exports = TravelService;