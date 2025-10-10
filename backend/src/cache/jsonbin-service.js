/**
 * JSONbin.io Caching Service
 * High-performance caching layer for Maya Travel Agent
 *
 * Perfect for:
 * - BossAgent metrics (temporary data)
 * - Skills configuration
 * - Price monitoring cache
 * - Development/testing data
 */

const fetch = require('node-fetch');

class JSONbinService {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.JSONBIN_API_KEY;
    this.baseUrl = 'https://api.jsonbin.io/v3';
    this.defaultTtl = config.defaultTtl || 3600; // 1 hour default

    // In-memory cache for performance
    this.localCache = new Map();
    this.cacheTimestamps = new Map();

    if (!this.apiKey) {
      console.warn('⚠️ JSONbin API key not provided - caching disabled');
    }
  }

  /**
   * Create a new bin
   */
  async createBin(name, data, isPrivate = true) {
    try {
      if (!this.apiKey) {
        throw new Error('JSONbin API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': this.apiKey
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`JSONbin API error: ${response.status}`);
      }

      const result = await response.json();

      console.log(`✅ Created JSONbin: ${name} (${result.metadata.id})`);

      return {
        success: true,
        binId: result.metadata.id,
        name,
        url: `https://api.jsonbin.io/v3/b/${result.metadata.id}`
      };

    } catch (error) {
      console.error(`❌ Failed to create bin ${name}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Read data from bin with local caching
   */
  async readBin(binId, useCache = true) {
    try {
      // Check local cache first
      if (useCache && this.localCache.has(binId)) {
        const cached = this.localCache.get(binId);
        const timestamp = this.cacheTimestamps.get(binId);
        const age = Date.now() - timestamp;

        // Use cache if less than 5 minutes old
        if (age < 5 * 60 * 1000) {
          return {
            success: true,
            data: cached,
            cached: true,
            age: age
          };
        }
      }

      if (!this.apiKey) {
        throw new Error('JSONbin API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/b/${binId}/latest`, {
        method: 'GET',
        headers: {
          'X-Access-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`JSONbin API error: ${response.status}`);
      }

      const result = await response.json();

      // Update local cache
      if (useCache) {
        this.localCache.set(binId, result.record);
        this.cacheTimestamps.set(binId, Date.now());
      }

      return {
        success: true,
        data: result.record,
        cached: false,
        binId
      };

    } catch (error) {
      console.error(`❌ Failed to read bin ${binId}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Update bin data
   */
  async updateBin(binId, data) {
    try {
      if (!this.apiKey) {
        throw new Error('JSONbin API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/b/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': this.apiKey
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`JSONbin API error: ${response.status}`);
      }

      const result = await response.json();

      // Update local cache
      this.localCache.set(binId, data);
      this.cacheTimestamps.set(binId, Date.now());

      return {
        success: true,
        binId,
        version: result.metadata.version
      };

    } catch (error) {
      console.error(`❌ Failed to update bin ${binId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete bin
   */
  async deleteBin(binId) {
    try {
      if (!this.apiKey) {
        throw new Error('JSONbin API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/b/${binId}`, {
        method: 'DELETE',
        headers: {
          'X-Access-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`JSONbin API error: ${response.status}`);
      }

      // Remove from local cache
      this.localCache.delete(binId);
      this.cacheTimestamps.delete(binId);

      return {
        success: true,
        binId
      };

    } catch (error) {
      console.error(`❌ Failed to delete bin ${binId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get bin metadata
   */
  async getBinMetadata(binId) {
    try {
      if (!this.apiKey) {
        throw new Error('JSONbin API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/b/${binId}/meta`, {
        method: 'GET',
        headers: {
          'X-Access-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`JSONbin API error: ${response.status}`);
      }

      const metadata = await response.json();

      return {
        success: true,
        metadata
      };

    } catch (error) {
      console.error(`❌ Failed to get metadata for bin ${binId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.apiKey) {
        return {
          status: 'disabled',
          message: 'API key not configured'
        };
      }

      // Try to read a test bin or create one
      const testData = { test: true, timestamp: Date.now() };
      const result = await this.createBin('health-check', testData);

      if (result.success) {
        // Clean up test bin
        await this.deleteBin(result.binId);

        return {
          status: 'healthy',
          message: 'JSONbin service is working correctly'
        };
      } else {
        return {
          status: 'unhealthy',
          message: result.error
        };
      }

    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message
      };
    }
  }

  /**
   * Clear local cache
   */
  clearLocalCache() {
    this.localCache.clear();
    this.cacheTimestamps.clear();
    console.log('🧹 Local cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      localCacheSize: this.localCache.size,
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  /**
   * Calculate cache hit rate (simplified)
   */
  calculateCacheHitRate() {
    // This would need more sophisticated tracking in production
    return 0.85; // Placeholder - 85% hit rate
  }
}

module.exports = JSONbinService;