/**
 * Skill Registry - Manages available skills (micro-agents)
 */

class SkillRegistry {
  constructor() {
    this.skills = new Map();
    this.registerDefaultSkills();
  }

  register(name, handler, metadata = {}) {
    this.skills.set(name, { name, handler, metadata });
  }

  async execute(skillName, params, sharedState = {}) {
    const skill = this.skills.get(skillName);
    
    if (!skill) {
      return { error: `Skill '${skillName}' not found`, available: Array.from(this.skills.keys()) };
    }

    try {
      return await skill.handler(params, sharedState);
    } catch (error) {
      return { error: error.message };
    }
  }

  getAvailableSkills() {
    return Array.from(this.skills.keys());
  }

  registerDefaultSkills() {
    // Plan Trip
    this.register('plan_trip', async (params) => {
      return {
        message: 'تم التخطيط! إليك خطة رحلتك',
        trip: {
          destination: params.destination || 'دبي',
          duration: params.duration || '7 أيام',
          activities: ['زيارة برج خليفة', 'التسوق في دبي مول', 'شاطئ جميرا']
        }
      };
    }, { description: 'Plan a complete trip' });

    // Search Flights
    this.register('search_flights', async (params) => {
      return {
        message: 'وجدت رحلات جوية',
        flights: [
          { airline: 'Emirates', price: 2500, departure: '10:00' },
          { airline: 'Etihad', price: 2300, departure: '14:00' }
        ]
      };
    }, { description: 'Search for flights' });

    // Calculate Budget
    this.register('calculate_budget', async (params) => {
      return {
        message: 'تم حساب الميزانية',
        budget: {
          total: params.budget || 15000,
          breakdown: {
            flights: 5000,
            accommodation: 7000,
            activities: 2000,
            food: 1000
          }
        }
      };
    }, { description: 'Calculate trip budget' });

    // Get Destination Info
    this.register('get_destination_info', async (params) => {
      return {
        message: 'معلومات الوجهة',
        info: {
          name: params.destination || 'دبي',
          bestTime: 'نوفمبر - مارس',
          weather: 'مشمس ودافئ',
          attractions: ['برج خليفة', 'نخلة جميرا', 'دبي مول']
        }
      };
    }, { description: 'Get destination information' });

    // Get Weather
    this.register('get_weather', async (params) => {
      return {
        message: 'حالة الطقس',
        weather: {
          temperature: 28,
          condition: 'مشمس',
          humidity: 60
        }
      };
    }, { description: 'Get weather information' });

    // Simple Response (fallback)
    this.register('simple_response', async (params) => {
      return {
        message: 'تم استلام طلبك، كيف يمكنني مساعدتك؟'
      };
    }, { description: 'Simple fallback response' });
  }
}

module.exports = new SkillRegistry();
