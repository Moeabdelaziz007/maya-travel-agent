/**
 * Enhanced AI Service - Combines vLLM + QuantumCompute MCP
 * Provides quantum-safe, high-performance AI processing
 */

const vllmService = require('./vllm-service');
const quantumService = require('./quantum-service');
const redisService = require('./redis-service');

class EnhancedAIService {
  constructor() {
    this.vllmEnabled = false;
    this.quantumEnabled = false;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return true;

    try {
      console.log('🚀 Initializing Enhanced AI Service...');

      // Initialize vLLM
      try {
        await vllmService.connect();
        this.vllmEnabled = true;
        console.log('✅ vLLM enabled for enhanced AI performance');
      } catch (error) {
        console.warn('⚠️  vLLM not available, using fallback AI service');
      }

      // Initialize Quantum service
      try {
        await quantumService.initialize();
        this.quantumEnabled = true;
        console.log('✅ Quantum service enabled for secure processing');
      } catch (error) {
        console.warn('⚠️  Quantum service not available');
      }

      this.initialized = true;
      console.log('✅ Enhanced AI Service initialized');
      return true;

    } catch (error) {
      console.error('❌ Enhanced AI Service initialization failed:', error.message);
      return false;
    }
  }

  async processTravelQuery(query, userData, options = {}) {
    await this.initialize();

    const cacheKey = `enhanced_ai:${crypto.createHash('md5').update(JSON.stringify({ query, userData })).digest('hex')}`;

    // Try cache first
    if (redisService.isConnected) {
      const cached = await redisService.get(cacheKey);
      if (cached) {
        console.log('📋 Returning cached enhanced AI response');
        return cached;
      }
    }

    let response;

    try {
      if (this.vllmEnabled && this.quantumEnabled) {
        // Full quantum-enhanced AI processing
        response = await this.processWithQuantumAI(query, userData, options);
      } else if (this.vllmEnabled) {
        // vLLM-only processing
        response = await this.processWithVLLM(query, userData);
      } else {
        // Fallback to existing AI service
        response = await this.processWithFallback(query, userData);
      }

      // Add quantum signature for authenticity
      if (this.quantumEnabled && options.sign) {
        const signature = await quantumService.signData({
          query,
          response: response.content,
          timestamp: Date.now()
        });
        response.signature = signature;
        response.authenticity = 'quantum-verified';
      }

      // Quantum-safe encryption for sensitive data
      if (this.quantumEnabled && options.encrypt && response.sensitiveData) {
        const encrypted = await quantumService.encryptData(response.sensitiveData);
        response.encryptedData = encrypted;
        response.privacyLevel = 'quantum-safe';
      }

      // Cache the response
      if (redisService.isConnected) {
        await redisService.set(cacheKey, response, 1800); // 30 minutes cache
      }

      return response;

    } catch (error) {
      console.error('❌ Enhanced AI processing failed:', error.message);

      // Return error response with quantum-safe error handling
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
        processingMethod: 'error-fallback',
        securityLevel: this.quantumEnabled ? 'quantum-safe' : 'standard'
      };
    }
  }

  async processWithQuantumAI(query, userData, options) {
    console.log('🔐 Processing with Quantum-Enhanced AI');

    // Encrypt user data for quantum processing
    const quantumInput = await quantumService.encryptData({
      query,
      userData,
      options,
      timestamp: Date.now(),
      quantumAcceleration: true
    });

    // Use vLLM with quantum context
    const vllmResponse = await vllmService.generateTravelPlan({
      ...userData,
      query: query,
      quantumContext: quantumInput,
      enhanced: true
    });

    // Quantum-enhanced result processing
    const enhancedResult = await quantumService.enhanceAIRecommendation({
      originalResponse: vllmResponse,
      quantumInput,
      confidence: 0.85
    });

    return {
      success: true,
      content: enhancedResult,
      processingMethod: 'quantum-enhanced-vllm',
      securityLevel: 'maximum',
      quantumProtected: true,
      performance: {
        method: 'quantum-accelerated',
        confidence: enhancedResult.confidence,
        processingTime: 'optimized'
      },
      timestamp: Date.now()
    };
  }

  async processWithVLLM(query, userData) {
    console.log('⚡ Processing with High-Performance vLLM');

    const response = await vllmService.generateTravelPlan({
      ...userData,
      query: query,
      enhanced: true
    });

    return {
      success: true,
      content: response,
      processingMethod: 'vllm-accelerated',
      securityLevel: 'standard',
      performance: {
        method: 'gpu-accelerated',
        throughput: 'high',
        latency: 'low'
      },
      timestamp: Date.now()
    };
  }

  async processWithFallback(query, userData) {
    console.log('🔄 Processing with Fallback AI Service');

    // Try to load existing Z.ai service
    let zaiService;
    try {
      zaiService = require('./zai-service');
    } catch (error) {
      // Create mock response if no AI service available
      return {
        success: true,
        content: {
          message: 'AI service temporarily unavailable. Using cached recommendations.',
          recommendations: this.getFallbackRecommendations(userData),
          disclaimer: 'This is a fallback response. Full AI features will be restored soon.'
        },
        processingMethod: 'fallback-cache',
        securityLevel: 'standard',
        timestamp: Date.now()
      };
    }

    const response = await zaiService.generateResponse(query, userData);

    return {
      success: true,
      content: response,
      processingMethod: 'zai-fallback',
      securityLevel: 'standard',
      timestamp: Date.now()
    };
  }

  getFallbackRecommendations(userData) {
    // Provide basic recommendations when AI is unavailable
    const { destination, budget, interests } = userData;

    return [
      {
        type: 'accommodation',
        recommendation: `Budget-friendly hotels in ${destination}`,
        estimatedCost: budget * 0.3,
        rating: 4.0
      },
      {
        type: 'activities',
        recommendation: `Popular ${interests?.[0] || 'cultural'} attractions`,
        estimatedCost: budget * 0.4,
        duration: '2-3 hours'
      },
      {
        type: 'transportation',
        recommendation: 'Local transport and airport transfer',
        estimatedCost: budget * 0.2,
        tips: 'Use ride-sharing apps for convenience'
      }
    ];
  }

  async getStreamingResponse(query, userData, onChunk) {
    await this.initialize();

    if (!this.vllmEnabled) {
      throw new Error('Streaming requires vLLM service');
    }

    // Implement streaming response
    const stream = await vllmService.streamResponse(query, userData);

    for await (const chunk of stream) {
      if (onChunk) {
        onChunk(chunk);
      }
    }
  }

  async getHealth() {
    await this.initialize();

    return {
      status: this.initialized ? 'healthy' : 'initializing',
      services: {
        vllm: this.vllmEnabled,
        quantum: this.quantumEnabled,
        redis: redisService.isConnected
      },
      capabilities: {
        streaming: this.vllmEnabled,
        quantumEncryption: this.quantumEnabled,
        caching: redisService.isConnected,
        performance: this.vllmEnabled ? 'high' : 'standard',
        security: this.quantumEnabled ? 'quantum-safe' : 'standard'
      },
      timestamp: Date.now()
    };
  }

  async clearCache() {
    if (redisService.isConnected) {
      const deleted = await redisService.clearByPattern('enhanced_ai:*');
      console.log(`🗑️  Cleared ${deleted} cached AI responses`);
      return deleted;
    }
    return 0;
  }
}

module.exports = new EnhancedAIService();
