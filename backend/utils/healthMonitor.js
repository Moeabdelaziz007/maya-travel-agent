/**
 * Health Monitor for Maya Travel Agent
 * Monitors system health, API status, and performance metrics
 */

const logger = require('./logger');
const ZaiClient = require('../src/ai/zaiClient');
const SupabaseDB = require('../database/supabase');

class HealthMonitor {
  constructor() {
    this.zaiClient = new ZaiClient();
    this.db = new SupabaseDB();
    
    this.metrics = {
      uptime: Date.now(),
      requests: {
        total: 0,
        successful: 0,
        failed: 0
      },
      api: {
        zai: { status: 'unknown', lastCheck: null, responseTime: 0 },
        telegram: { status: 'unknown', lastCheck: null, responseTime: 0 },
        supabase: { status: 'unknown', lastCheck: null, responseTime: 0 }
      },
      performance: {
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity
      },
      errors: {
        last24h: 0,
        lastError: null
      }
    };
    
    // Start periodic health checks
    this.startHealthChecks();
  }

  /**
   * Get current health status
   */
  getHealth() {
    const uptime = Date.now() - this.metrics.uptime;
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      status: this.getOverallStatus(),
      uptime: {
        ms: uptime,
        formatted: `${uptimeHours}h ${uptimeMinutes}m`
      },
      requests: this.metrics.requests,
      apis: this.metrics.api,
      performance: this.metrics.performance,
      errors: this.metrics.errors,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get overall system status
   */
  getOverallStatus() {
    const apiStatuses = Object.values(this.metrics.api).map(api => api.status);
    
    if (apiStatuses.includes('down')) {
      return 'degraded';
    }
    
    if (apiStatuses.every(status => status === 'healthy')) {
      return 'healthy';
    }
    
    return 'unknown';
  }

  /**
   * Check Z.ai API health
   */
  async checkZaiHealth() {
    const startTime = Date.now();
    
    try {
      const result = await this.zaiClient.healthCheck();
      const responseTime = Date.now() - startTime;
      
      this.metrics.api.zai = {
        status: result.success ? 'healthy' : 'down',
        lastCheck: new Date().toISOString(),
        responseTime,
        error: result.error || null
      };
      
      logger.debug('Z.ai health check', {
        status: this.metrics.api.zai.status,
        responseTime
      });
      
      return result.success;
    } catch (error) {
      this.metrics.api.zai = {
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error.message
      };
      
      logger.error('Z.ai health check failed', error);
      return false;
    }
  }

  /**
   * Check Supabase health
   */
  async checkSupabaseHealth() {
    const startTime = Date.now();
    
    try {
      // Try to get offers as a health check
      await this.db.getTravelOffers({ limit: 1 });
      const responseTime = Date.now() - startTime;
      
      this.metrics.api.supabase = {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        error: null
      };
      
      logger.debug('Supabase health check', {
        status: 'healthy',
        responseTime
      });
      
      return true;
    } catch (error) {
      this.metrics.api.supabase = {
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error.message
      };
      
      logger.error('Supabase health check failed', error);
      return false;
    }
  }

  /**
   * Check Telegram Bot health
   */
  async checkTelegramHealth(bot) {
    const startTime = Date.now();
    
    try {
      const me = await bot.getMe();
      const responseTime = Date.now() - startTime;
      
      this.metrics.api.telegram = {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        botInfo: {
          username: me.username,
          id: me.id
        },
        error: null
      };
      
      logger.debug('Telegram health check', {
        status: 'healthy',
        responseTime,
        bot: me.username
      });
      
      return true;
    } catch (error) {
      this.metrics.api.telegram = {
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error.message
      };
      
      logger.error('Telegram health check failed', error);
      return false;
    }
  }

  /**
   * Record request metrics
   */
  recordRequest(success, responseTime) {
    this.metrics.requests.total++;
    
    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }
    
    // Update performance metrics
    const total = this.metrics.requests.total;
    this.metrics.performance.avgResponseTime = 
      (this.metrics.performance.avgResponseTime * (total - 1) + responseTime) / total;
    
    this.metrics.performance.maxResponseTime = 
      Math.max(this.metrics.performance.maxResponseTime, responseTime);
    
    this.metrics.performance.minResponseTime = 
      Math.min(this.metrics.performance.minResponseTime, responseTime);
  }

  /**
   * Record error
   */
  recordError(error) {
    this.metrics.errors.last24h++;
    this.metrics.errors.lastError = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
    
    logger.error('Error recorded in health monitor', error);
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    // Check every 5 minutes
    setInterval(async () => {
      logger.info('Running periodic health checks...');
      
      await this.checkZaiHealth();
      await this.checkSupabaseHealth();
      
      const health = this.getHealth();
      logger.info('Health check complete', {
        status: health.status,
        apis: Object.keys(health.apis).map(key => ({
          name: key,
          status: health.apis[key].status
        }))
      });
      
      // Alert if system is degraded
      if (health.status === 'degraded') {
        logger.warn('System health degraded', {
          apis: health.apis
        });
      }
    }, 5 * 60 * 1000);
    
    // Reset error counter every 24 hours
    setInterval(() => {
      this.metrics.errors.last24h = 0;
      logger.info('Error counter reset');
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary() {
    const health = this.getHealth();
    
    return {
      status: health.status,
      uptime: health.uptime.formatted,
      totalRequests: health.requests.total,
      successRate: health.requests.total > 0 
        ? ((health.requests.successful / health.requests.total) * 100).toFixed(2) + '%'
        : '0%',
      avgResponseTime: health.performance.avgResponseTime.toFixed(2) + 'ms',
      errors24h: health.errors.last24h,
      apis: Object.keys(health.apis).reduce((acc, key) => {
        acc[key] = health.apis[key].status;
        return acc;
      }, {})
    };
  }

  /**
   * Export metrics for monitoring tools
   */
  exportMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
const healthMonitor = new HealthMonitor();

module.exports = healthMonitor;
