/**
 * Service Bus - Confluent Kafka Integration
 * Event streaming service for real-time communication between BossAgent and Skills
 */

const { Kafka } = require('@confluentinc/kafka-javascript');
const logger = require('../utils/logger');

class ServiceBus {
  constructor(config = {}) {
    this.config = {
      // Confluent Cloud configuration
      'bootstrap.servers': config.bootstrapServers || process.env.CONFLUENT_BOOTSTRAP_SERVERS,
      'sasl.username': config.saslUsername || process.env.CONFLUENT_SASL_USERNAME,
      'sasl.password': config.saslPassword || process.env.CONFLUENT_SASL_PASSWORD,
      'security.protocol': 'SASL_SSL',
      'sasl.mechanisms': 'PLAIN',

      // Producer configuration
      'acks': 'all',
      'retries': 3,
      'retry.backoff.ms': 1000,
      'compression.type': 'gzip',

      // Consumer configuration
      'group.id': config.groupId || 'amrikyy-service-bus',
      'auto.offset.reset': 'latest',
      'enable.auto.commit': true,
      'auto.commit.interval.ms': 5000,

      // Additional config
      ...config.kafkaConfig
    };

    this.producer = null;
    this.consumer = null;
    this.isConnected = false;
    this.topics = new Set();
    this.eventHandlers = new Map();
    this.metrics = {
      messagesProduced: 0,
      messagesConsumed: 0,
      errors: 0,
      reconnects: 0
    };

    // Topic configurations
    this.topicConfigs = {
      'orchestration-results': {
        partitions: 3,
        replicationFactor: 3,
        config: {
          'cleanup.policy': 'delete',
          'retention.ms': '604800000' // 7 days
        }
      },
      'user-emotions': {
        partitions: 2,
        replicationFactor: 3,
        config: {
          'cleanup.policy': 'delete',
          'retention.ms': '86400000' // 24 hours
        }
      },
      'skill-executions': {
        partitions: 2,
        replicationFactor: 3,
        config: {
          'cleanup.policy': 'delete',
          'retention.ms': '604800000' // 7 days
        }
      },
      'system-events': {
        partitions: 1,
        replicationFactor: 3,
        config: {
          'cleanup.policy': 'delete',
          'retention.ms': '2592000000' // 30 days
        }
      }
    };

    logger.info('🚍 Service Bus initialized', {
      bootstrapServers: this.config['bootstrap.servers'] ? 'configured' : 'missing',
      groupId: this.config['group.id']
    });
  }

