/**
 * Zero-Cost LLM Manager
 * Cost-effective AI operations using 0-cost LLMs and intelligent model selection
 */

import { UserContext } from '../core/ECMWCore';

export interface LLMProvider {
  id: string;
  name: string;
  type: 'open_source' | 'free_tier' | 'local' | 'custom';
  cost: number; // Cost per 1K tokens
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
  window: number; // milliseconds
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

export class ZeroCostLLMManager {
  private config: ZeroCostLLMConfig;
  private providers = new Map<string, LLMProvider>();
  private cache = new Map<string, LLMCache>();
  private requestQueue: LLMRequest[] = [];
  private activeRequests = new Map<string, LLMRequest>();
  private performanceHistory: LLMResponse[] = [];

  constructor(config: ZeroCostLLMConfig) {
    this.config = config;
    this.initializeProviders();
    this.startRequestProcessor();
  }

  /**
   * Process LLM request with intelligent model selection
   */
  async processRequest(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Check cache first
      if (this.config.enableCaching) {
        const cachedResponse = this.getCachedResponse(request);
        if (cachedResponse) {
          return {
            ...cachedResponse,
            cached: true,
            responseTime: Date.now() - startTime
          };
        }
      }

      // Select optimal provider
      const selectedProvider = this.selectOptimalProvider(request);

      if (!selectedProvider) {
        throw new Error('No suitable LLM provider available');
      }

      // Execute request
      const response = await this.executeWithProvider(request, selectedProvider);

      // Cache response if enabled
      if (this.config.enableCaching && response.quality > 0.7) {
        this.cacheResponse(request, response);
      }

      // Track performance
      if (this.config.performanceTracking) {
        this.trackPerformance(response);
      }

      return response;

    } catch (error) {
      // Try fallback providers
      if (this.config.enableFallback && request.fallbackAllowed) {
        return this.tryFallbackProviders(request);
      }
      throw error;
    }
  }

  /**
   * Select optimal provider based on criteria
   */
  private selectOptimalProvider(request: LLMRequest): LLMProvider | null {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => provider.availability === 'available');

    if (availableProviders.length === 0) {
      return null;
    }

    // Score providers based on multiple criteria
    const scoredProviders = availableProviders.map(provider => ({
      provider,
      score: this.calculateProviderScore(provider, request)
    }));

    // Sort by score (highest first)
    scoredProviders.sort((a, b) => b.score - a.score);

