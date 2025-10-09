/**
 * Booking.com Platform Service
 * Handles all Booking.com API interactions
 */

const axios = require('axios');
const PlatformAdapter = require('./PlatformAdapter');

class BookingService extends PlatformAdapter {
  constructor() {
    super({
      baseURL: 'https://booking-com.p.rapidapi.com/v1',
      apiKey: process.env.BOOKING_API_KEY,
      host: 'booking-com.p.rapidapi.com',
      timeout: 10000,
      platform: 'booking'
    });
  }

  /**
   * Search hotels on Booking.com
   */
  async searchHotels(params) {
    try {
      const { destination, checkin, checkout, guests = 1, room_qty = 1 } = params;

      if (!this.apiKey) {
        throw new Error('Booking.com API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/hotels/search`, {
        params: {
          dest_id: await this.getDestinationId(destination),
          search_type: 'city',
          arrival_date: checkin,
          departure_date: checkout,
          adults: guests,
          room_qty: room_qty,
          page_number: 0,
          languagecode: 'en-us',
          currency_code: 'USD'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatHotelResults(response.data?.result || []);
    } catch (error) {
      throw new Error(`Booking.com search failed: ${error.message}`);
    }
  }

  /**
   * Get hotel details by ID
   */
  async getHotelDetails(hotelId) {
    try {
      if (!this.apiKey) {
        throw new Error('Booking.com API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/hotels/data`, {
        params: {
          hotel_id: hotelId,
          languagecode: 'en-us',
          currency_code: 'USD'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatHotelDetails(response.data);
    } catch (error) {
      throw new Error(`Booking.com hotel details failed: ${error.message}`);
    }
  }

  /**
   * Get destination ID for a city
   */
  async getDestinationId(destination) {
    // This would typically involve a separate API call to get destination IDs
    // For now, return a mapping of common destinations
    const destinations = {
      'paris': '41',
      'london': '42',
      'tokyo': '43',
      'new york': '44',
      'barcelona': '45',
      'rome': '46',
      'amsterdam': '47',
      'berlin': '48',
      'madrid': '49',
      'vienna': '50'
    };

    return destinations[destination.toLowerCase()] || '41'; // Default to Paris
  }

  /**
   * Format hotel search results
   */
  formatHotelResults(hotels) {
    return hotels.map(hotel => ({
      id: hotel.hotel_id,
      name: hotel.hotel_name,
      platform: 'booking',
      price: hotel.min_total_price,
      currency: 'USD',
      rating: hotel.review_score,
      reviewCount: hotel.review_nr,
      image: hotel.main_photo_url,
      location: {
        city: hotel.city,
        address: hotel.address,
        latitude: hotel.latitude,
        longitude: hotel.longitude
      },
      amenities: hotel.facilities || [],
      roomTypes: hotel.room_data?.map(room => ({
        name: room.name,
        price: room.price_breakdown?.gross_price
      })) || [],
      checkInTime: hotel.checkin?.from,
      checkOutTime: hotel.checkout?.until,
      cancellationPolicy: hotel.cancellation_info || 'Standard policy'
    }));
  }

  /**
   * Format hotel details
   */
  formatHotelDetails(hotelData) {
    return {
      id: hotelData.hotel_id,
      name: hotelData.hotel_name,
      platform: 'booking',
      description: hotelData.description,
      rating: hotelData.review_score,
      reviewCount: hotelData.review_nr,
      images: hotelData.photos?.map(photo => photo.url) || [],
      location: {
        address: hotelData.address,
        city: hotelData.city,
        latitude: hotelData.latitude,
        longitude: hotelData.longitude
      },
      amenities: hotelData.facilities || [],
      policies: {
        checkIn: hotelData.checkin,
        checkOut: hotelData.checkout,
        cancellation: hotelData.cancellation_info
      },
      contact: {
        phone: hotelData.phone,
        email: hotelData.email
      }
    };
  }

  /**
   * Check availability for specific dates
   */
  async checkAvailability(hotelId, checkin, checkout, guests = 1) {
    try {
      if (!this.apiKey) {
        throw new Error('Booking.com API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/hotels/availability`, {
        params: {
          hotel_id: hotelId,
          arrival_date: checkin,
          departure_date: checkout,
          adults: guests,
          room_qty: 1,
          languagecode: 'en-us',
          currency_code: 'USD'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatAvailabilityResults(response.data);
    } catch (error) {
      throw new Error(`Booking.com availability check failed: ${error.message}`);
    }
  }

  /**
   * Format availability results
   */
  formatAvailabilityResults(availabilityData) {
    return {
      available: availabilityData.available || false,
      rooms: availabilityData.rooms?.map(room => ({
        id: room.room_id,
        name: room.name,
        price: room.price,
        currency: room.currency,
        available: room.available,
        maxOccupancy: room.max_occupancy
      })) || []
    };
  }

  /**
   * Health check for Booking.com API
   */
  async healthCheck() {
    try {
      if (!this.apiKey) {
        return {
          status: 'error',
          error: 'API key not configured'
        };
      }

      // Simple health check - try to get a basic response
      await axios.get(`${this.baseURL}/hotels/search`, {
        params: {
          dest_id: '41', // Paris
          arrival_date: '2024-01-15',
          departure_date: '2024-01-16',
          adults: 1,
          room_qty: 1,
          page_number: 0,
          languagecode: 'en-us',
          currency_code: 'USD'
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

module.exports = BookingService;