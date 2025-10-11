/**
 * Amrikyy Travel Agent - Code Recipes and Templates
 * Reusable code patterns and automation scripts
 */

module.exports = {
  // API Integration Recipes
  apiRecipes: {
    // Flight API Integration
    flightApiIntegration: `
const axios = require('axios');

class FlightAPIClient {
  constructor(apiKey, baseUrl = 'https://api.amadeus.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async searchFlights(origin, destination, departureDate, returnDate = null, passengers = 1) {
    try {
      const params = {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        adults: passengers
      };

      if (returnDate) {
        params.returnDate = returnDate;
      }

      const response = await this.client.get('/v2/shopping/flight-offers', { params });
      return this.formatFlightResults(response.data.data);
    } catch (error) {
      logger.error('Flight search failed:', error.message);
      throw new Error(\`Flight search failed: \${error.message}\`);
    }
  }

  formatFlightResults(flights) {
    return flights.map(flight => ({
      id: flight.id,
      price: {
        total: flight.price.total,
        currency: flight.price.currency
      },
      itineraries: flight.itineraries.map(itinerary => ({
        duration: itinerary.duration,
        segments: itinerary.segments.map(segment => ({
          departure: {
            iataCode: segment.departure.iataCode,
            terminal: segment.departure.terminal,
            at: segment.departure.at
          },
          arrival: {
            iataCode: segment.arrival.iataCode,
            terminal: segment.arrival.terminal,
            at: segment.arrival.at
          },
          carrierCode: segment.carrierCode,
          flightNumber: segment.number,
          aircraft: segment.aircraft.code,
          duration: segment.duration
        }))
      }))
    }));
  }
}

module.exports = FlightAPIClient;
`,

    // Hotel API Integration
    hotelApiIntegration: `
const axios = require('axios');

class HotelAPIClient {
  constructor(apiKey, baseUrl = 'https://api.booking.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async searchHotels(cityCode, checkinDate, checkoutDate, guests = 2, rooms = 1) {
    try {
      const params = {
        cityCode,
        checkinDate,
        checkoutDate,
        roomQuantity: rooms,
        adults: guests,
        radius: 10,
        radiusUnit: 'KM'
      };

      const response = await this.client.get('/v1/hotels/search', { params });
      return this.formatHotelResults(response.data.data);
    } catch (error) {
      logger.error('Hotel search failed:', error.message);
      throw new Error(\`Hotel search failed: \${error.message}\`);
    }
  }

  formatHotelResults(hotels) {
    return hotels.map(hotel => ({
      id: hotel.hotelId,
      name: hotel.name,
      rating: hotel.rating,
      location: {
        latitude: hotel.geoCode.latitude,
        longitude: hotel.geoCode.longitude,
        address: hotel.address
      },
      amenities: hotel.amenities || [],
      price: hotel.price ? {
        total: hotel.price.total,
        currency: hotel.price.currency
      } : null,
      images: hotel.media?.map(media => media.uri) || []
    }));
  }
}

module.exports = HotelAPIClient;
`,

    // Payment Processing Integration
    paymentIntegration: `
const stripe = require('stripe');

class PaymentService {
  constructor(secretKey, publishableKey) {
    this.stripe = stripe(secretKey);
    this.publishableKey = publishableKey;
  }

  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      logger.error('Payment intent creation failed:', error.message);
      throw new Error(\`Payment creation failed: \${error.message}\`);
    }
  }

  async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
        }
      );

      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      };
    } catch (error) {
      logger.error('Payment confirmation failed:', error.message);
      throw new Error(\`Payment confirmation failed: \${error.message}\`);
    }
  }

  async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason
      });

      return {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status
      };
    } catch (error) {
      logger.error('Refund creation failed:', error.message);
      throw new Error(\`Refund failed: \${error.message}\`);
    }
  }
}

module.exports = PaymentService;
`
  },

  // ML Model Recipes
  mlRecipes: {
    // Price Prediction Model Template
    pricePredictionModel: `
const { RandomForestRegressor } = require('scikit-learn');
const { StandardScaler } = require('scikit-learn/preprocessing');
const { train_test_split } = require('scikit-learn/model_selection');
const { mean_absolute_error, r2_score } = require('scikit-learn/metrics');

class PricePredictionModel {
  constructor() {
    this.model = new RandomForestRegressor({
      n_estimators: 100,
      max_depth: 20,
      random_state: 42,
      n_jobs: -1
    });
    this.scaler = new StandardScaler();
    this.isTrained = false;
  }

  async train(X, y, testSize = 0.2) {
    try {
      logger.info('Starting model training...');

      // Split data
      const [X_train, X_test, y_train, y_test] = train_test_split(
        X, y, { test_size: testSize, random_state: 42 }
      );

      // Scale features
      X_train_scaled = this.scaler.fit_transform(X_train);
      X_test_scaled = this.scaler.transform(X_test);

      // Train model
      this.model.fit(X_train_scaled, y_train);

      // Evaluate
      const y_pred = this.model.predict(X_test_scaled);
      const mae = mean_absolute_error(y_test, y_pred);
      const r2 = r2_score(y_test, y_pred);

      this.isTrained = true;

      logger.info('Model training completed', { mae, r2 });

      return {
        mae,
        r2,
        feature_importance: this.getFeatureImportance()
      };
    } catch (error) {
      logger.error('Model training failed:', error.message);
      throw error;
    }
  }

  async predict(features) {
    if (!this.isTrained) {
      throw new Error('Model must be trained before making predictions');
    }

    try {
      const scaledFeatures = this.scaler.transform([features]);
      const prediction = this.model.predict(scaledFeatures)[0];

      return {
        predictedPrice: prediction,
        confidence: this.calculateConfidence(features)
      };
    } catch (error) {
      logger.error('Prediction failed:', error.message);
      throw error;
    }
  }

  getFeatureImportance() {
    return this.model.feature_importances_;
  }

  calculateConfidence(features) {
    // Simplified confidence calculation
    // In practice, this would use prediction intervals or ensemble methods
    return 0.85; // Placeholder
  }

  async saveModel(path) {
    // Implementation for saving model to disk
    logger.info('Saving model to:', path);
    // Save model logic here
  }

  async loadModel(path) {
    // Implementation for loading model from disk
    logger.info('Loading model from:', path);
    this.isTrained = true;
    // Load model logic here
  }
}

module.exports = PricePredictionModel;
`,

    // User Churn Prediction Model
    churnPredictionModel: `
const { LGBMClassifier } = require('lightgbm');
const { SMOTE } = require('imbalanced-learn');
const { classification_report } = require('scikit-learn/metrics');

class ChurnPredictionModel {
  constructor() {
    this.model = new LGBMClassifier({
      n_estimators: 150,
      max_depth: 12,
      learning_rate: 0.05,
      num_leaves: 31,
      random_state: 42,
      n_jobs: -1
    });
    this.smote = new SMOTE(random_state: 42);
    this.isTrained = false;
  }

  async train(X, y, testSize = 0.2) {
    try {
      logger.info('Starting churn model training...');

      // Handle class imbalance
      const [X_resampled, y_resampled] = this.smote.fit_resample(X, y);

      // Split data
      const [X_train, X_test, y_train, y_test] = train_test_split(
        X_resampled, y_resampled, { test_size: testSize, random_state: 42 }
      );

      // Train model
      this.model.fit(X_train, y_train);

      // Evaluate
      const y_pred = this.model.predict(X_test);
      const report = classification_report(y_test, y_pred, { output_dict: true });

      this.isTrained = true;

      logger.info('Churn model training completed', {
        accuracy: report.accuracy,
        precision: report['1'].precision,
        recall: report['1'].recall,
        f1_score: report['1']['f1-score']
      });

      return report;
    } catch (error) {
      logger.error('Churn model training failed:', error.message);
      throw error;
    }
  }

  async predict(features) {
    if (!this.isTrained) {
      throw new Error('Model must be trained before making predictions');
    }

    try {
      const prediction = this.model.predict([features])[0];
      const probability = this.model.predict_proba([features])[0];

      return {
        churnPrediction: prediction,
        churnProbability: probability[1],
        riskLevel: this.getRiskLevel(probability[1]),
        recommendations: this.getRetentionRecommendations(prediction, probability[1])
      };
    } catch (error) {
      logger.error('Churn prediction failed:', error.message);
      throw error;
    }
  }

  getRiskLevel(probability) {
    if (probability > 0.8) return 'high';
    if (probability > 0.5) return 'medium';
    return 'low';
  }

  getRetentionRecommendations(prediction, probability) {
    if (prediction === 0) return [];

    const recommendations = [];

    if (probability > 0.8) {
      recommendations.push('Immediate intervention required');
      recommendations.push('Personalized retention offer');
      recommendations.push('Account manager assignment');
    } else if (probability > 0.5) {
      recommendations.push('Targeted engagement campaign');
      recommendations.push('Loyalty program enrollment');
      recommendations.push('Usage pattern analysis');
    } else {
      recommendations.push('Monitor engagement metrics');
      recommendations.push('Send re-engagement email');
    }

    return recommendations;
  }
}

module.exports = ChurnPredictionModel;
`
  },

  // Database Recipes
  databaseRecipes: {
    // Supabase Integration Template
    supabaseIntegration: `
const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
  constructor(url, anonKey, serviceRoleKey = null) {
    this.supabase = createClient(url, serviceRoleKey || anonKey);
    this.anonKey = anonKey;
  }

  // User Management
  async createUser(email, password, metadata = {}) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      return data.user;
    } catch (error) {
      logger.error('User creation failed:', error.message);
      throw error;
    }
  }

  async authenticateUser(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Authentication failed:', error.message);
      throw error;
    }
  }

  // Trip Management
  async createTrip(tripData) {
    try {
      const { data, error } = await this.supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Trip creation failed:', error.message);
      throw error;
    }
  }

  async getUserTrips(userId, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Trip retrieval failed:', error.message);
      throw error;
    }
  }

  // Payment Management
  async createPaymentRecord(paymentData) {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Payment record creation failed:', error.message);
      throw error;
    }
  }

  // Analytics Queries
  async getTripAnalytics(userId, dateRange = {}) {
    try {
      let query = this.supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId);

      if (dateRange.start) {
        query = query.gte('created_at', dateRange.start);
      }
      if (dateRange.end) {
        query = query.lte('created_at', dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;

      return this.processAnalytics(data);
    } catch (error) {
      logger.error('Analytics query failed:', error.message);
      throw error;
    }
  }

  processAnalytics(trips) {
    const analytics = {
      totalTrips: trips.length,
      totalSpent: trips.reduce((sum, trip) => sum + (trip.total_cost || 0), 0),
      averageTripCost: 0,
      tripsByMonth: {},
      destinations: {}
    };

    if (trips.length > 0) {
      analytics.averageTripCost = analytics.totalSpent / trips.length;
    }

    trips.forEach(trip => {
      // Monthly breakdown
      const month = new Date(trip.created_at).toISOString().slice(0, 7);
      analytics.tripsByMonth[month] = (analytics.tripsByMonth[month] || 0) + 1;

      // Destination analysis
      if (trip.destination) {
        analytics.destinations[trip.destination] = (analytics.destinations[trip.destination] || 0) + 1;
      }
    });

    return analytics;
  }
}

module.exports = SupabaseService;
`,

    // Database Migration Template
    databaseMigration: `
const fs = require('fs');
const path = require('path');

class DatabaseMigration {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.migrationTable = 'schema_migrations';
  }

  async initialize() {
    try {
      // Create migrations table if it doesn't exist
      const { error } = await this.supabase.rpc('create_migrations_table');
      if (error && !error.message.includes('already exists')) {
        throw error;
      }
    } catch (error) {
      logger.error('Migration initialization failed:', error.message);
      throw error;
    }
  }

  async runMigrations() {
    try {
      logger.info('Running database migrations...');

      const migrationFiles = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        const migrationName = path.parse(file).name;

        // Check if migration has already been run
        const { data: existing } = await this.supabase
          .from(this.migrationTable)
          .select('name')
          .eq('name', migrationName)
          .single();

        if (existing) {
          logger.info(\`Skipping already run migration: \${migrationName}\`);
          continue;
        }

        // Run migration
        const migrationSQL = fs.readFileSync(path.join(this.migrationsPath, file), 'utf8');

        logger.info(\`Running migration: \${migrationName}\`);

        const { error } = await this.supabase.rpc('exec_sql', {
          sql: migrationSQL
        });

        if (error) throw error;

        // Record migration as run
        await this.supabase
          .from(this.migrationTable)
          .insert([{ name: migrationName, executed_at: new Date().toISOString() }]);

        logger.info(\`Migration completed: \${migrationName}\`);
      }

      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration execution failed:', error.message);
      throw error;
    }
  }

  async rollbackMigration(migrationName) {
    try {
      const rollbackFile = path.join(this.migrationsPath, \`\${migrationName}.rollback.sql\`);

      if (!fs.existsSync(rollbackFile)) {
        throw new Error(\`Rollback file not found: \${rollbackFile}\`);
      }

      const rollbackSQL = fs.readFileSync(rollbackFile, 'utf8');

      logger.info(\`Rolling back migration: \${migrationName}\`);

      const { error } = await this.supabase.rpc('exec_sql', {
        sql: rollbackSQL
      });

      if (error) throw error;

      // Remove migration record
      await this.supabase
        .from(this.migrationTable)
        .delete()
        .eq('name', migrationName);

      logger.info(\`Migration rolled back: \${migrationName}\`);
    } catch (error) {
      logger.error('Migration rollback failed:', error.message);
      throw error;
    }
  }

  async createMigration(name, upSQL, downSQL = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = \`\${timestamp}_\${name}.sql\`;

      // Write migration file
      fs.writeFileSync(path.join(this.migrationsPath, fileName), upSQL);

      // Write rollback file if provided
      if (downSQL) {
        fs.writeFileSync(
          path.join(this.migrationsPath, \`\${timestamp}_\${name}.rollback.sql\`),
          downSQL
        );
      }

      logger.info(\`Migration created: \${fileName}\`);
      return fileName;
    } catch (error) {
      logger.error('Migration creation failed:', error.message);
      throw error;
    }
  }
}

module.exports = DatabaseMigration;
`
  },

  // Monitoring and Alerting Recipes
  monitoringRecipes: {
    // Prometheus Metrics Template
    prometheusMetrics: `
const promClient = require('prom-client');

class MetricsService {
  constructor() {
    this.register = new promClient.Registry();

    // Add default metrics
    promClient.collectDefaultMetrics({ register: this.register });

    // Custom metrics
    this.httpRequestTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register]
    });

    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register]
    });

    this.activeUsers = new promClient.Gauge({
      name: 'active_users',
      help: 'Number of currently active users',
      registers: [this.register]
    });

    this.cacheHits = new promClient.Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      registers: [this.register]
    });

    this.cacheMisses = new promClient.Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      registers: [this.register]
    });

    this.bossAgentDuration = new promClient.Histogram({
      name: 'boss_agent_orchestration_duration_seconds',
      help: 'Duration of boss agent orchestration in seconds',
      labelNames: ['operation', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
      registers: [this.register]
    });

    this.friendshipLevels = new promClient.Gauge({
      name: 'friendship_levels',
      help: 'Current friendship levels by level',
      labelNames: ['level'],
      registers: [this.register]
    });
  }

  // HTTP request metrics
  recordHttpRequest(method, route, statusCode, duration) {
    this.httpRequestTotal.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  // User metrics
  setActiveUsers(count) {
    this.activeUsers.set(count);
  }

  // Cache metrics
  recordCacheHit() {
    this.cacheHits.inc();
  }

  recordCacheMiss() {
    this.cacheMisses.inc();
  }

  // Boss agent metrics
  recordBossAgentOperation(operation, status, duration) {
    this.bossAgentDuration.observe({ operation, status }, duration);
  }

  // Friendship metrics
  updateFriendshipLevels(levelCounts) {
    Object.entries(levelCounts).forEach(([level, count]) => {
      this.friendshipLevels.set({ level }, count);
    });
  }

  // Middleware for Express
  getMetricsMiddleware() {
    return (req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        this.recordHttpRequest(
          req.method,
          req.route?.path || req.path,
          res.statusCode,
          duration
        );
      });

      next();
    };
  }

  // Metrics endpoint
  async getMetrics() {
    return this.register.metrics();
  }

  // Health check
  async getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}

module.exports = new MetricsService();
`,

    // Alert Manager Template
    alertManager: `
const nodemailer = require('nodemailer');

class AlertManager {
  constructor(config) {
    this.config = config;
    this.transporter = nodemailer.createTransporter({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
  }

  async sendAlert(alert) {
    try {
      const mailOptions = {
        from: this.config.from,
        to: alert.recipients.join(', '),
        subject: \`[${alert.severity.toUpperCase()}] \${alert.title}\`,
        html: this.formatAlertEmail(alert)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info('Alert sent successfully', { alertId: alert.id });
    } catch (error) {
      logger.error('Failed to send alert:', error.message);
      throw error;
    }
  }

  formatAlertEmail(alert) {
    return \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: \${this.getSeverityColor(alert.severity)};">
          \${alert.severity.toUpperCase()}: \${alert.title}
        </h2>

        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Description:</strong> \${alert.description}</p>
          <p><strong>Time:</strong> \${new Date(alert.timestamp).toLocaleString()}</p>
          <p><strong>Service:</strong> \${alert.service}</p>
          <p><strong>Environment:</strong> \${alert.environment}</p>
        </div>

        \${alert.details ? \`
          <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
            <h3>Additional Details:</h3>
            <pre style="white-space: pre-wrap;">\${JSON.stringify(alert.details, null, 2)}</pre>
          </div>
        \` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
          <p>This alert was generated by Amrikyy Travel Agent monitoring system.</p>
          <p>Please investigate and resolve as soon as possible.</p>
        </div>
      </div>
    \`;
  }

  getSeverityColor(severity) {
    switch (severity.toLowerCase()) {
      case 'critical': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  }

  // Predefined alert templates
  static createSystemAlert(severity, title, description, details = {}) {
    return {
      id: \`alert_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
      severity,
      title,
      description,
      service: 'amrikyy-backend',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString(),
      recipients: process.env.ALERT_RECIPIENTS?.split(',') || [],
      details
    };
  }

  static createPerformanceAlert(metric, value, threshold, details = {}) {
    return this.createSystemAlert(
      'warning',
      \`Performance Alert: \${metric}\`,
      \`\${metric} is at \${value}, exceeding threshold of \${threshold}\`,
      { metric, value, threshold, ...details }
    );
  }

  static createErrorAlert(error, context = {}) {
    return this.createSystemAlert(
      'critical',
      'Application Error',
      \`An error occurred: \${error.message}\`,
      { error: error.stack, context }
    );
  }
}

module.exports = AlertManager;
`
  },

  // Testing Recipes
  testingRecipes: {
    // API Testing Template
    apiTesting: `
const request = require('supertest');
const { expect } = require('chai');

describe('Amrikyy Travel Agent API', () => {
  let app;
  let testUser;
  let authToken;

  before(async () => {
    // Setup test application
    app = require('../server');

    // Create test user
    testUser = {
      email: \`test_\${Date.now()}@amrikyy-travel.com\`,
      password: 'testpassword123'
    };
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).to.have.property('user');
      expect(response.body.user.email).to.equal(testUser.email);
    });

    it('should login user and return token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('user');
      authToken = response.body.token;
    });

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });

  describe('Trip Planning', () => {
    it('should create a new trip plan', async () => {
      const tripData = {
        origin: 'NYC',
        destination: 'LAX',
        departureDate: '2024-06-15',
        returnDate: '2024-06-22',
        budget: 2000
      };

      const response = await request(app)
        .post('/api/trips/plan')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send(tripData)
        .expect(200);

      expect(response.body).to.have.property('tripId');
      expect(response.body).to.have.property('recommendations');
    });

    it('should reject trip planning without authentication', async () => {
      const tripData = {
        origin: 'NYC',
        destination: 'LAX',
        departureDate: '2024-06-15'
      };

      await request(app)
        .post('/api/trips/plan')
        .send(tripData)
        .expect(401);
    });
  });

  describe('ML Model Predictions', () => {
    it('should predict flight prices', async () => {
      const flightData = {
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2024-06-15',
        passengers: 2
      };

      const response = await request(app)
        .post('/api/models/flight-price/predict')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send(flightData)
        .expect(200);

      expect(response.body).to.have.property('predictedPrice');
      expect(response.body).to.have.property('confidence');
    });

    it('should predict hotel prices', async () => {
      const hotelData = {
        city: 'Los Angeles',
        checkinDate: '2024-06-15',
        checkoutDate: '2024-06-22',
        guests: 2
      };

      const response = await request(app)
        .post('/api/models/hotel-price/predict')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send(hotelData)
        .expect(200);

      expect(response.body).to.have.property('predictedPrice');
      expect(response.body).to.have.property('confidence');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid request data gracefully', async () => {
      const invalidData = {
        origin: '',
        destination: 'INVALID',
        departureDate: 'invalid-date'
      };

      const response = await request(app)
        .post('/api/trips/plan')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send(invalidData)
        .expect(400);

      expect(response.body).to.have.property('error');
    });

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 150; i++) {
        promises.push(
          request(app)
            .get('/api/health')
            .set('Authorization', \`Bearer \${authToken}\`)
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponse = responses.find(r => r.status === 429);

      expect(rateLimitedResponse).to.exist;
    });
  });
});
`,

    // Load Testing Template
    loadTesting: `
const { check, sleep } = require('k6');
const http = require('k6/http');

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 }, // Ramp up to 200 users over 2 minutes
    { duration: '5m', target: 200 }, // Stay at 200 users for 5 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  // Authentication
  const loginPayload = JSON.stringify({
    email: 'loadtest@example.com',
    password: 'password123'
  });

  const loginResponse = http.post(\`\${BASE_URL}/api/auth/login\`, loginPayload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => r.json().hasOwnProperty('token'),
  });

  const authToken = loginResponse.json().token;

  const headers = {
    'Authorization': \`Bearer \${authToken}\`,
    'Content-Type': 'application/json',
  };

  // Trip planning load test
  const tripPayload = JSON.stringify({
    origin: 'NYC',
    destination: 'LAX',
    departureDate: '2024-06-15',
    returnDate: '2024-06-22',
    budget: 2000
  });

  const tripResponse = http.post(\`\${BASE_URL}/api/trips/plan\`, tripPayload, {
    headers: headers,
  });

  check(tripResponse, {
    'trip planning status is 200': (r) => r.status === 200,
    'trip planning response has recommendations': (r) => r.json().hasOwnProperty('recommendations'),
  });

  // ML prediction load test
  const flightPayload = JSON.stringify({
    origin: 'JFK',
    destination: 'LAX',
    departureDate: '2024-06-15',
    passengers: 2
  });

  const flightResponse = http.post(\`\${BASE_URL}/api/models/flight-price/predict\`, flightPayload, {
    headers: headers,
  });

  check(flightResponse, {
    'flight prediction status is 200': (r) => r.status === 200,
    'flight prediction has price': (r) => r.json().hasOwnProperty('predictedPrice'),
  });

  // Health check
  const healthResponse = http.get(\`\${BASE_URL}/health\`);

  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response is healthy': (r) => r.json().status === 'healthy',
  });

  sleep(1); // Wait 1 second between iterations
}

export function setup() {
  // Setup function runs before the test starts
  console.log('Starting load test setup...');

  // Create test user if needed
  const registerPayload = JSON.stringify({
    email: 'loadtest@example.com',
    password: 'password123'
  });

  const registerResponse = http.post(\`\${BASE_URL}/api/auth/register\`, registerPayload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (registerResponse.status !== 201 && registerResponse.status !== 409) {
    console.error('Failed to setup test user');
  }

  console.log('Load test setup completed');
}

export function teardown() {
  // Teardown function runs after the test completes
  console.log('Load test completed');
}
`
  }
};