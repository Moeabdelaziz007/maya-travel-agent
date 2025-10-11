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

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

export interface PerformanceMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  totalCost: number;
  concurrentRequests: number;
  memoryUsage: number;
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

  // Advanced Caching System
  private requestCache = new Map<string, CacheEntry<WorkflowResult>>();
  private intentCache = new Map<string, CacheEntry<any>>();
  private workflowCache = new Map<string, CacheEntry<any>>();
  private contextCache = new Map<string, CacheEntry<UserContext>>();

  // Performance Management
  private activeWorkflows = new Map<string, WorkflowResult>();
  private userContexts = new Map<string, UserContext>();
  private requestQueue: Array<{ id: string; promise: Promise<WorkflowResult> }> = [];
  private processingRequests = new Set<string>();
  private performanceMetrics: PerformanceMetrics;

  // Load Balancing
  private maxConcurrentRequests: number = 50;
  private currentConcurrentRequests: number = 0;
  private requestBatches = new Map<string, Array<{ request: any; resolve: Function; reject: Function }>>();

  constructor(config: ECMWConfig) {
    this.config = config;
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      totalCost: 0,
      concurrentRequests: 0,
      memoryUsage: 0
    };
    this.initializeCore();
    this.initializeAgents();
    this.startPerformanceMonitoring();
  }

  private initializeCore() {
    // Initialize QuantumIntentEngine with proper configuration
    this.intentEngine = new QuantumIntentEngine({
      maxSuperpositionStates: 10,
      coherenceThreshold: 0.7,
      interferenceSensitivity: 0.5,
      contextWindowSize: 100,
      learningRate: this.config.learningRate || 0.1
    });

    // Initialize DynamicWorkflowEngine with proper configuration
    this.workflowEngine = new DynamicWorkflowEngine({
      maxParallelNodes: this.config.maxConcurrentWorkflows || 10,
      defaultRetryPolicy: {
        maxRetries: 3,
        backoffStrategy: 'exponential' as const,
        initialDelay: 1000
      },
      cacheEnabled: true,
      cacheTTL: 3600000, // 1 hour
      optimizationEnabled: true
    });

    // Initialize ZeroCostLLMManager with proper configuration
    this.llmManager = new ZeroCostLLMManager({
      enableCaching: true,
      cacheTTL: 3600000, // 1 hour
      maxCacheSize: 1000,
      enableFallback: true,
      maxRetries: 3
    });

    // Initialize SelfLearningOptimizer
    this.optimizer = new SelfLearningOptimizer({
      learningRate: this.config.learningRate || 0.1,
      memoryRetentionDays: this.config.memoryRetentionDays || 90,
      discountFactor: 0.95,
      explorationRate: 0.3
    });

    // Initialize MCPManager
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

  private startPerformanceMonitoring(): void {
    // Monitor performance every 30 seconds
    setInterval(() => {
      this.updatePerformanceMetrics();
      this.cleanupExpiredCache();
      this.balanceLoad();
    }, 30000);
  }

  /**
   * Advanced caching with intelligent eviction
   */
  private generateCacheKey(userId: string, message: string, context?: Partial<UserContext>): string {
    const keyData = {
      userId,
      message: message.substring(0, 100),
      contextHash: context ? this.hashContext(context) : 'no-context'
    };
    return btoa(JSON.stringify(keyData));
  }

  private hashContext(context: Partial<UserContext>): string {
    const relevantData = {
      preferences: context.preferences,
      emotionalState: context.emotionalState,
      travelHistory: context.travelHistory?.slice(-2) // Last 2 trips
    };
    return btoa(JSON.stringify(relevantData)).substring(0, 16);
  }

  private getCachedResult(cacheKey: string): WorkflowResult | null {
    const cached = this.requestCache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.requestCache.delete(cacheKey);
      return null;
    }

    cached.accessCount++;
    cached.lastAccessed = now;
    this.performanceMetrics.cacheHits++;

    return cached.data;
  }

  private setCachedResult(cacheKey: string, result: WorkflowResult, ttl: number = 3600000): void {
    const size = JSON.stringify(result).length;
    this.requestCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
      size
    });
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    const maxCacheSize = 100; // MB

    // Remove expired entries
    for (const [key, entry] of this.requestCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.requestCache.delete(key);
      }
    }

    // LRU eviction if cache too large
    let totalSize = 0;
    const entries = Array.from(this.requestCache.entries());

    for (const [, entry] of entries) {
      totalSize += entry.size;
    }

    if (totalSize > maxCacheSize * 1024 * 1024) {
      // Sort by last accessed and remove oldest 20%
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      const toRemove = Math.floor(entries.length * 0.2);

      for (let i = 0; i < toRemove; i++) {
        this.requestCache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Load balancing and request queuing
   */
  private async balanceLoad(): Promise<void> {
    if (this.currentConcurrentRequests >= this.maxConcurrentRequests) {
      // Queue additional requests
      return;
    }

    // Process queued requests
    const availableSlots = this.maxConcurrentRequests - this.currentConcurrentRequests;
    const requestsToProcess = this.requestQueue.splice(0, availableSlots);

    for (const queuedRequest of requestsToProcess) {
      this.currentConcurrentRequests++;
      queuedRequest.promise.finally(() => {
        this.currentConcurrentRequests--;
      });
    }
  }

  private updatePerformanceMetrics(): void {
    this.performanceMetrics.concurrentRequests = this.currentConcurrentRequests;
    this.performanceMetrics.memoryUsage = this.calculateMemoryUsage();
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0;

    // Calculate cache sizes
    for (const entry of this.requestCache.values()) {
      totalSize += entry.size;
    }
    for (const entry of this.intentCache.values()) {
      totalSize += entry.size;
    }
    for (const entry of this.workflowCache.values()) {
      totalSize += entry.size;
    }
    for (const entry of this.contextCache.values()) {
      totalSize += entry.size;
    }

    return totalSize;
  }

  /**
   * Process user request through the E-CMW system with advanced caching and load balancing
   */
  async processRequest(
    userId: string,
    message: string,
    context?: Partial<UserContext>
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(userId, message, context);
      const cachedResult = this.getCachedResult(cacheKey);

      if (cachedResult) {
        console.log('✅ Cache hit for request:', cacheKey);
        return cachedResult;
      }

      this.performanceMetrics.cacheMisses++;

      // Load balancing: queue if too many concurrent requests
      if (this.currentConcurrentRequests >= this.maxConcurrentRequests) {
        console.log('⚠️ Request queued due to high load');
        return new Promise((resolve, reject) => {
          this.requestQueue.push({
            id: cacheKey,
            promise: this.processRequestInternal(userId, message, context, startTime, cacheKey)
              .then(resolve)
              .catch(reject)
          });
        });
      }

      this.currentConcurrentRequests++;
      const result = await this.processRequestInternal(userId, message, context, startTime, cacheKey);
      this.currentConcurrentRequests--;

      return result;

    } catch (error) {
      this.performanceMetrics.cacheMisses++;
      console.error('E-CMW processing error:', error);
      throw new Error(`Failed to process request: ${error.message}`);
    }
  }

  private async processRequestInternal(
    userId: string,
    message: string,
    context: Partial<UserContext> | undefined,
    startTime: number,
    cacheKey: string
  ): Promise<WorkflowResult> {
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

      // Cache successful results
      if (result.success) {
        this.setCachedResult(cacheKey, result);
      }

      return result;

    } catch (error) {
      throw error;
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
    let emotionalImpact: number | undefined;
    let carbonSaved: number | undefined;

    if (this.emotionAdapter && context.emotionalState) {
      const emotionalOutput = await this.emotionAdapter.adaptResponse(output, context.emotionalState);
      Object.assign(output, emotionalOutput);
      emotionalImpact = emotionalOutput.emotionalImpact || 0.8; // Default emotional impact score
      agents.push('EmotionAwareAdapter');
    }

    if (this.shadowPlanner) {
      const shadowInsights = await this.shadowPlanner.getInsights(context);
      Object.assign(output, { shadowInsights });
      agents.push('ShadowPlanningAgent');
    }

    if (this.socialAgent) {
      const socialMatches = await this.socialAgent.findTravelTwins(context);
      Object.assign(output, { socialMatches });
      agents.push('TravelTwinNetworkAgent');
    }

    if (this.carbonAgent) {
      const carbonAnalysis = await this.carbonAgent.analyzeTrip(output);
      Object.assign(output, carbonAnalysis);
      carbonSaved = carbonAnalysis.carbonSaved || 0; // Carbon footprint reduction in kg CO2
      agents.push('CarbonConsciousAgent');
    }

    return {
      success: true,
      workflowId,
      agents,
      output,
      executionTime: 0,
      cost: 0,
      emotionalImpact,
      carbonSaved
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
   * Get system health and performance metrics with advanced monitoring
   */
  async getHealthMetrics(): Promise<{
    activeWorkflows: number;
    totalUsers: number;
    averageExecutionTime: number;
    totalCost: number;
    optimizationScore: number;
    performance: PerformanceMetrics;
    cache: {
      requestCacheSize: number;
      intentCacheSize: number;
      workflowCacheSize: number;
      contextCacheSize: number;
      totalCacheSize: number;
      cacheHitRate: number;
    };
    loadBalancing: {
      currentConcurrentRequests: number;
      maxConcurrentRequests: number;
      queuedRequests: number;
      utilization: number;
    };
  }> {
    const activeWorkflows = this.activeWorkflows.size;
    const totalUsers = this.userContexts.size;
    const averageExecutionTime = Array.from(this.activeWorkflows.values())
      .reduce((sum, w) => sum + w.executionTime, 0) / activeWorkflows || 0;
    const totalCost = Array.from(this.activeWorkflows.values())
      .reduce((sum, w) => sum + w.cost, 0);
    const optimizationScore = await this.optimizer.getOptimizationScore();

    const totalRequests = this.performanceMetrics.totalRequests;
    const cacheHitRate = totalRequests > 0 ?
      (this.performanceMetrics.cacheHits / totalRequests) * 100 : 0;

    return {
      activeWorkflows,
      totalUsers,
      averageExecutionTime,
      totalCost,
      optimizationScore,
      performance: { ...this.performanceMetrics },
      cache: {
        requestCacheSize: this.requestCache.size,
        intentCacheSize: this.intentCache.size,
        workflowCacheSize: this.workflowCache.size,
        contextCacheSize: this.contextCache.size,
        totalCacheSize: this.requestCache.size + this.intentCache.size +
                       this.workflowCache.size + this.contextCache.size,
        cacheHitRate
      },
      loadBalancing: {
        currentConcurrentRequests: this.currentConcurrentRequests,
        maxConcurrentRequests: this.maxConcurrentRequests,
        queuedRequests: this.requestQueue.length,
        utilization: (this.currentConcurrentRequests / this.maxConcurrentRequests) * 100
      }
    };
  }

  /**
   * Gracefully shutdown the E-CMW system with cleanup
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down E-CMW Core...');

    try {
      // Stop performance monitoring
      // Note: In production, store interval reference to clear it

      // Clear all caches
      this.requestCache.clear();
      this.intentCache.clear();
      this.workflowCache.clear();
      this.contextCache.clear();

      // Clear request queues
      this.requestQueue = [];
      this.processingRequests.clear();

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

      // Clear active workflows and contexts
      this.activeWorkflows.clear();
      this.userContexts.clear();

      // Reset performance metrics
      this.performanceMetrics = {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        averageResponseTime: 0,
        totalCost: 0,
        concurrentRequests: 0,
        memoryUsage: 0
      };

      console.log('✅ E-CMW Core shut down successfully');

    } catch (error: any) {
      console.error('❌ Shutdown error:', error.message);
      throw error;
    }
  }
}

export default ECMWCore;