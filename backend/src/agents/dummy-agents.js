/**
 * Dummy Agents - Stub implementations for missing functionality
 * Allows system to work even when agents aren't fully implemented
 */

const logger = require('../utils/logger');

// Base dummy agent template
class DummyAgent {
  constructor(name, capabilities = []) {
    this.name = name;
    this.capabilities = capabilities;
    this.priority = 1;
  }

  async execute(context) {
    logger.info(`🤖 Dummy agent executed: ${this.name}`);

    return {
      agent: this.name,
      success: true,
      data: {
        result: `${this.name} - Not implemented yet`,
        stub: true,
        timestamp: new Date().toISOString()
      },
      executionTime: 10,
      timestamp: new Date().toISOString()
    };
  }
}

// Specific dummy agents for Amriyy Travel Agent
const dummyAgents = {
  conversation: new DummyAgent('conversation', ['conversation']),
  hotel_search: new DummyAgent('hotel_search', ['hotel_search']),
  itinerary_generator: new DummyAgent('itinerary_generator', ['itinerary']),
  activities: new DummyAgent('activities', ['activities']),
  local_expert: new DummyAgent('local_expert', ['local_info']),
  budget_optimizer: new DummyAgent('budget_optimizer', ['budget']),
  price_analytics: new DummyAgent('price_analytics', ['analytics']),
  booking_agent: new DummyAgent('booking_agent', ['booking']),
  cancellation_agent: new DummyAgent('cancellation_agent', ['cancellation'])
};

/**
 * Register all dummy agents with Boss Agent
 */
function registerDummyAgents(bossAgent) {
  Object.entries(dummyAgents).forEach(([name, agent]) => {
    try {
      bossAgent.registerAgent(name, agent);
      logger.info(`✅ Registered dummy agent: ${name}`);
    } catch (error) {
      logger.warn(`⚠️ Failed to register dummy agent ${name}:`, error.message);
    }
  });
}

/**
 * Get dummy agent by name
 */
function getDummyAgent(name) {
  return dummyAgents[name] || null;
}

/**
 * Check if agent is dummy
 */
function isDummyAgent(name) {
  return dummyAgents[name] !== undefined;
}

module.exports = {
  DummyAgent,
  dummyAgents,
  registerDummyAgents,
  getDummyAgent,
  isDummyAgent
};