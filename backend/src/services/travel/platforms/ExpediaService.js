/**
 * Expedia Platform Service
 * Handles all Expedia API interactions
 */

const axios = require('axios');
const PlatformAdapter = require('./PlatformAdapter');

class ExpediaService extends PlatformAdapter {
  constructor() {
    super({
      baseURL: 'https://expedia-com-provider.p.rapidapi.com/v1',
      apiKey: process.env.EXPEDIA_API_KEY,
      host: 'expedia-com-provider.p.rapidapi.com',
      timeout: 10000,
      platform: 'expedia'
    });
  }

  /**
   * Search hotels on Expedia
   */
  async searchHotels(params) {
    try {
      const { destination, checkin, checkout, guests = 1 } = params;

      if (!this.apiKey) {
        throw new Error('Expedia API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/hotels/search`, {
        params: {
          query: destination,
          checkIn: checkin,
          checkOut: checkout,
          adults: guests,
          currency: 'USD',
          language: 'en_US',
          siteid: '300000001' // Default site ID
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatHotelResults(response.data?.data || []);
    } catch (error) {
      throw new Error(`Expedia search failed: ${error.message}`);
    }
  }

  /**
   * Get hotel details by ID
   */
  async getHotelDetails(hotelId) {
    try {
      if (!this.apiKey) {
        throw new Error('Expedia API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/hotels/details`, {
        params: {
          hotelId: hotelId,
          currency: 'USD',
          language: 'en_US'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatHotelDetails(response.data);
    } catch (error) {
      throw new Error(`Expedia hotel details failed: ${error.message}`);
    }
  }

  /**
   * Search flights on Expedia
   */
  async searchFlights(params) {
    try {
      const { origin, destination, departureDate, returnDate, passengers = 1 } = params;

      if (!this.apiKey) {
        throw new Error('Expedia API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/flights/search`, {
        params: {
          origin: origin || 'NYC', // Default to NYC if not provided
          destination: destination,
          departureDate: departureDate,
          returnDate: returnDate,
          adults: passengers,
          currency: 'USD',
          language: 'en_US'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatFlightResults(response.data?.data || []);
    } catch (error) {
      throw new Error(`Expedia flights search failed: ${error.message}`);
    }
  }

  /**
   * Format hotel search results
   */
  formatHotelResults(hotels) {
    return hotels.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      platform: 'expedia',
      price: hotel.price?.lead?.amount,
      currency: hotel.price?.lead?.currency || 'USD',
      rating: hotel.rating,
      reviewCount: hotel.reviewCount,
      image: hotel.image?.url,
      location: {
        city: hotel.destination,
        address: hotel.address,
        latitude: hotel.latitude,
        longitude: hotel.longitude
      },
      amenities: hotel.amenities || [],
      starRating: hotel.starRating,
      guestRating: hotel.guestRating,
      checkInTime: hotel.checkInTime,
      checkOutTime: hotel.checkOutTime
    }));
  }

  /**
   * Format hotel details
   */
  formatHotelDetails(hotelData) {
    return {
      id: hotelData.id,
      name: hotelData.name,
      platform: 'expedia',
      description: hotelData.description,
      rating: hotelData.rating,
      reviewCount: hotelData.reviewCount,
      images: hotelData.images?.map(img => img.url) || [],
      location: {
        address: hotelData.address,
        city: hotelData.city,
        latitude: hotelData.latitude,
        longitude: hotelData.longitude
      },
      amenities: hotelData.amenities || [],
      policies: {
        checkIn: hotelData.checkInTime,
        checkOut: hotelData.checkOutTime,
        cancellation: hotelData.cancellationPolicy
      },
      contact: {
        phone: hotelData.phone,
        email: hotelData.email
      },
      starRating: hotelData.starRating,
      guestRating: hotelData.guestRating
    };
  }

  /**
   * Format flight results
   */
  formatFlightResults(flights) {
    return flights.map(flight => ({
      id: flight.id,
      platform: 'expedia',
      price: flight.price?.total,
      currency: flight.price?.currency || 'USD',
      duration: flight.duration,
      stops: flight.stops,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      departure: {
        airport: flight.departure?.airport,
        time: flight.departure?.time,
        date: flight.departure?.date
      },
      arrival: {
        airport: flight.arrival?.airport,
        time: flight.arrival?.time,
        date: flight.arrival?.date
      },
      aircraft: flight.aircraft,
      cabin: flight.cabin
    }));
  }

  /**
   * Check hotel availability
   */
  async checkAvailability(hotelId, checkin, checkout, guests = 1) {
    try {
      if (!this.apiKey) {
        throw new Error('Expedia API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/hotels/availability`, {
        params: {
          hotelId: hotelId,
          checkIn: checkin,
          checkOut: checkout,
          adults: guests,
          currency: 'USD',
          language: 'en_US'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatAvailabilityResults(response.data);
    } catch (error) {
      throw new Error(`Expedia availability check failed: ${error.message}`);
    }
  }

  /**
   * Format availability results
   */
  formatAvailabilityResults(availabilityData) {
    return {
      available: availabilityData.available || false,
      rooms: availabilityData.rooms?.map(room => ({
        id: room.roomId,
        name: room.name,
        price: room.price,
        currency: room.currency,
        available: room.available,
        maxOccupancy: room.maxOccupancy,
        amenities: room.amenities || []
      })) || []
    };
  }

  /**
   * Health check for Expedia API
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
      await axios.get(`${this.baseURL}/hotels/search`, {
        params: {
          query: 'Paris',
          checkIn: '2024-01-15',
          checkOut: '2024-01-16',
          adults: 1,
          currency: 'USD',
          language: 'en_US'
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

module.exports = ExpediaService;