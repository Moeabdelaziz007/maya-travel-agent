/**
 * Unified Travel Platform API Client
 * Handles multiple travel platforms with rate limiting, caching, and error handling
 */

const axios = require('axios');
const NodeCache = require('node-cache');

// Platform configurations
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

// Cache configuration
const CACHE_TTL = {
  SEARCH: 1800, // 30 minutes
  HOTELS: 3600, // 1 hour
  FLIGHTS: 900, // 15 minutes
  DEALS: 600 // 10 minutes
};

class TravelPlatformClient {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 1800, checkperiod: 600 });
    this.rateLimiters = new Map();
    this.requestQueue = new Map();
    this.initializeRateLimiters();
    this.setupAxiosInterceptors();
  }

  /**
   * Initialize rate limiters for each platform
   */
  initializeRateLimiters() {
    Object.keys(PLATFORMS).forEach(platform => {
      this.rateLimiters.set(platform, {
        lastRequest: 0,
        queue: []
      });
    });
  }

  /**
   * Setup axios interceptors for global error handling
   */
  setupAxiosInterceptors() {
    // Request interceptor for authentication and rate limiting
    axios.interceptors.request.use((config) => {
      const platform = this.getPlatformFromURL(config.url);
      if (platform && PLATFORMS[platform]) {
        // Add API key to headers
        config.headers['X-RapidAPI-Key'] = PLATFORMS[platform].apiKey;
        config.headers['X-RapidAPI-Host'] = this.getHostFromPlatform(platform);
      }
      return config;
    });

    // Response interceptor for caching and error handling
    axios.interceptors.response.use(
      (response) => response,
      (error) => this.handleRequestError(error)
    );
  }

  /**
   * Get platform name from URL
   */
  getPlatformFromURL(url) {
    for (const [platform, config] of Object.entries(PLATFORMS)) {
      if (url.includes(config.baseURL)) {
        return platform;
      }
    }
    return null;
  }

  /**
   * Get host header for platform
   */
  getHostFromPlatform(platform) {
    const hosts = {
      booking: 'booking-com.p.rapidapi.com',
      expedia: 'expedia-com-provider.p.rapidapi.com',
      tripadvisor: 'tripadvisor16.p.rapidapi.com',
      kayak: 'apidojo-kayak-v1.p.rapidapi.com'
    };
    return hosts[platform] || '';
  }

  /**
   * Handle rate limiting for requests
   */
  async enforceRateLimit(platform) {
    return new Promise((resolve) => {
      const limiter = this.rateLimiters.get(platform);
      const now = Date.now();
      const timeSinceLastRequest = now - limiter.lastRequest;

      if (timeSinceLastRequest >= PLATFORMS[platform].rateLimit) {
        limiter.lastRequest = now;
        resolve();
      } else {
        const delay = PLATFORMS[platform].rateLimit - timeSinceLastRequest;
        setTimeout(() => {
          limiter.lastRequest = Date.now();
          resolve();
        }, delay);
      }
    });
  }

  /**
   * Handle request errors with retry logic
   */
  async handleRequestError(error) {
    const platform = this.getPlatformFromURL(error.config?.url);
    const config = error.config;

    if (!platform || !config) {
      throw error;
    }

    const platformConfig = PLATFORMS[platform];
    const retryCount = config.retryCount || 0;

    if (retryCount < platformConfig.retryAttempts) {
      config.retryCount = retryCount + 1;
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff

      await new Promise(resolve => setTimeout(resolve, delay));
      return axios(config);
    }

    throw error;
  }

  /**
   * Generate cache key from request parameters
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
   * Get cached data if available and valid
   */
  getCachedData(cacheKey) {
    return this.cache.get(cacheKey);
  }

  /**
   * Set data in cache with appropriate TTL
   */
  setCachedData(cacheKey, data, endpoint) {
    const ttl = this.getTTLForEndpoint(endpoint);
    this.cache.set(cacheKey, data, ttl);
  }

  /**
   * Get appropriate TTL for endpoint type
   */
  getTTLForEndpoint(endpoint) {
    if (endpoint.includes('search') || endpoint.includes('hotels')) {
      return CACHE_TTL.SEARCH;
    }
    if (endpoint.includes('flights')) {
      return CACHE_TTL.FLIGHTS;
    }
    if (endpoint.includes('deals')) {
      return CACHE_TTL.DEALS;
    }
    return CACHE_TTL.SEARCH;
  }

  /**
   * Unified search across all platforms
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
        await this.enforceRateLimit(platformName);

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
   */
  async searchPlatform(platform, searchParams) {
    const cacheKey = this.generateCacheKey(`${platform}_search`, searchParams);
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    const config = PLATFORMS[platform];
    if (!config || !config.apiKey) {
      throw new Error(`Platform ${platform} not configured or API key missing`);
    }

    let results = { hotels: [], flights: [], activities: [] };

    try {
      switch (platform) {
        case 'booking':
          results = await this.searchBooking(searchParams);
          break;
        case 'expedia':
          results = await this.searchExpedia(searchParams);
          break;
        case 'tripadvisor':
          results = await this.searchTripAdvisor(searchParams);
          break;
        case 'kayak':
          results = await this.searchKayak(searchParams);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      this.setCachedData(cacheKey, results, `${platform}_search`);
      return results;
    } catch (error) {
      throw new Error(`Failed to search ${platform}: ${error.message}`);
    }
  }

  /**
   * Search Booking.com
   */
  async searchBooking(params) {
    const { destination, checkin, checkout, guests } = params;

    const response = await axios.get(`${PLATFORMS.booking.baseURL}/hotels/search`, {
      params: {
        dest_id: await this.getBookingDestinationId(destination),
        search_type: 'city',
        arrival_date: checkin,
        departure_date: checkout,
        adults: guests,
        room_qty: 1,
        page_number: 0,
        languagecode: 'en-us',
        currency_code: 'USD'
      },
      timeout: PLATFORMS.booking.timeout
    });

    return {
      hotels: response.data?.result?.map(hotel => ({
        id: hotel.hotel_id,
        name: hotel.hotel_name,
        platform: 'booking',
        price: hotel.min_total_price,
        currency: 'USD',
        rating: hotel.review_score,
        image: hotel.main_photo_url,
        location: hotel.city
      })) || []
    };
  }

  /**
   * Search Expedia
   */
  async searchExpedia(params) {
    const { destination, checkin, checkout, guests } = params;

    const response = await axios.get(`${PLATFORMS.expedia.baseURL}/hotels/search`, {
      params: {
        query: destination,
        checkIn: checkin,
        checkOut: checkout,
        adults: guests,
        currency: 'USD',
        language: 'en_US'
      },
      timeout: PLATFORMS.expedia.timeout
    });

    return {
      hotels: response.data?.data?.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        platform: 'expedia',
        price: hotel.price?.lead?.amount,
        currency: hotel.price?.lead?.currency,
        rating: hotel.rating,
        image: hotel.image?.url,
        location: hotel.destination
      })) || []
    };
  }

  /**
   * Search TripAdvisor
   */
  async searchTripAdvisor(params) {
    const { destination } = params;

    const response = await axios.get(`${PLATFORMS.tripadvisor.baseURL}/restaurant/searchRestaurants`, {
      params: {
        locationId: await this.getTripAdvisorLocationId(destination)
      },
      timeout: PLATFORMS.tripadvisor.timeout
    });

    return {
      activities: response.data?.data?.map(restaurant => ({
        id: restaurant.restaurantId,
        name: restaurant.name,
        platform: 'tripadvisor',
        rating: restaurant.averageRating,
        priceRange: restaurant.priceRange,
        image: restaurant.heroImgUrl,
        location: restaurant.location?.city
      })) || []
    };
  }

  /**
   * Search Kayak
   */
  async searchKayak(params) {
    const { destination, checkin, checkout } = params;

    const response = await axios.get(`${PLATFORMS.kayak.baseURL}/flights/search`, {
      params: {
        origin: 'NYC', // Default origin, should be parameterized
        destination: destination,
        departdate: checkin,
        returndate: checkout,
        currency: 'USD'
      },
      timeout: PLATFORMS.kayak.timeout
    });

    return {
      flights: response.data?.tripset?.itineraries?.map(flight => ({
        id: flight.id,
        platform: 'kayak',
        price: flight.price?.total,
        currency: flight.price?.currency,
        duration: flight.duration,
        stops: flight.stops
      })) || []
    };
  }

  /**
   * Get best deals across all platforms
   */
  async getBestDeals(params = {}) {
    const cacheKey = this.generateCacheKey('best_deals', params);
    const cached = this.getCachedData(cacheKey);

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

    this.setCachedData(cacheKey, deals, 'deals');
    return deals;
  }

  /**
   * Compare prices across platforms
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
   */
  findBestPrice(items) {
    if (items.length === 0) return null;

    return items.reduce((best, current) => {
      return (!best || current.price < best.price) ? current : best;
    });
  }

  /**
   * Get destination ID for Booking.com (placeholder implementation)
   */
  async getBookingDestinationId(destination) {
    // This would typically involve a separate API call to get destination IDs
    // For now, return a placeholder
    const destinations = {
      'paris': '41',
      'london': '42',
      'tokyo': '43',
      'new york': '44'
    };
    return destinations[destination.toLowerCase()] || '41';
  }

  /**
   * Get location ID for TripAdvisor (placeholder implementation)
   */
  async getTripAdvisorLocationId(destination) {
    // This would typically involve a separate API call to get location IDs
    // For now, return a placeholder
    const locations = {
      'paris': '187147',
      'london': '186338',
      'tokyo': '298184',
      'new york': '60763'
    };
    return locations[destination.toLowerCase()] || '187147';
  }

  /**
   * Health check for all platforms
   */
  async healthCheck() {
    const health = {
      overall: 'healthy',
      platforms: {},
      timestamp: new Date().toISOString()
    };

    for (const [platform, config] of Object.entries(PLATFORMS)) {
      try {
        if (!config.apiKey) {
          health.platforms[platform] = {
            status: 'error',
            error: 'API key not configured'
          };
          continue;
        }

        // Simple health check - try to make a basic request
        await axios.get(`${config.baseURL}/status`, {
          timeout: 5000,
          headers: {
            'X-RapidAPI-Key': config.apiKey,
            'X-RapidAPI-Host': this.getHostFromPlatform(platform)
          }
        });

        health.platforms[platform] = { status: 'healthy' };
      } catch (error) {
        health.platforms[platform] = {
          status: 'error',
          error: error.message
        };
        health.overall = 'degraded';
      }
    }

    return health;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.flushAll();
    return { success: true, message: 'Cache cleared' };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

module.exports = TravelPlatformClient;