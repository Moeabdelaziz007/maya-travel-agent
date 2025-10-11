/**
 * Redis Service
 * Comprehensive Redis service for caching, rate limiting, and session management
 * Follows the established pattern from Amadeus SDK integration
 */

const redis = require('redis');
const { promisify } = require('util');
const redisConfig = require('../config/redis-config');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      operations: 0,
    };

    // Bind methods
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.healthCheck = this.healthCheck.bind(this);
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.del = this.del.bind(this);
    this.exists = this.exists.bind(this);
    this.expire = this.expire.bind(this);
    this.ttl = this.ttl.bind(this);
    this.keys = this.keys.bind(this);
    this.flushdb = this.flushdb.bind(this);
    this.incr = this.incr.bind(this);
    this.decr = this.decr.bind(this);
    this.setex = this.setex.bind(this);
    this.getset = this.getset.bind(this);
    this.mget = this.mget.bind(this);
    this.mset = this.mset.bind(this);
  }

  /**
   * Connect to Redis
   */
  async connect() {
    try {
      console.log('🔴 Connecting to Redis...');

      this.client = redis.createClient(redisConfig);

      // Handle connection events
      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('🔴 Redis ready to receive commands');
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis connection error:', err.message);
        this.isConnected = false;
        this.metrics.errors++;
      });

      this.client.on('end', () => {
        console.log('🔴 Redis connection ended');
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();

      // Test connection
      await this.client.ping();
      console.log('✅ Redis ping successful');

      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        console.log('✅ Redis disconnected successfully');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from Redis:', error.message);
      this.metrics.errors++;
    } finally {
      this.isConnected = false;
      this.client = null;
    }
  }

  /**
   * Health check for Redis
   */
  async healthCheck() {
    try {
      if (!this.client || !this.isConnected) {
        return {
          status: 'disconnected',
          message: 'Redis client not connected',
          uptime: 0,
          memory: { used: 0, peak: 0 },
          connections: { connected: 0, total: 0 },
        };
      }

      const startTime = Date.now();
      await this.client.ping();
      const responseTime = Date.now() - startTime;

      // Get Redis info
      const info = await this.client.info();
      const infoLines = info.split('\r\n');
      const infoObj = {};

      infoLines.forEach((line) => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          infoObj[key] = value;
        }
      });

      return {
        status: 'healthy',
        message: 'Redis is responding',
        uptime: parseInt(infoObj.uptime_in_seconds) || 0,
        memory: {
          used: parseInt(infoObj.used_memory) || 0,
          peak: parseInt(infoObj.used_memory_peak) || 0,
        },
        connections: {
          connected: parseInt(infoObj.connected_clients) || 0,
          total: parseInt(infoObj.total_connections_received) || 0,
        },
        responseTime,
        metrics: this.metrics,
      };
    } catch (error) {
      console.error('❌ Redis health check failed:', error.message);
      this.metrics.errors++;
      return {
        status: 'unhealthy',
        message: error.message,
        error: error.message,
      };
    }
  }

  // ==================== BASIC CACHE OPERATIONS ====================

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      if (!this.isConnected) return null;

      this.metrics.operations++;
      const fullKey = redisConfig.cache.prefix + key;
      const value = await this.client.get(fullKey);

      if (value) {
        this.metrics.hits++;
        return JSON.parse(value);
      } else {
        this.metrics.misses++;
        return null;
      }
    } catch (error) {
      console.error('❌ Redis GET error:', error.message);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = null) {
    try {
      if (!this.isConnected) return false;

      this.metrics.operations++;
      const fullKey = redisConfig.cache.prefix + key;
      const serializedValue = JSON.stringify(value);

      if (ttl) {
        await this.client.setex(fullKey, ttl, serializedValue);
      } else {
        await this.client.set(fullKey, serializedValue);
      }

      return true;
    } catch (error) {
      console.error('❌ Redis SET error:', error.message);
      this.metrics.errors++;
      return false;
    }
  }

  /**
   * Set value with expiration
   */
  async setex(key, ttl, value) {
    return this.set(key, value, ttl);
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    try {
      if (!this.isConnected) return 0;

      this.metrics.operations++;
      const fullKey = redisConfig.cache.prefix + key;
      return await this.client.del(fullKey);
    } catch (error) {
      console.error('❌ Redis DEL error:', error.message);
      this.metrics.errors++;
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      if (!this.isConnected) return false;

      const fullKey = redisConfig.cache.prefix + key;
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('❌ Redis EXISTS error:', error.message);
      this.metrics.errors++;
      return false;
    }
  }

  /**
   * Set expiration on key
   */
  async expire(key, ttl) {
    try {
      if (!this.isConnected) return false;

      const fullKey = redisConfig.cache.prefix + key;
      return await this.client.expire(fullKey, ttl);
    } catch (error) {
      console.error('❌ Redis EXPIRE error:', error.message);
      this.metrics.errors++;
      return false;
    }
  }

  /**
   * Get time to live for key
   */
  async ttl(key) {
    try {
      if (!this.isConnected) return -2;

      const fullKey = redisConfig.cache.prefix + key;
      return await this.client.ttl(fullKey);
    } catch (error) {
      console.error('❌ Redis TTL error:', error.message);
      this.metrics.errors++;
      return -2;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern = '*') {
    try {
      if (!this.isConnected) return [];

      const fullPattern = redisConfig.cache.prefix + pattern;
      return await this.client.keys(fullPattern);
    } catch (error) {
      console.error('❌ Redis KEYS error:', error.message);
      this.metrics.errors++;
      return [];
    }
  }

  /**
   * Increment value
   */
  async incr(key) {
    try {
      if (!this.isConnected) return null;

      this.metrics.operations++;
      const fullKey = redisConfig.cache.prefix + key;
      return await this.client.incr(fullKey);
    } catch (error) {
      console.error('❌ Redis INCR error:', error.message);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Decrement value
   */
  async decr(key) {
    try {
      if (!this.isConnected) return null;

      this.metrics.operations++;
      const fullKey = redisConfig.cache.prefix + key;
      return await this.client.decr(fullKey);
    } catch (error) {
      console.error('❌ Redis DECR error:', error.message);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Get and set value
   */
  async getset(key, value) {
    try {
      if (!this.isConnected) return null;

      this.metrics.operations++;
      const fullKey = redisConfig.cache.prefix + key;
      const serializedValue = JSON.stringify(value);
      const result = await this.client.getset(fullKey, serializedValue);

      return result ? JSON.parse(result) : null;
    } catch (error) {
      console.error('❌ Redis GETSET error:', error.message);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Get multiple values
   */
  async mget(keys) {
    try {
      if (!this.isConnected) return [];

      this.metrics.operations++;
      const fullKeys = keys.map((key) => redisConfig.cache.prefix + key);
      const values = await this.client.mget(fullKeys);

      return values.map((value) => (value ? JSON.parse(value) : null));
    } catch (error) {
      console.error('❌ Redis MGET error:', error.message);
      this.metrics.errors++;
      return [];
    }
  }

  /**
   * Set multiple values
   */
  async mset(keyValuePairs) {
    try {
      if (!this.isConnected) return false;

      this.metrics.operations++;
      const fullKeyValuePairs = {};

      Object.entries(keyValuePairs).forEach(([key, value]) => {
        fullKeyValuePairs[redisConfig.cache.prefix + key] =
          JSON.stringify(value);
      });

      await this.client.mset(fullKeyValuePairs);
      return true;
    } catch (error) {
      console.error('❌ Redis MSET error:', error.message);
      this.metrics.errors++;
      return false;
    }
  }

  /**
   * Flush all data (use with caution!)
   */
  async flushdb() {
    try {
      if (!this.isConnected) return false;

      if (redisConfig.isProduction) {
        throw new Error('FLUSHDB not allowed in production');
      }

      await this.client.flushdb();
      console.log('🗑️  Redis database flushed');
      return true;
    } catch (error) {
      console.error('❌ Redis FLUSHDB error:', error.message);
      this.metrics.errors++;
      return false;
    }
  }

  // ==================== RATE LIMITING ====================

  /**
   * Check rate limit for a key
   */
  async checkRateLimit(key, windowMs = null, maxRequests = null) {
    try {
      if (!this.isConnected) return { allowed: true };

      const window = windowMs || redisConfig.rateLimit.windowMs;
      const max = maxRequests || redisConfig.rateLimit.maxRequests;
      const rateLimitKey = redisConfig.rateLimit.prefix + key;

      // Get current count
      const current = await this.client.get(rateLimitKey);
      const count = current ? parseInt(current) : 0;

      // Check if limit exceeded
      if (count >= max) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: await this.ttl(
            rateLimitKey.replace(redisConfig.rateLimit.prefix, '')
          ),
        };
      }

      // Increment counter
      const newCount = await this.client.incr(rateLimitKey);

      // Set expiration if this is the first request
      if (newCount === 1) {
        await this.client.expire(rateLimitKey, Math.ceil(window / 1000));
      }

      return {
        allowed: true,
        remaining: Math.max(0, max - newCount),
        resetTime: Math.ceil(window / 1000),
      };
    } catch (error) {
      console.error('❌ Rate limit check error:', error.message);
      this.metrics.errors++;
      // Allow request on error to avoid blocking legitimate traffic
      return { allowed: true };
    }
  }

  /**
   * Reset rate limit for a key
   */
  async resetRateLimit(key) {
    try {
      if (!this.isConnected) return false;

      const rateLimitKey = redisConfig.rateLimit.prefix + key;
      return await this.client.del(rateLimitKey);
    } catch (error) {
      console.error('❌ Rate limit reset error:', error.message);
      this.metrics.errors++;
      return false;
    }
  }

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Get session data
   */
  async getSession(sessionId) {
    try {
      if (!this.isConnected) return null;

      const sessionKey = redisConfig.session.prefix + sessionId;
      const data = await this.client.get(sessionKey);

      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Session get error:', error.message);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Set session data
   */
  async setSession(sessionId, data, ttl = null) {
    try {
      if (!this.isConnected) return false;

      const sessionKey = redisConfig.session.prefix + sessionId;
      const expiration = ttl || redisConfig.session.ttl;

      await this.client.setex(sessionKey, expiration, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('❌ Session set error:', error.message);
      this.metrics.errors++;
      return false;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId) {
    try {
      if (!this.isConnected) return false;

      const sessionKey = redisConfig.session.prefix + sessionId;
      return await this.client.del(sessionKey);
    } catch (error) {
      console.error('❌ Session delete error:', error.message);
      this.metrics.errors++;
      return false;
    }
  }

  /**
   * Extend session TTL
   */
  async extendSession(sessionId, additionalTtl = null) {
    try {
      if (!this.isConnected) return false;

      const sessionKey = redisConfig.session.prefix + sessionId;
      const ttl = additionalTtl || redisConfig.session.ttl;

      return await this.client.expire(sessionKey, ttl);
    } catch (error) {
      console.error('❌ Session extend error:', error.message);
      this.metrics.errors++;
      return false;
    }
  }

  // ==================== ADVANCED CACHE METHODS ====================

  /**
   * Cache with fallback function
   */
  async getOrSet(key, fallbackFn, ttl = null) {
    try {
      // Try to get from cache first
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute fallback function
      const result = await fallbackFn();

      // Cache the result
      await this.set(key, result, ttl || redisConfig.cache.ttl);

      return result;
    } catch (error) {
      console.error('❌ Cache getOrSet error:', error.message);
      this.metrics.errors++;

      // Return result from fallback even if caching fails
      try {
        return await fallbackFn();
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  }

  /**
   * Cache multiple keys at once
   */
  async getMultipleOrSet(keys, fallbackFns, ttl = null) {
    try {
      const results = {};
      const uncachedKeys = [];
      const uncachedFns = [];

      // Check cache for all keys
      for (let i = 0; i < keys.length; i++) {
        const cached = await this.get(keys[i]);
        if (cached !== null) {
          results[keys[i]] = cached;
        } else {
          uncachedKeys.push(keys[i]);
          uncachedFns.push(fallbackFns[i]);
        }
      }

      // Execute fallback functions for uncached keys
      if (uncachedKeys.length > 0) {
        const fallbackResults = await Promise.all(
          uncachedFns.map((fn) => fn())
        );

        // Cache and add to results
        for (let i = 0; i < uncachedKeys.length; i++) {
          const key = uncachedKeys[i];
          const result = fallbackResults[i];
          results[key] = result;
          await this.set(key, result, ttl || redisConfig.cache.ttl);
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Cache getMultipleOrSet error:', error.message);
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate =
      totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0;

    return {
      ...this.metrics,
      hitRate: Math.round(hitRate * 100) / 100,
      connected: this.isConnected,
      uptime: process.uptime(),
    };
  }

  /**
   * Clear cache by pattern
   */
  async clearByPattern(pattern) {
    try {
      if (!this.isConnected) return 0;

      const keys = await this.keys(pattern);
      if (keys.length === 0) return 0;

      const fullKeys = keys.map(
        (key) =>
          redisConfig.cache.prefix + key.replace(redisConfig.cache.prefix, '')
      );
      return await this.client.del(fullKeys);
    } catch (error) {
      console.error('❌ Clear by pattern error:', error.message);
      this.metrics.errors++;
      return 0;
    }
  }
}

// Export singleton instance
const redisService = new RedisService();

module.exports = redisService;
