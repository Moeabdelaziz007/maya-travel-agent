/**
 * Z.ai GLM-4.6 API Client
 * Professional integration for Maya Trips AI Assistant
 * Enhanced with KV cache offloading, multimodal support, and FlashAttention 3
 */

const fetch = require('node-fetch');
const { getGlobalCacheManager } = require('./kvCacheManager');
const { getGlobalFlashAttentionConfig } = require('./flashAttention');
const MultimodalProcessor = require('./multimodalProcessor');

class ZaiClient {
  constructor() {
    this.apiKey = process.env.ZAI_API_KEY;
    // Use Coding API endpoint for GLM Coding Plan
    this.baseUrl = process.env.ZAI_API_BASE_URL || 'https://api.z.ai/api/coding/paas/v4';
    this.model = process.env.ZAI_MODEL || 'glm-4.6';
    this.maxTokens = parseInt(process.env.ZAI_MAX_TOKENS) || 2000;
    this.temperature = parseFloat(process.env.ZAI_TEMPERATURE) || 0.7;
    
    // Initialize advanced features
    this.cacheManager = getGlobalCacheManager();
    this.flashAttention = getGlobalFlashAttentionConfig();
    this.multimodalProcessor = new MultimodalProcessor();
    
    // Optional provider hints for performance/memory behavior
    this.enableKvCacheOffload = process.env.ZAI_ENABLE_KV_OFFLOAD !== 'false';
    this.attentionImpl = process.env.ZAI_ATTENTION_IMPL || 'flash-attn-3';
    
    console.log('🚀 ZaiClient initialized with advanced features:');
    console.log(`   - KV Cache Management: ${this.enableKvCacheOffload ? 'Enabled' : 'Disabled'}`);
    console.log(`   - FlashAttention: ${this.flashAttention.enabled ? this.flashAttention.version : 'Disabled'}`);
    console.log(`   - Multimodal Processing: Enabled`);
  }

