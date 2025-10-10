/**
 * Dataiku ML Model API Routes
 * Provides endpoints for price prediction and churn analysis
 */
const express = require('express');
const router = express.Router();
const logger = require('../src/utils/logger');

// Import prediction services
const flightPricePrediction = require('../src/services/flight-price-prediction');
const hotelPricePrediction = require('../src/services/hotel-price-prediction');
const churnPrediction = require('../src/services/churn-prediction');
const dataikuService = require('../src/services/dataiku-service');

// Middleware for error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Test Dataiku connection
 * GET /api/dataiku/test-connection
 */
router.get('/test-connection', asyncHandler(async (req, res) => {
  logger.info('Testing Dataiku connection');

  const result = await dataikuService.testConnection();

  res.json({
    success: result.success,
    message: result.success ? 'Dataiku connection successful' : 'Dataiku connection failed',
    data: result
  });
}));

/**
 * Get project information
 * GET /api/dataiku/project-info
 */
router.get('/project-info', asyncHandler(async (req, res) => {
  logger.info('Getting Dataiku project info');

  const projectInfo = await dataikuService.getProjectInfo();

  res.json({
    success: true,
    data: projectInfo
  });
}));

/**
 * Train flight price prediction model
 * POST /api/dataiku/train-flight-model
 */
router.post('/train-flight-model', asyncHandler(async (req, res) => {
  logger.info('Training flight price prediction model');

  const { flights } = req.body;

  if (!flights || !Array.isArray(flights)) {
    return res.status(400).json({
      success: false,
      message: 'Flights data is required and must be an array'
    });
  }

  const result = await flightPricePrediction.trainModel(flights);

  res.json({
    success: true,
    message: 'Flight price prediction model training initiated',
    data: result
  });
}));

/**
 * Predict flight price
 * POST /api/dataiku/predict-flight-price
 */
router.post('/predict-flight-price', asyncHandler(async (req, res) => {
  logger.info('Predicting flight price');

  const flightData = req.body;

  if (!flightData.departureAirport || !flightData.arrivalAirport || !flightData.date) {
    return res.status(400).json({
      success: false,
      message: 'Departure airport, arrival airport, and date are required'
    });
  }

  const prediction = await flightPricePrediction.predictPrice(flightData);

  res.json({
    success: true,
    data: prediction
  });
}));

/**
 * Batch predict flight prices
 * POST /api/dataiku/batch-predict-flights
 */
router.post('/batch-predict-flights', asyncHandler(async (req, res) => {
  logger.info('Batch predicting flight prices');

  const { flights } = req.body;

  if (!flights || !Array.isArray(flights)) {
    return res.status(400).json({
      success: false,
      message: 'Flights data is required and must be an array'
    });
  }

  const predictions = await flightPricePrediction.batchPredictPrices(flights);

  res.json({
    success: true,
    data: predictions
  });
}));

/**
 * Train hotel price prediction model
 * POST /api/dataiku/train-hotel-model
 */
router.post('/train-hotel-model', asyncHandler(async (req, res) => {
  logger.info('Training hotel price prediction model');

  const { hotels } = req.body;

  if (!hotels || !Array.isArray(hotels)) {
    return res.status(400).json({
      success: false,
      message: 'Hotels data is required and must be an array'
    });
  }

  const result = await hotelPricePrediction.trainModel(hotels);

  res.json({
    success: true,
    message: 'Hotel price prediction model training initiated',
    data: result
  });
}));

/**
 * Predict hotel price
 * POST /api/dataiku/predict-hotel-price
 */
router.post('/predict-hotel-price', asyncHandler(async (req, res) => {
  logger.info('Predicting hotel price');

  const hotelData = req.body;

  if (!hotelData.name || !hotelData.city || !hotelData.checkInDate) {
    return res.status(400).json({
      success: false,
      message: 'Hotel name, city, and check-in date are required'
    });
  }

  const prediction = await hotelPricePrediction.predictPrice(hotelData);

  res.json({
    success: true,
    data: prediction
  });
}));

/**
 * Batch predict hotel prices
 * POST /api/dataiku/batch-predict-hotels
 */
router.post('/batch-predict-hotels', asyncHandler(async (req, res) => {
  logger.info('Batch predicting hotel prices');

  const { hotels } = req.body;

  if (!hotels || !Array.isArray(hotels)) {
    return res.status(400).json({
      success: false,
      message: 'Hotels data is required and must be an array'
    });
  }

  const predictions = await hotelPricePrediction.batchPredictPrices(hotels);

  res.json({
    success: true,
    data: predictions
  });
}));

