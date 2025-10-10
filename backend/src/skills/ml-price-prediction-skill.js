/**
 * ML Price Prediction Skill
 * Integrates Dataiku ML models for flight and hotel price predictions
 */
const AbstractSkill = require('./abstract-skill');
const flightPricePrediction = require('../services/flight-price-prediction');
const hotelPricePrediction = require('../services/hotel-price-prediction');
const logger = require('../utils/logger');

class MLPricePredictionSkill extends AbstractSkill {
  constructor() {
    super();
    this.name = 'MLPricePrediction';
    this.description = 'Uses Dataiku ML models to predict optimal prices for flights and hotels';
    this.category = 'prediction';
    this.capabilities = [
      'flight_price_prediction',
      'hotel_price_prediction',
      'price_optimization',
      'market_analysis'
    ];
  }

  /**
   * Execute price prediction skill
   */
  async execute(params, context) {
    const startTime = Date.now();

    try {
      logger.info('🤖 Executing ML Price Prediction Skill', {
        userId: context.userId,
        capabilities: params.capabilities || 'auto-detect'
      });

      const results = [];

      // Determine what type of prediction is needed
      const predictionType = this.determinePredictionType(params, context);

      switch (predictionType) {
        case 'flight': {
            const flightResult = await this.predictFlightPrices(params, context);
            results.push(flightResult);
            break;
          }

        case 'hotel': {
            const hotelResult = await this.predictHotelPrices(params, context);
            results.push(hotelResult);
            break;
          }

        case 'both': {
            const [flightPredictions, hotelPredictions] = await Promise.all([
              this.predictFlightPrices(params, context),
              this.predictHotelPrices(params, context)
            ]);
            results.push(flightPredictions, hotelPredictions);
            break;
          }

        default:
          throw new Error(`Unsupported prediction type: ${predictionType}`);
      }

      // Generate insights and recommendations
      const insights = await this.generatePriceInsights(results, params, context);

      const executionTime = Date.now() - startTime;

      logger.info('✅ ML Price Prediction completed', {
        executionTime,
        predictionsGenerated: results.length,
        insightsGenerated: insights.length
      });

      return {
        success: true,
        data: {
          predictions: results,
          insights: insights,
          recommendations: this.generateRecommendations(results, insights),
          metadata: {
            executionTime,
            predictionType,
            modelsUsed: ['flight_price_model', 'hotel_price_model'],
            dataikuIntegration: true
          }
        },
        executionTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('❌ ML Price Prediction failed', {
        error: error.message,
        executionTime: Date.now() - startTime
      });

      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Determine what type of prediction is needed
   */
  determinePredictionType(params, context) {
    // Check explicit request
    if (params.type === 'flight') return 'flight';
    if (params.type === 'hotel') return 'hotel';
    if (params.type === 'both') return 'both';

    // Check context for travel intent
    const message = context.message || params.message || '';
    const lowerMessage = message.toLowerCase();

    const flightKeywords = ['flight', 'plane', 'airplane', 'fly', 'airport', 'departure', 'arrival'];
    const hotelKeywords = ['hotel', 'accommodation', 'stay', 'room', 'check-in', 'check-out'];

    const hasFlightKeywords = flightKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasHotelKeywords = hotelKeywords.some(keyword => lowerMessage.includes(keyword));

    if (hasFlightKeywords && hasHotelKeywords) return 'both';
    if (hasFlightKeywords) return 'flight';
    if (hasHotelKeywords) return 'hotel';

    // Default to both if unclear
    return 'both';
  }

  /**
   * Predict flight prices
   */
  async predictFlightPrices(params, context) {
    try {
      // Extract flight search criteria
      const flightCriteria = this.extractFlightCriteria(params, context);

      // Get predictions for multiple flights if batch data provided
      if (params.flights && Array.isArray(params.flights)) {
        const predictions = await flightPricePrediction.batchPredictPrices(params.flights);
        return {
          type: 'flight_batch',
          criteria: flightCriteria,
          predictions: predictions,
          count: predictions.length,
          success: true
        };
      }

      // Single flight prediction
      const prediction = await flightPricePrediction.predictPrice(flightCriteria);

      return {
        type: 'flight_single',
        criteria: flightCriteria,
        prediction: prediction,
        success: true
      };

    } catch (error) {
      logger.error('Flight price prediction failed:', error.message);
      return {
        type: 'flight_error',
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Predict hotel prices
   */
  async predictHotelPrices(params, context) {
    try {
      // Extract hotel search criteria
      const hotelCriteria = this.extractHotelCriteria(params, context);

      // Get predictions for multiple hotels if batch data provided
      if (params.hotels && Array.isArray(params.hotels)) {
        const predictions = await hotelPricePrediction.batchPredictPrices(params.hotels);
        return {
          type: 'hotel_batch',
          criteria: hotelCriteria,
          predictions: predictions,
          count: predictions.length,
          success: true
        };
      }

      // Single hotel prediction
      const prediction = await hotelPricePrediction.predictPrice(hotelCriteria);

      return {
        type: 'hotel_single',
        criteria: hotelCriteria,
        prediction: prediction,
        success: true
      };

    } catch (error) {
      logger.error('Hotel price prediction failed:', error.message);
      return {
        type: 'hotel_error',
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Extract flight search criteria from parameters
   */
  extractFlightCriteria(params, context) {
    return {
      departureAirport: params.departureAirport || params.from || 'JFK',
      arrivalAirport: params.arrivalAirport || params.to || 'LAX',
      date: params.date || params.departureDate || new Date().toISOString().split('T')[0],
      airline: params.airline,
      returnDate: params.returnDate,
      passengers: params.passengers || 1,
      class: params.class || 'economy'
    };
  }

  /**
   * Extract hotel search criteria from parameters
   */
  extractHotelCriteria(params, context) {
    return {
      name: params.hotelName || params.name,
      city: params.city || params.destination,
      country: params.country,
      checkInDate: params.checkInDate || params.checkin,
      checkOutDate: params.checkOutDate || params.checkout,
      guests: params.guests || 2,
      rooms: params.rooms || 1,
      starRating: params.starRating
    };
  }

  /**
   * Generate price insights from predictions
   */
  async generatePriceInsights(predictions, params, context) {
    const insights = [];

    for (const prediction of predictions) {
      if (!prediction.success) continue;

      if (prediction.type.includes('flight')) {
        insights.push(...this.generateFlightInsights(prediction));
      }

      if (prediction.type.includes('hotel')) {
        insights.push(...this.generateHotelInsights(prediction));
      }
    }

    return insights;
  }

  /**
   * Generate flight-specific insights
   */
  generateFlightInsights(flightPrediction) {
    const insights = [];

    if (flightPrediction.type === 'flight_batch') {
      const predictions = flightPrediction.predictions.filter(p => p.prediction);

      if (predictions.length > 0) {
        const prices = predictions.map(p => p.prediction.predictedPrice);
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        insights.push({
          type: 'flight_price_range',
          message: `Flight prices range from $${minPrice.toFixed(0)} to $${maxPrice.toFixed(0)}`,
          averagePrice: avgPrice,
          confidence: 'high'
        });

        // Find best value
        const bestValue = predictions.find(p => p.prediction.predictedPrice === minPrice);
        if (bestValue) {
          insights.push({
            type: 'flight_best_value',
            message: `Best value flight: ${bestValue.flight.airline} for $${minPrice.toFixed(0)}`,
            recommendation: 'book_now',
            urgency: 'medium'
          });
        }
      }
    }

    return insights;
  }

  /**
   * Generate hotel-specific insights
   */
  generateHotelInsights(hotelPrediction) {
    const insights = [];

    if (hotelPrediction.type === 'hotel_batch') {
      const predictions = hotelPrediction.predictions.filter(p => p.prediction);

      if (predictions.length > 0) {
        const prices = predictions.map(p => p.prediction.predictedPrice);
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const minPrice = Math.min(...prices);

        insights.push({
          type: 'hotel_price_range',
          message: `Hotel prices average $${avgPrice.toFixed(0)} per night`,
          averagePrice: avgPrice,
          confidence: 'high'
        });

        // Find best deal
        const bestDeal = predictions.find(p => p.prediction.predictedPrice === minPrice);
        if (bestDeal) {
          insights.push({
            type: 'hotel_best_deal',
            message: `Best deal: ${bestDeal.hotel.name} for $${minPrice.toFixed(0)}/night`,
            recommendation: 'book_soon',
            urgency: 'high'
          });
        }
      }
    }

    return insights;
  }

  /**
   * Generate recommendations based on predictions and insights
   */
  generateRecommendations(predictions, insights) {
    const recommendations = [];

    // Overall booking strategy
    const highUrgencyInsights = insights.filter(i => i.urgency === 'high');
    const mediumUrgencyInsights = insights.filter(i => i.urgency === 'medium');

    if (highUrgencyInsights.length > 0) {
      recommendations.push({
        type: 'urgent_booking',
        priority: 'high',
        message: 'Book now to secure the best prices',
        actions: ['compare_options', 'book_immediately', 'set_price_alerts']
      });
    }

    if (mediumUrgencyInsights.length > 0) {
      recommendations.push({
        type: 'monitor_prices',
        priority: 'medium',
        message: 'Monitor prices for the next few days',
        actions: ['set_alerts', 'check_back_tomorrow', 'compare_alternatives']
      });
    }

    // Price optimization tips
    recommendations.push({
      type: 'price_optimization',
      priority: 'low',
      message: 'Consider flexible dates for better prices',
      actions: ['try_adjacent_dates', 'consider_nearby_airports', 'look_for_packages']
    });

    return recommendations;
  }

  /**
   * Get skill health status
   */
  async healthCheck() {
    try {
      // Test Dataiku connection
      const dataikuHealth = await flightPricePrediction.getModelMetrics();

      return {
        status: 'healthy',
        details: {
          dataiku_connected: true,
          models_available: ['flight_price', 'hotel_price'],
          last_training: dataikuHealth?.lastTraining || 'unknown'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: {
          dataiku_connected: false,
          models_available: []
        }
      };
    }
  }

  /**
   * Get skill metrics
   */
  getMetrics() {
    return {
      predictions_made: this.executionCount || 0,
      success_rate: this.successCount || 0,
      average_execution_time: this.averageExecutionTime || 0,
      models_used: ['flight_price_model', 'hotel_price_model']
    };
  }
}

module.exports = MLPricePredictionSkill;