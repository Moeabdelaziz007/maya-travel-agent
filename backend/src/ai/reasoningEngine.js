/**
 * Structured Reasoning and Chain of Thought Engine
 * Implements step-by-step reasoning for travel planning and recommendations
 */

const KnowledgeBaseService = require('./knowledgeBase');
const UserProfileService = require('./userProfileService');

class ReasoningEngine {
  constructor() {
    this.knowledgeBase = new KnowledgeBaseService();
    this.userProfile = new UserProfileService();
  }

  /**
   * Generate structured reasoning trace for travel planning
   * @param {string} userId - User ID
   * @param {string} query - User's query
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Reasoning trace and result
   */
  async generateReasoningTrace(userId, query, context = {}) {
    const conversationId = context.conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Step 1: Analyze user query and intent
      const intentAnalysis = await this.analyzeQueryIntent(query, context);

      // Step 2: Get user profile and preferences
      const userProfile = await this.userProfile.getUserProfile(userId);

      // Step 3: Retrieve relevant knowledge based on intent
      const relevantKnowledge = await this.retrieveRelevantKnowledge(intentAnalysis, userProfile);

      // Step 4: Generate reasoning steps based on intent type
      const reasoningSteps = await this.generateReasoningSteps(
        intentAnalysis,
        userProfile,
        relevantKnowledge,
        context
      );

      // Step 5: Execute reasoning steps and collect evidence
      const executionResults = await this.executeReasoningSteps(reasoningSteps, context);

      // Step 6: Synthesize final recommendation
      const finalRecommendation = await this.synthesizeRecommendation(
        intentAnalysis,
        reasoningSteps,
        executionResults,
        userProfile
      );

      // Step 7: Store reasoning trace for transparency
      await this.storeReasoningTrace(conversationId, userId, reasoningSteps);

      return {
        conversationId,
        intentAnalysis,
        reasoningSteps,
        executionResults,
        finalRecommendation,
        metadata: {
          totalSteps: reasoningSteps.length,
          confidence: this.calculateOverallConfidence(reasoningSteps),
          processingTime: Date.now() - context.startTime
        }
      };

    } catch (error) {
      console.error('Error in reasoning engine:', error);

      // Store error trace
      await this.storeReasoningTrace(conversationId, userId, [{
        step: 1,
        type: 'error',
        thought: `Error in reasoning process: ${error.message}`,
        confidence: 0,
        timestamp: new Date().toISOString()
      }]);

      throw error;
    }
  }

  /**
   * Analyze user query to determine intent and requirements
   * @param {string} query - User's query
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Intent analysis
   */
  async analyzeQueryIntent(query, context) {
    const intentCategories = {
      travel_planning: ['plan', 'trip', 'travel', 'visit', 'vacation', 'holiday'],
      budget_analysis: ['budget', 'cost', 'price', 'expensive', 'cheap', 'money'],
      destination_info: ['about', 'information', 'details', 'tell me', 'what is'],
      recommendations: ['recommend', 'suggest', 'best', 'top', 'ideas'],
      safety_info: ['safe', 'dangerous', 'security', 'warning', 'advice'],
      cultural_info: ['culture', 'customs', 'tradition', 'people', 'local'],
      booking_help: ['book', 'reserve', 'ticket', 'hotel', 'flight']
    };

    let detectedIntent = 'general';
    let confidence = 0.5;
    let requirements = {};

    // Simple keyword-based intent detection
    for (const [intent, keywords] of Object.entries(intentCategories)) {
      const matches = keywords.filter(keyword =>
        query.toLowerCase().includes(keyword.toLowerCase())
      ).length;

      if (matches > 0) {
        const intentConfidence = matches / keywords.length;
        if (intentConfidence > confidence) {
          detectedIntent = intent;
          confidence = intentConfidence;
        }
      }
    }

    // Extract specific requirements based on intent
    if (detectedIntent === 'travel_planning') {
      requirements = this.extractTravelRequirements(query);
    } else if (detectedIntent === 'budget_analysis') {
      requirements = this.extractBudgetRequirements(query);
    }

    return {
      type: detectedIntent,
      confidence,
      originalQuery: query,
      requirements,
      keywords: this.extractKeywords(query)
    };
  }

  /**
   * Extract travel planning requirements from query
   * @param {string} query - User's query
   * @returns {Object} Extracted requirements
   */
  extractTravelRequirements(query) {
    const requirements = {};

    // Extract destination
    const destinationPatterns = [
      /to\s+([A-Za-z\s]+)/i,
      /visit\s+([A-Za-z\s]+)/i,
      /going\s+to\s+([A-Za-z\s]+)/i
    ];

    for (const pattern of destinationPatterns) {
      const match = query.match(pattern);
      if (match) {
        requirements.destination = match[1].trim();
        break;
      }
    }

    // Extract duration
    const durationPatterns = [
      /(\d+)\s*(days?|weeks?|months?)/i,
      /for\s+(\d+)\s*(days?|weeks?|months?)/i
    ];

    for (const pattern of durationPatterns) {
      const match = query.match(pattern);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        requirements.duration = { value, unit };
        break;
      }
    }

    // Extract budget
    const budgetPatterns = [
      /budget\s+(?:of\s+)?\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*budget/i,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*dollars?/i
    ];

    for (const pattern of budgetPatterns) {
      const match = query.match(pattern);
      if (match) {
        requirements.budget = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    return requirements;
  }

  /**
   * Extract budget analysis requirements from query
   * @param {string} query - User's query
   * @returns {Object} Extracted requirements
   */
  extractBudgetRequirements(query) {
    const requirements = {};

    // Extract budget amount
    const budgetMatch = query.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (budgetMatch) {
      requirements.budget = parseFloat(budgetMatch[1].replace(/,/g, ''));
    }

    // Extract destination for context
    const destinationMatch = query.match(/to\s+([A-Za-z\s]+)/i);
    if (destinationMatch) {
      requirements.destination = destinationMatch[1].trim();
    }

    return requirements;
  }

  /**
   * Extract keywords from query for knowledge retrieval
   * @param {string} query - User's query
   * @returns {Array} Extracted keywords
   */
  extractKeywords(query) {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
  }

  /**
   * Retrieve relevant knowledge based on intent and user profile
   * @param {Object} intentAnalysis - Intent analysis result
   * @param {Object} userProfile - User profile data
   * @returns {Promise<Array>} Relevant knowledge articles
   */
  async retrieveRelevantKnowledge(intentAnalysis, userProfile) {
    const { type, requirements, keywords } = intentAnalysis;

    // Map intent types to knowledge categories
    const categoryMapping = {
      travel_planning: ['destinations', 'accommodation', 'transportation'],
      destination_info: ['destinations', 'culture', 'activities'],
      cultural_info: ['culture', 'destinations'],
      safety_info: ['safety', 'destinations'],
      budget_analysis: ['budget', 'destinations'],
      recommendations: ['destinations', 'activities', 'food']
    };

    const relevantCategories = categoryMapping[type] || ['destinations'];

    // Search for relevant knowledge
    const searchPromises = keywords.map(keyword =>
      this.knowledgeBase.semanticSearch(keyword, {
        limit: 3,
        categories: relevantCategories,
        threshold: 0.6
      })
    );

    const searchResults = await Promise.all(searchPromises);
    const allResults = searchResults.flat();

    // Remove duplicates and sort by relevance
    const uniqueResults = this.deduplicateKnowledgeResults(allResults);

    return uniqueResults.slice(0, 8);
  }

  /**
   * Remove duplicate knowledge results
   * @param {Array} results - Search results
   * @returns {Array} Deduplicated results
   */
  deduplicateKnowledgeResults(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.title}_${result.country}_${result.city}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate reasoning steps based on intent type
   * @param {Object} intentAnalysis - Intent analysis
   * @param {Object} userProfile - User profile
   * @param {Array} knowledge - Relevant knowledge
   * @param {Object} context - Additional context
   * @returns {Promise<Array>} Reasoning steps
   */
  async generateReasoningSteps(intentAnalysis, userProfile, knowledge, context) {
    const { type, requirements } = intentAnalysis;
    const steps = [];

    // Common initial steps
    steps.push({
      step: 1,
      type: 'analysis',
      thought: `Analyzing user query: "${intentAnalysis.originalQuery}"`,
      evidence: [`Intent type: ${type}`, `Confidence: ${intentAnalysis.confidence}`],
      confidence: intentAnalysis.confidence,
      timestamp: new Date().toISOString()
    });

    // Generate steps based on intent type
    switch (type) {
      case 'travel_planning':
        steps.push(...this.generateTravelPlanningSteps(requirements, userProfile, knowledge));
        break;
      case 'budget_analysis':
        steps.push(...this.generateBudgetAnalysisSteps(requirements, userProfile, knowledge));
        break;
      case 'destination_info':
        steps.push(...this.generateDestinationInfoSteps(requirements, knowledge));
        break;
      default:
        steps.push(...this.generateGeneralSteps(requirements, knowledge));
    }

    return steps;
  }

  /**
   * Generate reasoning steps for travel planning
   * @param {Object} requirements - Travel requirements
   * @param {Object} userProfile - User profile
   * @param {Array} knowledge - Relevant knowledge
   * @returns {Array} Reasoning steps
   */
  generateTravelPlanningSteps(requirements, userProfile, knowledge) {
    const steps = [];

    steps.push({
      step: 2,
      type: 'planning',
      thought: 'Identifying destination and travel parameters',
      evidence: [
        `Destination: ${requirements.destination || 'Not specified'}`,
        `Duration: ${requirements.duration ? `${requirements.duration.value} ${requirements.duration.unit}` : 'Not specified'}`,
        `Budget: ${requirements.budget ? `$${requirements.budget}` : 'Not specified'}`
      ],
      confidence: requirements.destination ? 0.9 : 0.6,
      timestamp: new Date().toISOString()
    });

    if (userProfile.personas && userProfile.personas.length > 0) {
      steps.push({
        step: 3,
        type: 'personalization',
        thought: 'Applying user persona preferences',
        evidence: userProfile.personas.map(p => `${p.user_personas.name} (${p.confidence_score})`),
        confidence: 0.8,
        timestamp: new Date().toISOString()
      });
    }

    steps.push({
      step: 4,
      type: 'research',
      thought: 'Researching destination information and options',
      evidence: [`Found ${knowledge.length} relevant knowledge sources`],
      confidence: knowledge.length > 0 ? 0.8 : 0.5,
      timestamp: new Date().toISOString()
    });

    return steps;
  }

  /**
   * Generate reasoning steps for budget analysis
   * @param {Object} requirements - Budget requirements
   * @param {Object} userProfile - User profile
   * @param {Array} knowledge - Relevant knowledge
   * @returns {Array} Reasoning steps
   */
  generateBudgetAnalysisSteps(requirements, userProfile, knowledge) {
    const steps = [];

    steps.push({
      step: 2,
      type: 'budget_assessment',
      thought: 'Analyzing budget requirements and constraints',
      evidence: [
        `Budget amount: ${requirements.budget ? `$${requirements.budget}` : 'Not specified'}`,
        `Destination: ${requirements.destination || 'General'}`,
        `User budget preference: ${userProfile.budget_range || 'Not set'}`
      ],
      confidence: requirements.budget ? 0.9 : 0.7,
      timestamp: new Date().toISOString()
    });

    return steps;
  }

  /**
   * Generate reasoning steps for destination information
   * @param {Object} requirements - Information requirements
   * @param {Array} knowledge - Relevant knowledge
   * @returns {Array} Reasoning steps
   */
  generateDestinationInfoSteps(requirements, knowledge) {
    const steps = [];

    steps.push({
      step: 2,
      type: 'information_gathering',
      thought: 'Gathering comprehensive destination information',
      evidence: [`Found ${knowledge.length} relevant sources`],
      confidence: knowledge.length > 0 ? 0.8 : 0.4,
      timestamp: new Date().toISOString()
    });

    return steps;
  }

  /**
   * Generate general reasoning steps
   * @param {Object} requirements - General requirements
   * @param {Array} knowledge - Relevant knowledge
   * @returns {Array} Reasoning steps
   */
  generateGeneralSteps(requirements, knowledge) {
    return [{
      step: 2,
      type: 'general_analysis',
      thought: 'Providing general assistance based on available information',
      evidence: [`Available knowledge: ${knowledge.length} sources`],
      confidence: 0.7,
      timestamp: new Date().toISOString()
    }];
  }

  /**
   * Execute reasoning steps and collect evidence
   * @param {Array} steps - Reasoning steps
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution results
   */
  async executeReasoningSteps(steps, context) {
    const results = {};

    for (const step of steps) {
      try {
        // Execute step based on type
        switch (step.type) {
          case 'research':
            results[step.step] = await this.executeResearchStep(step, context);
            break;
          case 'planning':
            results[step.step] = await this.executePlanningStep(step, context);
            break;
          case 'personalization':
            results[step.step] = await this.executePersonalizationStep(step, context);
            break;
          default:
            results[step.step] = { status: 'completed', evidence: step.evidence };
        }
      } catch (error) {
        results[step.step] = {
          status: 'error',
          error: error.message,
          confidence: 0
        };
      }
    }

    return results;
  }

  /**
   * Execute research step
   * @param {Object} step - Research step
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Research results
   */
  async executeResearchStep(step, context) {
    // This would integrate with external APIs for real-time data
    return {
      status: 'completed',
      evidence: step.evidence,
      additionalData: {
        realTimeInfo: 'Would fetch current events, weather, etc.',
        apiCalls: ['weather_api', 'events_api', 'safety_api']
      }
    };
  }

  /**
   * Execute planning step
   * @param {Object} step - Planning step
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Planning results
   */
  async executePlanningStep(step, context) {
    return {
      status: 'completed',
      evidence: step.evidence,
      plan: {
        structure: 'itinerary_template',
        components: ['accommodation', 'transportation', 'activities', 'dining']
      }
    };
  }

  /**
   * Execute personalization step
   * @param {Object} step - Personalization step
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Personalization results
   */
  async executePersonalizationStep(step, context) {
    return {
      status: 'completed',
      evidence: step.evidence,
      personalizedAdjustments: [
        'Budget alignment',
        'Preference matching',
        'Persona-based recommendations'
      ]
    };
  }

  /**
   * Synthesize final recommendation from reasoning steps
   * @param {Object} intentAnalysis - Intent analysis
   * @param {Array} steps - Reasoning steps
   * @param {Object} executionResults - Execution results
   * @param {Object} userProfile - User profile
   * @returns {Promise<Object>} Final recommendation
   */
  async synthesizeRecommendation(intentAnalysis, steps, executionResults, userProfile) {
    const { type, requirements } = intentAnalysis;

    // Generate recommendation based on intent type
    switch (type) {
      case 'travel_planning':
        return this.generateTravelPlanRecommendation(requirements, userProfile, executionResults);
      case 'budget_analysis':
        return this.generateBudgetRecommendation(requirements, userProfile, executionResults);
      case 'destination_info':
        return this.generateDestinationInfoRecommendation(requirements, executionResults);
      default:
        return this.generateGeneralRecommendation(intentAnalysis, executionResults);
    }
  }

  /**
   * Generate travel plan recommendation
   * @param {Object} requirements - Travel requirements
   * @param {Object} userProfile - User profile
   * @param {Object} executionResults - Execution results
   * @returns {Object} Travel plan recommendation
   */
  generateTravelPlanRecommendation(requirements, userProfile, executionResults) {
    return {
      type: 'travel_plan',
      destination: requirements.destination,
      duration: requirements.duration,
      budget: requirements.budget,
      personalized: true,
      structure: {
        overview: 'Comprehensive travel itinerary',
        daily_breakdown: 'Day-by-day activities',
        budget_allocation: 'Cost breakdown by category',
        tips: 'Personalized recommendations'
      }
    };
  }

  /**
   * Generate budget recommendation
   * @param {Object} requirements - Budget requirements
   * @param {Object} userProfile - User profile
   * @param {Object} executionResults - Execution results
   * @returns {Object} Budget recommendation
   */
  generateBudgetRecommendation(requirements, userProfile, executionResults) {
    return {
      type: 'budget_analysis',
      budget: requirements.budget,
      destination: requirements.destination,
      analysis: {
        feasibility: requirements.budget > 1000 ? 'feasible' : 'challenging',
        recommendations: 'Budget optimization suggestions',
        alternatives: 'Cost-saving alternatives'
      }
    };
  }

  /**
   * Generate destination information recommendation
   * @param {Object} requirements - Information requirements
   * @param {Object} executionResults - Execution results
   * @returns {Object} Destination info recommendation
   */
  generateDestinationInfoRecommendation(requirements, executionResults) {
    return {
      type: 'destination_info',
      destination: requirements.destination,
      information: {
        overview: 'General destination information',
        highlights: 'Key attractions and features',
        practical_info: 'Travel tips and advice'
      }
    };
  }

  /**
   * Generate general recommendation
   * @param {Object} intentAnalysis - Intent analysis
   * @param {Object} executionResults - Execution results
   * @returns {Object} General recommendation
   */
  generateGeneralRecommendation(intentAnalysis, executionResults) {
    return {
      type: 'general_assistance',
      query: intentAnalysis.originalQuery,
      response: 'General helpful response based on context'
    };
  }

  /**
   * Calculate overall confidence from reasoning steps
   * @param {Array} steps - Reasoning steps
   * @returns {number} Overall confidence score
   */
  calculateOverallConfidence(steps) {
    if (steps.length === 0) return 0;

    const totalConfidence = steps.reduce((sum, step) => sum + (step.confidence || 0), 0);
    return totalConfidence / steps.length;
  }

  /**
   * Store reasoning trace in database
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - User ID
   * @param {Array} steps - Reasoning steps
   * @returns {Promise<void>}
   */
  async storeReasoningTrace(conversationId, userId, steps) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const traces = steps.map(step => ({
        conversation_id: conversationId,
        user_id: userId,
        step_number: step.step,
        reasoning_type: step.type,
        thought_process: step.thought,
        evidence_used: step.evidence || [],
        confidence_score: step.confidence || 0.5
      }));

      const { error } = await supabase
        .from('ai_reasoning_traces')
        .insert(traces);

      if (error) {
        console.error('Error storing reasoning trace:', error);
      }

    } catch (error) {
      console.error('Error in storeReasoningTrace:', error);
    }
  }
}

module.exports = ReasoningEngine;