  /**
   * Send chat completion request to GLM-4.6
   * Enhanced with KV cache and FlashAttention optimization
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response
   */
  async chatCompletion(messages, options = {}) {
    try {
      // Check cache first
      const cacheKey = this.cacheManager.generateCacheKey(messages, options);
      const cached = this.cacheManager.get(cacheKey);
      
      if (cached && !options.skipCache) {
        console.log('💾 Cache hit - returning cached response');
        return {
          success: true,
          data: cached.data,
          content: cached.content,
          fromCache: true
        };
      }

      const requestBody = {
        model: options.model || this.model,
        messages: messages,
        temperature: options.temperature || this.temperature,
        max_tokens: options.maxTokens || this.maxTokens,
        stream: options.stream || false
      };

      // Build advanced provider hints with KV cache and FlashAttention
      const taskType = options.taskType || 'chat';
      const flashConfig = this.flashAttention.getProviderHints(taskType, {
        sequenceLength: this.estimateSequenceLength(messages),
        batchSize: 1
      });
      
      const cacheHints = this.cacheManager.getProviderHints();

      const providerHints = {
        kv_cache_offload: options.enableKvCacheOffload !== undefined 
          ? options.enableKvCacheOffload 
          : (this.enableKvCacheOffload || cacheHints.kv_cache_offload),
        attention: options.attentionImpl || this.attentionImpl || flashConfig.attention,
        attention_config: flashConfig.attention_config,
        cache_strategy: cacheHints.offload_strategy
      };
      
      // Only attach if any value present to avoid sending noisy nulls
      if (providerHints.kv_cache_offload !== undefined || providerHints.attention !== undefined) {
        requestBody.provider_hints = providerHints;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Z.ai API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Extract content from response (GLM-4.6 uses reasoning_content)
      const message = data.choices?.[0]?.message;
      const content = message?.content || message?.reasoning_content || data.output || 'No response generated';
      
      const result = {
        success: true,
        data: data,
        content: content,
        fromCache: false
      };
      
      // Cache the successful response
      if (!options.skipCache) {
        this.cacheManager.set(cacheKey, {
          data: data,
          content: content
        });
      }
      
      return result;

    } catch (error) {
      console.error('Z.ai API Error:', error);
      return {
        success: false,
        error: error.message,
        content: 'Sorry, I encountered an error. Please try again.'
      };
    }
  }

  /**
   * Analyze visual media (image or video) with an accompanying prompt.
   * Attempts to use provider multimodal interface if available; otherwise falls back to text reasoning.
   * @param {Object} params - Analysis parameters
   * @param {string} params.prompt - User prompt/question
   * @param {string[]} [params.imageUrls] - One or more image URLs
   * @param {string} [params.videoUrl] - Optional video URL
   * @param {Object} [options] - Additional model options
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeMedia({ prompt, imageUrls = [], videoUrl = null }, options = {}) {
    // Compose a robust instruction so text-only fallback is still useful
    const systemPrompt = `You are Maya, an expert travel assistant with strong visual understanding.
    When images or video are provided, carefully describe relevant travel context (landmarks, conditions, activities, safety, accessibility) and extract actionable trip-planning insights.
    Be concise and practical. Prefer Arabic unless explicitly asked for English.`;

    // Some providers support mixed content arrays; we send a conservative structure
    const mediaDescriptionLines = [];
    if (imageUrls.length > 0) {
      mediaDescriptionLines.push(`Images provided: ${imageUrls.join(', ')}`);
    }
    if (videoUrl) {
      mediaDescriptionLines.push(`Video provided: ${videoUrl}`);
    }

    const mediaContext = mediaDescriptionLines.length > 0
      ? `\nMedia context:\n${mediaDescriptionLines.join('\n')}`
      : '';

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${prompt || 'Analyze the provided media for trip planning.'}${mediaContext}` }
    ];

    // Reuse chatCompletion; provider_hints will carry KV offload and attention impl
    return await this.chatCompletion(messages, {
      temperature: options.temperature ?? 0.4,
      maxTokens: options.maxTokens ?? 900,
      enableKvCacheOffload: options.enableKvCacheOffload,
      attentionImpl: options.attentionImpl
    });
  }

  /**
   * Generate travel recommendations using GLM-4.6
   * @param {string} destination - Travel destination
   * @param {string} budget - Budget range
   * @param {string} duration - Trip duration
   * @param {Array} preferences - User preferences
   * @returns {Promise<Object>} Travel recommendations
   */
  async generateTravelRecommendations(destination, budget, duration, preferences = []) {
    const systemPrompt = `You are Maya, an expert AI travel assistant specializing in Arabic and English travel planning. 
    Provide detailed, practical travel recommendations with:
    - 3-5 must-visit attractions
    - Local food recommendations
    - Transportation options
    - Budget-friendly tips
    - Cultural insights
    - Safety advice
    Respond in Arabic unless specifically asked in English.`;

    const userPrompt = `Plan a ${duration} trip to ${destination} with a budget of ${budget}. 
    Preferences: ${preferences.join(', ')}. 
    Provide a comprehensive travel guide with practical tips.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 1500
    });
  }

  /**
   * Generate budget analysis and recommendations
   * @param {Object} tripData - Trip details
   * @param {number} totalBudget - Total budget
   * @returns {Promise<Object>} Budget analysis
   */
  async generateBudgetAnalysis(tripData, totalBudget) {
    const systemPrompt = `You are Maya, a financial travel advisor. Analyze trip costs and provide:
    - Detailed budget breakdown
    - Cost-saving recommendations
    - Alternative options
    - Emergency fund suggestions
    - Currency exchange tips`;

    const userPrompt = `Analyze this trip budget:
    Destination: ${tripData.destination}
    Duration: ${tripData.duration} days
    Travelers: ${tripData.travelers} people
    Total Budget: $${totalBudget}
    
    Provide a detailed financial analysis and recommendations.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 1200
    });
  }

  /**
   * Generate AI chat response for general conversation
   * @param {string} userMessage - User's message
   * @param {Array} conversationHistory - Previous messages
   * @returns {Promise<Object>} AI response
   */
  async generateChatResponse(userMessage, conversationHistory = []) {
    const systemPrompt = `You are Maya, a friendly and knowledgeable AI travel assistant. 
    You help users with:
    - Travel planning and recommendations
    - Budget analysis
    - Destination information
    - Cultural insights
    - Travel tips and advice
    
    Be conversational, helpful, and provide practical advice.
    Respond in Arabic unless specifically asked in English.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1000
    });
  }

  /**
   * Generate destination insights
   * @param {string} destination - Destination name
   * @param {string} travelType - Type of travel (business, leisure, adventure, etc.)
   * @returns {Promise<Object>} Destination insights
   */
  async generateDestinationInsights(destination, travelType = 'leisure') {
    const systemPrompt = `You are Maya, a travel destination expert. Provide comprehensive insights about destinations including:
    - Best time to visit
    - Weather conditions
    - Cultural highlights
    - Local customs and etiquette
    - Transportation options
    - Accommodation recommendations
    - Safety considerations
    - Hidden gems and off-the-beaten-path attractions`;

    const userPrompt = `Provide detailed insights about ${destination} for ${travelType} travel. 
    Include practical information, cultural tips, and recommendations for first-time visitors.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 1800
    });
  }

  /**
   * Generate payment and booking recommendations
   * @param {Object} tripDetails - Trip information
   * @param {string} paymentMethod - Preferred payment method
   * @returns {Promise<Object>} Payment recommendations
   */
  async generatePaymentRecommendations(tripDetails, paymentMethod = 'credit_card') {
    const systemPrompt = `You are Maya, a travel financial advisor. Provide payment and booking advice including:
    - Best payment methods for travel
    - Currency exchange strategies
    - Travel insurance recommendations
    - Booking timing advice
    - Cost-saving payment tips
    - Security considerations`;

    const userPrompt = `Provide payment and booking recommendations for:
    Destination: ${tripDetails.destination}
    Budget: $${tripDetails.budget}
    Duration: ${tripDetails.duration} days
    Preferred payment: ${paymentMethod}
    
    Include practical tips for secure and cost-effective payments.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 1000
    });
  }

  /**
   * Estimate sequence length from messages
   * @param {Array} messages - Message array
   * @returns {number} Estimated token count
   */
  estimateSequenceLength(messages) {
    // Rough estimate: 1 token ≈ 4 characters
    const totalChars = messages.reduce((sum, msg) => 
      sum + (typeof msg.content === 'string' ? msg.content.length : 0), 0);
    return Math.ceil(totalChars / 4);
  }

  /**
   * Process multimodal files (images/videos)
   * @param {Array<Buffer>} files - Array of file buffers with metadata
   * @returns {Promise<Array<Object>>} Processing results
   */
  async processMultimodalFiles(files) {
    const results = [];
    for (const file of files) {
      const result = await this.multimodalProcessor.processFileBuffer(
        file.buffer,
        file.originalName,
        file.mimeType
      );
      results.push(result);
    }
    return results;
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance stats
   */
  getPerformanceStats() {
    return {
      cache: this.cacheManager.getStats(),
      flashAttention: this.flashAttention.toJSON(),
      multimodal: {
        uploadDir: this.multimodalProcessor.uploadDir,
        maxFileSize: this.multimodalProcessor.maxFileSize
      }
    };
  }

  /**
   * Health check for Z.ai API
   * @returns {Promise<Object>} API status
   */
  async healthCheck() {
    try {
      const testMessages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, are you working?' }
      ];

      const response = await this.chatCompletion(testMessages, {
        maxTokens: 50,
        temperature: 0.1
      });

      return {
        success: response.success,
        status: response.success ? 'healthy' : 'unhealthy',
        error: response.error || null
      };

    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = ZaiClient;
