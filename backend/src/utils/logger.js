/**
 * Simple Logger Utility for Amriyy Travel Agent
 * Provides consistent logging across all components
 */

class Logger {
  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    this.currentLevel = process.env.LOG_LEVEL || 'info';
  }

  /**
   * Log error message
   */
  error(message, data = {}) {
    if (this.levels[this.currentLevel] >= this.levels.error) {
      console.error(`❌ ${new Date().toISOString()} - ${message}`, data);
    }
  }

  /**
   * Log warning message
   */
  warn(message, data = {}) {
    if (this.levels[this.currentLevel] >= this.levels.warn) {
      console.warn(`⚠️ ${new Date().toISOString()} - ${message}`, data);
    }
  }

  /**
   * Log info message
   */
  info(message, data = {}) {
    if (this.levels[this.currentLevel] >= this.levels.info) {
      console.log(`ℹ️ ${new Date().toISOString()} - ${message}`, data);
    }
  }

  /**
   * Log debug message
   */
  debug(message, data = {}) {
    if (this.levels[this.currentLevel] >= this.levels.debug) {
      console.log(`🔍 ${new Date().toISOString()} - ${message}`, data);
    }
  }

  /**
   * Set log level
   */
  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.currentLevel = level;
      this.info(`Log level set to: ${level}`);
    } else {
      this.warn(`Invalid log level: ${level}`);
    }
  }
}

// Export singleton instance
module.exports = new Logger();