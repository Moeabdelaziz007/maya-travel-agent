/**
 * Skill Plugin System - Enhanced with JSONbin.io Integration
 * Dynamic skill registration and execution system
 */

const JSONbinService = require('../cache/jsonbin-service');
const logger = require('../utils/logger');

class SkillSystem {
  constructor(config = {}) {
    this.skills = new Map();
    this.cache = new JSONbinService({
      apiKey: config.jsonbinApiKey || process.env.JSONBIN_API_KEY
    });
    this.storage = config.storage; // Supabase instance
    this.enablePersistence = config.enablePersistence !== false;

    // Skill execution metrics
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0
    };

    logger.info('🧠 Skill System initialized', {
      enablePersistence: this.enablePersistence,
      cacheEnabled: !!this.cache.apiKey
    });
  }

  /**
   * Register a skill with validation
   */
  registerSkill(skill) {
    // Comprehensive validation
    if (!skill || typeof skill !== 'object') {
      throw new Error('Skill must be an object');
    }

    if (!skill.name || typeof skill.name !== 'string') {
      throw new Error('Skill must have a name property');
    }

    if (!skill.execute || typeof skill.execute !== 'function') {
      throw new Error(`Skill ${skill.name} must have an execute method`);
    }

    if (skill.execute.length < 1) {
      throw new Error(`Skill ${skill.name}.execute must accept context parameter`);
    }

    // Check for duplicates
    if (this.skills.has(skill.name)) {
      logger.warn(`⚠️ Overwriting existing skill: ${skill.name}`);
    }

    // Register skill with metadata
    this.skills.set(skill.name, {
      instance: skill,
      name: skill.name,
      description: skill.description || '',
      category: skill.category || 'general',
      version: skill.version || '1.0.0',
      enabled: skill.enabled !== false,
      registeredAt: new Date().toISOString(),
      executionCount: 0,
      successCount: 0,
      averageExecutionTime: 0
    });

    logger.info(`✅ Skill registered: ${skill.name}`, {
      category: skill.category,
      version: skill.version
    });

    return this; // For method chaining
  }

  /**
   * Execute a skill with caching and metrics
   */
  async executeSkill(skillName, context = {}) {
    const startTime = Date.now();
    this.metrics.totalExecutions++;

    try {
      const skillConfig = this.skills.get(skillName);

      if (!skillConfig) {
        throw new Error(`Skill not found: ${skillName}`);
      }

      if (!skillConfig.enabled) {
        throw new Error(`Skill disabled: ${skillName}`);
      }

      // Check cache for this skill execution
      const cacheKey = this.generateCacheKey(skillName, context);
      const cachedResult = await this.getCachedResult(cacheKey);

      if (cachedResult) {
        logger.debug(`📋 Cache hit for skill: ${skillName}`);
        this.updateSkillMetrics(skillName, Date.now() - startTime, true);
        return cachedResult;
      }

      // Execute skill
      logger.debug(`⚡ Executing skill: ${skillName}`);
      const result = await skillConfig.instance.execute(context);

      // Cache successful results
      if (result.success !== false) {
        await this.cacheResult(cacheKey, result);
      }

      const executionTime = Date.now() - startTime;
      this.updateSkillMetrics(skillName, executionTime, true);

      this.metrics.successfulExecutions++;

      logger.debug(`✅ Skill executed: ${skillName}`, {
        executionTime,
        success: true
      });

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;

      logger.error(`❌ Skill execution failed: ${skillName}`, {
        error: error.message,
        executionTime
      });

      this.updateSkillMetrics(skillName, executionTime, false);
      this.metrics.failedExecutions++;

      // Return error in standardized format
      return {
        success: false,
        error: error.message,
        skill: skillName,
        executionTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute multiple skills in parallel
   */
  async executeSkills(skillNames, context = {}) {
    const promises = skillNames.map(skillName =>
      this.executeSkill(skillName, context)
        .catch(error => ({
          success: false,
          error: error.message,
          skill: skillName
        }))
    );

    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || 'Unknown error',
          skill: skillNames[index]
        };
      }
    });
  }

  /**
   * Execute skills in sequence (for dependent skills)
   */
  async executeSkillChain(skillChain, context = {}) {
    const results = [];

    for (const skillName of skillChain) {
      const result = await this.executeSkill(skillName, {
        ...context,
        previousResults: results
      });

      results.push(result);

      // Stop chain if skill fails and is critical
      const skillConfig = this.skills.get(skillName);
      if (!result.success && skillConfig?.instance?.critical) {
        break;
      }
    }

    return results;
  }

  /**
   * Generate cache key for skill execution
   */
  generateCacheKey(skillName, context) {
    // Create a deterministic key based on skill name and relevant context
    const relevantContext = this.extractRelevantContext(skillName, context);
    const contextStr = JSON.stringify(relevantContext);
    const hash = Buffer.from(contextStr).toString('base64').slice(0, 16);

    return `skill_${skillName}_${hash}`;
  }

  /**
   * Extract relevant context for caching
   */
  extractRelevantContext(skillName, context) {
    const skillConfig = this.skills.get(skillName);
    const relevantKeys = skillConfig?.instance?.cacheRelevantKeys || ['message', 'userId'];

    const relevant = {};
    for (const key of relevantKeys) {
      if (context[key] !== undefined) {
        relevant[key] = context[key];
      }
    }

    return relevant;
  }

  /**
   * Get cached result if available and valid
   */
  async getCachedResult(cacheKey) {
    try {
      // Try local cache first
      if (this.cache.localCache?.has(cacheKey)) {
        return this.cache.localCache.get(cacheKey);
      }

      // Try JSONbin cache
      if (this.cache.apiKey) {
        const result = await this.cache.readBin(cacheKey);
        if (result.success) {
          return result.data;
        }
      }

      return null;
    } catch (error) {
      logger.warn(`⚠️ Cache read failed for key: ${cacheKey}`, { error: error.message });
      return null;
    }
  }

  /**
   * Cache result for future use
   */
  async cacheResult(cacheKey, result) {
    try {
      // Cache locally
      if (this.cache.localCache) {
        this.cache.localCache.set(cacheKey, result);
        this.cache.cacheTimestamps.set(cacheKey, Date.now());
      }

      // Cache in JSONbin for persistence
      if (this.cache.apiKey) {
        await this.cache.updateBin(cacheKey, result);
      }
    } catch (error) {
      logger.warn(`⚠️ Cache write failed for key: ${cacheKey}`, { error: error.message });
    }
  }

  /**
   * Update skill execution metrics
   */
  updateSkillMetrics(skillName, executionTime, success) {
    const skillConfig = this.skills.get(skillName);
    if (!skillConfig) return;

    skillConfig.executionCount++;
    skillConfig.totalExecutionTime += executionTime;

    if (success) {
      skillConfig.successCount++;
    }

    skillConfig.averageExecutionTime =
      skillConfig.totalExecutionTime / skillConfig.executionCount;

    skillConfig.successRate =
      (skillConfig.successCount / skillConfig.executionCount) * 100;

    this.skills.set(skillName, skillConfig);

    // Update global metrics
    const totalExecutions = this.metrics.successfulExecutions + this.metrics.failedExecutions;
    this.metrics.averageExecutionTime =
      (this.metrics.averageExecutionTime * (totalExecutions - 1) + executionTime) / totalExecutions;
  }

  /**
   * Get skill information
   */
  getSkillInfo(skillName) {
    return this.skills.get(skillName) || null;
  }

  /**
   * List all registered skills
   */
  listSkills() {
    return Array.from(this.skills.entries()).map(([name, config]) => ({
      name,
      description: config.description,
      category: config.category,
      version: config.version,
      enabled: config.enabled,
      executionCount: config.executionCount,
      successRate: config.executionCount > 0 ?
        `${(config.successCount / config.executionCount * 100).toFixed(2)}%` : 'N/A',
      averageExecutionTime: `${config.averageExecutionTime.toFixed(2)}ms`
    }));
  }

  /**
   * Enable/disable skill
   */
  setSkillEnabled(skillName, enabled) {
    const skillConfig = this.skills.get(skillName);
    if (skillConfig) {
      skillConfig.enabled = enabled;
      this.skills.set(skillName, skillConfig);
      logger.info(`🔄 Skill ${skillName} ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    }
    return false;
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category) {
    return this.listSkills().filter(skill => skill.category === category);
  }

  /**
   * Get system metrics
   */
  getMetrics() {
    const totalExecutions = this.metrics.totalExecutions;
    const successRate = totalExecutions > 0 ?
      (this.metrics.successfulExecutions / totalExecutions) * 100 : 0;

    return {
      ...this.metrics,
      successRate: `${successRate.toFixed(2)}%`,
      registeredSkills: this.skills.size,
      skillDetails: this.listSkills(),
      cacheStats: this.cache.getCacheStats()
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    const checks = {
      skillsLoaded: this.skills.size > 0,
      cacheAvailable: !!this.cache.apiKey,
      storageAvailable: !!this.storage
    };

    // Test skill execution
    try {
      if (this.skills.size > 0) {
        const firstSkill = this.skills.keys().next().value;
        const testResult = await this.executeSkill(firstSkill, { test: true });
        checks.skillExecution = testResult.success !== false;
      } else {
        checks.skillExecution = false;
      }
    } catch (error) {
      checks.skillExecution = false;
    }

    // Test cache
    try {
      if (this.cache.apiKey) {
        const cacheHealth = await this.cache.healthCheck();
        checks.cacheHealth = cacheHealth.status === 'healthy';
      } else {
        checks.cacheHealth = false;
      }
    } catch (error) {
      checks.cacheHealth = false;
    }

    const overallHealth = Object.values(checks).every(check => check);

    return {
      status: overallHealth ? 'healthy' : 'degraded',
      checks,
      metrics: this.getMetrics(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear all caches
   */
  async clearCaches() {
    try {
      this.cache.clearLocalCache();

      if (this.cache.apiKey) {
        // Note: JSONbin doesn't have a bulk delete, so we just clear local cache
        logger.info('🧹 Cleared local cache');
      }

      return { success: true };
    } catch (error) {
      logger.error('❌ Failed to clear caches:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SkillSystem;