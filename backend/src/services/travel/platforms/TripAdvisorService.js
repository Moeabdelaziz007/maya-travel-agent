/**
 * TripAdvisor Platform Service
 * Handles all TripAdvisor API interactions
 */

const axios = require('axios');
const PlatformAdapter = require('./PlatformAdapter');

class TripAdvisorService extends PlatformAdapter {
  constructor() {
    super({
      baseURL: 'https://tripadvisor16.p.rapidapi.com/api/v1',
      apiKey: process.env.TRIPADVISOR_API_KEY,
      host: 'tripadvisor16.p.rapidapi.com',
      timeout: 10000,
      platform: 'tripadvisor'
    });
  }

  /**
   * Search hotels on TripAdvisor (not supported)
   */
  async searchHotels(params) {
    // TripAdvisor doesn't provide hotel search through this API
    return [];
  }

  /**
   * Get hotel details (not supported)
   */
  async getHotelDetails(hotelId) {
    throw new Error('Hotel details not supported on TripAdvisor platform');
  }

  /**
   * Check hotel availability (not supported)
   */
  async checkAvailability(hotelId, checkin, checkout, guests = 1) {
    throw new Error('Hotel availability not supported on TripAdvisor platform');
  }

  /**
   * Search activities on TripAdvisor
   */
  async searchActivities(params) {
    const { destination } = params;
    const locationId = await this.getLocationId(destination);

    const [attractions, restaurants] = await Promise.allSettled([
      this.searchAttractions({ locationId }),
      this.searchRestaurants({ locationId })
    ]);

    const activities = [];

    if (attractions.status === 'fulfilled') {
      activities.push(...attractions.value);
    }

    if (restaurants.status === 'fulfilled') {
      activities.push(...restaurants.value);
    }

    return activities;
  }