/**
 * Get hotel price trends
 * GET /api/dataiku/hotel-price-trends/:hotelName/:city
 */
router.get('/hotel-price-trends/:hotelName/:city', asyncHandler(async (req, res) => {
  logger.info('Getting hotel price trends');

  const { hotelName, city } = req.params;
  const { days = 30 } = req.query;

  const trends = await hotelPricePrediction.getPriceTrends(hotelName, city, parseInt(days));

  res.json({
    success: true,
    data: trends
  });
}));

/**
 * Train churn prediction model
 * POST /api/dataiku/train-churn-model
 */
router.post('/train-churn-model', asyncHandler(async (req, res) => {
  logger.info('Training churn prediction model');

  const { users } = req.body;

  if (!users || !Array.isArray(users)) {
    return res.status(400).json({
      success: false,
      message: 'Users data is required and must be an array'
    });
  }

  const result = await churnPrediction.trainModel(users);

  res.json({
    success: true,
    message: 'Churn prediction model training initiated',
    data: result
  });
}));

/**
 * Predict user churn
 * POST /api/dataiku/predict-churn
 */
router.post('/predict-churn', asyncHandler(async (req, res) => {
  logger.info('Predicting user churn');

  const userData = req.body;

  if (!userData.id || !userData.registrationDate || !userData.lastActivityDate) {
    return res.status(400).json({
      success: false,
      message: 'User ID, registration date, and last activity date are required'
    });
  }

  const prediction = await churnPrediction.predictChurn(userData);

  res.json({
    success: true,
    data: prediction
  });
}));

/**
 * Batch predict user churn
 * POST /api/dataiku/batch-predict-churn
 */
router.post('/batch-predict-churn', asyncHandler(async (req, res) => {
  logger.info('Batch predicting user churn');

  const { users } = req.body;

  if (!users || !Array.isArray(users)) {
    return res.status(400).json({
      success: false,
      message: 'Users data is required and must be an array'
    });
  }

  const predictions = await churnPrediction.batchPredictChurn(users);

  res.json({
    success: true,
    data: predictions
  });
}));

/**
 * Get high risk users
 * POST /api/dataiku/high-risk-users
 */
router.post('/high-risk-users', asyncHandler(async (req, res) => {
  logger.info('Getting high risk users');

  const { users } = req.body;

  if (!users || !Array.isArray(users)) {
    return res.status(400).json({
      success: false,
      message: 'Users data is required and must be an array'
    });
  }

  const highRiskUsers = await churnPrediction.getHighRiskUsers(users);

  res.json({
    success: true,
    data: highRiskUsers
  });
}));

/**
 * Generate retention insights for a user
 * POST /api/dataiku/retention-insights
 */
router.post('/retention-insights', asyncHandler(async (req, res) => {
  logger.info('Generating retention insights');

  const userData = req.body;

  if (!userData.id || !userData.registrationDate || !userData.lastActivityDate) {
    return res.status(400).json({
      success: false,
      message: 'User ID, registration date, and last activity date are required'
    });
  }

  const insights = await churnPrediction.generateRetentionInsights(userData);

  res.json({
    success: true,
    data: insights
  });
}));

/**
 * Get model metrics
 * GET /api/dataiku/model-metrics/:modelName
 */
router.get('/model-metrics/:modelName', asyncHandler(async (req, res) => {
  logger.info('Getting model metrics');

  const { modelName } = req.params;

  let metrics;
  switch (modelName) {
  case 'flight-price':
    metrics = await flightPricePrediction.getModelMetrics();
    break;
  case 'hotel-price':
    metrics = await hotelPricePrediction.getModelMetrics();
    break;
  case 'churn':
    metrics = await churnPrediction.getModelMetrics();
    break;
  default:
    return res.status(400).json({
      success: false,
      message: 'Invalid model name. Use: flight-price, hotel-price, or churn'
    });
  }

  res.json({
    success: true,
    data: metrics
  });
}));

/**
 * Health check endpoint
 * GET /api/dataiku/health
 */
router.get('/health', asyncHandler(async (req, res) => {
  logger.info('Dataiku ML service health check');

  const connectionTest = await dataikuService.testConnection();

  res.json({
    success: true,
    status: connectionTest.success ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      dataiku: connectionTest.success,
      flightModel: true, // Assume models are available if Dataiku is connected
      hotelModel: true,
      churnModel: true
    }
  });
}));

module.exports = router;