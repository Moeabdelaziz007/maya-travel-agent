/**
 * User Churn Prediction Service
 * Uses Dataiku ML models to predict user churn and retention
 */
const dataikuService = require('./dataiku-service');
const logger = require('../utils/logger');

class ChurnPredictionService {
  constructor() {
    this.modelName = 'user_churn_model';
    this.serviceName = 'user_churn_prediction';
    this.datasetName = 'user_behavior_dataset';
    this.folderName = 'user_behavior_data';
  }

  /**
   * Prepare user behavior data for training
   */
  prepareTrainingData(users) {
    const trainingData = users.map(user => ({
      user_id: user.id,
      timestamp: user.lastActivityDate,
      days_since_registration: this.calculateDaysSinceRegistration(user.registrationDate),
      days_since_last_activity: this.calculateDaysSinceLastActivity(user.lastActivityDate),
      total_bookings: user.totalBookings || 0,
      total_spent: user.totalSpent || 0,
      avg_booking_value: (user.totalSpent || 0) / Math.max(user.totalBookings || 1, 1),
      booking_frequency: this.calculateBookingFrequency(user.registrationDate, user.totalBookings),
      app_sessions_last_30_days: user.appSessionsLast30Days || 0,
      messages_sent_last_30_days: user.messagesSentLast30Days || 0,
      searches_performed_last_30_days: user.searchesPerformedLast30Days || 0,
      profile_completeness: this.calculateProfileCompleteness(user),
      engagement_score: this.calculateEngagementScore(user),
      churned: user.churned ? 1 : 0, // Target variable: 1 if churned, 0 if active
      target: user.churned ? 1 : 0
    }));

    return trainingData;
  }

