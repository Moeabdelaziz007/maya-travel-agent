/**
 * Base Platform Adapter
 * Defines the common interface for all travel platform implementations
 */

class PlatformAdapter {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.host = config.host;
    this.timeout = config.timeout || 10000;
    this.platform = config.platform;
  }

  /**
   * Search hotels on the platform
   * @param {Object} params - Search parameters
   * @returns {Promise<Array>} Array of hotel results
   */
  async searchHotels(params) {
    throw new Error('searchHotels method must be implemented by subclass');
  }

  /**
   * Get detailed information about a specific hotel
   * @param {string} hotelId - Hotel ID
   * @returns {Promise<Object>} Hotel details
   */
  async getHotelDetails(hotelId) {
    throw new Error('getHotelDetails method must be implemented by subclass');
  }

  /**
   * Search flights on the platform (optional)
   * @param {Object} params - Flight search parameters
   * @returns {Promise<Array>} Array of flight results
   */
  async searchFlights(params) {
    // Default implementation returns empty array
    return [];
  }

  /**
   * Search activities/attractions on the platform (optional)
   * @param {Object} params - Activity search parameters
   * @returns {Promise<Array>} Array of activity results
   */
  async searchActivities(params) {
    // Default implementation returns empty array
    return [];
  }

  /**
   * Check availability for a hotel
   * @param {string} hotelId - Hotel ID
   * @param {string} checkin - Check-in date
   * @param {string} checkout - Check-out date
   * @param {number} guests - Number of guests
   * @returns {Promise<Object>} Availability information
   */
  async checkAvailability(hotelId, checkin, checkout, guests = 1) {
    throw new Error('checkAvailability method must be implemented by subclass');
  }

  /**
   * Perform health check for the platform
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      if (!this.apiKey) {
        return {
          status: 'error',
          error: 'API key not configured'
        };
      }
      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get platform name
   * @returns {string} Platform name
   */
  getPlatformName() {
    return this.platform;
  }

  /**
   * Check if API key is configured
   * @returns {boolean} True if API key is available
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Create axios config with common headers
   * @param {Object} additionalParams - Additional request parameters
   * @returns {Object} Axios config object
   */
  createRequestConfig(additionalParams = {}) {
    return {
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': this.host
      },
      timeout: this.timeout,
      ...additionalParams
    };
  }
}

module.exports = PlatformAdapter;