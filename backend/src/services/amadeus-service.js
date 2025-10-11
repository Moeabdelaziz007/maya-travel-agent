const Amadeus = require('amadeus');

/**
 * Amadeus Travel API Service
 * Provides integration with Amadeus Travel APIs for flight search, booking, and more
 */
class AmadeusService {
  constructor() {
    this.amadeus = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET,
      hostname: process.env.NODE_ENV === 'production' ? 'production' : 'test'
    });
  }

  /**
   * Search for flight offers
   * @param {Object} params - Search parameters
   * @param {string} params.originLocationCode - Origin airport code (e.g., 'JFK')
   * @param {string} params.destinationLocationCode - Destination airport code (e.g., 'LAX')
   * @param {string} params.departureDate - Departure date (YYYY-MM-DD)
   * @param {string} params.returnDate - Return date (YYYY-MM-DD) - optional
   * @param {number} params.adults - Number of adult passengers
   * @param {number} params.children - Number of children - optional
   * @param {string} params.travelClass - Travel class (ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST) - optional
   * @param {boolean} params.nonStop - Non-stop flights only - optional
   * @param {number} params.max - Maximum number of results - optional
   * @returns {Promise<Object>} Flight offers data
   */
  async searchFlights(params) {
    try {
      const response = await this.amadeus.shopping.flightOffersSearch.get({
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        adults: params.adults || 1,
        children: params.children || 0,
        travelClass: params.travelClass || 'ECONOMY',
        nonStop: params.nonStop || false,
        max: params.max || 10
      });

      return {
        success: true,
        data: response.data,
        meta: response.meta,
        warnings: response.warnings
      };
    } catch (error) {
      console.error('Amadeus flight search error:', error);
      return {
        success: false,
        error: error.message || 'Flight search failed',
        code: error.code
      };
    }
  }

  /**
   * Get flight offer pricing
   * @param {string} flightOfferId - Flight offer ID
   * @returns {Promise<Object>} Pricing data
   */
  async getFlightPricing(flightOfferId) {
    try {
      const response = await this.amadeus.shopping.flightOffers.pricing.post({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [{ id: flightOfferId }]
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Amadeus pricing error:', error);
      return {
        success: false,
        error: error.message || 'Pricing request failed',
        code: error.code
      };
    }
  }

  /**
   * Search for hotels
   * @param {Object} params - Hotel search parameters
   * @param {string} params.cityCode - City code (e.g., 'PAR' for Paris)
   * @param {string} params.checkInDate - Check-in date (YYYY-MM-DD)
   * @param {string} params.checkOutDate - Check-out date (YYYY-MM-DD)
   * @param {number} params.adults - Number of adults
   * @param {number} params.radius - Search radius in km - optional
   * @param {number} params.radiusUnit - Radius unit (KM or MILE) - optional
   * @returns {Promise<Object>} Hotel search results
   */
  async searchHotels(params) {
    try {
      const response = await this.amadeus.shopping.hotelOffers.get({
        cityCode: params.cityCode,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults || 1,
        radius: params.radius || 5,
        radiusUnit: params.radiusUnit || 'KM'
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Amadeus hotel search error:', error);
      return {
        success: false,
        error: error.message || 'Hotel search failed',
        code: error.code
      };
    }
  }

  /**
   * Get airport and city search
   * @param {string} keyword - Search keyword (airport name, city name, or IATA code)
   * @param {string} subType - Search subtype (AIRPORT, CITY, etc.) - optional
   * @returns {Promise<Object>} Location data
   */
  async searchLocations(keyword, subType = 'AIRPORT') {
    try {
      const response = await this.amadeus.referenceData.locations.get({
        keyword: keyword,
        subType: subType
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Amadeus location search error:', error);
      return {
        success: false,
        error: error.message || 'Location search failed',
        code: error.code
      };
    }
  }

  /**
   * Get flight check-in links
   * @param {string} airlineCode - Airline IATA code
   * @param {string} language - Language code (e.g., 'en-US') - optional
   * @returns {Promise<Object>} Check-in links
   */
  async getCheckinLinks(airlineCode, language = 'en-US') {
    try {
      const response = await this.amadeus.referenceData.urls.checkinLinks.get({
        airlineCode: airlineCode,
        language: language
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Amadeus check-in links error:', error);
      return {
        success: false,
        error: error.message || 'Check-in links request failed',
        code: error.code
      };
    }
  }

  /**
   * Get travel restrictions
   * @param {string} originLocationCode - Origin location code
   * @param {string} destinationLocationCode - Destination location code
   * @returns {Promise<Object>} Travel restrictions data
   */
  async getTravelRestrictions(originLocationCode, destinationLocationCode) {
    try {
      const response = await this.amadeus.dutyOfCare.diseases.covid19AreaReport.get({
        countryCode: destinationLocationCode
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Amadeus travel restrictions error:', error);
      return {
        success: false,
        error: error.message || 'Travel restrictions request failed',
        code: error.code
      };
    }
  }

  /**
   * Create flight booking order
   * @param {Object} orderData - Order data
   * @param {Array} orderData.flightOffers - Flight offers array
   * @param {Array} orderData.travelers - Travelers array
   * @param {Object} orderData.contacts - Contact information
   * @returns {Promise<Object>} Booking confirmation
   */
  async createFlightOrder(orderData) {
    try {
      const response = await this.amadeus.booking.flightOrders.post({
        data: {
          type: 'flight-order',
          flightOffers: orderData.flightOffers,
          travelers: orderData.travelers,
          contacts: orderData.contacts
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Amadeus flight booking error:', error);
      return {
        success: false,
        error: error.message || 'Flight booking failed',
        code: error.code
      };
    }
  }

  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  async getBooking(bookingId) {
    try {
      const response = await this.amadeus.booking.flightOrder(bookingId).get();

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Amadeus booking retrieval error:', error);
      return {
        success: false,
        error: error.message || 'Booking retrieval failed',
        code: error.code
      };
    }
  }

  /**
   * Delete booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteBooking(bookingId) {
    try {
      const response = await this.amadeus.booking.flightOrder(bookingId).delete();

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Amadeus booking deletion error:', error);
      return {
        success: false,
        error: error.message || 'Booking deletion failed',
        code: error.code
      };
    }
  }
}

module.exports = new AmadeusService();