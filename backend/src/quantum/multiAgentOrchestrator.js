/**
 * Multi-Agent Orchestrator - Lean Implementation
 * Coordinates multiple AI agents to execute workflows
 */

const EventEmitter = require('events');
const skillRegistry = require('../workflows/skillRegistry');
const logger = require('../utils/logger');

class MultiAgentOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.agentRegistry = new Map();
    this.activeOrchestrations = new Map();
    this.initializeAgents();
  }

  async orchestrate(workflow, context, userInput) {
    const orchId = `orch_${Date.now()}`;

    logger.info('Starting orchestration', {
      orchId,
      workflowId: workflow.workflow_id,
      strategy: workflow.execution_strategy,
    });

    const orchestration = {
      id: orchId,
      workflow,
      context,
      startTime: Date.now(),
      results: [],
      sharedState: {},
    };

    this.activeOrchestrations.set(orchId, orchestration);

    try {
      let result;

      if (workflow.execution_strategy === 'parallel') {
        result = await this.executeParallel(orchestration);
      } else {
        result = await this.executeSequential(orchestration);
      }

      const duration = Date.now() - orchestration.startTime;

      logger.info('Orchestration complete', {
        orchId,
        duration,
        steps: result.completedSteps,
      });

      return {
        success: true,
        orchestrationId: orchId,
        result: result.output,
        metadata: {
          duration,
          steps_completed: result.completedSteps,
          agents_involved: result.agents,
        },
      };
    } catch (error) {
      logger.error('Orchestration failed', { orchId, error: error.message });

      return {
        success: false,
        orchestrationId: orchId,
        error: error.message,
        partialResults: orchestration.results,
      };
    } finally {
      setTimeout(() => this.activeOrchestrations.delete(orchId), 60000);
    }
  }

  async executeSequential(orchestration) {
    const { workflow, sharedState } = orchestration;
    const results = [];
    const agents = [];
    let completed = 0;

    for (const step of workflow.steps) {
      try {
        const result = await this.executeStep(step, sharedState);
        results.push({ step: step.id, result, success: true });
        agents.push('default_agent');
        completed++;

        // Update shared state
        sharedState[step.skill] = result;
      } catch (error) {
        logger.error(`Step ${step.id} failed`, { error: error.message });

        if (step.critical) {
          throw error;
        }
      }
    }

    return {
      output: this.aggregateResults(results),
      completedSteps: completed,
      results,
      agents,
    };
  }

  async executeParallel(orchestration) {
    const { workflow, sharedState } = orchestration;

    const promises = workflow.steps.map((step) =>
      this.executeStep(step, sharedState).catch((err) => ({
        error: err.message,
      }))
    );

    const results = await Promise.all(promises);
    const successful = results.filter((r) => !r.error);

    return {
      output: this.aggregateResults(successful),
      completedSteps: successful.length,
      results: successful,
      agents: successful.map(() => 'default_agent'),
    };
  }

  async executeStep(step, sharedState) {
    return await skillRegistry.execute(step.skill, {}, sharedState);
  }

  aggregateResults(results) {
    return {
      summary: `تم إكمال ${results.length} خطوة بنجاح`,
      successful_steps: results.length,
      details: results.map((r) => r.result),
    };
  }

  initializeAgents() {
    // Register default agent
    this.agentRegistry.set('default', {
      id: 'default',
      name: 'Default Agent',
      capabilities: ['all'],
      handler: async (task) => task,
    });
  }
}

module.exports = new MultiAgentOrchestrator();