  /**
   * Search restaurants on TripAdvisor
   */
  async searchRestaurants(params) {
    try {
      const { locationId, query } = params;

      if (!this.apiKey) {
        throw new Error('TripAdvisor API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/restaurant/searchRestaurants`, {
        params: {
          locationId: locationId || await this.getLocationId(query || 'Paris')
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatRestaurantResults(response.data?.data || []);
    } catch (error) {
      throw new Error(`TripAdvisor restaurants search failed: ${error.message}`);
    }
  }

  /**
   * Search attractions on TripAdvisor
   */
  async searchAttractions(params) {
    try {
      const { locationId, query } = params;

      if (!this.apiKey) {
        throw new Error('TripAdvisor API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/attraction/searchAttractions`, {
        params: {
          locationId: locationId || await this.getLocationId(query || 'Paris')
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatAttractionResults(response.data?.data || []);
    } catch (error) {
      throw new Error(`TripAdvisor attractions search failed: ${error.message}`);
    }
  }

  /**
   * Get restaurant details by ID
   */
  async getRestaurantDetails(restaurantId) {
    try {
      if (!this.apiKey) {
        throw new Error('TripAdvisor API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/restaurant/getRestaurantDetails`, {
        params: {
          restaurantId: restaurantId
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatRestaurantDetails(response.data);
    } catch (error) {
      throw new Error(`TripAdvisor restaurant details failed: ${error.message}`);
    }
  }

  /**
   * Get attraction details by ID
   */
  async getAttractionDetails(attractionId) {
    try {
      if (!this.apiKey) {
        throw new Error('TripAdvisor API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/attraction/getAttractionDetails`, {
        params: {
          attractionId: attractionId
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatAttractionDetails(response.data);
    } catch (error) {
      throw new Error(`TripAdvisor attraction details failed: ${error.message}`);
    }
  }

  /**
   * Get location ID for a city
   */
  async getLocationId(destination) {
    // This would typically involve a separate API call to get location IDs
    // For now, return a mapping of common destinations
    const locations = {
      'paris': '187147',
      'london': '186338',
      'tokyo': '298184',
      'new york': '60763',
      'barcelona': '187497',
      'rome': '187791',
      'amsterdam': '188590',
      'berlin': '187323',
      'madrid': '187514',
      'vienna': '190454'
    };

    return locations[destination.toLowerCase()] || '187147'; // Default to Paris
  }

  /**
   * Format restaurant search results
   */
  formatRestaurantResults(restaurants) {
    return restaurants.map(restaurant => ({
      id: restaurant.restaurantId,
      name: restaurant.name,
      platform: 'tripadvisor',
      rating: restaurant.averageRating,
      reviewCount: restaurant.userReviewCount,
      priceRange: restaurant.priceRange,
      image: restaurant.heroImgUrl,
      location: {
        city: restaurant.location?.city,
        address: restaurant.location?.address,
        latitude: restaurant.location?.latitude,
        longitude: restaurant.location?.longitude
      },
      cuisine: restaurant.cuisine || [],
      dietaryRestrictions: restaurant.dietaryRestrictions || [],
      awards: restaurant.awards || [],
      phone: restaurant.phone,
      website: restaurant.website
    }));
  }

  /**
   * Format attraction search results
   */
  formatAttractionResults(attractions) {
    return attractions.map(attraction => ({
      id: attraction.attractionId,
      name: attraction.name,
      platform: 'tripadvisor',
      rating: attraction.averageRating,
      reviewCount: attraction.userReviewCount,
      image: attraction.heroImgUrl,
      location: {
        city: attraction.location?.city,
        address: attraction.location?.address,
        latitude: attraction.location?.latitude,
        longitude: attraction.location?.longitude
      },
      category: attraction.category,
      subcategory: attraction.subcategory,
      phone: attraction.phone,
      website: attraction.website,
      duration: attraction.duration,
      price: attraction.price
    }));
  }

  /**
   * Format restaurant details
   */
  formatRestaurantDetails(restaurantData) {
    return {
      id: restaurantData.restaurantId,
      name: restaurantData.name,
      platform: 'tripadvisor',
      description: restaurantData.description,
      rating: restaurantData.averageRating,
      reviewCount: restaurantData.userReviewCount,
      priceRange: restaurantData.priceRange,
      images: restaurantData.images?.map(img => img.url) || [],
      location: {
        address: restaurantData.location?.address,
        city: restaurantData.location?.city,
        latitude: restaurantData.location?.latitude,
        longitude: restaurantData.location?.longitude
      },
      contact: {
        phone: restaurantData.phone,
        website: restaurantData.website,
        email: restaurantData.email
      },
      cuisine: restaurantData.cuisine || [],
      dietaryRestrictions: restaurantData.dietaryRestrictions || [],
      features: restaurantData.features || [],
      awards: restaurantData.awards || [],
      hours: restaurantData.hours || {},
      menu: restaurantData.menu || []
    };
  }

  /**
   * Format attraction details
   */
  formatAttractionDetails(attractionData) {
    return {
      id: attractionData.attractionId,
      name: attractionData.name,
      platform: 'tripadvisor',
      description: attractionData.description,
      rating: attractionData.averageRating,
      reviewCount: attractionData.userReviewCount,
      images: attractionData.images?.map(img => img.url) || [],
      location: {
        address: attractionData.location?.address,
        city: attractionData.location?.city,
        latitude: attractionData.location?.latitude,
        longitude: attractionData.location?.longitude
      },
      contact: {
        phone: attractionData.phone,
        website: attractionData.website,
        email: attractionData.email
      },
      category: attractionData.category,
      subcategory: attractionData.subcategory,
      duration: attractionData.duration,
      price: attractionData.price,
      features: attractionData.features || [],
      awards: attractionData.awards || [],
      hours: attractionData.hours || {}
    };
  }

  /**
   * Health check for TripAdvisor API
   */
  async healthCheck() {
    try {
      if (!this.apiKey) {
        return {
          status: 'error',
          error: 'API key not configured'
        };
      }

      // Simple health check
      await axios.get(`${this.baseURL}/restaurant/searchRestaurants`, {
        params: {
          locationId: '187147' // Paris
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: 5000
      });

      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = TripAdvisorService;