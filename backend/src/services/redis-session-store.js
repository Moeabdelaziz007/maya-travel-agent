/**
 * Redis Session Store for Express Session
 * Implements the express-session Store interface using Redis
 */

const redisService = require('./redis-service');
const redisConfig = require('../config/redis-config');

class RedisSessionStore extends require('express-session').Store {
  constructor(options = {}) {
    super(options);

    this.ttl = options.ttl || redisConfig.session.ttl;
    this.prefix = options.prefix || redisConfig.session.prefix;
    this.scanCount = options.scanCount || 100;

    // Bind methods
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.destroy = this.destroy.bind(this);
    this.touch = this.touch.bind(this);
    this.all = this.all.bind(this);
    this.length = this.length.bind(this);
    this.clear = this.clear.bind(this);
  }

  /**
   * Get session data by session ID
   */
  async get(sid, callback) {
    try {
      const data = await redisService.getSession(sid);

      if (data) {
        // Session data is stored with express-session format
        callback(null, data);
      } else {
        callback(null, null);
      }
    } catch (error) {
      console.error('❌ RedisSessionStore.get error:', error.message);
      callback(error);
    }
  }

  /**
   * Set session data
   */
  async set(sid, session, callback) {
    try {
      // Remove express-session internal properties before storing
      const data = { ...session };
      delete data.cookie;

      const success = await redisService.setSession(sid, data, this.ttl);

      if (success) {
        callback(null);
      } else {
        callback(new Error('Failed to store session'));
      }
    } catch (error) {
      console.error('❌ RedisSessionStore.set error:', error.message);
      callback(error);
    }
  }

  /**
   * Destroy session by session ID
   */
  async destroy(sid, callback) {
    try {
      const success = await redisService.deleteSession(sid);

      if (success) {
        callback(null);
      } else {
        callback(new Error('Session not found'));
      }
    } catch (error) {
      console.error('❌ RedisSessionStore.destroy error:', error.message);
      callback(error);
    }
  }

  /**
   * Touch session to extend TTL
   */
  async touch(sid, session, callback) {
    try {
      const success = await redisService.extendSession(sid, this.ttl);

      if (success) {
        callback(null);
      } else {
        callback(new Error('Failed to extend session'));
      }
    } catch (error) {
      console.error('❌ RedisSessionStore.touch error:', error.message);
      callback(error);
    }
  }

  /**
   * Get all session IDs (expensive operation, use with caution)
   */
  async all(callback) {
    try {
      const keys = await redisService.keys(`${this.prefix}*`);

      if (keys && keys.length > 0) {
        // Extract session IDs from Redis keys
        const sids = keys.map((key) => key.replace(this.prefix, ''));
        callback(null, sids);
      } else {
        callback(null, []);
      }
    } catch (error) {
      console.error('❌ RedisSessionStore.all error:', error.message);
      callback(error);
    }
  }

  /**
   * Get number of active sessions
   */
  async length(callback) {
    try {
      const keys = await redisService.keys(`${this.prefix}*`);
      callback(null, keys ? keys.length : 0);
    } catch (error) {
      console.error('❌ RedisSessionStore.length error:', error.message);
      callback(error);
    }
  }

  /**
   * Clear all sessions (dangerous operation!)
   */
  async clear(callback) {
    try {
      if (redisConfig.isProduction) {
        return callback(new Error('Clear operation not allowed in production'));
      }

      const keys = await redisService.keys(`${this.prefix}*`);

      if (keys && keys.length > 0) {
        const deletePromises = keys.map((key) =>
          redisService.del(key.replace(redisConfig.cache.prefix, ''))
        );

        await Promise.all(deletePromises);
      }

      callback(null);
    } catch (error) {
      console.error('❌ RedisSessionStore.clear error:', error.message);
      callback(error);
    }
  }

  /**
   * Get session statistics
   */
  async getStats() {
    try {
      const length = await new Promise((resolve, reject) => {
        this.length((err, count) => {
          if (err) reject(err);
          else resolve(count);
        });
      });

      return {
        sessions: length,
        ttl: this.ttl,
        prefix: this.prefix,
        redisConnected: redisService.isConnected,
      };
    } catch (error) {
      console.error('❌ RedisSessionStore.getStats error:', error.message);
      return {
        sessions: 0,
        ttl: this.ttl,
        prefix: this.prefix,
        redisConnected: false,
        error: error.message,
      };
    }
  }
}

module.exports = RedisSessionStore;