    return scoredProviders[0]?.provider || null;
  }

  /**
   * Calculate provider score for request
   */
  private calculateProviderScore(provider: LLMProvider, request: LLMRequest): number {
    let score = 0;

    // Cost factor (lower cost = higher score)
    const costScore = Math.max(0, 1 - (provider.cost / 0.01)); // Normalize against $0.01 baseline
    score += costScore * 0.3;

    // Performance factor
    score += provider.performance.qualityScore * 0.25;

    // Capability match factor
    const capabilityMatches = request.requiredCapabilities.filter(cap =>
      provider.strengths.includes(cap)
    ).length;
    const capabilityScore = capabilityMatches / request.requiredCapabilities.length;
    score += capabilityScore * 0.2;

    // Availability factor
    if (provider.availability === 'available') score += 0.15;

    // Rate limit factor
    const rateLimitScore = this.checkRateLimits(provider) ? 0.1 : 0;
    score += rateLimitScore;

    return Math.min(1, score);
  }

  /**
   * Execute request with selected provider
   */
  private async executeWithProvider(
    request: LLMRequest,
    provider: LLMProvider
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Simulate LLM call (replace with actual provider integration)
      const response = await this.callLLMProvider(request, provider);

      const responseTime = Date.now() - startTime;
      const quality = this.assessResponseQuality(response, request);

      return {
        id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId: request.id,
        provider: provider.id,
        text: response,
        tokens: this.estimateTokenCount(response),
        cost: provider.cost * (this.estimateTokenCount(response) / 1000),
        responseTime,
        quality,
        cached: false,
        timestamp: new Date()
      };

    } catch (error) {
      throw new Error(`Provider ${provider.id} failed: ${error.message}`);
    }
  }

  /**
   * Try fallback providers if primary fails
   */
  private async tryFallbackProviders(request: LLMRequest): Promise<LLMResponse> {
    const fallbackProviders = Array.from(this.providers.values())
      .filter(p => p.id !== request.id && p.availability === 'available')
      .slice(0, 2); // Try up to 2 fallback providers

    for (const provider of fallbackProviders) {
      try {
        return await this.executeWithProvider(request, provider);
      } catch (error) {
        // Continue to next fallback
      }
    }

    throw new Error('All providers failed, no fallbacks available');
  }

  /**
   * Simulate LLM provider call
   */
  private async callLLMProvider(request: LLMRequest, provider: LLMProvider): Promise<string> {
    // Simulate network delay based on provider performance
    const delay = provider.performance.averageResponseTime + Math.random() * 500;
    await this.delay(delay);

    // Generate mock response based on request type
    return this.generateMockResponse(request, provider);
  }

  /**
   * Generate mock response for testing
   */
  private generateMockResponse(request: LLMRequest, provider: LLMProvider): string {
    const responses: Record<string, string[]> = {
      intent_analysis: [
        'Based on the user input, I detect a travel planning intent with moderate confidence.',
        'The user appears to be interested in booking travel arrangements.',
        'Intent analysis suggests travel-related queries with contextual information needed.'
      ],
      text_generation: [
        'I understand you\'re looking for travel recommendations. Here are some excellent options...',
        'For your travel needs, I recommend considering these popular destinations...',
        'Based on your preferences, here are personalized travel suggestions...'
      ],
      summarization: [
        'Summary: The user is requesting travel information with specific preferences.',
        'Key points: Travel planning, destination selection, booking assistance needed.',
        'Main requirements: Trip planning, accommodation, transportation details.'
      ]
    };

    const taskResponses = responses[request.requiredCapabilities[0]] || responses.text_generation;
    return taskResponses[Math.floor(Math.random() * taskResponses.length)];
  }

  /**
   * Assess response quality
   */
  private assessResponseQuality(response: string, request: LLMRequest): number {
    let quality = 0.5; // Base quality

    // Length appropriateness
    const expectedLength = request.maxTokens;
    const actualLength = this.estimateTokenCount(response);
    const lengthScore = 1 - Math.abs(actualLength - expectedLength) / expectedLength;
    quality += lengthScore * 0.2;

    // Relevance check (basic keyword matching)
    const promptKeywords = request.prompt.toLowerCase().split(' ');
    const responseKeywords = response.toLowerCase().split(' ');
    const relevanceScore = promptKeywords.filter(word =>
      responseKeywords.includes(word)
    ).length / promptKeywords.length;
    quality += relevanceScore * 0.3;

    return Math.min(1, quality);
  }

  /**
   * Check if provider is within rate limits
   */
  private checkRateLimits(provider: LLMProvider): boolean {
    // Simple rate limit check (in production, track actual usage)
    return provider.availability === 'available';
  }

  /**
   * Estimate token count for text
   */
  private estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Get cached response if available
   */
  private getCachedResponse(request: LLMRequest): LLMResponse | null {
    const cacheKey = this.generateCacheKey(request);
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > new Date()) {
      cached.accessCount++;
      cached.lastAccessed = new Date();
      return cached.response;
    }

    return null;
  }

  /**
   * Cache response for future use
   */
  private cacheResponse(request: LLMRequest, response: LLMResponse): void {
    const cacheKey = this.generateCacheKey(request);

    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictOldestCacheEntry();
    }

    this.cache.set(cacheKey, {
      key: cacheKey,
      response,
      expiresAt: new Date(Date.now() + this.config.cacheTTL),
      accessCount: 1,
      lastAccessed: new Date()
    });
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: LLMRequest): string {
    const keyData = {
      prompt: request.prompt.substring(0, 100), // First 100 chars
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      capabilities: request.requiredCapabilities.sort().join(',')
    };

    return btoa(JSON.stringify(keyData));
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldestCacheEntry(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, cache] of this.cache.entries()) {
      if (cache.lastAccessed.getTime() < oldestTime) {
        oldestTime = cache.lastAccessed.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Track performance metrics
   */
  private trackPerformance(response: LLMResponse): void {
    this.performanceHistory.push(response);

    // Keep only last 1000 responses
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-1000);
    }

    // Update provider performance metrics
    this.updateProviderMetrics(response);
  }

  /**
   * Update provider performance metrics
   */
  private updateProviderMetrics(response: LLMResponse): void {
    const provider = this.providers.get(response.provider);
    if (!provider) return;

    const recentResponses = this.performanceHistory
      .filter(r => r.provider === response.provider)
      .slice(-100); // Last 100 responses

    if (recentResponses.length > 0) {
      provider.performance = {
        averageResponseTime: recentResponses.reduce((sum, r) => sum + r.responseTime, 0) / recentResponses.length,
        successRate: recentResponses.filter(r => r.quality > 0.5).length / recentResponses.length,
        qualityScore: recentResponses.reduce((sum, r) => sum + r.quality, 0) / recentResponses.length,
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Initialize available LLM providers
   */
  private initializeProviders(): void {
    // Open source / free tier providers
    this.providers.set('llama2_7b', {
      id: 'llama2_7b',
      name: 'Llama 2 7B',
      type: 'open_source',
      cost: 0.0001, // Very low cost
      maxTokens: 4096,
      contextWindow: 4096,
      strengths: ['text_generation', 'summarization'],
      weaknesses: ['complex_reasoning', 'large_context'],
      rateLimits: [
        { requests: 100, window: 60000, type: 'per_minute' }
      ],
      availability: 'available',
      performance: {
        averageResponseTime: 800,
        successRate: 0.92,
        qualityScore: 0.78,
        lastUpdated: new Date()
      }
    });

    this.providers.set('mistral_7b', {
      id: 'mistral_7b',
      name: 'Mistral 7B',
      type: 'open_source',
      cost: 0.00005, // Extremely low cost
      maxTokens: 8192,
      contextWindow: 8192,
      strengths: ['text_generation', 'classification', 'translation'],
      weaknesses: ['specialized_domains'],
      rateLimits: [
        { requests: 50, window: 60000, type: 'per_minute' }
      ],
      availability: 'available',
      performance: {
        averageResponseTime: 600,
        successRate: 0.95,
        qualityScore: 0.82,
        lastUpdated: new Date()
      }
    });

    this.providers.set('phi_2', {
      id: 'phi_2',
      name: 'Phi-2',
      type: 'open_source',
      cost: 0, // Completely free
      maxTokens: 2048,
      contextWindow: 2048,
      strengths: ['text_generation', 'summarization'],
      weaknesses: ['large_context', 'complex_tasks'],
      rateLimits: [
        { requests: 200, window: 60000, type: 'per_minute' }
      ],
      availability: 'available',
      performance: {
        averageResponseTime: 400,
        successRate: 0.88,
        qualityScore: 0.75,
        lastUpdated: new Date()
      }
    });

    // Free tier providers
    this.providers.set('openai_free', {
      id: 'openai_free',
      name: 'OpenAI Free Tier',
      type: 'free_tier',
      cost: 0.002, // Free tier rate
      maxTokens: 4096,
      contextWindow: 4096,
      strengths: ['text_generation', 'intent_analysis'],
      weaknesses: ['rate_limits', 'quality_variability'],
      rateLimits: [
        { requests: 20, window: 60000, type: 'per_minute' }
      ],
      availability: 'available',
      performance: {
        averageResponseTime: 1000,
        successRate: 0.90,
        qualityScore: 0.85,
        lastUpdated: new Date()
      }
    });
  }

  /**
   * Start request processing queue
   */
  private startRequestProcessor(): void {
    setInterval(() => {
      this.processRequestQueue();
    }, 1000);
  }

  /**
   * Process queued requests
   */
  private async processRequestQueue(): Promise<void> {
    if (this.requestQueue.length === 0) return;

    // Process high priority requests first
    const priorityRequests = this.requestQueue
      .filter(req => req.priority === 'critical' || req.priority === 'high')
      .slice(0, 5); // Process up to 5 high priority requests

    const normalRequests = this.requestQueue
      .filter(req => req.priority === 'medium' || req.priority === 'low')
      .slice(0, 3); // Process up to 3 normal requests

    const requestsToProcess = [...priorityRequests, ...normalRequests];

    // Remove from queue
    this.requestQueue = this.requestQueue.filter(req =>
      !requestsToProcess.includes(req)
    );

    // Process requests
    await Promise.all(requestsToProcess.map(async (request) => {
      try {
        await this.processRequest(request);
      } catch (error) {
        console.error(`Failed to process request ${request.id}:`, error);
      }
    }));
  }

  /**
   * Queue request for processing
   */
  queueRequest(request: LLMRequest): void {
    this.requestQueue.push(request);
    this.activeRequests.set(request.id, request);

    // Sort queue by priority
    this.requestQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

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
  } {
    const availableProviders = Array.from(this.providers.values())
      .filter(p => p.availability === 'available').length;

    const totalRequests = this.performanceHistory.length;
    const averageResponseTime = this.performanceHistory.length > 0
      ? this.performanceHistory.reduce((sum, r) => sum + r.responseTime, 0) / this.performanceHistory.length
      : 0;

    const totalCost = this.performanceHistory.reduce((sum, r) => sum + r.cost, 0);

    const cacheHits = this.performanceHistory.filter(r => r.cached).length;
    const cacheHitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;

    return {
      totalProviders: this.providers.size,
      availableProviders,
      totalRequests,
      averageResponseTime,
      totalCost,
      cacheHitRate
    };
  }

  /**
   * Get cost savings compared to paid LLMs
   */
  getCostSavings(): {
    totalSaved: number;
    monthlyProjection: number;
    efficiency: number;
  } {
    const totalCost = this.performanceHistory.reduce((sum, r) => sum + r.cost, 0);
    const equivalentPaidCost = this.performanceHistory.length * 0.02; // Assume $0.02 per request for paid LLM
    const totalSaved = equivalentPaidCost - totalCost;

    return {
      totalSaved,
      monthlyProjection: (totalSaved / Math.max(1, this.performanceHistory.length)) * 30,
      efficiency: totalCost / Math.max(0.001, equivalentPaidCost)
    };
  }

  /**
   * Health check for all providers
   */
  async healthCheck(): Promise<{
    healthy: number;
    degraded: number;
    unavailable: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    let healthy = 0;
    let degraded = 0;
    let unavailable = 0;

    for (const provider of this.providers.values()) {
      switch (provider.availability) {
        case 'available':
          if (provider.performance.successRate > 0.9) {
            healthy++;
          } else {
            degraded++;
            issues.push(`${provider.name}: Low success rate (${provider.performance.successRate})`);
          }
          break;
        case 'degraded':
          degraded++;
          issues.push(`${provider.name}: Service degraded`);
          break;
        case 'unavailable':
          unavailable++;
          issues.push(`${provider.name}: Service unavailable`);
          break;
      }
    }

    return { healthy, degraded, unavailable, issues };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get all available providers
   */
  getProviders(): LLMProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Update provider status
   */
  updateProviderStatus(providerId: string, status: 'available' | 'degraded' | 'unavailable'): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.availability = status;
    }
  }

  /**
   * Add custom provider
   */
  addProvider(provider: LLMProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Remove provider
   */
  /**
    * Remove provider
    */
   removeProvider(providerId: string): boolean {
     return this.providers.delete(providerId);
   }

   /**
    * Get engine metrics
    */
   async getMetrics(): Promise<any> {
     return {
       totalRequests: this.requestCount || 0,
       avgResponseTime: this.calculateAvgResponseTime(),
       costSavings: this.calculateTotalSavings(),
       providerDistribution: this.getProviderStats()
     };
   }

   /**
    * Health check for the manager
    */
   async healthCheck(): Promise<boolean> {
     try {
       // Test provider availability
       const providers = await this.getAvailableProviders();
       return providers.length > 0;
     } catch {
       return false;
     }
   }

   /**
    * Cleanup resources
    */
   async cleanup(): Promise<void> {
     // Cleanup resources
     this.cache.clear();
     this.requestQueue = [];
     this.activeRequests.clear();
     this.performanceHistory = [];
     console.log('✅ ZeroCostLLMManager cleaned up');
   }

   /**
    * Get available providers (helper method)
    */
   private async getAvailableProviders(): Promise<LLMProvider[]> {
     return Array.from(this.providers.values())
       .filter(provider => provider.availability === 'available');
   }

   /**
    * Calculate average response time (helper method)
    */
   private calculateAvgResponseTime(): number {
     if (this.performanceHistory.length === 0) return 0;
     return this.performanceHistory.reduce((sum, r) => sum + r.responseTime, 0) / this.performanceHistory.length;
   }

  /**
   * Calculate total savings (helper method)
   */
  private calculateTotalSavings(): number {
    const totalCost = this.performanceHistory.reduce((sum, r) => sum + r.cost, 0);
    const equivalentPaidCost = this.performanceHistory.length * 0.02; // Assume $0.02 per request for paid LLM
    return equivalentPaidCost - totalCost;
  }

  /**
   * Remove a provider from the manager
   */
  removeProvider(providerId: string): boolean {
    return this.providers.delete(providerId);
  }
}

export default ZeroCostLLMManager;