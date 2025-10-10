/**
 * Dataiku API Service
 * Handles communication with Dataiku DSS for ML model operations
 */
const axios = require('axios');
const logger = require('../utils/logger');

class DataikuService {
  constructor() {
    this.baseURL = process.env.DATAIKU_BASE_URL;
    this.apiKey = process.env.DATAIKU_API_KEY;
    this.projectKey = process.env.DATAIKU_PROJECT_KEY || 'MAYA_TRAVEL_AGENT';

    // Initialize axios instance with authentication
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        logger.error('Dataiku API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        throw error;
      }
    );
  }

  /**
   * Test connection to Dataiku DSS
   */
  async testConnection() {
    try {
      const response = await this.client.get('/public/api/about');
      logger.info('Dataiku connection successful');
      return {
        success: true,
        version: response.data.version,
        build: response.data.build
      };
    } catch (error) {
      logger.error('Dataiku connection failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get project information
   */
  async getProjectInfo() {
    try {
      const response = await this.client.get(`/projects/${this.projectKey}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get project info:', error.message);
      throw new Error(`Project not found: ${this.projectKey}`);
    }
  }

  /**
   * Create or get a managed folder for data storage
   */
  async getOrCreateManagedFolder(folderName) {
    try {
      // Try to get existing folder
      const response = await this.client.get(`/projects/${this.projectKey}/managedfolders/${folderName}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Create new folder if it doesn't exist
        logger.info(`Creating managed folder: ${folderName}`);
        const createResponse = await this.client.post(`/projects/${this.projectKey}/managedfolders`, {
          name: folderName,
          type: 'Filesystem'
        });
        return createResponse.data;
      }
      throw error;
    }
  }

  /**
   * Upload data to Dataiku managed folder
   */
  async uploadDataToFolder(folderName, fileName, data) {
    try {
      const folder = await this.getOrCreateManagedFolder(folderName);

      const response = await this.client.post(
        `/projects/${this.projectKey}/managedfolders/${folder.id}/upload`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          params: {
            path: fileName
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to upload data to folder:', error.message);
      throw error;
    }
  }

  /**
   * Create a dataset from uploaded data
   */
  async createDatasetFromFolder(folderName, fileName, datasetName) {
    try {
      const response = await this.client.post(`/projects/${this.projectKey}/datasets`, {
        name: datasetName,
        type: 'Filesystem',
        format: 'csv',
        managedFolder: folderName,
        pathInFolder: fileName,
        schema: {
          columns: [
            { name: 'timestamp', type: 'string' },
            { name: 'feature1', type: 'float' },
            { name: 'feature2', type: 'float' },
            { name: 'target', type: 'float' }
          ]
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create dataset:', error.message);
      throw error;
    }
  }

  /**
   * Train a prediction model
   */
  async trainModel(datasetName, modelName, modelType = 'regression') {
    try {
      // Create analysis (recipe) for the dataset
      const analysisResponse = await this.client.post(`/projects/${this.projectKey}/analyses`, {
        name: `${modelName}_analysis`,
        type: 'clustering' // or 'prediction' based on model type
      });

      // Configure the model
      const modelConfig = {
        name: modelName,
        type: modelType === 'regression' ? 'PRED_REGRESSION' : 'PRED_CLASSIFICATION',
        predictionType: modelType === 'regression' ? 'REGRESSION' : 'BINARY_CLASSIFICATION',
        targetVariable: 'target',
        inputDataset: datasetName
      };

      const modelResponse = await this.client.post(`/projects/${this.projectKey}/models`, modelConfig);

      // Train the model
      await this.client.post(`/projects/${this.projectKey}/models/${modelName}/actions/train`);

      logger.info(`Model ${modelName} training initiated`);
      return modelResponse.data;

    } catch (error) {
      logger.error('Failed to train model:', error.message);
      throw error;
    }
  }

  /**
   * Deploy model as API service
   */
  async deployModel(modelName, serviceName) {
    try {
      // Create API service from model
      const serviceResponse = await this.client.post(`/projects/${this.projectKey}/apiservices`, {
        name: serviceName,
        modelName: modelName,
        endpointId: 'predict'
      });

      // Activate the service
      await this.client.post(`/projects/${this.projectKey}/apiservices/${serviceName}/actions/deploy`);

      logger.info(`Model ${modelName} deployed as service ${serviceName}`);
      return serviceResponse.data;

    } catch (error) {
      logger.error('Failed to deploy model:', error.message);
      throw error;
    }
  }

  /**
   * Make prediction using deployed model
   */
  async predict(serviceName, features) {
    try {
      const response = await this.client.post(
        `/projects/${this.projectKey}/apiservices/${serviceName}/predict`,
        {
          features: [features]
        }
      );

      return response.data.result;
    } catch (error) {
      logger.error('Prediction failed:', error.message);
      throw error;
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics(modelName) {
    try {
      const response = await this.client.get(`/projects/${this.projectKey}/models/${modelName}/metrics`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get model metrics:', error.message);
      throw error;
    }
  }

  /**
   * Flight price prediction
   */
  async predictFlightPrice(flightData) {
    const serviceName = 'flight_price_prediction';
    return await this.predict(serviceName, flightData);
  }

  /**
   * Hotel price prediction
   */
  async predictHotelPrice(hotelData) {
    const serviceName = 'hotel_price_prediction';
    return await this.predict(serviceName, hotelData);
  }

  /**
   * User churn prediction
   */
  async predictChurn(userData) {
    const serviceName = 'user_churn_prediction';
    return await this.predict(serviceName, userData);
  }
}

module.exports = new DataikuService();