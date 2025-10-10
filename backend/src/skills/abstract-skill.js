/**
 * Abstract Skill Base Class
 * Provides common functionality for all skills in the system
 */

class AbstractSkill {
  constructor(config = {}) {
    this.name = config.name || this.constructor.name;
    this.description = config.description || '';
    this.category = config.category || 'general';
    this.version = config.version || '1.0.0';
    this.enabled = config.enabled !== false;
    this.timeout = config.timeout || 10000;
    this.critical = config.critical || false; // If true, failure stops skill chain
    this.cacheRelevantKeys = config.cacheRelevantKeys || [];
    this.dependencies = config.dependencies || [];

    // Execution metadata
    this.createdAt = new Date().toISOString();
    this.lastExecuted = null;
    this.executionHistory = [];
  }

  /**
   * Get skill description - can be overridden by subclasses
   */
  getDescription() {
    return this.description || `${this.name} skill`;
  }

  /**
   * Execute skill - must be implemented by subclasses
   */
  async execute(context) {
    throw new Error(`${this.name}: execute() method must be implemented by subclass`);
  }

  /**
   * Validate inputs before execution - can be overridden
   */
  validateInputs(context) {
    return {
      valid: true,
      errors: []
    };
  }

  /**
   * Handle errors gracefully - can be overridden
   */
  handleError(error, context) {
    return {
      success: false,
      error: error.message,
      skill: this.name,
      timestamp: new Date().toISOString(),
      context: context ? this.sanitizeContext(context) : null
    };
  }

  /**
   * Pre-execution hook - can be overridden
   */
  async preExecute(context) {
    // Validate inputs
    const validation = this.validateInputs(context);
    if (!validation.valid) {
      throw new Error(`Input validation failed: ${validation.errors.join(', ')}`);
    }

    return context;
  }

  /**
   * Post-execution hook - can be overridden
   */
  async postExecute(result, context) {
    // Record execution in history
    this.executionHistory.push({
      timestamp: new Date().toISOString(),
      success: result.success !== false,
      executionTime: result.executionTime || 0
    });

    // Keep only last 100 executions
    if (this.executionHistory.length > 100) {
      this.executionHistory = this.executionHistory.slice(-100);
    }

    this.lastExecuted = new Date().toISOString();

    return result;
  }

  /**
   * Get skill metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: this.getDescription(),
      category: this.category,
      version: this.version,
      enabled: this.enabled,
      critical: this.critical,
      timeout: this.timeout,
      dependencies: this.dependencies,
      cacheRelevantKeys: this.cacheRelevantKeys,
      createdAt: this.createdAt,
      lastExecuted: this.lastExecuted,
      executionCount: this.executionHistory.length,
      successRate: this.calculateSuccessRate()
    };
  }

  /**
   * Calculate success rate from execution history
   */
  calculateSuccessRate() {
    if (this.executionHistory.length === 0) return 0;

    const successful = this.executionHistory.filter(exec => exec.success).length;
    return (successful / this.executionHistory.length) * 100;
  }

  /**
   * Enable or disable skill
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    return this;
  }

  /**
   * Check if skill is ready for execution
   */
  isReady() {
    return this.enabled && this.execute && typeof this.execute === 'function';
  }

  /**
   * Get execution statistics
   */
  getExecutionStats() {
    const total = this.executionHistory.length;
    const successful = this.executionHistory.filter(exec => exec.success).length;
    const failed = total - successful;

    const totalTime = this.executionHistory.reduce((sum, exec) => sum + exec.executionTime, 0);
    const averageTime = total > 0 ? totalTime / total : 0;

    return {
      totalExecutions: total,
      successfulExecutions: successful,
      failedExecutions: failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageExecutionTime: averageTime,
      totalExecutionTime: totalTime
    };
  }

  /**
   * Sanitize context for logging (remove sensitive data)
   */
  sanitizeContext(context) {
    if (!context) return null;

    const sanitized = { ...context };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard'];
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Create a child context with additional data
   */
  createChildContext(parentContext, additionalData) {
    return {
      ...parentContext,
      ...additionalData,
      startTime: parentContext.startTime || Date.now(),
      skillContext: {
        skillName: this.name,
        skillVersion: this.version,
        executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    };
  }

  /**
   * Check if skill depends on other skills
   */
  hasDependencies() {
    return this.dependencies && this.dependencies.length > 0;
  }

  /**
   * Get dependency tree for this skill
   */
  getDependencyTree() {
    return {
      skill: this.name,
      dependencies: this.dependencies,
      hasDependencies: this.hasDependencies()
    };
  }

  /**
   * Validate dependencies are available
   */
  validateDependencies(availableSkills) {
    if (!this.hasDependencies()) {
      return { valid: true, missing: [] };
    }

    const missing = this.dependencies.filter(dep => !availableSkills.includes(dep));

    return {
      valid: missing.length === 0,
      missing,
      errors: missing.map(skill => `Missing dependency: ${skill}`)
    };
  }

  /**
   * Reset skill state
   */
  reset() {
    this.executionHistory = [];
    this.lastExecuted = null;
    return this;
  }

  /**
   * Export skill configuration for persistence
   */
  exportConfig() {
    return {
      name: this.name,
      description: this.description,
      category: this.category,
      version: this.version,
      enabled: this.enabled,
      timeout: this.timeout,
      critical: this.critical,
      cacheRelevantKeys: this.cacheRelevantKeys,
      dependencies: this.dependencies,
      createdAt: this.createdAt
    };
  }

  /**
   * Import skill configuration
   */
  importConfig(config) {
    Object.assign(this, config);
    return this;
  }
}

module.exports = AbstractSkill;