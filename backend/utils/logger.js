/**
 * Enterprise-grade Logger for Maya Travel Agent
 * Provides structured logging with multiple levels and outputs
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    
    this.currentLevel = process.env.LOG_LEVEL 
      ? this.logLevels[process.env.LOG_LEVEL.toUpperCase()] 
      : this.logLevels.INFO;
    
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
    
    this.colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[90m', // Gray
      RESET: '\x1b[0m'
    };
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return {
      timestamp,
      level,
      message,
      meta,
      formatted: `[${timestamp}] [${level}] ${message} ${metaStr}`
    };
  }

  writeToFile(level, formattedLog) {
    const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);
    const allLogsFile = path.join(this.logDir, 'all.log');
    
    try {
      fs.appendFileSync(logFile, formattedLog.formatted + '\n');
      fs.appendFileSync(allLogsFile, formattedLog.formatted + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(level, message, meta = {}) {
    if (this.logLevels[level] > this.currentLevel) {
      return;
    }

    const formattedLog = this.formatMessage(level, message, meta);
    
    // Console output with colors
    const color = this.colors[level] || this.colors.RESET;
    console.log(`${color}${formattedLog.formatted}${this.colors.RESET}`);
    
    // File output
    this.writeToFile(level, formattedLog);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = {
      ...meta,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null
    };
    this.log('ERROR', message, errorMeta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  // Specialized logging methods
  apiCall(method, url, status, duration, meta = {}) {
    this.info(`API ${method} ${url}`, {
      ...meta,
      status,
      duration_ms: duration
    });
  }

  userAction(userId, action, meta = {}) {
    this.info(`User action: ${action}`, {
      ...meta,
      user_id: userId,
      action
    });
  }

  botMessage(userId, direction, message, meta = {}) {
    this.debug(`Bot ${direction}: ${message.substring(0, 100)}`, {
      ...meta,
      user_id: userId,
      direction,
      message_length: message.length
    });
  }

  performance(operation, duration, meta = {}) {
    const level = duration > 1000 ? 'WARN' : 'INFO';
    this.log(level, `Performance: ${operation}`, {
      ...meta,
      duration_ms: duration,
      slow: duration > 1000
    });
  }

  // Rotate logs (keep last 7 days)
  rotateLogs() {
    const files = fs.readdirSync(this.logDir);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    files.forEach(file => {
      const filePath = path.join(this.logDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs < sevenDaysAgo) {
        fs.unlinkSync(filePath);
        this.info(`Rotated old log file: ${file}`);
      }
    });
  }
}

// Singleton instance
const logger = new Logger();

// Rotate logs daily
setInterval(() => {
  logger.rotateLogs();
}, 24 * 60 * 60 * 1000);

module.exports = logger;
