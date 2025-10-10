/**
 * Collibra Data Governance Service
 * Comprehensive data governance platform for Maya Travel Agent
 */

const axios = require('axios');
const logger = require('../utils/logger');

class CollibraService {
  constructor(config = {}) {
    this.collibraUrl = config.collibraUrl || process.env.COLLIBRA_URL || 'https://maya.collibra.com';
    this.apiKey = config.apiKey || process.env.COLLIBRA_API_KEY;
    this.username = config.username || process.env.COLLIBRA_USERNAME;
    this.password = config.password || process.env.COLLIBRA_PASSWORD;

    // Initialize axios client
    this.client = axios.create({
      baseURL: `${this.collibraUrl}/rest/2.0`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    // Set authentication
    if (this.apiKey) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
    } else if (this.username && this.password) {
      this.client.defaults.auth = {
        username: this.username,
        password: this.password
      };
    }

    // Cache for performance
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 300000; // 5 minutes

    logger.info('Collibra Data Governance Service initialized', {
      url: this.collibraUrl,
      authMethod: this.apiKey ? 'API Key' : 'Basic Auth'
    });
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
        url: this.collibraUrl,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        url: this.collibraUrl,
      };
    }
  }

  /**
   * Create data domain for Maya Travel Agent
   */
  async createDataDomain(name, description, parentDomainId = null) {
    try {
      const domainData = {
        name,
        description,
        type: { id: '00000000-0000-0000-0000-000000000000' }, // Default domain type
        parent: parentDomainId ? { id: parentDomainId } : null,
      };

      const response = await this.client.post('/domains', domainData);

      logger.info('Data domain created', {
        name,
        domainId: response.data.id,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create data domain', {
        name,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create data asset for key datasets
   */
  async createDataAsset(name, description, domainId, assetType, attributes = {}) {
    try {
      const assetData = {
        name,
        description,
        domain: { id: domainId },
        type: { id: assetType },
        attributes: Object.entries(attributes).map(([key, value]) => ({
          type: { id: this.getAttributeTypeId(key) },
          value: String(value),
        })),
      };

      const response = await this.client.post('/assets', assetData);

      logger.info('Data asset created', {
        name,
        assetId: response.data.id,
        domainId,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create data asset', {
        name,
        domainId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Set up Maya Travel Agent data domains
   */
  async setupMayaDataDomains() {
    try {
      logger.info('Setting up Maya Travel Agent data domains...');

      // Create root domain for Maya Travel Agent
      const mayaDomain = await this.createDataDomain(
        'Maya Travel Agent',
        'Data governance domain for Maya Travel Agent platform'
      );

      // Create sub-domains
      const domains = [
        {
          name: 'Users',
          description: 'User profiles, authentication, and engagement data',
          parentId: mayaDomain.id,
        },
        {
          name: 'Trips',
          description: 'Trip planning, bookings, and travel history data',
          parentId: mayaDomain.id,
        },
        {
          name: 'Payments',
          description: 'Payment processing, transactions, and financial data',
          parentId: mayaDomain.id,
        },
        {
          name: 'Analytics',
          description: 'Business intelligence, reporting, and analytics data',
          parentId: mayaDomain.id,
        },
      ];

      const createdDomains = [];
      for (const domain of domains) {
        const created = await this.createDataDomain(
          domain.name,
          domain.description,
          domain.parentId
        );
        createdDomains.push(created);
      }

      logger.info('Maya Travel Agent data domains created successfully', {
        count: createdDomains.length,
      });

      return { rootDomain: mayaDomain, subDomains: createdDomains };
    } catch (error) {
      logger.error('Failed to setup Maya data domains', { error: error.message });
      throw error;
    }
  }

  /**
   * Set up key data assets for Maya Travel Agent
   */
  async setupMayaDataAssets(domainMap) {
    try {
      logger.info('Setting up Maya Travel Agent data assets...');

      const assets = [
        // User domain assets
        {
          name: 'User Profiles',
          description: 'Customer profile information and preferences',
          domainId: domainMap.users,
          type: 'Table',
          attributes: {
            'Data Source': 'Supabase',
            'Data Classification': 'Internal',
            'Owner': 'Customer Success Team',
            'Update Frequency': 'Real-time',
          },
        },
        {
          name: 'User Sessions',
          description: 'User activity and session tracking data',
          domainId: domainMap.users,
          type: 'Table',
          attributes: {
            'Data Source': 'Application Logs',
            'Data Classification': 'Internal',
            'Owner': 'Engineering Team',
            'Update Frequency': 'Real-time',
          },
        },
        // Trip domain assets
        {
          name: 'Trip Bookings',
          description: 'Flight and hotel booking records',
          domainId: domainMap.trips,
          type: 'Table',
          attributes: {
            'Data Source': 'External APIs',
            'Data Classification': 'Confidential',
            'Owner': 'Operations Team',
            'Update Frequency': 'Real-time',
          },
        },
        {
          name: 'Trip History',
          description: 'Historical trip data and user preferences',
          domainId: domainMap.trips,
          type: 'Table',
          attributes: {
            'Data Source': 'Supabase',
            'Data Classification': 'Internal',
            'Owner': 'Data Science Team',
            'Update Frequency': 'Daily',
          },
        },
        // Payment domain assets
        {
          name: 'Payment Transactions',
          description: 'Payment processing and transaction records',
          domainId: domainMap.payments,
          type: 'Table',
          attributes: {
            'Data Source': 'Stripe API',
            'Data Classification': 'Restricted',
            'Owner': 'Finance Team',
            'Update Frequency': 'Real-time',
          },
        },
        {
          name: 'Payment Methods',
          description: 'Stored payment methods and billing information',
          domainId: domainMap.payments,
          type: 'Table',
          attributes: {
            'Data Source': 'Stripe API',
            'Data Classification': 'Restricted',
            'Owner': 'Finance Team',
            'Update Frequency': 'Real-time',
          },
        },
        // Analytics domain assets
        {
          name: 'Business KPIs',
          description: 'Key performance indicators and business metrics',
          domainId: domainMap.analytics,
          type: 'Report',
          attributes: {
            'Data Source': 'dbt Models',
            'Data Classification': 'Internal',
            'Owner': 'Analytics Team',
            'Update Frequency': 'Daily',
          },
        },
        {
          name: 'ML Models',
          description: 'Machine learning models for price prediction and recommendations',
          domainId: domainMap.analytics,
          type: 'Model',
          attributes: {
            'Data Source': 'Dataiku',
            'Data Classification': 'Internal',
            'Owner': 'Data Science Team',
            'Update Frequency': 'Weekly',
          },
        },
      ];

      const createdAssets = [];
      for (const asset of assets) {
        const created = await this.createDataAsset(
          asset.name,
          asset.description,
          asset.domainId,
          asset.type,
          asset.attributes
        );
        createdAssets.push(created);
      }

      logger.info('Maya Travel Agent data assets created successfully', {
        count: createdAssets.length,
      });

      return createdAssets;
    } catch (error) {
      logger.error('Failed to setup Maya data assets', { error: error.message });
      throw error;
    }
  }

  /**
   * Set up data lineage for Fivetran → Supabase → dbt → Dataiku flow
   */
  async setupDataLineage(assetMap) {
    try {
      logger.info('Setting up data lineage tracking...');

      // Define the data flow lineage
      const lineageMappings = [
        {
          source: 'External APIs',
          target: 'Trip Bookings',
          transformation: 'Fivetran Ingestion',
        },
        {
          source: 'Trip Bookings',
          target: 'Supabase Raw Tables',
          transformation: 'Fivetran → Supabase',
        },
        {
          source: 'Supabase Raw Tables',
          target: 'dbt Staging Models',
          transformation: 'dbt Transformation',
        },
        {
          source: 'dbt Staging Models',
          target: 'dbt Marts',
          transformation: 'dbt Modeling',
        },
        {
          source: 'dbt Marts',
          target: 'Business KPIs',
          transformation: 'dbt Reporting',
        },
        {
          source: 'dbt Marts',
          target: 'Dataiku Projects',
          transformation: 'Dataiku ML Pipeline',
        },
        {
          source: 'Dataiku Projects',
          target: 'ML Models',
          transformation: 'Model Training',
        },
      ];

      const lineageRecords = [];
      for (const mapping of lineageMappings) {
        const sourceAsset = assetMap[mapping.source];
        const targetAsset = assetMap[mapping.target];

        if (sourceAsset && targetAsset) {
          const lineage = await this.createDataLineage(
            sourceAsset.id,
            targetAsset.id,
            mapping.transformation
          );
          lineageRecords.push(lineage);
        }
      }

      logger.info('Data lineage setup completed', {
        count: lineageRecords.length,
      });

      return lineageRecords;
    } catch (error) {
      logger.error('Failed to setup data lineage', { error: error.message });
      throw error;
    }
  }

  /**
   * Create data lineage relationship
   */
  async createDataLineage(sourceAssetId, targetAssetId, transformation) {
    try {
      const lineageData = {
        sourceAsset: { id: sourceAssetId },
        targetAsset: { id: targetAssetId },
        transformation: transformation,
      };

      const response = await this.client.post('/lineage', lineageData);

      logger.debug('Data lineage created', {
        sourceAssetId,
        targetAssetId,
        transformation,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create data lineage', {
        sourceAssetId,
        targetAssetId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Set up data quality rules
   */
  async setupDataQualityRules(assetMap) {
    try {
      logger.info('Setting up data quality rules...');

      const qualityRules = [
        {
          assetId: assetMap['User Profiles'].id,
          rules: [
            {
              name: 'Email Format Validation',
              description: 'Ensure email addresses follow valid format',
              rule: 'REGEXP_LIKE(email, \'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$\')',
              severity: 'High',
            },
            {
              name: 'Required Fields Check',
              description: 'Ensure critical user fields are not null',
              rule: 'user_id IS NOT NULL AND email IS NOT NULL',
              severity: 'Critical',
            },
          ],
        },
        {
          assetId: assetMap['Payment Transactions'].id,
          rules: [
            {
              name: 'Amount Validation',
              description: 'Ensure payment amounts are positive',
              rule: 'amount > 0',
              severity: 'Critical',
            },
            {
              name: 'Currency Code Check',
              description: 'Ensure valid currency codes',
              rule: "currency IN ('USD', 'EUR', 'GBP')",
              severity: 'High',
            },
          ],
        },
      ];

      const createdRules = [];
      for (const ruleGroup of qualityRules) {
        for (const rule of ruleGroup.rules) {
          const created = await this.createDataQualityRule(
            ruleGroup.assetId,
            rule.name,
            rule.description,
            rule.rule,
            rule.severity
          );
          createdRules.push(created);
        }
      }

      logger.info('Data quality rules setup completed', {
        count: createdRules.length,
      });

      return createdRules;
    } catch (error) {
      logger.error('Failed to setup data quality rules', { error: error.message });
      throw error;
    }
  }

  /**
   * Create data quality rule
   */
  async createDataQualityRule(assetId, name, description, rule, severity) {
    try {
      const ruleData = {
        name,
        description,
        asset: { id: assetId },
        type: 'Data Quality Rule',
        attributes: [
          {
            type: { id: '00000000-0000-0000-0000-000000000000' },
            value: rule,
          },
          {
            type: { id: '00000000-0000-0000-0000-000000000000' },
            value: severity,
          },
        ],
      };

      const response = await this.client.post('/assets', ruleData);

      logger.debug('Data quality rule created', {
        name,
        assetId,
        severity,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create data quality rule', {
        name,
        assetId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Set up AI model governance
   */
  async setupAIModelGovernance(assetMap) {
    try {
      logger.info('Setting up AI model governance...');

      const mlModelAsset = assetMap['ML Models'];
      const governanceAssets = [];

      // Create model risk assessment
      const riskAssessment = await this.createDataAsset(
        'Price Prediction Model Risk Assessment',
        'Risk assessment for ML price prediction models',
        mlModelAsset.domain.id,
        'Assessment',
        {
          'Risk Level': 'Medium',
          'Compliance Status': 'Compliant',
          'Last Assessment': new Date().toISOString(),
          'Next Assessment': new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        }
      );
      governanceAssets.push(riskAssessment);

      // Create bias monitoring
      const biasMonitoring = await this.createDataAsset(
        'Model Bias Monitoring',
        'Bias detection and monitoring for ML models',
        mlModelAsset.domain.id,
        'Monitoring',
        {
          'Bias Detection': 'Enabled',
          'Fairness Metrics': 'PSI, Demographic Parity',
          'Monitoring Frequency': 'Daily',
          'Alert Threshold': '0.05',
        }
      );
      governanceAssets.push(biasMonitoring);

      // Create model inventory
      const modelInventory = await this.createDataAsset(
        'ML Model Inventory',
        'Complete inventory of all ML models in production',
        mlModelAsset.domain.id,
        'Inventory',
        {
          'Total Models': '3',
          'Active Models': '3',
          'Deprecated Models': '0',
          'Last Updated': new Date().toISOString(),
        }
      );
      governanceAssets.push(modelInventory);

      logger.info('AI model governance setup completed', {
        count: governanceAssets.length,
      });

      return governanceAssets;
    } catch (error) {
      logger.error('Failed to setup AI model governance', { error: error.message });
      throw error;
    }
  }

  /**
   * Set up configuration management domains
   */
  async setupConfigurationManagement() {
    try {
      logger.info('Setting up configuration management...');

      // Create configuration domain
      const configDomain = await this.createDataDomain(
        'Configuration Management',
        'Centralized configuration governance and version control'
      );

      // Create environment-specific config assets
      const environments = ['development', 'staging', 'production'];
      const configAssets = [];

      for (const env of environments) {
        const configAsset = await this.createDataAsset(
          `Maya ${env} Configuration`,
          `Configuration settings for ${env} environment`,
          configDomain.id,
          'Configuration',
          {
            'Environment': env,
            'Status': 'Active',
            'Last Modified': new Date().toISOString(),
            'Modified By': 'System',
          }
        );
        configAssets.push(configAsset);
      }

      logger.info('Configuration management setup completed', {
        domainId: configDomain.id,
        configCount: configAssets.length,
      });

      return { domain: configDomain, configs: configAssets };
    } catch (error) {
      logger.error('Failed to setup configuration management', { error: error.message });
      throw error;
    }
  }

  /**
   * Get attribute type ID (simplified mapping)
   */
  getAttributeTypeId(attributeName) {
    // In a real implementation, this would map to actual Collibra attribute type IDs
    return '00000000-0000-0000-0000-000000000000';
  }

  /**
   * Initialize complete Maya Travel Agent data governance
   */
  async initializeMayaGovernance() {
    try {
      logger.info('Initializing complete Maya Travel Agent data governance...');

      // Step 1: Health check
      const health = await this.healthCheck();
      if (!health.healthy) {
        throw new Error(`Collibra connection failed: ${health.error}`);
      }

      // Step 2: Setup data domains
      const domains = await this.setupMayaDataDomains();
      const domainMap = {
        users: domains.subDomains.find(d => d.name === 'Users').id,
        trips: domains.subDomains.find(d => d.name === 'Trips').id,
        payments: domains.subDomains.find(d => d.name === 'Payments').id,
        analytics: domains.subDomains.find(d => d.name === 'Analytics').id,
      };

      // Step 3: Setup data assets
      const assets = await this.setupMayaDataAssets(domainMap);
      const assetMap = {};
      assets.forEach(asset => {
        assetMap[asset.name] = asset;
      });

      // Step 4: Setup data lineage
      await this.setupDataLineage(assetMap);

      // Step 5: Setup data quality rules
      await this.setupDataQualityRules(assetMap);

      // Step 6: Setup AI model governance
      await this.setupAIModelGovernance(assetMap);

      // Step 7: Setup configuration management
      await this.setupConfigurationManagement();

      logger.info('Maya Travel Agent data governance initialization completed successfully');

      return {
        domains,
        assets,
        assetMap,
        health,
      };
    } catch (error) {
      logger.error('Failed to initialize Maya governance', { error: error.message });
      throw error;
    }
  }
}

module.exports = CollibraService;