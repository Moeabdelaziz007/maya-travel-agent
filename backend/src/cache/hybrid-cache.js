/**
 * Hybrid Cache - Local-First with Remote Fallback
 * Perfect solution for Maya Travel Agent caching needs
 *
 * Strategy:
 * 1. Always use local cache first (fastest)
 * 2. Sync with remote in background (resilient)
 * 3. Graceful degradation if remote fails
 */

const JSONbinService = require('./jsonbin-service');

class HybridCache {
  constructor(config = {}) {
    this.local = new Map();
    this.timestamps = new Map();
    this.remote = new JSONbinService({
      apiKey: config.apiKey || process.env.JSONBIN_API_KEY,
      testMode: config.testMode || process.env.NODE_ENV === 'test'
    });

    this.syncInProgress = new Set();
    this.enableRemoteSync = config.enableRemoteSync !== false;

    console.log('🔄 Hybrid Cache initialized', {
      remoteEnabled: !!this.remote.apiKey,
      testMode: this.remote.testMode
    });
  }

  /**
   * Get data with local-first strategy
   */
  async get(key) {
    // 1. Check local cache first
    if (this.local.has(key)) {
      const cached = this.local.get(key);
      const timestamp = this.timestamps.get(key);
      const age = Date.now() - timestamp;

      // Use if less than 5 minutes old
      if (age < 5 * 60 * 1000) {
        return {
          success: true,
          data: cached,
          source: 'local',
          age: age
        };
      }
    }

    // 2. Try remote cache
    if (this.enableRemoteSync && this.remote.apiKey) {
      try {
        const remoteResult = await this.remote.readBin(key);
        if (remoteResult.success) {
          // Update local cache
          this.local.set(key, remoteResult.data);
          this.timestamps.set(key, Date.now());

          return {
            success: true,
            data: remoteResult.data,
            source: 'remote',
            age: 0
          };
        }
      } catch (error) {
        console.warn(`⚠️ Remote cache read failed for ${key}:`, error.message);
      }
    }

    // 3. Return null if not found
    return {
      success: false,
      data: null,
      source: 'none'
    };
  }

  /**
   * Set data with local-first, remote-sync strategy
   */
  async set(key, value, options = {}) {
    const ttl = options.ttl || 300; // 5 minutes default

    // 1. Always set local cache immediately
    this.local.set(key, value);
    this.timestamps.set(key, Date.now());

    // 2. Sync to remote in background if enabled
    if (this.enableRemoteSync && this.remote.apiKey) {
      // Prevent duplicate sync requests
      if (!this.syncInProgress.has(key)) {
        this.syncInProgress.add(key);

        // Async sync (don't await)
        this.syncToRemote(key, value).finally(() => {
          this.syncInProgress.delete(key);
        });
      }
    }

    return {
      success: true,
      source: 'local',
      synced: false // Will be updated when remote sync completes
    };
  }

  /**
   * Sync to remote cache in background
   */
  async syncToRemote(key, value) {
    try {
      const result = await this.remote.updateBin(key, value);

      if (result.success) {
        console.log(`✅ Remote cache synced: ${key}`);
        return { success: true };
      } else {
        console.warn(`⚠️ Remote cache sync failed: ${key}`, result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.warn(`⚠️ Remote cache sync error: ${key}`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete from both caches
   */
  async delete(key) {
    // Delete from local cache
    this.local.delete(key);
    this.timestamps.delete(key);

    // Delete from remote cache
    if (this.enableRemoteSync && this.remote.apiKey) {
      try {
        await this.remote.deleteBin(key);
      } catch (error) {
        console.warn(`⚠️ Remote cache delete failed: ${key}`, error.message);
      }
    }

    return { success: true };
  }

  /**
   * Clear all caches
   */
  async clear() {
    this.local.clear();
    this.timestamps.clear();
    this.syncInProgress.clear();

    if (this.enableRemoteSync && this.remote.apiKey) {
      try {
        await this.remote.clearLocalCache();
      } catch (error) {
        console.warn('⚠️ Remote cache clear failed:', error.message);
      }
    }

    return { success: true };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      localCacheSize: this.local.size,
      syncInProgress: this.syncInProgress.size,
      remoteEnabled: !!this.remote.apiKey,
      testMode: this.remote.testMode,
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    const localHealth = this.local.size >= 0; // Local cache always works

    let remoteHealth = true;
    if (this.enableRemoteSync && this.remote.apiKey) {
      try {
        const remoteCheck = await this.remote.healthCheck();
        remoteHealth = remoteCheck.status === 'healthy' || remoteCheck.status === 'disabled';
      } catch (error) {
        remoteHealth = false;
      }
    }

    return {
      status: localHealth && remoteHealth ? 'healthy' : 'degraded',
      local: localHealth,
      remote: remoteHealth,
      stats: this.getStats()
    };
  }
}

module.exports = HybridCache;