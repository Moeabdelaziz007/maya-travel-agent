const axios = require('axios');
const Joi = require('joi');

/**
 * Fivetran Service for programmatic data pipeline management
 * Handles connector setup, monitoring, and data transformations
 */
class FivetranService {
  constructor() {
    this.apiKey = process.env.FIVETRAN_API_KEY;
    this.apiSecret = process.env.FIVETRAN_API_SECRET;
    this.accountId = process.env.FIVETRAN_ACCOUNT_ID;
    this.baseUrl = 'https://api.fivetran.com/v1';

    if (!this.apiKey || !this.apiSecret || !this.accountId) {
      throw new Error('Fivetran credentials not configured');
    }

    // Create axios instance with auth
    this.client = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: this.apiKey,
        password: this.apiSecret
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create Telegram connector
   */
  async createTelegramConnector(config) {
    const schema = Joi.object({
      botToken: Joi.string().required(),
      destinationId: Joi.string().required(),
      syncFrequency: Joi.number().min(1).max(24).default(1)
    });

    const { error, value } = schema.validate(config);
    if (error) throw new Error(`Invalid config: ${error.details[0].message}`);

    try {
      const response = await this.client.post('/connectors', {
        service: 'telegram',
        group_id: this.accountId,
        config: {
          bot_token: value.botToken,
          sync_frequency: value.syncFrequency
        },
        destination_id: value.destinationId,
        paused: false,
        trust_certificates: true,
        trust_fingerprints: true
      });

      return {
        connectorId: response.data.data.id,
        status: response.data.data.status.setup_state
      };
    } catch (error) {
      throw new Error(`Failed to create Telegram connector: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create Stripe connector
   */
  async createStripeConnector(config) {
    const schema = Joi.object({
      apiKey: Joi.string().required(),
      destinationId: Joi.string().required(),
      syncFrequency: Joi.number().min(1).max(24).default(1)
    });

    const { error, value } = schema.validate(config);
    if (error) throw new Error(`Invalid config: ${error.details[0].message}`);

    try {
      const response = await this.client.post('/connectors', {
        service: 'stripe',
        group_id: this.accountId,
        config: {
          api_key: value.apiKey,
          sync_frequency: value.syncFrequency
        },
        destination_id: value.destinationId,
        paused: false,
        trust_certificates: true,
        trust_fingerprints: true
      });

      return {
        connectorId: response.data.data.id,
        status: response.data.data.status.setup_state
      };
    } catch (error) {
      throw new Error(`Failed to create Stripe connector: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create Supabase destination
   */
  async createSupabaseDestination(config) {
    const schema = Joi.object({
      host: Joi.string().required(),
      port: Joi.number().default(5432),
      database: Joi.string().required(),
      user: Joi.string().required(),
      password: Joi.string().required(),
      schema: Joi.string().default('public')
    });

    const { error, value } = schema.validate(config);
    if (error) throw new Error(`Invalid config: ${error.details[0].message}`);

    try {
      const response = await this.client.post('/destinations', {
        group_id: this.accountId,
        service: 'postgres_rds',
        region: 'us-east-1',
        config: {
          host: value.host,
          port: value.port,
          database: value.database,
          user: value.user,
          password: value.password,
          schema: value.schema
        },
        time_zone_offset: '+00',
        trust_certificates: true,
        trust_fingerprints: true
      });

      return {
        destinationId: response.data.data.id,
        status: response.data.data.status.setup_state
      };
    } catch (error) {
      throw new Error(`Failed to create Supabase destination: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get connector status
   */
  async getConnectorStatus(connectorId) {
    try {
      const response = await this.client.get(`/connectors/${connectorId}`);
      return {
        id: response.data.data.id,
        status: response.data.data.status.setup_state,
        syncState: response.data.data.status.sync_state,
        lastSync: response.data.data.status.update_state,
        failedAt: response.data.data.status.failed_at
      };
    } catch (error) {
      throw new Error(`Failed to get connector status: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Start manual sync
   */
  async syncConnector(connectorId) {
    try {
      const response = await this.client.post(`/connectors/${connectorId}/sync`);
      return {
        success: response.data.code === 'Success',
        message: response.data.message
      };
    } catch (error) {
      throw new Error(`Failed to sync connector: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Update connector configuration
   */
  async updateConnectorConfig(connectorId, config) {
    try {
      const response = await this.client.patch(`/connectors/${connectorId}/config`, config);
      return {
        success: response.data.code === 'Success',
        message: response.data.message
      };
    } catch (error) {
      throw new Error(`Failed to update connector config: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get sync logs
   */
  async getSyncLogs(connectorId, limit = 50) {
    try {
      const response = await this.client.get(`/connectors/${connectorId}/logs`, {
        params: { limit }
      });
      return response.data.data.logs.map(log => ({
        id: log.id,
        message: log.message,
        type: log.type,
        createdAt: log.created_at
      }));
    } catch (error) {
      throw new Error(`Failed to get sync logs: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Pause/Resume connector
   */
  async setConnectorPaused(connectorId, paused) {
    try {
      const response = await this.client.patch(`/connectors/${connectorId}`, {
        paused
      });
      return {
        success: response.data.code === 'Success',
        message: response.data.message
      };
    } catch (error) {
      throw new Error(`Failed to ${paused ? 'pause' : 'resume'} connector: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete connector
   */
  async deleteConnector(connectorId) {
    try {
      const response = await this.client.delete(`/connectors/${connectorId}`);
      return {
        success: response.data.code === 'Success',
        message: response.data.message
      };
    } catch (error) {
      throw new Error(`Failed to delete connector: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * List all connectors
   */
  async listConnectors() {
    try {
      const response = await this.client.get('/connectors');
      return response.data.data.connectors.map(connector => ({
        id: connector.id,
        service: connector.service,
        schema: connector.schema,
        status: connector.status.setup_state,
        syncState: connector.status.sync_state,
        paused: connector.paused,
        connectedAt: connector.connected_at
      }));
    } catch (error) {
      throw new Error(`Failed to list connectors: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Transform Telegram data
   */
  transformTelegramData(rawData) {
    return {
      message_id: rawData.message?.message_id,
      chat_id: rawData.message?.chat?.id,
      user_id: rawData.message?.from?.id,
      username: rawData.message?.from?.username,
      first_name: rawData.message?.from?.first_name,
      last_name: rawData.message?.from?.last_name,
      text: rawData.message?.text,
      date: new Date(rawData.message?.date * 1000),
      message_type: this.getMessageType(rawData.message),
      has_media: this.hasMedia(rawData.message),
      processed_at: new Date()
    };
  }

  /**
   * Transform Stripe data
   */
  transformStripeData(rawData) {
    return {
      id: rawData.id,
      type: rawData.object,
      amount: rawData.amount ? rawData.amount / 100 : null, // Convert cents to dollars
      currency: rawData.currency,
      customer_id: rawData.customer,
      payment_method: rawData.payment_method,
      status: rawData.status,
      created: new Date(rawData.created * 1000),
      description: rawData.description,
      metadata: rawData.metadata,
      processed_at: new Date()
    };
  }

  /**
   * Helper: Get message type
   */
  getMessageType(message) {
    if (message.text) return 'text';
    if (message.photo) return 'photo';
    if (message.document) return 'document';
    if (message.audio) return 'audio';
    if (message.video) return 'video';
    if (message.voice) return 'voice';
    if (message.sticker) return 'sticker';
    return 'unknown';
  }

  /**
   * Helper: Check if message has media
   */
  hasMedia(message) {
    return !!(message.photo || message.document || message.audio || message.video || message.voice || message.sticker);
  }

  /**
   * Validate data before sync
   */
  validateData(data, type) {
    const validators = {
      telegram: Joi.object({
        message_id: Joi.number().required(),
        chat_id: Joi.number().required(),
        user_id: Joi.number().required(),
        text: Joi.string().allow(null),
        date: Joi.date().required()
      }),
      stripe: Joi.object({
        id: Joi.string().required(),
        type: Joi.string().required(),
        amount: Joi.number().allow(null),
        currency: Joi.string().allow(null),
        status: Joi.string().allow(null),
        created: Joi.date().required()
      })
    };

    const schema = validators[type];
    if (!schema) throw new Error(`Unknown data type: ${type}`);

    const { error } = schema.validate(data);
    if (error) throw new Error(`Data validation failed: ${error.details[0].message}`);

    return true;
  }
}

module.exports = FivetranService;