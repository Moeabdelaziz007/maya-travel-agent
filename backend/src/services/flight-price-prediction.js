/**
 * Flight Price Prediction Service
 * Uses Dataiku ML models to predict flight prices based on historical data
 */
const dataikuService = require('./dataiku-service');
const logger = require('../utils/logger');

class FlightPricePredictionService {
  constructor() {
    this.modelName = 'flight_price_model';
    this.serviceName = 'flight_price_prediction';
    this.datasetName = 'flight_prices_dataset';
    this.folderName = 'flight_price_data';
  }

  /**
   * Prepare flight data for training
   */
  prepareTrainingData(flights) {
    const trainingData = flights.map(flight => ({
      timestamp: flight.date,
      departure_airport: flight.departureAirport,
      arrival_airport: flight.arrivalAirport,
      airline: flight.airline,
      days_until_flight: this.calculateDaysUntilFlight(flight.date),
      hour_of_day: new Date(flight.date).getHours(),
      day_of_week: new Date(flight.date).getDay(),
      month: new Date(flight.date).getMonth() + 1,
      season: this.getSeason(new Date(flight.date)),
      price: flight.price,
      target: flight.price // Target variable for prediction
    }));

    return trainingData;
  }

  /**
   * Calculate days until flight
   */
  calculateDaysUntilFlight(flightDate) {
    const today = new Date();
    const flight = new Date(flightDate);
    const diffTime = flight - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get season based on date
   */
  getSeason(date) {
    const month = date.getMonth() + 1;
    if ([12, 1, 2].includes(month)) return 'winter';
    if ([3, 4, 5].includes(month)) return 'spring';
    if ([6, 7, 8].includes(month)) return 'summer';
    return 'autumn';
  }

  /**
   * Train flight price prediction model
   */
  async trainModel(flights) {
    try {
      logger.info('Training flight price prediction model...');

      // Prepare training data
      const trainingData = this.prepareTrainingData(flights);

      // Upload training data to Dataiku
      await dataikuService.uploadDataToFolder(
        this.folderName,
        'flight_training_data.json',
        trainingData
      );

      // Create dataset from uploaded data
      await dataikuService.createDatasetFromFolder(
        this.folderName,
        'flight_training_data.json',
        this.datasetName
      );

      // Train the model
      const modelResult = await dataikuService.trainModel(
        this.datasetName,
        this.modelName,
        'regression'
      );

      // Deploy the model as API service
      await dataikuService.deployModel(this.modelName, this.serviceName);

      logger.info('Flight price prediction model trained and deployed successfully');
      return modelResult;

    } catch (error) {
      logger.error('Failed to train flight price prediction model:', error.message);
      throw error;
    }
  }

  /**
   * Predict flight price
   */
  async predictPrice(flightData) {
    try {
      // Prepare features for prediction
      const features = {
        departure_airport: flightData.departureAirport,
        arrival_airport: flightData.arrivalAirport,
        airline: flightData.airline,
        days_until_flight: this.calculateDaysUntilFlight(flightData.date),
        hour_of_day: new Date(flightData.date).getHours(),
        day_of_week: new Date(flightData.date).getDay(),
        month: new Date(flightData.date).getMonth() + 1,
        season: this.getSeason(new Date(flightData.date))
      };

      // Get prediction from Dataiku
      const prediction = await dataikuService.predictFlightPrice(features);

      return {
        predictedPrice: prediction[0]?.prediction || 0,
        confidence: prediction[0]?.confidence || 0,
        features: features,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to predict flight price:', error.message);
      throw error;
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics() {
    try {
      return await dataikuService.getModelMetrics(this.modelName);
    } catch (error) {
      logger.error('Failed to get flight model metrics:', error.message);
      throw error;
    }
  }

  /**
   * Batch predict prices for multiple flights
   */
  async batchPredictPrices(flights) {
    try {
      logger.info(`Batch predicting prices for ${flights.length} flights`);

      const predictions = [];

      for (const flight of flights) {
        try {
          const prediction = await this.predictPrice(flight);
          predictions.push({
            flight: flight,
            prediction: prediction
          });
        } catch (error) {
          logger.error(`Failed to predict price for flight ${flight.id}:`, error.message);
          predictions.push({
            flight: flight,
            error: error.message
          });
        }
      }

      return predictions;

    } catch (error) {
      logger.error('Batch prediction failed:', error.message);
      throw error;
    }
  }
}

module.exports = new FlightPricePredictionService();