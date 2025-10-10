/**
 * Database Test Configuration
 * Environment-specific configuration for database testing
 */

const path = require('path');

// Test environment configuration
const TEST_CONFIG = {
  // Database connection settings
  database: {
    url: process.env.TEST_SUPABASE_URL || 'http://localhost:54321',
    serviceRoleKey: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key',
    anonKey: process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key',
    poolSize: 10,
    connectionTimeout: 10000,
    queryTimeout: 5000
  },

  // Test data settings
  testData: {
    defaultUserCount: 5,
    defaultTripCount: 10,
    defaultExpenseCount: 20,
    maxConcurrentOperations: 50,
    cleanupTimeout: 30000
  },

  // Performance thresholds
  performance: {
    maxQueryTime: 1000, // 1 second
    maxBulkOperationTime: 5000, // 5 seconds
    maxConnectionTime: 3000, // 3 seconds
    maxCleanupTime: 10000 // 10 seconds
  },

  // Test isolation settings
  isolation: {
    useTransactions: true,
    rollbackAfterEach: true,
    separateSchemas: false,
    uniquePrefixes: true
  },

  // Logging configuration
  logging: {
    level: process.env.TEST_LOG_LEVEL || 'warn',
    enableConsole: true,
    enableFile: false,
    logDirectory: path.join(__dirname, 'logs'),
    maxFileSize: '10MB',
    maxFiles: 5
  },

  // Mock data settings
  mocks: {
    enableFallbackMocks: true,
    mockResponseDelay: 0,
    mockErrorRate: 0.05, // 5% error rate for testing error handling
    seedDataPath: path.join(__dirname, 'seed-data')
  }
};

// Environment-specific overrides
const getEnvironmentConfig = () => {
  const nodeEnv = process.env.NODE_ENV || 'test';

  switch (nodeEnv) {
    case 'development':
      return {
        ...TEST_CONFIG,
        database: {
          ...TEST_CONFIG.database,
          url: process.env.SUPABASE_URL || TEST_CONFIG.database.url,
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || TEST_CONFIG.database.serviceRoleKey
        },
        logging: {
          ...TEST_CONFIG.logging,
          level: 'debug',
          enableFile: true
        }
      };

    case 'ci':
      return {
        ...TEST_CONFIG,
        performance: {
          ...TEST_CONFIG.performance,
          maxQueryTime: 2000, // More lenient for CI
          maxConnectionTime: 5000
        },
        testData: {
          ...TEST_CONFIG.testData,
          defaultUserCount: 2, // Fewer users for faster CI
          defaultTripCount: 5,
          defaultExpenseCount: 10
        }
      };

    case 'production':
      return {
        ...TEST_CONFIG,
        database: {
          ...TEST_CONFIG.database,
          url: process.env.SUPABASE_URL,
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        logging: {
          ...TEST_CONFIG.logging,
          level: 'error',
          enableFile: true
        }
      };

    default:
      return TEST_CONFIG;
  }
};

// Validate configuration
const validateConfig = (config) => {
  const errors = [];

  if (!config.database.url) {
    errors.push('Database URL is required');
  }

  if (!config.database.serviceRoleKey) {
    errors.push('Database service role key is required');
  }

  if (config.performance.maxQueryTime <= 0) {
    errors.push('Max query time must be positive');
  }

  if (config.testData.maxConcurrentOperations <= 0) {
    errors.push('Max concurrent operations must be positive');
  }

  return errors;
};

// Get and validate configuration
const config = getEnvironmentConfig();
const validationErrors = validateConfig(config);

if (validationErrors.length > 0) {
  console.error('❌ Database test configuration errors:');
  validationErrors.forEach(error => console.error(`  - ${error}`));
  throw new Error('Invalid database test configuration');
}

module.exports = {
  config,
  TEST_CONFIG,
  getEnvironmentConfig,
  validateConfig
};