/**
 * vLLM Service - High-Performance AI Inference
 * Connects to vLLM server for fast LLM processing
 */

const OpenAI = require('openai');

class VLLMService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.baseURL = process.env.VLLM_BASE_URL || 'http://localhost:8000/v1';
    this.apiKey = process.env.VLLM_API_KEY || 'not-needed';
    this.model = process.env.VLLM_MODEL || 'THUDM/glm-4v-9b';
  }

  async connect() {
    try {
      console.log('🔗 Connecting to vLLM server...');

      this.client = new OpenAI({
        baseURL: this.baseURL,
        apiKey: this.apiKey,
      });

      // Test connection
      await this.client.models.list();
      this.isConnected = true;

      console.log(`✅ Connected to vLLM server at ${this.baseURL}`);
      console.log(`📋 Using model: ${this.model}`);

      return true;
    } catch (error) {
      console.error('❌ vLLM connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async generateTravelPlan(params) {
    if (!this.isConnected && !(await this.connect())) {
      throw new Error('vLLM service not available');
    }

    try {
      const { destination, budget, duration, interests, query } = params;

      // Build comprehensive prompt
      const prompt = this.buildTravelPrompt({
        destination,
        budget,
        duration,
        interests: interests || [],
        query: query || `Plan a trip to ${destination}`,
      });

      console.log('🧠 Generating travel plan with vLLM...');

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are Amrikyy, an advanced AI travel assistant powered by quantum-enhanced processing. Provide detailed, personalized travel recommendations with specific costs, timings, and local insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      });

      const content = response.choices[0].message.content;
      const parsed = this.parseTravelPlan(content);

      return {
        ...parsed,
        metadata: {
          model: this.model,
          processingTime: response.usage?.total_tokens || 0,
          tokens: response.usage,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ vLLM generation failed:', error.message);
      throw error;
    }
  }

  buildTravelPrompt({ destination, budget, duration, interests, query }) {
    return `Create a comprehensive travel plan for:

DESTINATION: ${destination}
BUDGET: $${budget}
DURATION: ${duration} days
INTERESTS: ${interests.join(', ') || 'general tourism'}
QUERY: ${query}

Please provide:
1. **Daily Itinerary** - Detailed day-by-day schedule
2. **Accommodation** - 3 options with prices and ratings
3. **Transportation** - Getting around and transfers
4. **Activities** - Specific attractions and experiences
5. **Food & Dining** - Restaurant recommendations
6. **Budget Breakdown** - Cost analysis by category
7. **Local Tips** - Cultural insights and safety advice
8. **Best Time** - Weather and seasonal considerations

Format your response as a structured JSON object with these sections. Be specific with costs, addresses, and practical details.`;
  }

  parseTravelPlan(content) {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      // If not JSON, structure the text response
      return {
        destination: 'Parsed from AI response',
        summary: content.substring(0, 500),
        fullResponse: content,
        structured: false,
        error: 'Response not in expected JSON format',
      };
    }
  }

  async streamResponse(query, userData, onChunk) {
    if (!this.isConnected && !(await this.connect())) {
      throw new Error('vLLM service not available');
    }

    try {
      const prompt = this.buildTravelPrompt({
        ...userData,
        query,
      });

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are Amrikyy, a quantum-enhanced AI travel assistant. Provide streaming responses with real-time travel planning.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      });

      // Return async iterator for streaming
      return stream;
    } catch (error) {
      console.error('❌ vLLM streaming failed:', error.message);
      throw error;
    }
  }

  async getHealth() {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const models = await this.client.models.list();

      return {
        status: 'healthy',
        connected: this.isConnected,
        baseURL: this.baseURL,
        model: this.model,
        availableModels: models.data?.length || 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  async getMetrics() {
    // vLLM doesn't provide detailed metrics via API
    // This would need to be integrated with vLLM's monitoring endpoints
    return {
      status: 'limited',
      message: 'Detailed metrics available via vLLM server endpoints',
      timestamp: Date.now(),
    };
  }

  async disconnect() {
    this.isConnected = false;
    this.client = null;
    console.log('🔌 Disconnected from vLLM server');
  }
}

module.exports = new VLLMService();
