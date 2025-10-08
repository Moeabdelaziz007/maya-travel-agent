/**
 * FlashAttention 3 Configuration
 * Optimizes text processing performance through advanced attention mechanisms
 * Provides configuration helpers for efficient transformer inference
 */

class FlashAttentionConfig {
  constructor(options = {}) {
    // FlashAttention 3 specific configurations
    this.enabled = options.enabled !== false;
    this.version = options.version || '3.0';
    this.implementation = options.implementation || 'flash-attn-3';
    
    // Performance tuning parameters
    this.blockSize = options.blockSize || 128; // Token block size for attention computation
    this.headDim = options.headDim || 64; // Attention head dimension
    this.useCausalMask = options.useCausalMask !== false; // Use causal masking for autoregressive generation
    
    // Memory optimization
    this.useFP16 = options.useFP16 !== false; // Use FP16 precision for speed/memory tradeoff
    this.useGQA = options.useGQA !== false; // Grouped Query Attention for better efficiency
    this.groupSize = options.groupSize || 8; // Number of groups for GQA
    
    // Sequence optimization
    this.maxSeqLength = options.maxSeqLength || 8192; // Maximum sequence length
    this.useRoPE = options.useRoPE !== false; // Rotary Position Embeddings
    this.useALiBi = options.useALiBi || false; // Attention with Linear Biases (alternative to RoPE)
    
    // Dynamic optimization
    this.adaptiveBatching = options.adaptiveBatching !== false; // Batch requests dynamically
    this.prefillOptimization = options.prefillOptimization !== false; // Optimize prefill stage
    
    // Hardware-specific
    this.deviceType = options.deviceType || 'auto'; // 'cuda', 'cpu', 'auto'
    this.numStreams = options.numStreams || 1; // CUDA streams for parallel execution
    
    console.log(`⚡ FlashAttention ${this.version} initialized (${this.implementation})`);
  }

  /**
   * Get optimized configuration for specific task type
   * @param {string} taskType - 'chat', 'completion', 'analysis', 'multimodal'
   * @returns {Object} Optimized configuration
   */
  getConfigForTask(taskType) {
    const baseConfig = {
      implementation: this.implementation,
      version: this.version,
      enabled: this.enabled
    };

    switch (taskType) {
      case 'chat':
        return {
          ...baseConfig,
          blockSize: 128,
          useCausalMask: true,
          useFP16: true,
          prefillOptimization: true,
          description: 'Optimized for conversational AI with fast response generation'
        };

      case 'completion':
        return {
          ...baseConfig,
          blockSize: 256,
          useCausalMask: true,
          useFP16: true,
          maxSeqLength: 4096,
          description: 'Optimized for long-form text generation'
        };

      case 'analysis':
        return {
          ...baseConfig,
          blockSize: 64,
          useCausalMask: false,
          useFP16: true,
          useGQA: true,
          description: 'Optimized for text analysis and understanding tasks'
        };

      case 'multimodal':
        return {
          ...baseConfig,
          blockSize: 256,
          useCausalMask: true,
          useFP16: true,
          useGQA: true,
          groupSize: 4,
          description: 'Optimized for vision-language tasks with mixed modalities'
        };

      default:
        return baseConfig;
    }
  }

  /**
   * Get provider hints for Z.ai API
   * @param {string} taskType - Task type
   * @param {Object} context - Additional context
   * @returns {Object} Provider hints
   */
  getProviderHints(taskType = 'chat', context = {}) {
    const config = this.getConfigForTask(taskType);
    
    const hints = {
      attention: this.implementation,
      attention_config: {
        version: this.version,
        block_size: config.blockSize,
        use_fp16: config.useFP16,
        use_gqa: config.useGQA,
        causal_mask: config.useCausalMask
      }
    };

    // Add context-specific optimizations
    if (context.sequenceLength) {
      hints.attention_config.estimated_seq_length = context.sequenceLength;
    }

    if (context.batchSize) {
      hints.attention_config.batch_size = context.batchSize;
    }

    return hints;
  }

  /**
   * Estimate performance improvement
   * @param {Object} baseline - Baseline performance metrics
   * @returns {Object} Estimated improvements
   */
  estimatePerformance(baseline = {}) {
    const tokensPerSecond = baseline.tokensPerSecond || 100;
    const memoryUsageMB = baseline.memoryUsageMB || 1000;
    const latencyMs = baseline.latencyMs || 200;

    // FlashAttention 3 typically provides:
    // - 2-3x speedup in attention computation
    // - 30-50% memory reduction
    // - Lower latency for long sequences

    return {
      estimated: {
        tokensPerSecond: Math.round(tokensPerSecond * 2.5),
        memoryUsageMB: Math.round(memoryUsageMB * 0.6),
        latencyMs: Math.round(latencyMs * 0.5),
        improvementFactor: 2.5
      },
      baseline,
      benefits: [
        'Faster attention computation through tiling and recomputation',
        'Reduced memory footprint with IO-aware attention',
        'Better scaling for long sequences',
        'Hardware-optimized CUDA kernels'
      ]
    };
  }

