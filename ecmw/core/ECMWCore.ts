/**
 * Enhanced Cognitive Mesh Weaver (E-CMW) Core
 * The central brain of the Amrikyy Travel Agent system
 */

import { QuantumIntentEngine } from '../engines/QuantumIntentEngine';
import { DynamicWorkflowEngine } from '../engines/DynamicWorkflowEngine';
import { ZeroCostLLMManager } from '../services/ZeroCostLLMManager';
import { SelfLearningOptimizer } from '../services/SelfLearningOptimizer';
import { MCPManager } from '../mcp/MCPManager';
import { EmotionAwareAdapter } from '../agents/EmotionAwareAdapter';
import { ShadowPlanningAgent } from '../agents/ShadowPlanningAgent';
import { CrossTripMemoryAgent } from '../agents/CrossTripMemoryAgent';
import { TravelTwinNetworkAgent } from '../agents/TravelTwinNetworkAgent';
import { CarbonConsciousAgent } from '../agents/CarbonConsciousAgent';
import { PlanBOrchestrator } from '../agents/PlanBOrchestrator';

export interface ECMWConfig {
  enableEmotionalIntelligence: boolean;
  enableShadowPlanning: boolean;
  enableCrossTripMemory: boolean;
  enableSocialNetwork: boolean;
  enableCarbonTracking: boolean;
  enablePlanB: boolean;
  maxConcurrentWorkflows: number;
  learningRate: number;
  memoryRetentionDays: number;
}

export interface UserContext {
  userId: string;
  sessionId: string;
  preferences: Record<string, any>;
  emotionalState?: 'excited' | 'stressed' | 'tired' | 'neutral';
  travelHistory: Array<{
    tripId: string;
    destination: string;
    companions: string[];
    satisfaction: number;
    completedAt: Date;
  }>;
  currentIntent?: string;
  carbonFootprint?: number;
}

export interface WorkflowResult {
  success: boolean;
  workflowId: string;
  agents: string[];
  output: any;
  executionTime: number;
  cost: number;
  emotionalImpact?: number;
  carbonSaved?: number;
  backupPlans?: Array<{
    trigger: string;
    alternative: any;
    confidence: number;
  }>;
}

export class ECMWCore {
  private config: ECMWConfig;
  private intentEngine: QuantumIntentEngine;
  private workflowEngine: DynamicWorkflowEngine;
  private llmManager: ZeroCostLLMManager;
  private optimizer: SelfLearningOptimizer;
  private mcpManager: MCPManager;

  // Specialized Agents
  private emotionAdapter?: EmotionAwareAdapter;
  private shadowPlanner?: ShadowPlanningAgent;
  private memoryAgent?: CrossTripMemoryAgent;
  private socialAgent?: TravelTwinNetworkAgent;
  private carbonAgent?: CarbonConsciousAgent;
  private planBOrchestrator?: PlanBOrchestrator;

  private activeWorkflows = new Map<string, WorkflowResult>();
  private userContexts = new Map<string, UserContext>();

  constructor(config: ECMWConfig) {
    this.config = config;
    this.initializeCore();
    this.initializeAgents();
  }

  private initializeCore() {
    this.intentEngine = new QuantumIntentEngine();
    this.workflowEngine = new DynamicWorkflowEngine();
    this.llmManager = new ZeroCostLLMManager();
    this.optimizer = new SelfLearningOptimizer({
      learningRate: this.config.learningRate,
      memoryRetentionDays: this.config.memoryRetentionDays
    });
    this.mcpManager = new MCPManager();
  }

  private initializeAgents() {
    if (this.config.enableEmotionalIntelligence) {
      this.emotionAdapter = new EmotionAwareAdapter();
    }
    if (this.config.enableShadowPlanning) {
      this.shadowPlanner = new ShadowPlanningAgent();
    }
    if (this.config.enableCrossTripMemory) {
      this.memoryAgent = new CrossTripMemoryAgent();
    }
    if (this.config.enableSocialNetwork) {
      this.socialAgent = new TravelTwinNetworkAgent();
    }
    if (this.config.enableCarbonTracking) {
      this.carbonAgent = new CarbonConsciousAgent();
    }
    if (this.config.enablePlanB) {
      this.planBOrchestrator = new PlanBOrchestrator();
    }
  }

