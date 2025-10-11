/**
 * SelfLearningOptimizer - Stub implementation for E-CMW testing
 * This is a placeholder for the actual SelfLearningOptimizer implementation
 */
export interface SelfLearningOptimizerConfig {
    learningRate: number;
    memoryRetentionDays: number;
    discountFactor?: number;
    explorationRate?: number;
}
export declare class SelfLearningOptimizer {
    private config;
    private executionHistory;
    private optimizationScore;
    constructor(config: SelfLearningOptimizerConfig);
    learnFromExecution(result: any, context: any): Promise<void>;
    getOptimizationScore(): Promise<number>;
    getMetrics(): Promise<any>;
    healthCheck(): Promise<boolean>;
    cleanup(): Promise<void>;
}
export default SelfLearningOptimizer;
//# sourceMappingURL=SelfLearningOptimizer.d.ts.map