/**
 * KV Cache Manager
 * Intelligent memory management for AI model KV (Key-Value) cache offloading
 * Implements strategies to optimize memory usage during inference
 */

const crypto = require('crypto');

class KVCacheManager {
  constructor(options = {}) {
    // Configuration
    this.maxCacheSize = options.maxCacheSize || 100; // Maximum number of cached entries
    this.ttl = options.ttl || 3600000; // Time to live in milliseconds (default 1 hour)
    this.enableOffloading = options.enableOffloading !== false; // Default to true
    this.offloadThreshold = options.offloadThreshold || 0.8; // Offload at 80% capacity
    
    // Cache storage
    this.cache = new Map();
    this.accessCount = new Map();
    this.lastAccess = new Map();
    
    // Memory statistics
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      offloads: 0,
      reloads: 0
    };
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Every minute
  }

  /**
   * Generate a cache key from conversation context
   * @param {Array} messages - Conversation messages
   * @param {Object} options - Additional context
   * @returns {string} Cache key
   */
  generateCacheKey(messages, options = {}) {
    const contextString = JSON.stringify({
      messages: messages.slice(-5), // Last 5 messages for context
      model: options.model || 'default',
      temperature: options.temperature || 0.7
    });
    return crypto.createHash('sha256').update(contextString).digest('hex');
  }

  /**
   * Get cached KV data if available
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null
   */
  get(key) {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return null;
    }

    const entry = this.cache.get(key);
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access tracking
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.lastAccess.set(key, Date.now());
    this.stats.hits++;

    return entry.data;
  }

  /**
   * Store KV data in cache
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   * @returns {boolean} Success status
   */
  set(key, data) {
    // Check if we need to make room
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size: this.estimateSize(data)
    });

    this.accessCount.set(key, 1);
    this.lastAccess.set(key, Date.now());

    // Check if offloading is needed
    if (this.shouldOffload()) {
      this.offloadToDisk();
    }

    return true;
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    this.accessCount.delete(key);
    this.lastAccess.delete(key);
  }

  /**
   * Evict least recently used entry
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, time] of this.lastAccess.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Check if cache should offload to disk
   * @returns {boolean}
   */
  shouldOffload() {
    if (!this.enableOffloading) return false;
    return this.cache.size / this.maxCacheSize >= this.offloadThreshold;
  }

  /**
   * Offload cache to disk (simulated - in production would use Redis or filesystem)
   */
  offloadToDisk() {
    // In a production environment, this would offload to Redis, disk, or cloud storage
    // For now, we'll just evict less-used entries
    const entriesToOffload = Math.floor(this.cache.size * 0.2); // Offload 20%
    
    // Sort by access count and evict least used
    const sortedEntries = Array.from(this.accessCount.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, entriesToOffload);

    sortedEntries.forEach(([key]) => {
      this.delete(key);
      this.stats.offloads++;
    });

    console.log(`📦 KV Cache: Offloaded ${entriesToOffload} entries to free memory`);
  }

  /**
   * Estimate size of cached data
   * @param {Object} data - Data to estimate
   * @returns {number} Estimated size in bytes
   */
  estimateSize(data) {
    return JSON.stringify(data).length * 2; // Rough estimate: 2 bytes per character
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 KV Cache: Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      currentSize: this.cache.size,
      maxSize: this.maxCacheSize,
      utilizationPercent: ((this.cache.size / this.maxCacheSize) * 100).toFixed(2),
      hitRatePercent: hitRate
    };
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.accessCount.clear();
    this.lastAccess.clear();
    console.log('🗑️ KV Cache: Cleared all entries');
  }

  /**
   * Destroy cache manager and cleanup
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }

  /**
   * Get optimal provider hints for Z.ai API based on cache state
   * @returns {Object} Provider hints configuration
   */
  getProviderHints() {
    const utilization = this.cache.size / this.maxCacheSize;
    
    return {
      kv_cache_offload: this.enableOffloading && utilization > 0.5,
      // Suggest more aggressive offloading when cache is fuller
      offload_strategy: utilization > 0.7 ? 'aggressive' : 'balanced',
      cache_utilization: utilization
    };
  }
}

/**
 * Singleton instance for application-wide use
 */
let globalCacheManager = null;

function getGlobalCacheManager(options = {}) {
  if (!globalCacheManager) {
    globalCacheManager = new KVCacheManager({
      maxCacheSize: parseInt(process.env.KV_CACHE_MAX_SIZE) || 100,
      ttl: parseInt(process.env.KV_CACHE_TTL) || 3600000,
      enableOffloading: process.env.KV_CACHE_OFFLOAD !== 'false',
      offloadThreshold: parseFloat(process.env.KV_CACHE_OFFLOAD_THRESHOLD) || 0.8,
      ...options
    });
  }
  return globalCacheManager;
}

module.exports = { KVCacheManager, getGlobalCacheManager };