  /**
   * Connect to Confluent Cloud
   */
  async connect() {
    try {
      // Validate configuration
      if (!this.config['bootstrap.servers'] ||
          !this.config['sasl.username'] ||
          !this.config['sasl.password']) {
        throw new Error('Missing Confluent Cloud credentials. Please set CONFLUENT_BOOTSTRAP_SERVERS, CONFLUENT_SASL_USERNAME, and CONFLUENT_SASL_PASSWORD environment variables.');
      }

      // Initialize producer
      this.producer = new Kafka.Producer(this.config);
      await this._connectProducer();

      // Initialize consumer
      this.consumer = new Kafka.Consumer(this.config);
      await this._connectConsumer();

      this.isConnected = true;
      logger.info('✅ Service Bus connected to Confluent Cloud');

      return { success: true };

    } catch (error) {
      logger.error('❌ Failed to connect Service Bus:', error.message);
      this.metrics.errors++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Connect producer
   */
  async _connectProducer() {
    return new Promise((resolve, reject) => {
      this.producer.connect((err) => {
        if (err) {
          reject(err);
        } else {
          logger.info('📤 Producer connected');
          resolve();
        }
      });
    });
  }

  /**
   * Connect consumer
   */
  async _connectConsumer() {
    return new Promise((resolve, reject) => {
      this.consumer.connect((err) => {
        if (err) {
          reject(err);
        } else {
          logger.info('📥 Consumer connected');
          resolve();
        }
      });
    });
  }

  /**
   * Disconnect from Confluent Cloud
   */
  async disconnect() {
    try {
      if (this.producer) {
        await this._disconnectProducer();
      }

      if (this.consumer) {
        await this._disconnectConsumer();
      }

      this.isConnected = false;
      logger.info('👋 Service Bus disconnected');

      return { success: true };

    } catch (error) {
      logger.error('❌ Error disconnecting Service Bus:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect producer
   */
  async _disconnectProducer() {
    return new Promise((resolve) => {
      this.producer.disconnect((err) => {
        if (err) {
          logger.warn('⚠️ Producer disconnect error:', err.message);
        } else {
          logger.info('📤 Producer disconnected');
        }
        resolve();
      });
    });
  }

  /**
   * Disconnect consumer
   */
  async _disconnectConsumer() {
    return new Promise((resolve) => {
      this.consumer.disconnect((err) => {
        if (err) {
          logger.warn('⚠️ Consumer disconnect error:', err.message);
        } else {
          logger.info('📥 Consumer disconnected');
        }
        resolve();
      });
    });
  }

  /**
   * Publish event to topic
   */
  async publish(topic, event, key = null) {
    if (!this.isConnected || !this.producer) {
      throw new Error('Service Bus not connected');
    }

    try {
      const message = {
        topic,
        messages: [{
          key: key || event.id || event.userId || 'default',
          value: JSON.stringify({
            ...event,
            timestamp: new Date().toISOString(),
            source: 'amrikyy-service-bus'
          }),
          headers: {
            'event-type': event.type || 'generic',
            'version': '1.0'
          }
        }]
      };

      await this._produceMessage(message);
      this.metrics.messagesProduced++;

      logger.debug(`📤 Published event to ${topic}:`, {
        eventType: event.type,
        key: message.messages[0].key
      });

      return { success: true, topic, eventId: event.id };

    } catch (error) {
      logger.error(`❌ Failed to publish to ${topic}:`, error.message);
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * Produce message with retry logic
   */
  async _produceMessage(message, retryCount = 0) {
    return new Promise((resolve, reject) => {
      this.producer.produce(message.topic, null, Buffer.from(message.messages[0].value),
        message.messages[0].key, Date.now(), (err, offset) => {
          if (err) {
            if (retryCount < 3) {
              logger.warn(`⚠️ Produce retry ${retryCount + 1}/3 for topic ${message.topic}`);
              setTimeout(() => {
                this._produceMessage(message, retryCount + 1).then(resolve).catch(reject);
              }, Math.pow(2, retryCount) * 1000);
            } else {
              reject(err);
            }
          } else {
            resolve(offset);
          }
        });
    });
  }

  /**
   * Subscribe to topics and handle events
   */
  async subscribe(topics, eventHandler) {
    if (!this.isConnected || !this.consumer) {
      throw new Error('Service Bus not connected');
    }

    try {
      // Subscribe to topics
      await this._subscribeToTopics(topics);

      // Set up message handler
      this.consumer.on('data', (message) => {
        this._handleMessage(message, eventHandler);
      });

      // Set up error handler
      this.consumer.on('event.error', (err) => {
        logger.error('❌ Consumer error:', err.message);
        this.metrics.errors++;
      });

      // Track subscribed topics
      topics.forEach(topic => this.topics.add(topic));

      logger.info('📥 Subscribed to topics:', topics);
      return { success: true, topics };

    } catch (error) {
      logger.error('❌ Failed to subscribe:', error.message);
      throw error;
    }
  }

  /**
   * Subscribe to topics
   */
  async _subscribeToTopics(topics) {
    return new Promise((resolve, reject) => {
      this.consumer.subscribe(topics, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Handle incoming message
   */
  async _handleMessage(message, eventHandler) {
    try {
      const event = JSON.parse(message.value.toString());
      this.metrics.messagesConsumed++;

      logger.debug(`📥 Received event from ${message.topic}:`, {
        eventType: event.type,
        key: message.key?.toString()
      });

      // Call event handler
      if (eventHandler) {
        await eventHandler(event, {
          topic: message.topic,
          partition: message.partition,
          offset: message.offset,
          key: message.key?.toString(),
          timestamp: message.timestamp
        });
      }

    } catch (error) {
      logger.error('❌ Error handling message:', error.message);
      this.metrics.errors++;
    }
  }

  /**
   * Register event handler for specific event types
   */
  registerEventHandler(eventType, handler) {
    this.eventHandlers.set(eventType, handler);
    logger.info(`🎯 Registered handler for event type: ${eventType}`);
  }

  /**
   * Publish orchestration result
   */
  async publishOrchestrationResult(result, context = {}) {
    const event = {
      id: result.metadata?.requestId || `orch_${Date.now()}`,
      type: 'orchestration:result',
      data: result,
      context,
      userId: context.userId,
      sessionId: context.sessionId
    };

    return this.publish('orchestration-results', event);
  }

  /**
   * Publish user emotion event
   */
  async publishUserEmotion(emotionData, context = {}) {
    const event = {
      id: `emotion_${Date.now()}`,
      type: 'user:emotion',
      data: emotionData,
      context,
      userId: context.userId,
      timestamp: new Date().toISOString()
    };

    return this.publish('user-emotions', event);
  }

  /**
   * Publish skill execution event
   */
  async publishSkillExecution(skillName, executionData, context = {}) {
    const event = {
      id: `skill_${Date.now()}`,
      type: 'skill:execution',
      skillName,
      data: executionData,
      context,
      userId: context.userId
    };

    return this.publish('skill-executions', event);
  }

  /**
   * Publish system event
   */
  async publishSystemEvent(eventType, eventData, context = {}) {
    const event = {
      id: `system_${Date.now()}`,
      type: `system:${eventType}`,
      data: eventData,
      context,
      timestamp: new Date().toISOString()
    };

    return this.publish('system-events', event);
  }

  /**
   * Create topics if they don't exist
   */
  async createTopics() {
    if (!this.isConnected) {
      throw new Error('Service Bus not connected');
    }

    try {
      const adminClient = Kafka.AdminClient.create(this.config);
      await this._connectAdmin(adminClient);

      const topicsToCreate = Object.entries(this.topicConfigs)
        .filter(([topicName]) => !this.topics.has(topicName))
        .map(([topicName, config]) => ({
          topic: topicName,
          num_partitions: config.partitions,
          replication_factor: config.replicationFactor,
          config: config.config
        }));

      if (topicsToCreate.length > 0) {
        await this._createTopics(adminClient, topicsToCreate);
        logger.info('✅ Created topics:', topicsToCreate.map(t => t.topic));
      } else {
        logger.info('ℹ️ All topics already exist');
      }

      adminClient.disconnect();
      return { success: true, topicsCreated: topicsToCreate.length };

    } catch (error) {
      logger.error('❌ Failed to create topics:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Connect admin client
   */
  async _connectAdmin(adminClient) {
    return new Promise((resolve, reject) => {
      adminClient.connect((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Create topics
   */
  async _createTopics(adminClient, topics) {
    return new Promise((resolve, reject) => {
      adminClient.createTopic(topics, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get health status
   */
  async healthCheck() {
    const checks = {
      connected: this.isConnected,
      producerReady: !!this.producer,
      consumerReady: !!this.consumer,
      topicsSubscribed: this.topics.size,
      eventHandlers: this.eventHandlers.size
    };

    // Test connection if connected
    if (this.isConnected) {
      try {
        // Simple metadata request to test connection
        const metadata = await this._getMetadata();
        checks.connectionHealthy = !!metadata;
      } catch (error) {
        checks.connectionHealthy = false;
        logger.warn('⚠️ Connection health check failed:', error.message);
      }
    }

    const overallHealth = checks.connected && checks.connectionHealthy;

    return {
      status: overallHealth ? 'healthy' : 'unhealthy',
      checks,
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get cluster metadata
   */
  async _getMetadata() {
    return new Promise((resolve, reject) => {
      if (this.consumer) {
        this.consumer.getMetadata({}, (err, metadata) => {
          if (err) {
            reject(err);
          } else {
            resolve(metadata);
          }
        });
      } else {
        reject(new Error('Consumer not available'));
      }
    });
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      topics: Array.from(this.topics),
      eventHandlers: this.eventHandlers.size,
      isConnected: this.isConnected
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      messagesProduced: 0,
      messagesConsumed: 0,
      errors: 0,
      reconnects: 0
    };
    logger.info('📊 Metrics reset');
  }
}

module.exports = ServiceBus;