  /**
   * Process user request through the E-CMW system
   */
  async processRequest(
    userId: string,
    message: string,
    context?: Partial<UserContext>
  ): Promise<WorkflowResult> {
    const startTime = Date.now();

    try {
      // 1. Update or create user context
      const userContext = await this.updateUserContext(userId, context);

      // 2. Analyze intent with quantum-inspired engine
      const intent = await this.intentEngine.analyzeIntent(message, userContext);

      // 3. Apply emotional intelligence if enabled
      if (this.emotionAdapter) {
        const emotionalState = await this.emotionAdapter.analyzeEmotionalState(message, userContext);
        userContext.emotionalState = emotionalState;
      }

      // 4. Generate dynamic workflow
      const workflow = await this.workflowEngine.synthesizeWorkflow(intent, userContext);

      // 5. Execute workflow with specialized agents
      const result = await this.executeWorkflow(workflow, userContext);

      // 6. Apply cross-trip memory if enabled
      if (this.memoryAgent) {
        await this.memoryAgent.updateMemory(userId, result, userContext);
      }

      // 7. Generate backup plans if enabled
      if (this.planBOrchestrator) {
        result.backupPlans = await this.planBOrchestrator.generateBackupPlans(result, userContext);
      }

      // 8. Learn and optimize
      await this.optimizer.learnFromExecution(result, userContext);

      // 9. Track execution metrics
      result.executionTime = Date.now() - startTime;
      result.cost = await this.calculateCost(result);

      return result;

    } catch (error) {
      console.error('E-CMW processing error:', error);
      throw new Error(`Failed to process request: ${error.message}`);
    }
  }

  /**
   * Update user context with latest information
   */
  private async updateUserContext(
    userId: string,
    updates?: Partial<UserContext>
  ): Promise<UserContext> {
    let context = this.userContexts.get(userId);

    if (!context) {
      context = {
        userId,
        sessionId: `session_${Date.now()}_${Math.random()}`,
        preferences: {},
        travelHistory: [],
        emotionalState: 'neutral'
      };
    }

    // Apply updates
    if (updates) {
      context = { ...context, ...updates };
    }

    // Load from memory if agents are available
    if (this.memoryAgent) {
      const memoryContext = await this.memoryAgent.getUserContext(userId);
      context = { ...context, ...memoryContext };
    }

    this.userContexts.set(userId, context);
    return context;
  }

  /**
   * Execute the synthesized workflow
   */
  private async executeWorkflow(
    workflow: any,
    context: UserContext
  ): Promise<WorkflowResult> {
    const workflowId = `workflow_${Date.now()}_${Math.random()}`;
    const agents: string[] = [];

    // Execute through MCP and specialized agents
    const output = await this.mcpManager.executeWorkflow(workflow, context);

    // Apply specialized enhancements
    if (this.emotionAdapter && context.emotionalState) {
      const emotionalOutput = await this.emotionAdapter.adaptResponse(output, context.emotionalState);
      Object.assign(output, emotionalOutput);
    }

    if (this.shadowPlanner) {
      const shadowInsights = await this.shadowPlanner.getInsights(context);
      Object.assign(output, { shadowInsights });
    }

    if (this.socialAgent) {
      const socialMatches = await this.socialAgent.findTravelTwins(context);
      Object.assign(output, { socialMatches });
    }

    if (this.carbonAgent) {
      const carbonAnalysis = await this.carbonAgent.analyzeTrip(output);
      Object.assign(output, carbonAnalysis);
    }

    return {
      success: true,
      workflowId,
      agents,
      output,
      executionTime: 0,
      cost: 0
    };
  }

  /**
   * Calculate the cost of workflow execution
   */
  private async calculateCost(result: WorkflowResult): Promise<number> {
    // Calculate based on LLM usage, MCP calls, and agent operations
    let cost = 0;

    // LLM costs (should be near zero with 0-cost strategy)
    cost += (result.output.llmTokens || 0) * 0.0001;

    // MCP operation costs
    cost += (result.output.mcpCalls || 0) * 0.001;

    // Agent operation costs
    cost += result.agents.length * 0.0005;

    return cost;
  }

  /**
   * Get system health and performance metrics
   */
  async getHealthMetrics(): Promise<{
    activeWorkflows: number;
    totalUsers: number;
    averageExecutionTime: number;
    totalCost: number;
    optimizationScore: number;
  }> {
    const activeWorkflows = this.activeWorkflows.size;
    const totalUsers = this.userContexts.size;
    const averageExecutionTime = Array.from(this.activeWorkflows.values())
      .reduce((sum, w) => sum + w.executionTime, 0) / activeWorkflows || 0;
    const totalCost = Array.from(this.activeWorkflows.values())
      .reduce((sum, w) => sum + w.cost, 0);
    const optimizationScore = await this.optimizer.getOptimizationScore();

    return {
      activeWorkflows,
      totalUsers,
      averageExecutionTime,
      totalCost,
      optimizationScore
    };
  }

  /**
   * Gracefully shutdown the E-CMW system
   */
  async shutdown(): Promise<void> {
    // Save all contexts and learning data
    if (this.memoryAgent) {
      await this.memoryAgent.persistAllContexts();
    }

    // Shutdown all agents
    const agents = [
      this.emotionAdapter,
      this.shadowPlanner,
      this.memoryAgent,
      this.socialAgent,
      this.carbonAgent,
      this.planBOrchestrator
    ].filter(Boolean);

    await Promise.all(agents.map(agent => agent?.shutdown()));

    // Clear active workflows
    this.activeWorkflows.clear();
    this.userContexts.clear();
  }
}

export default ECMWCore;