#!/usr/bin/env node

/**
 * Configuration Export Script
 * Exports all system configurations including Collibra, Dataiku, and environment settings
 */

const fs = require('fs');
const path = require('path');
const logger = require('../../backend/src/utils/logger');

class ConfigurationExporter {
  constructor() {
    this.exportDir = path.join(__dirname, '..');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Export Collibra data governance configuration
   */
  async exportCollibraConfig() {
    try {
      logger.info('Exporting Collibra configuration...');

      const collibraConfig = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          description: 'Amrikyy Travel Agent Collibra Data Governance Configuration'
        },
        domains: [
          {
            name: 'Amrikyy Travel Agent',
            description: 'Data governance domain for Amrikyy Travel Agent platform',
            subDomains: [
              {
                name: 'Users',
                description: 'User profiles, authentication, and engagement data'
              },
              {
                name: 'Trips',
                description: 'Trip planning, bookings, and travel history data'
              },
              {
                name: 'Payments',
                description: 'Payment processing, transactions, and financial data'
              },
              {
                name: 'Analytics',
                description: 'Business intelligence, reporting, and analytics data'
              }
            ]
          },
          {
            name: 'Configuration Management',
            description: 'Centralized configuration governance and version control'
          }
        ],
        dataAssets: {
          users: [
            {
              name: 'User Profiles',
              type: 'Table',
              classification: 'Internal',
              source: 'Supabase',
              owner: 'Customer Success Team'
            },
            {
              name: 'User Sessions',
              type: 'Table',
              classification: 'Internal',
              source: 'Application Logs',
              owner: 'Engineering Team'
            }
          ],
          trips: [
            {
              name: 'Trip Bookings',
              type: 'Table',
              classification: 'Confidential',
              source: 'External APIs',
              owner: 'Operations Team'
            },
            {
              name: 'Trip History',
              type: 'Table',
              classification: 'Internal',
              source: 'Supabase',
              owner: 'Data Science Team'
            }
          ],
          payments: [
            {
              name: 'Payment Transactions',
              type: 'Table',
              classification: 'Restricted',
              source: 'Stripe API',
              owner: 'Finance Team'
            },
            {
              name: 'Payment Methods',
              type: 'Table',
              classification: 'Restricted',
              source: 'Stripe API',
              owner: 'Finance Team'
            }
          ],
          analytics: [
            {
              name: 'Business KPIs',
              type: 'Report',
              classification: 'Internal',
              source: 'dbt Models',
              owner: 'Analytics Team'
            },
            {
              name: 'ML Models',
              type: 'Model',
              classification: 'Internal',
              source: 'Dataiku',
              owner: 'Data Science Team'
            }
          ]
        },
        dataLineage: [
          {
            source: 'External APIs',
            target: 'Trip Bookings',
            transformation: 'Fivetran Ingestion'
          },
          {
            source: 'Trip Bookings',
            target: 'Supabase Raw Tables',
            transformation: 'Fivetran → Supabase'
          },
          {
            source: 'Supabase Raw Tables',
            target: 'dbt Staging Models',
            transformation: 'dbt Transformation'
          },
          {
            source: 'dbt Staging Models',
            target: 'dbt Marts',
            transformation: 'dbt Modeling'
          },
          {
            source: 'dbt Marts',
            target: 'Business KPIs',
            transformation: 'dbt Reporting'
          },
          {
            source: 'dbt Marts',
            target: 'Dataiku Projects',
            transformation: 'Dataiku ML Pipeline'
          },
          {
            source: 'Dataiku Projects',
            target: 'ML Models',
            transformation: 'Model Training'
          }
        ],
        dataQualityRules: [
          {
            asset: 'User Profiles',
            rules: [
              {
                name: 'Email Format Validation',
                rule: 'REGEXP_LIKE(email, \'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$\')',
                severity: 'High'
              },
              {
                name: 'Required Fields Check',
                rule: 'user_id IS NOT NULL AND email IS NOT NULL',
                severity: 'Critical'
              }
            ]
          },
          {
            asset: 'Payment Transactions',
            rules: [
              {
                name: 'Amount Validation',
                rule: 'amount > 0',
                severity: 'Critical'
              },
              {
                name: 'Currency Code Check',
                rule: "currency IN ('USD', 'EUR', 'GBP')",
                severity: 'High'
              }
            ]
          }
        ],
        aiGovernance: {
          modelRiskAssessment: {
            name: 'Price Prediction Model Risk Assessment',
            riskLevel: 'Medium',
            complianceStatus: 'Compliant',
            assessmentFrequency: 'Quarterly'
          },
          biasMonitoring: {
            name: 'Model Bias Monitoring',
            detectionEnabled: true,
            fairnessMetrics: ['PSI', 'Demographic Parity'],
            monitoringFrequency: 'Daily',
            alertThreshold: 0.05
          },
          modelInventory: {
            name: 'ML Model Inventory',
            totalModels: 3,
            activeModels: 3,
            deprecatedModels: 0
          }
        },
        configurationManagement: {
          environments: ['development', 'staging', 'production'],
          status: 'Active',
          versionControl: 'Enabled'
        }
      };

      const filePath = path.join(this.exportDir, 'configurations', `collibra-config-${this.timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(collibraConfig, null, 2));

      logger.info('Collibra configuration exported successfully', { filePath });
      return filePath;

    } catch (error) {
      logger.error('Failed to export Collibra configuration', { error: error.message });
      throw error;
    }
  }

  /**
   * Export environment-specific configurations
   */
  async exportEnvironmentConfigs() {
    try {
      logger.info('Exporting environment configurations...');

      const environments = {
        development: {
          name: 'Development Environment',
          description: 'Development and testing environment configuration',
          variables: {
            NODE_ENV: 'development',
            PORT: 5000,
            DATABASE_URL: 'postgresql://localhost:5432/amrikyy_dev',
            LOG_LEVEL: 'debug',
            CACHE_TTL: 300,
            RATE_LIMIT_WINDOW_MS: 900000,
            RATE_LIMIT_MAX_REQUESTS: 1000
          },
          features: {
            debugMode: true,
            hotReload: true,
            detailedLogging: true,
            mockExternalServices: true
          },
          deployment: {
            autoDeploy: false,
            backupEnabled: false,
            monitoringLevel: 'basic'
          }
        },
        staging: {
          name: 'Staging Environment',
          description: 'Pre-production testing environment configuration',
          variables: {
            NODE_ENV: 'staging',
            PORT: 5000,
            DATABASE_URL: 'postgresql://staging-db:5432/amrikyy_staging',
            LOG_LEVEL: 'info',
            CACHE_TTL: 600,
            RATE_LIMIT_WINDOW_MS: 900000,
            RATE_LIMIT_MAX_REQUESTS: 500
          },
          features: {
            debugMode: false,
            hotReload: false,
            detailedLogging: false,
            mockExternalServices: false
          },
          deployment: {
            autoDeploy: true,
            backupEnabled: true,
            monitoringLevel: 'standard'
          }
        },
        production: {
          name: 'Production Environment',
          description: 'Live production environment configuration',
          variables: {
            NODE_ENV: 'production',
            PORT: 5000,
            DATABASE_URL: 'postgresql://prod-db:5432/amrikyy_prod',
            LOG_LEVEL: 'warn',
            CACHE_TTL: 1800,
            RATE_LIMIT_WINDOW_MS: 900000,
            RATE_LIMIT_MAX_REQUESTS: 100
          },
          features: {
            debugMode: false,
            hotReload: false,
            detailedLogging: false,
            mockExternalServices: false
          },
          deployment: {
            autoDeploy: true,
            backupEnabled: true,
            monitoringLevel: 'comprehensive'
          }
        }
      };

      const filePath = path.join(this.exportDir, 'environments', `environment-configs-${this.timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(environments, null, 2));

      logger.info('Environment configurations exported successfully', { filePath });
      return filePath;

    } catch (error) {
      logger.error('Failed to export environment configurations', { error: error.message });
      throw error;
    }
  }

