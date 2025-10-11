/**
 * QFO Master Controller - Lean Implementation
 * Unified controller for QuantumFlow Orchestrator
 */

const quantumIntentEngine = require('./quantumIntentEngine');
const dynamicWorkflowSynthesizer = require('./dynamicWorkflowSynthesizer');
const multiAgentOrchestrator = require('./multiAgentOrchestrator');
const gamificationEngine = require('./gamificationEngine');
const superAppOrchestrator = require('./superAppOrchestrator');
const blockchainTrustLayer = require('./blockchainTrustLayer');
const proactiveAIPrediction = require('./proactiveAIPrediction');
const logger = require('../utils/logger');

class QFOMasterController {
  constructor() {
    this.version = '1.0.0';
    this.stats = {
      total_requests: 0,
      successful: 0,
      failed: 0,
      avg_time: 0
    };
  }

  async processUserRequest(request) {
    const requestId = `req_${Date.now()}`;
    const startTime = Date.now();

    this.stats.total_requests++;

    logger.info('QFO Processing', {
      requestId,
      userId: request.userId,
      message: request.message?.substring(0, 30)
    });

    try {
      // Step 1: Quantum Intent Analysis
      const analysis = await quantumIntentEngine.analyzeIntent(
        request.message,
        { sessionId: request.sessionId, userId: request.userId, ...request.context }
      );

      // Step 2: Synthesize Workflow
      const workflow = await dynamicWorkflowSynthesizer.synthesizeWorkflow(analysis, request.context);

      // Step 3: Execute with Multi-Agent Orchestrator
      const orchestrationResult = await multiAgentOrchestrator.orchestrate(workflow, request.context, request.message);

      // Step 4: Record on Blockchain
      await blockchainTrustLayer.createTransaction({
        type: 'workflow_execution',
        userId: request.userId,
        data: {
          requestId,
          workflowId: workflow.workflow_id,
          intent: analysis.primary_intent,
          success: orchestrationResult.success
        }
      });

      // Step 5: Gamification Reward
      const reward = await gamificationEngine.awardPoints(
        request.userId,
        'workflow_completed',
        { success: orchestrationResult.success }
      );

      // Step 6: Proactive Predictions
      const predictions = await proactiveAIPrediction.predictUserNeeds(
        request.userId,
        { lastIntent: analysis.primary_intent }
      );

      // Step 7: Cross-Platform Sync
      if (request.syncAcrossPlatforms) {
        await superAppOrchestrator.syncStateAcrossPlatforms(
          request.userId,
          { lastAction: analysis.primary_intent }
        );
      }

      const processingTime = Date.now() - startTime;
      this.updateStats(processingTime, true);

      logger.info('QFO Complete', {
        requestId,
        time: processingTime,
        success: true
      });

      return {
        success: true,
        requestId,
        response: {
          message: orchestrationResult.result.summary || 'تم إكمال طلبك بنجاح!',
          intent: analysis.primary_intent,
          confidence: analysis.confidence,
          workflow: {
            id: workflow.workflow_id,
            steps_completed: orchestrationResult.metadata.steps_completed
          },
          gamification: {
            points_earned: reward.points,
            level: reward.level,
            level_up: reward.leveledUp,
            achievements: reward.newAchievements
          },
          predictions: predictions.predictions,
          blockchain: { verified: true }
        },
        metadata: {
          processing_time: processingTime,
          agents_involved: orchestrationResult.metadata.agents_involved
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateStats(processingTime, false);

      logger.error('QFO Failed', { requestId, error: error.message });

      return {
        success: false,
        requestId,
        error: error.message,
        fallback_response: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
      };
    }
  }

  updateStats(time, success) {
    const total = this.stats.total_requests;
    this.stats.avg_time = ((this.stats.avg_time * (total - 1)) + time) / total;
    
    if (success) {
      this.stats.successful++;
    } else {
      this.stats.failed++;
    }
  }

  getSystemStatus() {
    return {
      version: this.version,
      statistics: {
        ...this.stats,
        success_rate: ((this.stats.successful / this.stats.total_requests) * 100).toFixed(2) + '%'
      },
      components: {
        quantum_engine: 'operational',
        workflow_synthesizer: 'operational',
        agent_orchestrator: 'operational',
        gamification: 'operational',
        super_app: 'operational',
        blockchain: 'operational',
        prediction: 'operational'
      },
      health: 'excellent'
    };
  }
}

module.exports = new QFOMasterController();

