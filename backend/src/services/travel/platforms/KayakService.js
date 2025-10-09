/**
 * Kayak Platform Service
 * Handles all Kayak API interactions
 */

const axios = require('axios');
const PlatformAdapter = require('./PlatformAdapter');

class KayakService extends PlatformAdapter {
  constructor() {
    super({
      baseURL: 'https://apidojo-kayak-v1.p.rapidapi.com',
      apiKey: process.env.KAYAK_API_KEY,
      host: 'apidojo-kayak-v1.p.rapidapi.com',
      timeout: 10000,
      platform: 'kayak'
    });
  }

  /**
   * Get hotel details by ID (not directly supported, return basic info)
   */
  async getHotelDetails(hotelId) {
    // Kayak doesn't provide detailed hotel info via API
    // Return basic structure
    return {
      id: hotelId,
      platform: 'kayak',
      name: 'Hotel details not available',
      description: 'Detailed hotel information is not available through Kayak API'
    };
  }

  /**
   * Check hotel availability (not supported)
   */
  async checkAvailability(hotelId, checkin, checkout, guests = 1) {
    throw new Error('Hotel availability check not supported on Kayak platform');
  }

  /**
   * Search flights on Kayak
   */
  async searchFlights(params) {
    try {
      const {
        origin,
        destination,
        departdate,
        returndate,
        passengers = 1,
        cabin = 'economy'
      } = params;

      if (!this.apiKey) {
        throw new Error('Kayak API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/flights/search`, {
        params: {
          origin: origin || 'NYC', // Default to NYC if not provided
          destination: destination,
          departdate: departdate,
          returndate: returndate,
          adults: passengers,
          cabin: cabin,
          currency: 'USD',
          country: 'US',
          language: 'en-US'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatFlightResults(response.data?.tripset?.itineraries || []);
    } catch (error) {
      throw new Error(`Kayak flights search failed: ${error.message}`);
    }
  }

  /**
   * Search hotels on Kayak
   */
  async searchHotels(params) {
    try {
      const {
        destination,
        checkin,
        checkout,
        rooms = 1,
        adults = 1
      } = params;

      if (!this.apiKey) {
        throw new Error('Kayak API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/hotels/search`, {
        params: {
          city: destination,
          checkin: checkin,
          checkout: checkout,
          rooms: rooms,
          adults: adults,
          currency: 'USD',
          country: 'US',
          language: 'en-US'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatHotelResults(response.data?.hotels || []);
    } catch (error) {
      throw new Error(`Kayak hotels search failed: ${error.message}`);
    }
  }

  /**
   * Search cars on Kayak
   */
  async searchCars(params) {
    try {
      const {
        pickup,
        dropoff,
        pickupDate,
        dropoffDate,
        driverAge = 25
      } = params;

      if (!this.apiKey) {
        throw new Error('Kayak API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/cars/search`, {
        params: {
          pickup: pickup,
          dropoff: dropoff,
          pickupDate: pickupDate,
          dropoffDate: dropoffDate,
          driverAge: driverAge,
          currency: 'USD',
          country: 'US',
          language: 'en-US'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatCarResults(response.data?.cars || []);
    } catch (error) {
      throw new Error(`Kayak cars search failed: ${error.message}`);
    }
  }

  /**
   * Format flight results
   */
  formatFlightResults(flights) {
    return flights.map(flight => ({
      id: flight.id,
      platform: 'kayak',
      price: flight.price?.total,
      currency: flight.price?.currency || 'USD',
      duration: flight.duration,
      stops: flight.stops,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      departure: {
        airport: flight.departure?.airport,
        time: flight.departure?.time,
        date: flight.departure?.date,
        terminal: flight.departure?.terminal
      },
      arrival: {
        airport: flight.arrival?.airport,
        time: flight.arrival?.time,
        date: flight.arrival?.date,
        terminal: flight.arrival?.terminal
      },
      aircraft: flight.aircraft,
      cabin: flight.cabin,
      baggage: flight.baggage || {},
      bookingUrl: flight.bookingUrl
    }));
  }

  /**
   * Format hotel results
   */
  formatHotelResults(hotels) {
    return hotels.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      platform: 'kayak',
      price: hotel.price?.total,
      currency: hotel.price?.currency || 'USD',
      rating: hotel.rating,
      reviewCount: hotel.reviewCount,
      image: hotel.image?.url,
      location: {
        city: hotel.city,
        address: hotel.address,
        latitude: hotel.latitude,
        longitude: hotel.longitude
      },
      amenities: hotel.amenities || [],
      starRating: hotel.starRating,
      checkInTime: hotel.checkInTime,
      checkOutTime: hotel.checkOutTime,
      bookingUrl: hotel.bookingUrl
    }));
  }

  /**
   * Format car rental results
   */
  formatCarResults(cars) {
    return cars.map(car => ({
      id: car.id,
      platform: 'kayak',
      price: car.price?.total,
      currency: car.price?.currency || 'USD',
      company: car.company,
      category: car.category,
      type: car.type,
      passengers: car.passengers,
      bags: car.bags,
      doors: car.doors,
      transmission: car.transmission,
      airConditioning: car.airConditioning,
      fuelPolicy: car.fuelPolicy,
      mileage: car.mileage,
      image: car.image?.url,
      pickupLocation: car.pickupLocation,
      dropoffLocation: car.dropoffLocation,
      bookingUrl: car.bookingUrl
    }));
  }

  /**
   * Get flight details by ID
   */
  async getFlightDetails(flightId) {
    try {
      if (!this.apiKey) {
        throw new Error('Kayak API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/flights/details`, {
        params: {
          id: flightId,
          currency: 'USD',
          language: 'en-US'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        },
        timeout: this.timeout
      });

      return this.formatFlightDetails(response.data);
    } catch (error) {
      throw new Error(`Kayak flight details failed: ${error.message}`);
    }
  }

  /**
   * Format flight details
   */
  formatFlightDetails(flightData) {
    return {
      id: flightData.id,
      platform: 'kayak',
      price: flightData.price,
      currency: flightData.currency,
      itinerary: flightData.itinerary?.map(segment => ({
        flightNumber: segment.flightNumber,
        airline: segment.airline,
        aircraft: segment.aircraft,
        departure: segment.departure,
        arrival: segment.arrival,
        duration: segment.duration,
        stops: segment.stops
      })) || [],
      baggage: flightData.baggage || {},
      policies: flightData.policies || {},
      bookingUrl: flightData.bookingUrl
    };
  }

  /**
   * Health check for Kayak API
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
      await axios.get(`${this.baseURL}/flights/search`, {
        params: {
          origin: 'NYC',
          destination: 'LAX',
          departdate: '2024-01-15',
          adults: 1,
          currency: 'USD',
          country: 'US',
          language: 'en-US'
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

module.exports = KayakService;