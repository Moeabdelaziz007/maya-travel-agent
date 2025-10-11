const AmadeusService = require('../services/amadeus-service');

/**
 * Amadeus Flight Search Agent
 * Uses Amadeus Travel API for real flight search functionality
 */
class AmadeusFlightAgent {
  constructor() {
    this.capabilities = ['flight_search', 'price_comparison', 'flight_booking'];
    this.priority = 1; // Higher priority than mock agent
    this.timeout = 10000; // Longer timeout for API calls
  }

  async execute(context) {
    try {
      const {
        origin,
        destination,
        departure_date,
        return_date,
        travelers = 1,
        travel_class = 'ECONOMY',
        non_stop = false,
        max_results = 10
      } = context;

      // Validate required parameters
      if (!origin || !destination || !departure_date) {
        return {
          agent: 'flight_search',
          success: false,
          error: 'Missing required parameters: origin, destination, and departure_date are required',
          timestamp: new Date().toISOString()
        };
      }

      // Call Amadeus API
      const searchParams = {
        originLocationCode: origin.toUpperCase(),
        destinationLocationCode: destination.toUpperCase(),
        departureDate: departure_date,
        returnDate: return_date,
        adults: travelers,
        travelClass: travel_class.toUpperCase(),
        nonStop: non_stop,
        max: max_results
      };

      const result = await AmadeusService.searchFlights(searchParams);

      if (!result.success) {
        return {
          agent: 'flight_search',
          success: false,
          error: result.error,
          code: result.code,
          timestamp: new Date().toISOString()
        };
      }

      // Transform Amadeus response to our format
      const flights = this.transformFlightData(result.data);

      return {
        agent: 'flight_search',
        success: true,
        results: flights,
        search_params: searchParams,
        meta: result.meta,
        warnings: result.warnings,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Amadeus Flight Agent error:', error);
      return {
        agent: 'flight_search',
        success: false,
        error: error.message || 'Flight search failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Transform Amadeus flight data to our internal format
   * @param {Array} amadeusData - Raw Amadeus flight offers
   * @returns {Array} Transformed flight data
   */
  transformFlightData(amadeusData) {
    return amadeusData.map((offer, index) => {
      const itinerary = offer.itineraries[0]; // Take first itinerary
      const segment = itinerary.segments[0]; // Take first segment
      const price = offer.price;

      return {
        id: offer.id || `flight_${index + 1}`,
        airline: segment.carrierCode,
        flight_number: `${segment.carrierCode}_${segment.number}`,
        origin: segment.departure.iataCode,
        destination: segment.arrival.iataCode,
        departure_date: segment.departure.at.split('T')[0],
        departure_time: segment.departure.at.split('T')[1],
        arrival_date: segment.arrival.at.split('T')[0],
        arrival_time: segment.arrival.at.split('T')[1],
        return_date: offer.itineraries[1]?.segments[0]?.departure.at.split('T')[0] || null,
        price: parseFloat(price.total),
        currency: price.currency,
        duration: this.formatDuration(itinerary.duration),
        stops: itinerary.segments.length - 1,
        aircraft: segment.aircraft?.code || 'Unknown',
        class: offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'ECONOMY',
        available_seats: offer.numberOfBookableSeats || null,
        baggage_included: offer.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags?.quantity > 0,
        refundable: offer.travelerPricings[0]?.fareDetailsBySegment[0]?.isRefundable || false,
        raw_data: offer // Keep original data for reference
      };
    });
  }

  /**
   * Format ISO 8601 duration to human readable format
   * @param {string} duration - ISO 8601 duration (e.g., "PT1H30M")
   * @returns {string} Human readable duration (e.g., "1h 30m")
   */
  formatDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return duration;

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Get flight pricing for a specific offer
   * @param {string} flightOfferId - Amadeus flight offer ID
   * @returns {Promise<Object>} Pricing information
   */
  async getPricing(flightOfferId) {
    try {
      const result = await AmadeusService.getFlightPricing(flightOfferId);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          code: result.code
        };
      }

      return {
        success: true,
        pricing: result.data
      };
    } catch (error) {
      console.error('Flight pricing error:', error);
      return {
        success: false,
        error: error.message || 'Pricing request failed'
      };
    }
  }

  /**
   * Search for airports/locations
   * @param {string} keyword - Search keyword
   * @param {string} subType - Location type (AIRPORT, CITY)
   * @returns {Promise<Object>} Location search results
   */
  async searchLocations(keyword, subType = 'AIRPORT') {
    try {
      const result = await AmadeusService.searchLocations(keyword, subType);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          code: result.code
        };
      }

      return {
        success: true,
        locations: result.data.map(location => ({
          id: location.id,
          name: location.name,
          iataCode: location.iataCode,
          cityName: location.address?.cityName,
          countryName: location.address?.countryName,
          type: location.subType
        }))
      };
    } catch (error) {
      console.error('Location search error:', error);
      return {
        success: false,
        error: error.message || 'Location search failed'
      };
    }
  }
}

module.exports = AmadeusFlightAgent;