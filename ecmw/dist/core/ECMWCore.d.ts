/**
 * Enhanced Cognitive Mesh Weaver (E-CMW) Core
 * The central brain of the Amrikyy Travel Agent system
 */
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
export declare class ECMWCore {
    private config;
    private intentEngine;
    private workflowEngine;
    private llmManager;
    private optimizer;
    private mcpManager;
    private emotionAdapter?;
    private shadowPlanner?;
    private memoryAgent?;
    private socialAgent?;
    private carbonAgent?;
    private planBOrchestrator?;
    private requestCache;
    private intentCache;
    private workflowCache;
    private contextCache;
    private activeWorkflows;
    private userContexts;
    private requestQueue;
    private processingRequests;
    private performanceMetrics;
    private maxConcurrentRequests;
    private currentConcurrentRequests;
    private requestBatches;
    constructor(config: ECMWConfig);
    private initializeCore;
    private initializeAgents;
    private startPerformanceMonitoring;
    /**
     * Advanced caching with intelligent eviction
     */
    private generateCacheKey;
    private hashContext;
    private getCachedResult;
    private setCachedResult;
    private cleanupExpiredCache;
    /**
     * Load balancing and request queuing
     */
    private balanceLoad;
    private updatePerformanceMetrics;
    private calculateMemoryUsage;
    /**
     * Process user request through the E-CMW system with advanced caching and load balancing
     */
    processRequest(userId: string, message: string, context?: Partial<UserContext>): Promise<WorkflowResult>;
    private processRequestInternal;
    /**
     * Update user context with latest information
     */
    private updateUserContext;
    /**
     * Execute the synthesized workflow
     */
    private executeWorkflow;
    /**
     * Calculate the cost of workflow execution
     */
    private calculateCost;
    /**
     * Get system health and performance metrics with advanced monitoring
     */
    getHealthMetrics(): Promise<{
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
    }>;
    /**
     * Gracefully shutdown the E-CMW system with cleanup
     */
    shutdown(): Promise<void>;
}
export default ECMWCore;
//# sourceMappingURL=ECMWCore.d.ts.map