  /**
   * Calculate days since user registration
   */
  calculateDaysSinceRegistration(registrationDate) {
    const today = new Date();
    const registration = new Date(registrationDate);
    const diffTime = today - registration;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate days since last activity
   */
  calculateDaysSinceLastActivity(lastActivityDate) {
    const today = new Date();
    const lastActivity = new Date(lastActivityDate);
    const diffTime = today - lastActivity;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate booking frequency (bookings per month)
   */
  calculateBookingFrequency(registrationDate, totalBookings) {
    const daysSinceRegistration = this.calculateDaysSinceRegistration(registrationDate);
    const monthsSinceRegistration = Math.max(daysSinceRegistration / 30, 1);
    return totalBookings / monthsSinceRegistration;
  }

  /**
   * Calculate profile completeness score
   */
  calculateProfileCompleteness(user) {
    let score = 0;
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth',
      'nationality', 'passportNumber', 'preferences'
    ];

    fields.forEach(field => {
      if (user[field]) score += 1;
    });

    return (score / fields.length) * 100;
  }

  /**
   * Calculate user engagement score
   */
  calculateEngagementScore(user) {
    let score = 0;

    // Activity-based scoring
    if (user.totalBookings > 0) score += 30;
    if (user.totalSpent > 100) score += 20;
    if (user.appSessionsLast30Days > 5) score += 25;
    if (user.messagesSentLast30Days > 0) score += 15;
    if (user.searchesPerformedLast30Days > 3) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Train churn prediction model
   */
  async trainModel(users) {
    try {
      logger.info('Training user churn prediction model...');

      // Prepare training data
      const trainingData = this.prepareTrainingData(users);

      // Upload training data to Dataiku
      await dataikuService.uploadDataToFolder(
        this.folderName,
        'user_training_data.json',
        trainingData
      );

      // Create dataset from uploaded data
      await dataikuService.createDatasetFromFolder(
        this.folderName,
        'user_training_data.json',
        this.datasetName
      );

      // Train the model (classification for churn prediction)
      const modelResult = await dataikuService.trainModel(
        this.datasetName,
        this.modelName,
        'classification'
      );

      // Deploy the model as API service
      await dataikuService.deployModel(this.modelName, this.serviceName);

      logger.info('User churn prediction model trained and deployed successfully');
      return modelResult;

    } catch (error) {
      logger.error('Failed to train churn prediction model:', error.message);
      throw error;
    }
  }

  /**
   * Predict user churn probability
   */
  async predictChurn(userData) {
    try {
      // Prepare features for prediction
      const features = {
        user_id: userData.id,
        days_since_registration: this.calculateDaysSinceRegistration(userData.registrationDate),
        days_since_last_activity: this.calculateDaysSinceLastActivity(userData.lastActivityDate),
        total_bookings: userData.totalBookings || 0,
        total_spent: userData.totalSpent || 0,
        avg_booking_value: (userData.totalSpent || 0) / Math.max(userData.totalBookings || 1, 1),
        booking_frequency: this.calculateBookingFrequency(userData.registrationDate, userData.totalBookings),
        app_sessions_last_30_days: userData.appSessionsLast30Days || 0,
        messages_sent_last_30_days: userData.messagesSentLast30Days || 0,
        searches_performed_last_30_days: userData.searchesPerformedLast30Days || 0,
        profile_completeness: this.calculateProfileCompleteness(userData),
        engagement_score: this.calculateEngagementScore(userData)
      };

      // Get prediction from Dataiku
      const prediction = await dataikuService.predictChurn(features);

      return {
        churnProbability: prediction[0]?.prediction || 0,
        confidence: prediction[0]?.confidence || 0,
        riskLevel: this.calculateRiskLevel(prediction[0]?.prediction || 0),
        features: features,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to predict user churn:', error.message);
      throw error;
    }
  }

  /**
   * Calculate risk level based on churn probability
   */
  calculateRiskLevel(probability) {
    if (probability >= 0.7) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics() {
    try {
      return await dataikuService.getModelMetrics(this.modelName);
    } catch (error) {
      logger.error('Failed to get churn model metrics:', error.message);
      throw error;
    }
  }

  /**
   * Batch predict churn for multiple users
   */
  async batchPredictChurn(users) {
    try {
      logger.info(`Batch predicting churn for ${users.length} users`);

      const predictions = [];

      for (const user of users) {
        try {
          const prediction = await this.predictChurn(user);
          predictions.push({
            user: user,
            prediction: prediction
          });
        } catch (error) {
          logger.error(`Failed to predict churn for user ${user.id}:`, error.message);
          predictions.push({
            user: user,
            error: error.message
          });
        }
      }

      return predictions;

    } catch (error) {
      logger.error('Batch churn prediction failed:', error.message);
      throw error;
    }
  }

  /**
   * Get users at high risk of churn
   */
  async getHighRiskUsers(users) {
    try {
      const predictions = await this.batchPredictChurn(users);

      return predictions
        .filter(result => result.prediction && result.prediction.riskLevel === 'high')
        .map(result => ({
          user: result.user,
          churnProbability: result.prediction.churnProbability,
          riskLevel: result.prediction.riskLevel,
          recommendedActions: this.getRecommendedActions(result.prediction)
        }));

    } catch (error) {
      logger.error('Failed to get high risk users:', error.message);
      throw error;
    }
  }

  /**
   * Get recommended actions based on churn prediction
   */
  getRecommendedActions(prediction) {
    const actions = [];

    if (prediction.riskLevel === 'high') {
      if (prediction.features.days_since_last_activity > 30) {
        actions.push('Send re-engagement email');
      }
      if (prediction.features.engagement_score < 50) {
        actions.push('Offer personalized discount');
      }
      if (prediction.features.profile_completeness < 70) {
        actions.push('Encourage profile completion');
      }
      actions.push('Schedule follow-up call');
    }

    return actions;
  }

  /**
   * Generate retention insights for a user
   */
  async generateRetentionInsights(userData) {
    try {
      const prediction = await this.predictChurn(userData);

      return {
        userId: userData.id,
        currentRisk: prediction.riskLevel,
        churnProbability: prediction.churnProbability,
        engagementScore: prediction.features.engagement_score,
        profileCompleteness: prediction.features.profile_completeness,
        keyRiskFactors: this.identifyRiskFactors(prediction.features),
        recommendedActions: this.getRecommendedActions(prediction),
        insights: this.generateInsights(prediction),
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to generate retention insights:', error.message);
      throw error;
    }
  }

  /**
   * Identify key risk factors
   */
  identifyRiskFactors(features) {
    const riskFactors = [];

    if (features.days_since_last_activity > 30) {
      riskFactors.push('Long period of inactivity');
    }
    if (features.engagement_score < 50) {
      riskFactors.push('Low engagement score');
    }
    if (features.profile_completeness < 70) {
      riskFactors.push('Incomplete profile');
    }
    if (features.booking_frequency < 0.1) {
      riskFactors.push('Low booking frequency');
    }

    return riskFactors;
  }

  /**
   * Generate human-readable insights
   */
  generateInsights(prediction) {
    const insights = [];

    if (prediction.riskLevel === 'high') {
      insights.push(`User has a ${Math.round(prediction.churnProbability * 100)}% probability of churning`);
      insights.push('Immediate intervention recommended');
    } else if (prediction.riskLevel === 'medium') {
      insights.push(`User shows moderate churn risk (${Math.round(prediction.churnProbability * 100)}%)`);
      insights.push('Monitor and consider engagement activities');
    } else {
      insights.push(`User appears engaged with low churn risk (${Math.round(prediction.churnProbability * 100)}%)`);
      insights.push('Continue current engagement strategy');
    }

    return insights;
  }
}

module.exports = new ChurnPredictionService();