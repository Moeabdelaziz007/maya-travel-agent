/**
 * Dynamic Workflow Engine
 * Real-time workflow synthesis and dynamic agent composition for personalized travel experiences
 */
import { UserContext, IntentAnalysis } from '../core/ECMWCore';
export interface WorkflowNode {
    id: string;
    type: 'agent' | 'service' | 'decision' | 'parallel' | 'sequential';
    name: string;
    description: string;
    inputs: string[];
    outputs: string[];
    dependencies: string[];
    priority: number;
    estimatedDuration: number;
    cost: number;
    retryPolicy?: RetryPolicy;
    fallbackNodes?: string[];
}
export interface WorkflowEdge {
    from: string;
    to: string;
    condition?: string;
    weight: number;
    dataFlow: string[];
}
export interface Workflow {
    id: string;
    name: string;
    description: string;
    nodes: Map<string, WorkflowNode>;
    edges: WorkflowEdge[];
    entryPoints: string[];
    exitPoints: string[];
    metadata: WorkflowMetadata;
    createdAt: Date;
    updatedAt: Date;
}
export interface WorkflowMetadata {
    complexity: 'simple' | 'medium' | 'complex';
    estimatedDuration: number;
    estimatedCost: number;
    requiredAgents: string[];
    requiredServices: string[];
    optimizationScore: number;
    cacheable: boolean;
    version: string;
}
export interface RetryPolicy {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    backoffMultiplier: number;
    retryableErrors: string[];
}
export interface WorkflowExecution {
    workflowId: string;
    executionId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    currentNode?: string;
    completedNodes: string[];
    failedNodes: string[];
    startTime: Date;
    endTime?: Date;
    results: Map<string, any>;
    errors: WorkflowError[];
    metrics: ExecutionMetrics;
}
export interface WorkflowError {
    nodeId: string;
    error: string;
    timestamp: Date;
    retryCount: number;
    recoverable: boolean;
}
export interface ExecutionMetrics {
    totalDuration: number;
    nodeDurations: Map<string, number>;
    totalCost: number;
    nodeCosts: Map<string, number>;
    cacheHits: number;
    optimizationApplied: boolean;
}
export interface WorkflowConfig {
    maxParallelNodes: number;
    defaultRetryPolicy: RetryPolicy;
    cacheEnabled: boolean;
    cacheTTL: number;
    optimizationEnabled: boolean;
    maxWorkflowDepth: number;
    enableFallbackRouting: boolean;
}
export declare class DynamicWorkflowEngine {
    private config;
    private workflowCache;
    private activeExecutions;
    private nodeTemplates;
    private optimizationRules;
    private workflowHistory;
    private cacheHitRate;
    constructor(config: WorkflowConfig);
    /**
     * Calculate average execution time from workflow history
     */
    private calculateAvgExecutionTime;
    /**
     * Calculate success rate from workflow history
     */
    private calculateSuccessRate;
    /**
     * Synthesize workflow based on intent analysis and user context
     */
    synthesizeWorkflow(intent: IntentAnalysis, context: UserContext): Promise<Workflow>;
    /**
     * Execute workflow with dynamic adaptation
     */
    executeWorkflow(workflow: Workflow, context: UserContext): Promise<WorkflowExecution>;
    /**
     * Create workflow from intent analysis
     */
    private createWorkflowFromIntent;
    /**
     * Create entry point node
     */
    private createEntryNode;
    /**
     * Create nodes based on intent
     */
    private createIntentNodes;
    /**
     * Create node for specific intent
     */
    private createIntentNode;
    /**
     * Create parallel execution node for multiple intents
     */
    private createParallelNode;
    /**
     * Create sequential nodes for linear execution
     */
    private createSequentialNodes;
    /**
     * Create context-dependent nodes
     */
    private createContextNodes;
    /**
     * Create workflow edges
     */
    private createWorkflowEdges;
    /**
     * Create exit point node
     */
    private createExitNode;
    /**
     * Find last nodes in workflow (nodes with no outgoing edges)
     */
    private findLastNodes;
    /**
     * Calculate workflow metadata
     */
    private calculateWorkflowMetadata;
    /**
     * Determine workflow complexity
     */
    private determineComplexity;
    /**
     * Execute workflow recursively
     */
    private executeWorkflowRecursive;
    /**
     * Find nodes that can be executed (dependencies satisfied)
     */
    private findExecutableNodes;
    /**
     * Execute individual workflow node
     */
    private executeNode;
    /**
     * Execute agent node
     */
    private executeAgentNode;
    /**
     * Execute service node
     */
    private executeServiceNode;
    /**
     * Execute decision node
     */
    private executeDecisionNode;
    /**
     * Execute parallel node
     */
    private executeParallelNode;
    /**
     * Execute sequential node
     */
    private executeSequentialNode;
    /**
     * Execute fallback nodes
     */
    private executeFallbackNodes;
    /**
     * Optimize workflow for better performance
     */
    private optimizeWorkflow;
    /**
     * Generate cache key for workflow
     */
    private generateCacheKey;
    /**
     * Get cached workflow
     */
    private getCachedWorkflow;
    /**
     * Cache workflow
     */
    private cacheWorkflow;
    /**
     * Clone workflow with new ID
     */
    private cloneWorkflow;
    /**
     * Initialize node templates
     */
    private initializeNodeTemplates;
    /**
     * Initialize optimization rules
     */
    private initializeOptimizationRules;
    /**
     * Create generic node for unknown intents
     */
    private createGenericNode;
    /**
     * Get node templates
     */
    private getNodeTemplates;
    /**
     * Check if error is recoverable
     */
    private isRecoverableError;
    /**
     * Utility delay function
     */
    private delay;
    /**
     * Get active executions
     */
    getActiveExecutions(): WorkflowExecution[];
    /**
     * Cancel execution
     */
    cancelExecution(executionId: string): boolean;
    /**
     * Get workflow statistics
     */
    getWorkflowStats(): {
        cachedWorkflows: number;
        activeExecutions: number;
        totalExecutions: number;
        averageExecutionTime: number;
    };
    /**
     * Get engine metrics
     */
    getMetrics(): Promise<any>;
    /**
     * Health check for the engine
     */
    healthCheck(): Promise<boolean>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
export interface OptimizationRule {
    name: string;
    condition: (workflow: Workflow, intent: IntentAnalysis, context: UserContext) => boolean;
    apply: (workflow: Workflow, intent: IntentAnalysis, context: UserContext) => Promise<void>;
    score: number;
}
export default DynamicWorkflowEngine;
//# sourceMappingURL=DynamicWorkflowEngine.d.ts.map