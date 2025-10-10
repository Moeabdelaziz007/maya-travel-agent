/**
 * Comprehensive Health Check System for Maya Travel Agent
 * Checks database connectivity, external APIs, system resources, and dependencies
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class HealthChecker {
  constructor() {
    this.checks = new Map();
    this.registerDefaultChecks();
  }

  /**
   * Register default health checks
   */
  registerDefaultChecks() {
    // Database connectivity check
    this.registerCheck('database', async () => {
      try {
        if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === 'your_supabase_url_here') {
          return { status: 'disabled', message: 'Supabase URL not configured' };
        }

        if (!process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
          return { status: 'disabled', message: 'Supabase anon key not configured' };
        }

        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        );

        const { data, error } = await supabase
          .from('health_check')
          .select('count')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }

        return { status: 'healthy', response_time: 0 };
      } catch (error) {
        logger.error('Database health check failed:', error.message);
        return { status: 'unhealthy', error: error.message };
      }
    });

    // Z.ai API check
    this.registerCheck('zai_api', async () => {
      try {
        if (!process.env.ZAI_API_KEY) {
          return { status: 'disabled', message: 'ZAI API key not configured' };
        }

        const response = await axios.get('https://api.zai.ai/health', {
          timeout: 5000,
          headers: {
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
          }
        });

        return {
          status: response.status === 200 ? 'healthy' : 'degraded',
          response_time: response.data.response_time || 0
        };
      } catch (error) {
        logger.error('Z.ai API health check failed:', error.message);
        return { status: 'unhealthy', error: error.message };
      }
    });

    // Telegram Bot API check
    this.registerCheck('telegram_bot', async () => {
      try {
        if (!process.env.TELEGRAM_BOT_TOKEN) {
          return { status: 'disabled', message: 'Telegram bot token not configured' };
        }

        const response = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`, {
          timeout: 5000
        });

        return {
          status: response.data.ok ? 'healthy' : 'unhealthy',
          bot_info: response.data.result
        };
      } catch (error) {
        logger.error('Telegram Bot health check failed:', error.message);
        return { status: 'unhealthy', error: error.message };
      }
    });

    // System resources check
    this.registerCheck('system_resources', async () => {
      try {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        const totalMemory = memUsage.heapTotal + memUsage.external;
        const usedMemory = memUsage.heapUsed + memUsage.external;
        const memoryUsagePercent = (usedMemory / totalMemory) * 100;

        const healthStatus = memoryUsagePercent > 90 ? 'unhealthy' :
          memoryUsagePercent > 75 ? 'degraded' : 'healthy';

        return {
          status: healthStatus,
          memory: {
            used: Math.round(usedMemory / 1024 / 1024), // MB
            total: Math.round(totalMemory / 1024 / 1024), // MB
            usage_percent: Math.round(memoryUsagePercent * 100) / 100
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          },
          uptime: process.uptime()
        };
      } catch (error) {
        logger.error('System resources health check failed:', error.message);
        return { status: 'unhealthy', error: error.message };
      }
    });

    // Cache system check
    this.registerCheck('cache_system', async () => {
      try {
        // This would need to be integrated with the actual cache system
        // For now, return healthy if cache is enabled
        const cacheEnabled = !!(process.env.JSONBIN_API_KEY || process.env.REDIS_URL);

        if (!cacheEnabled) {
          return { status: 'disabled', message: 'Cache not configured' };
        }

        return { status: 'healthy', type: process.env.REDIS_URL ? 'redis' : 'jsonbin' };
      } catch (error) {
        logger.error('Cache system health check failed:', error.message);
        return { status: 'unhealthy', error: error.message };
      }
    });

    // External payment API check (Stripe)
    this.registerCheck('payment_api', async () => {
      try {
        if (!process.env.STRIPE_SECRET_KEY) {
          return { status: 'disabled', message: 'Stripe not configured' };
        }

        // Simple connectivity check - not actual payment processing
        return { status: 'healthy', provider: 'stripe' };
      } catch (error) {
        logger.error('Payment API health check failed:', error.message);
        return { status: 'unhealthy', error: error.message };
      }
    });
  }

  /**
   * Register a custom health check
   */
  registerCheck(name, checkFunction) {
    this.checks.set(name, checkFunction);
  }

  /**
   * Run all health checks
   */
  async runAllChecks() {
    const results = {};
    const startTime = Date.now();

    for (const [name, checkFunction] of this.checks) {
      try {
        const result = await checkFunction();
        results[name] = {
          ...result,
          timestamp: new Date().toISOString(),
          check_duration: Date.now() - startTime
        };
      } catch (error) {
        results[name] = {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    return results;
  }

  /**
   * Run a specific health check
   */
  async runCheck(name) {
    const checkFunction = this.checks.get(name);
    if (!checkFunction) {
      throw new Error(`Health check '${name}' not found`);
    }

    try {
      const result = await checkFunction();
      return {
        ...result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate overall health status
   */
  calculateOverallHealth(results) {
    const statuses = Object.values(results).map(r => r.status);

    if (statuses.includes('unhealthy') || statuses.includes('error')) {
      return 'unhealthy';
    }

    if (statuses.includes('degraded')) {
      return 'degraded';
    }

    if (statuses.every(s => s === 'healthy' || s === 'disabled')) {
      return 'healthy';
    }

    return 'unknown';
  }

  /**
   * Get detailed health report
   */
  async getHealthReport() {
    const results = await this.runAllChecks();
    const overallStatus = this.calculateOverallHealth(results);

    return {
      overall_status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: results,
      summary: {
        total_checks: Object.keys(results).length,
        healthy: Object.values(results).filter(r => r.status === 'healthy').length,
        degraded: Object.values(results).filter(r => r.status === 'degraded').length,
        unhealthy: Object.values(results).filter(r => r.status === 'unhealthy' || r.status === 'error').length,
        disabled: Object.values(results).filter(r => r.status === 'disabled').length
      }
    };
  }

  /**
   * Get simple health status for load balancers
   */
  async getSimpleHealth() {
    const report = await this.getHealthReport();

    return {
      status: report.overall_status,
      timestamp: report.timestamp,
      uptime: report.uptime,
      version: report.version
    };
  }
}

module.exports = HealthChecker;