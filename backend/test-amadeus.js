/**
 * Test script for Amadeus Travel API integration
 * Run this script to test the Amadeus service functionality
 */

require('dotenv').config();
const AmadeusService = require('./src/services/amadeus-service');

async function testAmadeusIntegration() {
  console.log('🧪 Testing Amadeus Travel API Integration\n');

  try {
    // Test 1: Flight Search
    console.log('1️⃣ Testing Flight Search...');
    const flightParams = {
      originLocationCode: 'JFK',
      destinationLocationCode: 'LAX',
      departureDate: '2025-12-01',
      adults: 1,
      max: 5
    };

    console.log('Search parameters:', flightParams);
    const flightResult = await AmadeusService.searchFlights(flightParams);

    if (flightResult.success) {
      console.log('✅ Flight search successful!');
      console.log(`Found ${flightResult.data.length} flight offers`);
      if (flightResult.data.length > 0) {
        const firstFlight = flightResult.data[0];
        console.log('Sample flight:', {
          id: firstFlight.id,
          price: firstFlight.price,
          currency: firstFlight.currency,
          airline: firstFlight.validatingAirlineCodes?.[0] || 'Unknown'
        });
      }
    } else {
      console.log('❌ Flight search failed:', flightResult.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Location Search
    console.log('2️⃣ Testing Location Search...');
    const locationResult = await AmadeusService.searchLocations('New York', 'CITY');

    if (locationResult.success) {
      console.log('✅ Location search successful!');
      console.log(`Found ${locationResult.data.length} locations`);
      if (locationResult.data.length > 0) {
        console.log('Sample location:', locationResult.data[0]);
      }
    } else {
      console.log('❌ Location search failed:', locationResult.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Hotel Search
    console.log('3️⃣ Testing Hotel Search...');
    const hotelParams = {
      cityCode: 'PAR',
      checkInDate: '2025-12-01',
      checkOutDate: '2025-12-03',
      adults: 2
    };

    console.log('Hotel search parameters:', hotelParams);
    const hotelResult = await AmadeusService.searchHotels(hotelParams);

    if (hotelResult.success) {
      console.log('✅ Hotel search successful!');
      console.log(`Found ${hotelResult.data.length} hotels`);
      if (hotelResult.data.length > 0) {
        const firstHotel = hotelResult.data[0];
        console.log('Sample hotel:', {
          name: firstHotel.hotel?.name || 'Unknown',
          rating: firstHotel.hotel?.rating,
          price: firstHotel.offers?.[0]?.price?.total || 'N/A'
        });
      }
    } else {
      console.log('❌ Hotel search failed:', hotelResult.error);
    }

    console.log('\n🎉 Amadeus integration test completed!');

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testAmadeusIntegration();
}

module.exports = { testAmadeusIntegration };