  /**
   * Export system-wide configuration templates
   */
  async exportConfigurationTemplates() {
    try {
      logger.info('Exporting configuration templates...');

      const templates = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          description: 'Configuration templates for different deployment scenarios'
        },
        templates: {
          microservice: {
            name: 'Microservice Configuration Template',
            description: 'Template for microservice deployment',
            config: {
              server: {
                port: '${PORT}',
                host: '${HOST}',
                environment: '${NODE_ENV}'
              },
              database: {
                url: '${DATABASE_URL}',
                pool: {
                  min: 2,
                  max: 10,
                  acquireTimeout: 30000
                }
              },
              cache: {
                redis: {
                  host: '${REDIS_HOST}',
                  port: '${REDIS_PORT}',
                  ttl: '${CACHE_TTL}'
                }
              },
              monitoring: {
                metrics: {
                  enabled: true,
                  endpoint: '/metrics'
                },
                healthCheck: {
                  enabled: true,
                  endpoint: '/health'
                }
              }
            }
          },
          dataPipeline: {
            name: 'Data Pipeline Configuration Template',
            description: 'Template for ETL/data pipeline deployment',
            config: {
              source: {
                type: '${SOURCE_TYPE}',
                connection: '${SOURCE_CONNECTION}',
                credentials: '${SOURCE_CREDENTIALS}'
              },
              destination: {
                type: '${DESTINATION_TYPE}',
                connection: '${DESTINATION_CONNECTION}',
                credentials: '${DESTINATION_CREDENTIALS}'
              },
              transformation: {
                engine: '${TRANSFORMATION_ENGINE}',
                parallelism: '${PARALLELISM}',
                errorHandling: '${ERROR_HANDLING}'
              },
              schedule: {
                cron: '${SCHEDULE_CRON}',
                timezone: '${SCHEDULE_TIMEZONE}',
                retryPolicy: '${RETRY_POLICY}'
              }
            }
          },
          mlModel: {
            name: 'ML Model Configuration Template',
            description: 'Template for machine learning model deployment',
            config: {
              model: {
                name: '${MODEL_NAME}',
                version: '${MODEL_VERSION}',
                type: '${MODEL_TYPE}',
                framework: '${MODEL_FRAMEWORK}'
              },
              training: {
                dataSource: '${TRAINING_DATA_SOURCE}',
                validationSplit: '${VALIDATION_SPLIT}',
                hyperparameters: '${HYPERPARAMETERS}'
              },
              deployment: {
                endpoint: '${MODEL_ENDPOINT}',
                scaling: {
                  minInstances: '${MIN_INSTANCES}',
                  maxInstances: '${MAX_INSTANCES}',
                  targetCpuUtilization: '${TARGET_CPU_UTILIZATION}'
                },
                monitoring: {
                  latencyThreshold: '${LATENCY_THRESHOLD}',
                  errorRateThreshold: '${ERROR_RATE_THRESHOLD}',
                  driftDetection: '${DRIFT_DETECTION}'
                }
              }
            }
          }
        }
      };

      const filePath = path.join(this.exportDir, 'configurations', `config-templates-${this.timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(templates, null, 2));

      logger.info('Configuration templates exported successfully', { filePath });
      return filePath;

    } catch (error) {
      logger.error('Failed to export configuration templates', { error: error.message });
      throw error;
    }
  }

  /**
   * Export all configurations
   */
  async exportAllConfigurations() {
    try {
      logger.info('Starting complete configuration export...');

      const results = await Promise.all([
        this.exportCollibraConfig(),
        this.exportEnvironmentConfigs(),
        this.exportConfigurationTemplates()
      ]);

      logger.info('Configuration export completed successfully', {
        count: results.length,
        files: results
      });

      return results;

    } catch (error) {
      logger.error('Configuration export failed', { error: error.message });
      throw error;
    }
  }
}

// Execute export if run directly
if (require.main === module) {
  const exporter = new ConfigurationExporter();
  exporter.exportAllConfigurations()
    .then(() => {
      logger.info('Configuration export process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Configuration export process failed', { error: error.message });
      process.exit(1);
    });
}

module.exports = ConfigurationExporter;