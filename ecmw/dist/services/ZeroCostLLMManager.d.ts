/**
 * Zero-Cost LLM Manager
 * Cost-effective AI operations using 0-cost LLMs and intelligent model selection
 */
import { UserContext } from '../core/ECMWCore';
export interface LLMProvider {
    id: string;
    name: string;
    type: 'open_source' | 'free_tier' | 'local' | 'custom';
    cost: number;
    maxTokens: number;
    contextWindow: number;
    strengths: string[];
    weaknesses: string[];
    rateLimits: RateLimit[];
    availability: 'available' | 'degraded' | 'unavailable';
    performance: PerformanceMetrics;
}
export interface RateLimit {
    requests: number;
    window: number;
    type: 'per_minute' | 'per_hour' | 'per_day';
}
export interface PerformanceMetrics {
    averageResponseTime: number;
    successRate: number;
    qualityScore: number;
    lastUpdated: Date;
}
export interface LLMRequest {
    id: string;
    prompt: string;
    context?: UserContext;
    maxTokens: number;
    temperature: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    requiredCapabilities: string[];
    fallbackAllowed: boolean;
    timeout: number;
}
export interface LLMResponse {
    id: string;
    requestId: string;
    provider: string;
    text: string;
    tokens: number;
    cost: number;
    responseTime: number;
    quality: number;
    cached: boolean;
    timestamp: Date;
}
export interface ModelSelectionCriteria {
    taskType: 'intent_analysis' | 'text_generation' | 'summarization' | 'classification' | 'translation';
    complexity: 'simple' | 'medium' | 'complex';
    urgency: 'low' | 'medium' | 'high';
    quality: 'draft' | 'good' | 'excellent';
    maxCost: number;
    preferredProviders?: string[];
}
export interface LLMCache {
    key: string;
    response: LLMResponse;
    expiresAt: Date;
    accessCount: number;
    lastAccessed: Date;
}
export interface ZeroCostLLMConfig {
    enableCaching: boolean;
    cacheTTL: number;
    maxCacheSize: number;
    enableFallback: boolean;
    maxRetries: number;
    requestTimeout: number;
    costOptimization: boolean;
    performanceTracking: boolean;
}
export declare class ZeroCostLLMManager {
    private config;
    private providers;
    private cache;
    private requestQueue;
    private activeRequests;
    private performanceHistory;
    constructor(config: ZeroCostLLMConfig);
    /**
     * Process LLM request with intelligent model selection
     */
    processRequest(request: LLMRequest): Promise<LLMResponse>;
    /**
     * Select optimal provider based on criteria
     */
    private selectOptimalProvider;
    /**
     * Calculate provider score for request
     */
    private calculateProviderScore;
    /**
     * Execute request with selected provider
     */
    private executeWithProvider;
    /**
     * Try fallback providers if primary fails
     */
    private tryFallbackProviders;
    /**
     * Simulate LLM provider call
     */
    private callLLMProvider;
    /**
     * Generate mock response for testing
     */
    private generateMockResponse;
    /**
     * Assess response quality
     */
    private assessResponseQuality;
    /**
     * Check if provider is within rate limits
     */
    private checkRateLimits;
    /**
     * Estimate token count for text
     */
    private estimateTokenCount;
    /**
     * Get cached response if available
     */
    private getCachedResponse;
    /**
     * Cache response for future use
     */
    private cacheResponse;
    /**
     * Generate cache key for request
     */
    private generateCacheKey;
    /**
     * Evict oldest cache entry
     */
    private evictOldestCacheEntry;
    /**
     * Track performance metrics
     */
    private trackPerformance;
    /**
     * Update provider performance metrics
     */
    private updateProviderMetrics;
    /**
     * Initialize available LLM providers
     */
    private initializeProviders;
    /**
     * Start request processing queue
     */
    private startRequestProcessor;
    /**
     * Process queued requests
     */
    private processRequestQueue;
    /**
     * Queue request for processing
     */
    queueRequest(request: LLMRequest): void;
    /**
     * Get provider performance statistics
     */
    getProviderStats(): {
        totalProviders: number;
        availableProviders: number;
        totalRequests: number;
        averageResponseTime: number;
        totalCost: number;
        cacheHitRate: number;
    };
    /**
     * Get cost savings compared to paid LLMs
     */
    getCostSavings(): {
        totalSaved: number;
        monthlyProjection: number;
        efficiency: number;
    };
    /**
     * Utility delay function
     */
    private delay;
    /**
     * Get all available providers
     */
    getProviders(): LLMProvider[];
    /**
     * Update provider status
     */
    updateProviderStatus(providerId: string, status: 'available' | 'degraded' | 'unavailable'): void;
    /**
     * Add custom provider
     */
    addProvider(provider: LLMProvider): void;
    /**
     * Get engine metrics
     */
    getMetrics(): Promise<any>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Get available providers (helper method)
     */
    private getAvailableProviders;
    /**
     * Calculate average response time (helper method)
     */
    private calculateAvgResponseTime;
    /**
     * Calculate total savings (helper method)
     */
    private calculateTotalSavings;
}
export default ZeroCostLLMManager;
//# sourceMappingURL=ZeroCostLLMManager.d.ts.map