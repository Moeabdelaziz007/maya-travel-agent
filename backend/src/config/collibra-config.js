/**
 * Collibra Configuration Manager
 * Uses Collibra Data Catalog for centralized configuration governance
 *
 * Benefits:
 * - Centralized config management
 * - Version control for configs
 * - Audit trail for all changes
 * - Data governance compliance
 * - Multi-environment support
 */

const axios = require('axios');
const logger = require('../utils/logger');

class CollibraConfigManager {
  constructor(config = {}) {
    this.collibraUrl =
      config.collibraUrl ||
      process.env.COLLIBRA_URL ||
      'https://maya.collibra.com';
    this.apiKey = config.apiKey || process.env.COLLIBRA_API_KEY;
    this.username = config.username || process.env.COLLIBRA_USERNAME;
    this.password = config.password || process.env.COLLIBRA_PASSWORD;

    // Cache configs locally for performance
    this.configCache = new Map();
    this.cacheTTL = config.cacheTTL || 300000; // 5 minutes default

    // Initialize axios client
    this.client = axios.create({
      baseURL: `${this.collibraUrl}/rest/2.0`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      timeout: 10000
    });

    // Set authentication
    if (this.apiKey) {
      this.client.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${this.apiKey}`;
    } else if (this.username && this.password) {
      this.client.defaults.auth = {
        username: this.username,
        password: this.password
      };
    }

    logger.info('Collibra Config Manager initialized', {
      url: this.collibraUrl,
      authMethod: this.apiKey ? 'API Key' : 'Basic Auth'
    });
  }

  /**
   * Get configuration for specific environment
   * @param {string} environment - Environment name (development, staging, production)
   * @param {boolean} forceRefresh - Skip cache and fetch fresh config
   */
  async getConfig(environment = 'development', forceRefresh = false) {
    const cacheKey = `config_${environment}`;

    // Check cache first
    if (!forceRefresh && this.configCache.has(cacheKey)) {
      const cached = this.configCache.get(cacheKey);
      const age = Date.now() - cached.timestamp;

      if (age < this.cacheTTL) {
        logger.debug('Returning cached config', { environment, age });
        return cached.data;
      }
    }

    try {
      logger.info('Fetching config from Collibra', { environment });

      // Step 1: Find the configuration asset
      const assetName = `maya_${environment}_config`;
      const asset = await this.findAsset(assetName, 'Configuration');

      if (!asset) {
        logger.warn('Config asset not found in Collibra, using fallback', {
          assetName
        });
        return this.getFallbackConfig(environment);
      }

      // Step 2: Get asset attributes
      const attributes = await this.getAssetAttributes(asset.id);

      // Step 3: Transform Collibra attributes to config object
      const config = this.transformAttributes(attributes);

      // Cache the result
      this.configCache.set(cacheKey, {
        data: config,
        timestamp: Date.now()
      });

      logger.info('Config loaded successfully from Collibra', {
        environment,
        assetId: asset.id
      });

      return config;
    } catch (error) {
      logger.error('Failed to fetch config from Collibra', {
        environment,
        error: error.message
      });

      // Return fallback config on error
      return this.getFallbackConfig(environment);
    }
  }

  /**
   * Find asset by name and type
   */
  async findAsset(name, type) {
    try {
      const response = await this.client.get('/assets', {
        params: {
          name: name,
          typeNames: type,
          limit: 1
        }
      });

      return response.data.results?.[0] || null;
    } catch (error) {
      logger.error('Error finding asset', { name, type, error: error.message });
      return null;
    }
  }

  /**
   * Get all attributes for an asset
   */
  async getAssetAttributes(assetId) {
    try {
      const response = await this.client.get(`/assets/${assetId}/attributes`);
      return response.data.results || [];
    } catch (error) {
      logger.error('Error fetching asset attributes', {
        assetId,
        error: error.message
      });
      return [];
    }
  }

  /**
   * Transform Collibra attributes to config object
   */
  transformAttributes(attributes) {
    const config = {
      database: {},
      ai: {},
      payments: {},
      telegram: {},
      cache: {},
      monitoring: {},
      security: {}
    };

    attributes.forEach((attr) => {
      const { name, value } = attr;

      // Parse attribute name (format: section.key)
      const parts = name.split('.');
      if (parts.length === 2) {
        const [section, key] = parts;

        if (config[section] !== undefined) {
          // Try to parse JSON values
          try {
            config[section][key] = JSON.parse(value);
          } catch {
            config[section][key] = value;
          }
        }
      }
    });

    return config;
  }

  /**
   * Get fallback configuration when Collibra is unavailable
   */
  getFallbackConfig(environment) {
    logger.warn('Using fallback configuration', { environment });

    return {
      database: {
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/maya',
        pool_size: parseInt(process.env.DB_POOL_SIZE || '10'),
        ssl: environment === 'production'
      },
      ai: {
        provider: 'zai',
        api_url:
          process.env.ZAI_API_URL || 'https://open.bigmodel.cn/api/paas/v4',
        model: process.env.ZAI_MODEL || 'glm-4-flash',
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
      },
      payments: {
        stripe_enabled: process.env.STRIPE_ENABLED === 'true',
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET
      },
      telegram: {
        bot_token: process.env.TELEGRAM_BOT_TOKEN,
        webhook_url: process.env.TELEGRAM_WEBHOOK_URL
      },
      cache: {
        jsonbin_api_key: process.env.JSONBIN_API_KEY,
        ttl: parseInt(process.env.CACHE_TTL || '3600')
      },
      monitoring: {
        prometheus_enabled: environment !== 'development',
        metrics_port: parseInt(process.env.METRICS_PORT || '9090')
      },
      security: {
        rate_limit_window_ms: parseInt(
          process.env.RATE_LIMIT_WINDOW || '60000'
        ),
        rate_limit_max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
        cors_origin: process.env.CORS_ORIGIN || '*'
      },
      _source: 'fallback',
      _environment: environment
    };
  }

  /**
   * Update configuration in Collibra
   */
  async updateConfig(environment, section, key, value) {
    try {
      const assetName = `maya_${environment}_config`;
      const asset = await this.findAsset(assetName, 'Configuration');

      if (!asset) {
        throw new Error(`Config asset not found: ${assetName}`);
      }

      // Find or create attribute
      const attributeName = `${section}.${key}`;
      const stringValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);

      await this.client.post(`/assets/${asset.id}/attributes`, {
        name: attributeName,
        value: stringValue
      });

      // Invalidate cache
      this.configCache.delete(`config_${environment}`);

      logger.info('Config updated in Collibra', {
        environment,
        section,
        key,
        assetId: asset.id
      });

      return true;
    } catch (error) {
      logger.error('Failed to update config in Collibra', {
        environment,
        section,
        key,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get configuration metadata (governance info)
   */
  async getConfigMetadata(environment) {
    try {
      const assetName = `maya_${environment}_config`;
      const asset = await this.findAsset(assetName, 'Configuration');

      if (!asset) {
        return null;
      }

      // Get asset responsibilities (owners, stewards)
      const responsibilities = await this.client.get(
        `/assets/${asset.id}/responsibilities`
      );

      // Get asset lineage
      const lineage = await this.client.get(`/assets/${asset.id}/lineage`);

      return {
        asset_id: asset.id,
        asset_name: asset.name,
        created_on: asset.createdOn,
        last_modified: asset.lastModifiedOn,
        owners: responsibilities.data.results
          .filter((r) => r.role.name === 'Data Owner')
          .map((r) => r.user.userName),
        stewards: responsibilities.data.results
          .filter((r) => r.role.name === 'Data Steward')
          .map((r) => r.user.userName),
        lineage: lineage.data
      };
    } catch (error) {
      logger.error('Failed to fetch config metadata', {
        environment,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Clear configuration cache
   */
  clearCache(environment = null) {
    if (environment) {
      this.configCache.delete(`config_${environment}`);
      logger.info('Cache cleared for environment', { environment });
    } else {
      this.configCache.clear();
      logger.info('All config cache cleared');
    }
  }

  /**
   * Health check for Collibra connection
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/version');
      return {
        healthy: true,
        version: response.data.version,
        url: this.collibraUrl
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        url: this.collibraUrl
      };
    }
  }
}

// Singleton instance
let instance = null;

module.exports = {
  CollibraConfigManager,

  /**
   * Get singleton instance
   */
  getInstance: (config) => {
    if (!instance) {
      instance = new CollibraConfigManager(config);
    }
    return instance;
  },

  /**
   * Initialize with config
   */
  initialize: (config) => {
    instance = new CollibraConfigManager(config);
    return instance;
  }
};