  /**
   * Validate configuration
   * @returns {Object} Validation result
   */
  validate() {
    const issues = [];
    const warnings = [];

    if (this.blockSize < 32 || this.blockSize > 512) {
      warnings.push('Block size outside recommended range (32-512)');
    }

    if (this.maxSeqLength > 16384) {
      warnings.push('Very long sequences may impact performance');
    }

    if (this.useALiBi && this.useRoPE) {
      issues.push('Cannot use both ALiBi and RoPE position encodings');
    }

    if (this.useGQA && this.groupSize < 1) {
      issues.push('Invalid group size for GQA');
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      config: this.toJSON()
    };
  }

  /**
   * Get performance tuning recommendations
   * @param {Object} metrics - Current performance metrics
   * @returns {Array<string>} Recommendations
   */
  getRecommendations(metrics = {}) {
    const recommendations = [];

    if (metrics.memoryPressure > 0.8) {
      recommendations.push('Enable FP16 precision to reduce memory usage');
      recommendations.push('Reduce block size to 64 for better memory efficiency');
      recommendations.push('Enable KV cache offloading');
    }

    if (metrics.avgSequenceLength > 2048) {
      recommendations.push('Enable prefill optimization for long sequences');
      recommendations.push('Consider using ALiBi for better long-range attention');
    }

    if (metrics.throughput < metrics.targetThroughput) {
      recommendations.push('Increase block size to 256 for better throughput');
      recommendations.push('Enable adaptive batching');
      recommendations.push('Use GQA to reduce attention computation cost');
    }

    if (metrics.latency > metrics.targetLatency) {
      recommendations.push('Reduce max sequence length if not needed');
      recommendations.push('Enable parallel attention streams');
    }

    return recommendations;
  }

  /**
   * Export configuration as JSON
   * @returns {Object} Configuration object
   */
  toJSON() {
    return {
      enabled: this.enabled,
      version: this.version,
      implementation: this.implementation,
      blockSize: this.blockSize,
      headDim: this.headDim,
      useCausalMask: this.useCausalMask,
      useFP16: this.useFP16,
      useGQA: this.useGQA,
      groupSize: this.groupSize,
      maxSeqLength: this.maxSeqLength,
      useRoPE: this.useRoPE,
      useALiBi: this.useALiBi,
      adaptiveBatching: this.adaptiveBatching,
      prefillOptimization: this.prefillOptimization,
      deviceType: this.deviceType,
      numStreams: this.numStreams
    };
  }

  /**
   * Get human-readable summary
   * @returns {string} Configuration summary
   */
  getSummary() {
    return `
FlashAttention ${this.version} Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${this.enabled ? '✅ Enabled' : '❌ Disabled'}
Implementation: ${this.implementation}
Block Size: ${this.blockSize} tokens
Precision: ${this.useFP16 ? 'FP16' : 'FP32'}
Attention Type: ${this.useGQA ? `GQA (${this.groupSize} groups)` : 'Standard'}
Max Sequence: ${this.maxSeqLength} tokens
Position Encoding: ${this.useRoPE ? 'RoPE' : this.useALiBi ? 'ALiBi' : 'Learned'}
Optimizations: ${[
  this.adaptiveBatching && 'Adaptive Batching',
  this.prefillOptimization && 'Prefill Optimization',
  this.useCausalMask && 'Causal Masking'
].filter(Boolean).join(', ') || 'None'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }
}

/**
 * Singleton instance
 */
let globalFlashAttentionConfig = null;

function getGlobalFlashAttentionConfig(options = {}) {
  if (!globalFlashAttentionConfig) {
    globalFlashAttentionConfig = new FlashAttentionConfig({
      enabled: process.env.FLASH_ATTENTION_ENABLED !== 'false',
      version: process.env.FLASH_ATTENTION_VERSION || '3.0',
      implementation: process.env.FLASH_ATTENTION_IMPL || 'flash-attn-3',
      blockSize: parseInt(process.env.FLASH_ATTENTION_BLOCK_SIZE) || 128,
      maxSeqLength: parseInt(process.env.FLASH_ATTENTION_MAX_SEQ) || 8192,
      useFP16: process.env.FLASH_ATTENTION_FP16 !== 'false',
      useGQA: process.env.FLASH_ATTENTION_GQA !== 'false',
      ...options
    });
  }
  return globalFlashAttentionConfig;
}

module.exports = { FlashAttentionConfig, getGlobalFlashAttentionConfig };
