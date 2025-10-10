/**
 * Mock Flight Search Agent
 * For testing and development purposes
 */

class MockFlightAgent {
  constructor() {
    this.capabilities = ['flight_search', 'price_comparison'];
    this.priority = 2;
    this.timeout = 3000;
  }

  async execute(context) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const { origin, destination, departure_date, travelers = 1 } = context;

    // Mock flight results
    const mockFlights = [
      {
        id: 'flight_1',
        airline: 'Saudia',
        flight_number: 'SV_550',
        origin,
        destination,
        departure_date,
        return_date: context.return_date,
        price: 1200 * travelers,
        currency: 'SAR',
        duration: '1h 30m',
        stops: 0,
        aircraft: 'Boeing 777',
        class: context.travel_class || 'economy'
      },
      {
        id: 'flight_2',
        airline: 'FlyNas',
        flight_number: 'XY_77',
        origin,
        destination,
        departure_date,
        return_date: context.return_date,
        price: 980 * travelers,
        currency: 'SAR',
        duration: '1h 35m',
        stops: 0,
        aircraft: 'Airbus A320',
        class: context.travel_class || 'economy'
      },
      {
        id: 'flight_3',
        airline: 'Flyadeal',
        flight_number: 'F3_101',
        origin,
        destination,
        departure_date,
        return_date: context.return_date,
        price: 850 * travelers,
        currency: 'SAR',
        duration: '1h 40m',
        stops: 0,
        aircraft: 'Airbus A319',
        class: context.travel_class || 'economy'
      }
    ];

    return {
      agent: 'flight_search',
      success: true,
      results: mockFlights,
      search_params: { origin, destination, departure_date, travelers },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = MockFlightAgent;