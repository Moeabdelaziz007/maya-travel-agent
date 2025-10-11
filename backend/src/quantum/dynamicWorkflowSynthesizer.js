/**
 * Dynamic Workflow Synthesizer - Lean Implementation
 * Builds workflows dynamically based on intent
 */

const skillRegistry = require('../workflows/skillRegistry');
const logger = require('../utils/logger');

class DynamicWorkflowSynthesizer {
  constructor() {
    this.synthesisCounter = 0;
  }

  async synthesizeWorkflow(quantumAnalysis, context = {}) {
    this.synthesisCounter++;
    const startTime = Date.now();

    try {
      // Build steps based on intent
      const steps = this.buildSteps(quantumAnalysis, context);

      // Determine execution strategy
      const strategy = this.selectStrategy(steps, context);

      // Add monitoring and fallbacks
      const enhanced = this.enhanceSteps(steps);

      const workflow = {
        workflow_id: `qfo_${this.synthesisCounter}_${Date.now()}`,
        type: 'synthesized',
        primary_intent: quantumAnalysis.primary_intent,
        steps: enhanced,
        execution_strategy: strategy,
        estimated_duration: this.estimateDuration(enhanced, strategy),
        success_probability: quantumAnalysis.confidence,
        metadata: {
          synthesis_time: Date.now() - startTime,
          complexity_score: enhanced.length * 0.1,
        },
      };

      logger.info('Workflow synthesized', {
        id: workflow.workflow_id,
        steps: workflow.steps.length,
        strategy,
      });

      return workflow;
    } catch (error) {
      logger.error('Synthesis error', { error: error.message });
      return this.getFallbackWorkflow(quantumAnalysis);
    }
  }

  buildSteps(analysis, context) {
    const intent = analysis.primary_intent;
    const steps = [];

    // Map intents to skill sequences
    const intentMap = {
      plan_trip: ['plan_trip', 'search_flights', 'calculate_budget'],
      search_destination: ['get_destination_info', 'get_weather'],
      budget_inquiry: ['calculate_budget'],
      book_flight: ['search_flights'],
      get_weather: ['get_weather'],
    };

    const skillSequence = intentMap[intent] || ['plan_trip'];

    skillSequence.forEach((skill, i) => {
      steps.push({
        id: `step_${i + 1}`,
        order: i + 1,
        skill,
        timeout: 10000,
        critical: i === 0,
      });
    });

    return steps;
  }

  selectStrategy(steps, context) {
    if (context.urgency === 'high') return 'parallel';
    if (steps.length > 3) return 'hybrid';
    return 'sequential';
  }

  enhanceSteps(steps) {
    return steps.map((step) => ({
      ...step,
      retry_policy: { max_attempts: 3, backoff: 'exponential' },
      fallback: { strategy: 'use_cached_data' },
    }));
  }

  estimateDuration(steps, strategy) {
    if (strategy === 'parallel') {
      return Math.max(...steps.map((s) => s.timeout));
    }
    return steps.reduce((sum, s) => sum + s.timeout, 0);
  }

  getFallbackWorkflow(analysis) {
    return {
      workflow_id: `fallback_${Date.now()}`,
      type: 'fallback',
      primary_intent: analysis.primary_intent,
      steps: [{ id: 'step_1', skill: 'simple_response', timeout: 1000 }],
      execution_strategy: 'sequential',
      estimated_duration: 1000,
      success_probability: 0.7,
    };
  }
}

module.exports = new DynamicWorkflowSynthesizer();
