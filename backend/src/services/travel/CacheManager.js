/**
 * Cache Manager Service
 * Comprehensive caching functionality for travel platform data
 */

class CacheManager {
  constructor(options = {}) {
    this.options = {
      defaultTTL: options.defaultTTL || 300000, // 5 minutes default
      maxSize: options.maxSize || 1000, // Maximum cache entries
      maxMemoryMB: options.maxMemoryMB || 100, // Maximum memory usage
      enableMetrics: options.enableMetrics !== false, // Enable cache metrics
      enableCompression: options.enableCompression || false, // Enable data compression
      ...options
    };

    this.cache = new Map();
    this.accessOrder = []; // For LRU tracking
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      memoryUsage: 0,
      lastCleanup: Date.now()
    };

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute

    // Cache namespaces for different data types
    this.namespaces = {
      SEARCH_RESULTS: 'search_results',
      HOTEL_DATA: 'hotel_data',
      FLIGHT_DATA: 'flight_data',
      USER_PREFERENCES: 'user_preferences',
      PLATFORM_RESPONSES: 'platform_responses',
      GEOLOCATION: 'geolocation',
      CURRENCY_RATES: 'currency_rates',
      BOOKING_DATA: 'booking_data'
    };
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {Object} options - Cache options
   * @param {number} options.ttl - Time to live in milliseconds
   * @param {string} options.namespace - Cache namespace
   * @param {boolean} options.compress - Whether to compress data
   * @returns {boolean} Success status
   */
  set(key, value, options = {}) {
    try {
      const ttl = options.ttl || this.options.defaultTTL;
      const namespace = options.namespace || 'default';
      const compress = options.compress || this.options.enableCompression;

      // Check if we need to evict entries due to size limit
      if (this.cache.size >= this.options.maxSize) {
        this.evictLRU();
      }

      // Create cache entry
      const entry = {
        key,
        value: compress ? this.compressData(value) : value,
        timestamp: Date.now(),
        ttl,
        namespace,
        compressed: compress,
        size: this.estimateSize(value),
        accessCount: 0,
        lastAccessed: Date.now()
      };

      // Remove existing entry if present
      if (this.cache.has(key)) {
        const existingEntry = this.cache.get(key);
        this.removeFromAccessOrder(existingEntry);
        this.metrics.deletes++;
      }

      // Add to cache
      this.cache.set(key, entry);
      this.addToAccessOrder(entry);
      this.metrics.sets++;
      this.updateMemoryUsage();

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @param {Object} options - Cache options
   * @returns {any} Cached value or null if not found/expired
   */
  get(key, options = {}) {
    try {
      const entry = this.cache.get(key);

      if (!entry) {
        this.metrics.misses++;
        return null;
      }

      // Check if entry has expired
      if (this.isExpired(entry)) {
        this.delete(key);
        this.metrics.misses++;
        return null;
      }

      // Update access tracking
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.updateAccessOrder(entry);

      this.metrics.hits++;

      // Return decompressed value if needed
      return entry.compressed ? this.decompressData(entry.value) : entry.value;
    } catch (error) {
      console.error('Cache get error:', error);
      this.metrics.misses++;
      return null;
    }
  }

  /**
   * Delete a specific cache entry
   * @param {string} key - Cache key to delete
   * @returns {boolean} Success status
   */
  delete(key) {
    try {
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        this.removeFromAccessOrder(entry);
        this.metrics.deletes++;
        this.updateMemoryUsage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   * @param {string} namespace - Optional namespace to clear
   * @returns {number} Number of entries cleared
   */
  clear(namespace = null) {
    try {
      let cleared = 0;

      if (namespace) {
        // Clear specific namespace
        for (const [key, entry] of this.cache.entries()) {
          if (entry.namespace === namespace) {
            this.cache.delete(key);
            this.removeFromAccessOrder(entry);
            cleared++;
          }
        }
      } else {
        // Clear all
        cleared = this.cache.size;
        this.cache.clear();
        this.accessOrder = [];
      }

      this.metrics.deletes += cleared;
      this.updateMemoryUsage();
      return cleared;
    } catch (error) {
      console.error('Cache clear error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} Whether key exists and is valid
   */
  has(key) {
    const entry = this.cache.get(key);
    return entry && !this.isExpired(entry);
  }

  /**
   * Get multiple values from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {Object} Object with key-value pairs
   */
  getMany(keys) {
    const result = {};
    for (const key of keys) {
      const value = this.get(key);
      if (value !== null) {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Set multiple values in cache
   * @param {Object} keyValuePairs - Object with key-value pairs
   * @param {Object} options - Cache options
   * @returns {number} Number of successful sets
   */
  setMany(keyValuePairs, options = {}) {
    let successCount = 0;
    for (const [key, value] of Object.entries(keyValuePairs)) {
      if (this.set(key, value, options)) {
        successCount++;
      }
    }
    return successCount;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache metrics and statistics
   */
  getStats() {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0;

    return {
      ...this.metrics,
      size: this.cache.size,
      maxSize: this.options.maxSize,
      memoryUsageMB: Math.round(this.metrics.memoryUsage / 1024 / 1024 * 100) / 100,
      maxMemoryMB: this.options.maxMemoryMB,
      hitRate: Math.round(hitRate * 100) / 100,
      namespaces: this.getNamespaceStats(),
      uptime: Date.now() - this.metrics.lastCleanup
    };
  }

  /**
   * Get statistics for each namespace
   * @returns {Object} Namespace statistics
   */
  getNamespaceStats() {
    const stats = {};

    for (const entry of this.cache.values()) {
      if (!stats[entry.namespace]) {
        stats[entry.namespace] = {
          count: 0,
          size: 0,
          memoryUsage: 0
        };
      }

      stats[entry.namespace].count++;
      stats[entry.namespace].size += entry.size;
      stats[entry.namespace].memoryUsage += entry.size;
    }

    return stats;
  }

  /**
   * Travel-specific cache methods
   */

  /**
   * Cache search results (hotels, flights, activities)
   * @param {string} searchType - Type of search (hotels, flights, activities)
   * @param {Object} searchParams - Search parameters
   * @param {Array} results - Search results
   * @param {number} ttl - TTL in milliseconds
   * @returns {boolean} Success status
   */
  cacheSearchResults(searchType, searchParams, results, ttl = 600000) {
    const key = `search:${searchType}:${this.hashObject(searchParams)}`;
    return this.set(key, results, {
      ttl,
      namespace: this.namespaces.SEARCH_RESULTS
    });
  }

  /**
   * Get cached search results
   * @param {string} searchType - Type of search
   * @param {Object} searchParams - Search parameters
   * @returns {Array|null} Cached search results
   */
  getSearchResults(searchType, searchParams) {
    const key = `search:${searchType}:${this.hashObject(searchParams)}`;
    return this.get(key);
  }

  /**
   * Cache hotel details
   * @param {string} hotelId - Hotel identifier
   * @param {Object} hotelData - Hotel information
   * @param {number} ttl - TTL in milliseconds
   * @returns {boolean} Success status
   */
  cacheHotelData(hotelId, hotelData, ttl = 1800000) {
    const key = `hotel:${hotelId}`;
    return this.set(key, hotelData, {
      ttl,
      namespace: this.namespaces.HOTEL_DATA
    });
  }

  /**
   * Get cached hotel data
   * @param {string} hotelId - Hotel identifier
   * @returns {Object|null} Cached hotel data
   */
  getHotelData(hotelId) {
    const key = `hotel:${hotelId}`;
    return this.get(key);
  }

  /**
   * Cache flight data
   * @param {string} flightKey - Flight identifier
   * @param {Object} flightData - Flight information
   * @param {number} ttl - TTL in milliseconds
   * @returns {boolean} Success status
   */
  cacheFlightData(flightKey, flightData, ttl = 900000) {
    const key = `flight:${flightKey}`;
    return this.set(key, flightData, {
      ttl,
      namespace: this.namespaces.FLIGHT_DATA
    });
  }

  /**
   * Get cached flight data
   * @param {string} flightKey - Flight identifier
   * @returns {Object|null} Cached flight data
   */
  getFlightData(flightKey) {
    const key = `flight:${flightKey}`;
    return this.get(key);
  }

  /**
   * Cache user preferences
   * @param {string} userId - User identifier
   * @param {Object} preferences - User preferences
   * @returns {boolean} Success status
   */
  cacheUserPreferences(userId, preferences) {
    const key = `user:${userId}:preferences`;
    return this.set(key, preferences, {
      ttl: 3600000, // 1 hour
      namespace: this.namespaces.USER_PREFERENCES
    });
  }

  /**
   * Get cached user preferences
   * @param {string} userId - User identifier
   * @returns {Object|null} Cached user preferences
   */
  getUserPreferences(userId) {
    const key = `user:${userId}:preferences`;
    return this.get(key);
  }

  /**
   * Cache platform API responses
   * @param {string} platform - Platform name
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @param {Object} response - API response
   * @param {number} ttl - TTL in milliseconds
   * @returns {boolean} Success status
   */
  cachePlatformResponse(platform, endpoint, params, response, ttl = 300000) {
    const key = `platform:${platform}:${endpoint}:${this.hashObject(params)}`;
    return this.set(key, response, {
      ttl,
      namespace: this.namespaces.PLATFORM_RESPONSES
    });
  }

  /**
   * Get cached platform response
   * @param {string} platform - Platform name
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {Object|null} Cached platform response
   */
  getPlatformResponse(platform, endpoint, params) {
    const key = `platform:${platform}:${endpoint}:${this.hashObject(params)}`;
    return this.get(key);
  }

  /**
   * Cache geolocation data
   * @param {string} location - Location string
   * @param {Object} geoData - Geolocation data
   * @returns {boolean} Success status
   */
  cacheGeolocation(location, geoData) {
    const key = `geo:${location.toLowerCase()}`;
    return this.set(key, geoData, {
      ttl: 86400000, // 24 hours
      namespace: this.namespaces.GEOLOCATION
    });
  }

  /**
   * Get cached geolocation data
   * @param {string} location - Location string
   * @returns {Object|null} Cached geolocation data
   */
  getGeolocation(location) {
    const key = `geo:${location.toLowerCase()}`;
    return this.get(key);
  }

  /**
   * Cache currency exchange rates
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @param {number} rate - Exchange rate
   * @returns {boolean} Success status
   */
  cacheCurrencyRate(fromCurrency, toCurrency, rate) {
    const key = `currency:${fromCurrency}:${toCurrency}`;
    return this.set(key, { rate, timestamp: Date.now() }, {
      ttl: 3600000, // 1 hour
      namespace: this.namespaces.CURRENCY_RATES
    });
  }

  /**
   * Get cached currency rate
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @returns {Object|null} Cached currency rate data
   */
  getCurrencyRate(fromCurrency, toCurrency) {
    const key = `currency:${fromCurrency}:${toCurrency}`;
    return this.get(key);
  }

  /**
   * Cache booking data
   * @param {string} bookingId - Booking identifier
   * @param {Object} bookingData - Booking information
   * @returns {boolean} Success status
   */
  cacheBookingData(bookingId, bookingData) {
    const key = `booking:${bookingId}`;
    return this.set(key, bookingData, {
      ttl: 2592000000, // 30 days
      namespace: this.namespaces.BOOKING_DATA
    });
  }

  /**
   * Get cached booking data
   * @param {string} bookingId - Booking identifier
   * @returns {Object|null} Cached booking data
   */
  getBookingData(bookingId) {
    const key = `booking:${bookingId}`;
    return this.get(key);
  }

  /**
   * Private helper methods
   */

  /**
   * Check if cache entry is expired
   * @param {Object} entry - Cache entry
   * @returns {boolean} Whether entry is expired
   */
  isExpired(entry) {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict least recently used entry
   */
  evictLRU() {
    if (this.accessOrder.length === 0) return;

    const lruEntry = this.accessOrder.shift();
    this.cache.delete(lruEntry.key);
    this.metrics.evictions++;
    this.updateMemoryUsage();
  }

  /**
   * Add entry to access order tracking
   * @param {Object} entry - Cache entry
   */
  addToAccessOrder(entry) {
    this.accessOrder.push(entry);
  }

  /**
   * Remove entry from access order tracking
   * @param {Object} entry - Cache entry
   */
  removeFromAccessOrder(entry) {
    const index = this.accessOrder.indexOf(entry);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Update entry position in access order (move to end for LRU)
   * @param {Object} entry - Cache entry
   */
  updateAccessOrder(entry) {
    this.removeFromAccessOrder(entry);
    this.addToAccessOrder(entry);
  }

  /**
   * Estimate memory usage of a value
   * @param {any} value - Value to estimate
   * @returns {number} Estimated size in bytes
   */
  estimateSize(value) {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate
    } catch (error) {
      return 1000; // Default estimate
    }
  }

  /**
   * Update memory usage statistics
   */
  updateMemoryUsage() {
    this.metrics.memoryUsage = 0;
    for (const entry of this.cache.values()) {
      this.metrics.memoryUsage += entry.size;
    }
  }

  /**
   * Generate hash for object (simple hash for cache keys)
   * @param {Object} obj - Object to hash
   * @returns {string} Hash string
   */
  hashObject(obj) {
    try {
      const str = JSON.stringify(obj, Object.keys(obj).sort());
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36);
    } catch (error) {
      return 'default';
    }
  }

  /**
   * Compress data (simple compression for demo)
   * @param {any} data - Data to compress
   * @returns {string} Compressed data
   */
  compressData(data) {
    try {
      return Buffer.from(JSON.stringify(data)).toString('base64');
    } catch (error) {
      return data;
    }
  }

  /**
   * Decompress data
   * @param {string} data - Compressed data
   * @returns {any} Decompressed data
   */
  decompressData(data) {
    try {
      if (typeof data === 'string' && data.includes('"')) {
        return JSON.parse(Buffer.from(data, 'base64').toString());
      }
      return data;
    } catch (error) {
      return data;
    }
  }

  /**
   * Cleanup expired entries and enforce memory limits
   */
  cleanup() {
    try {
      const now = Date.now();
      let cleaned = 0;

      // Remove expired entries
      for (const [key, entry] of this.cache.entries()) {
        if (this.isExpired(entry)) {
          this.cache.delete(key);
          this.removeFromAccessOrder(entry);
          cleaned++;
        }
      }

      // Check memory usage
      const memoryUsageMB = this.metrics.memoryUsage / 1024 / 1024;
      if (memoryUsageMB > this.options.maxMemoryMB) {
        // Evict entries until under memory limit
        while (memoryUsageMB > this.options.maxMemoryMB * 0.8 && this.accessOrder.length > 0) {
          this.evictLRU();
        }
      }

      this.metrics.lastCleanup = now;

      if (cleaned > 0) {
        this.updateMemoryUsage();
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  /**
   * Destroy cache manager and cleanup resources
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    this.accessOrder = [];
    this.metrics = {};
  }
}

module.exports = CacheManager;