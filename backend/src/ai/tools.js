const fetch = require('node-fetch');

/**
 * Simple tool registry providing external knowledge/actions.
 * Network calls are limited to internal endpoints to avoid extra creds.
 */
const Tools = {
  async getWeather(params = {}) {
    const { destination = '', date = '' } = params;
    // Placeholder weather generation; replace with real API if available
    return {
      destination,
      date,
      forecast: 'Sunny intervals with light breeze',
      temperatureC: 24,
      precipitationChance: 10
    };
  },

  async convertCurrency(params = {}) {
    const { amount = 1, from = 'USD', to = 'EUR' } = params;
    // Static rate for demo purposes
    const rate = 0.9;
    return { amount, from, to, rate, converted: Math.round(amount * rate * 100) / 100 };
  },

  async searchDestinations(params = {}) {
    const { query = '' } = params;
    // Query local destinations endpoint if server is running
    try {
      const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
      const res = await fetch(`${apiUrl}/api/destinations`);
      const data = await res.json();
      const items = (data.destinations || []).filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        (d.country || '').toLowerCase().includes(query.toLowerCase())
      );
      return { query, results: items };
    } catch (e) {
      return { query, results: [], error: 'Failed to fetch destinations' };
    }
  },

  async getSafetyInfo(params = {}) {
    const { destination = '' } = params;
    // Static guidance; replace with external sources if desired
    return {
      destination,
      advisories: [
        'Keep copies of important documents and store originals securely.',
        'Avoid unlicensed taxis; use reputable transport services.',
        'Stay aware of local customs and dress codes in religious sites.'
      ]
    };
  }
};

/**
 * Describe available tools in a schema for the LLM.
 */
function getToolSchemas() {
  return [
    {
      name: 'getWeather',
      description: 'Get simple weather forecast for a destination and date',
      parameters: { type: 'object', properties: { destination: { type: 'string' }, date: { type: 'string' } } }
    },
    {
      name: 'convertCurrency',
      description: 'Convert an amount from one currency to another (approximate)',
      parameters: { type: 'object', properties: { amount: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } } }
    },
    {
      name: 'searchDestinations',
      description: 'Search destinations by name or country',
      parameters: { type: 'object', properties: { query: { type: 'string' } } }
    },
    {
      name: 'getSafetyInfo',
      description: 'Get safety advisories for a destination',
      parameters: { type: 'object', properties: { destination: { type: 'string' } } }
    }
  ];
}

module.exports = { Tools, getToolSchemas };

