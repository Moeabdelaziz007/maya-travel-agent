/**
 * Hotel Price Prediction Service
 * Uses Dataiku ML models to predict hotel prices based on historical data
 */
const dataikuService = require('./dataiku-service');
const logger = require('../utils/logger');

class HotelPricePredictionService {
  constructor() {
    this.modelName = 'hotel_price_model';
    this.serviceName = 'hotel_price_prediction';
    this.datasetName = 'hotel_prices_dataset';
    this.folderName = 'hotel_price_data';
  }

  /**
   * Prepare hotel data for training
   */
  prepareTrainingData(hotels) {
    const trainingData = hotels.map(hotel => ({
      timestamp: hotel.checkInDate,
      hotel_name: hotel.name,
      city: hotel.city,
      country: hotel.country,
      star_rating: hotel.starRating,
      days_until_stay: this.calculateDaysUntilStay(hotel.checkInDate),
      length_of_stay: this.calculateLengthOfStay(hotel.checkInDate, hotel.checkOutDate),
      room_type: hotel.roomType,
      day_of_week: new Date(hotel.checkInDate).getDay(),
      month: new Date(hotel.checkInDate).getMonth() + 1,
      season: this.getSeason(new Date(hotel.checkInDate)),
      price: hotel.price,
      target: hotel.price // Target variable for prediction
    }));

    return trainingData;
  }

  /**
   * Calculate days until hotel stay
   */
  calculateDaysUntilStay(checkInDate) {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    const diffTime = checkIn - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate length of stay in nights
   */
  calculateLengthOfStay(checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut - checkIn;
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
   * Train hotel price prediction model
   */
  async trainModel(hotels) {
    try {
      logger.info('Training hotel price prediction model...');

      // Prepare training data
      const trainingData = this.prepareTrainingData(hotels);

      // Upload training data to Dataiku
      await dataikuService.uploadDataToFolder(
        this.folderName,
        'hotel_training_data.json',
        trainingData
      );

      // Create dataset from uploaded data
      await dataikuService.createDatasetFromFolder(
        this.folderName,
        'hotel_training_data.json',
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

      logger.info('Hotel price prediction model trained and deployed successfully');
      return modelResult;

    } catch (error) {
      logger.error('Failed to train hotel price prediction model:', error.message);
      throw error;
    }
  }

  /**
   * Predict hotel price
   */
  async predictPrice(hotelData) {
    try {
      // Prepare features for prediction
      const features = {
        hotel_name: hotelData.name,
        city: hotelData.city,
        country: hotelData.country,
        star_rating: hotelData.starRating,
        days_until_stay: this.calculateDaysUntilStay(hotelData.checkInDate),
        length_of_stay: this.calculateLengthOfStay(hotelData.checkInDate, hotelData.checkOutDate),
        room_type: hotelData.roomType,
        day_of_week: new Date(hotelData.checkInDate).getDay(),
        month: new Date(hotelData.checkInDate).getMonth() + 1,
        season: this.getSeason(new Date(hotelData.checkInDate))
      };

      // Get prediction from Dataiku
      const prediction = await dataikuService.predictHotelPrice(features);

      return {
        predictedPrice: prediction[0]?.prediction || 0,
        confidence: prediction[0]?.confidence || 0,
        features: features,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to predict hotel price:', error.message);
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
      logger.error('Failed to get hotel model metrics:', error.message);
      throw error;
    }
  }

  /**
   * Batch predict prices for multiple hotels
   */
  async batchPredictPrices(hotels) {
    try {
      logger.info(`Batch predicting prices for ${hotels.length} hotels`);

      const predictions = [];

      for (const hotel of hotels) {
        try {
          const prediction = await this.predictPrice(hotel);
          predictions.push({
            hotel: hotel,
            prediction: prediction
          });
        } catch (error) {
          logger.error(`Failed to predict price for hotel ${hotel.id}:`, error.message);
          predictions.push({
            hotel: hotel,
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

  /**
   * Get price trends for a specific hotel
   */
  async getPriceTrends(hotelName, city, days = 30) {
    try {
      // This would typically query historical price data
      // For now, return mock trend data
      const trends = [];
      const today = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        trends.push({
          date: date.toISOString().split('T')[0],
          predictedPrice: Math.random() * 200 + 100, // Mock price between 100-300
          confidence: 0.8 + Math.random() * 0.2 // Mock confidence 80-100%
        });
      }

      return trends;

    } catch (error) {
      logger.error('Failed to get price trends:', error.message);
      throw error;
    }
  }
}

module.exports = new HotelPricePredictionService();