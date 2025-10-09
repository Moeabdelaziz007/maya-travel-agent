/**
 * Context-Aware Response System
 * Maintains conversation context and provides personalized responses
 */

const { createClient } = require('@supabase/supabase-js');
const KnowledgeBaseService = require('./knowledgeBase');
const UserProfileService = require('./userProfileService');
const ReasoningEngine = require('./reasoningEngine');

class ContextService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.knowledgeBase = new KnowledgeBaseService();
    this.userProfile = new UserProfileService();
    this.reasoningEngine = new ReasoningEngine();
  }

  /**
   * Generate context-aware response for user query
   * @param {string} userId - User ID
   * @param {string} message - User's message
   * @param {Object} options - Response options
   * @returns {Promise<Object>} Context-aware response
   */
  async generateContextAwareResponse(userId, message, options = {}) {
    const conversationId = options.conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // Step 1: Retrieve conversation context
      const conversationContext = await this.getConversationContext(userId, conversationId);

      // Step 2: Get user profile and preferences
      const userProfile = await this.userProfile.getUserProfile(userId);

      // Step 3: Analyze message in context
      const contextAnalysis = await this.analyzeMessageContext(message, conversationContext, userProfile);

      // Step 4: Generate reasoning trace if needed
      let reasoningTrace = null;
      if (options.useReasoning !== false && contextAnalysis.requiresReasoning) {
        reasoningTrace = await this.reasoningEngine.generateReasoningTrace(userId, message, {
          conversationId,
          startTime,
          conversationContext,
          userProfile,
          contextAnalysis
        });
      }

      // Step 5: Generate personalized response
      const response = await this.generatePersonalizedResponse(
        message,
        contextAnalysis,
        userProfile,
        reasoningTrace,
        conversationContext
      );

      // Step 6: Update conversation context
      await this.updateConversationContext(userId, conversationId, {
        lastMessage: message,
        lastResponse: response.content,
        contextAnalysis,
        timestamp: new Date().toISOString()
      });

      // Step 7: Record user behavior for learning
      await this.userProfile.recordUserBehavior(
        userId,
        'chat_message',
        {
          messageLength: message.length,
          intent: contextAnalysis.intent,
          requiresReasoning: contextAnalysis.requiresReasoning,
          responseLength: response.content.length
        },
        conversationId
      );

      return {
        conversationId,
        response: response.content,
        contextAnalysis,
        reasoningTrace,
        suggestions: response.suggestions || [],
        metadata: {
          processingTime: Date.now() - startTime,
          contextUsed: conversationContext.length,
          personalized: response.personalized,
          confidence: response.confidence || 0.8
        }
      };

    } catch (error) {
      console.error('Error generating context-aware response:', error);

      // Return fallback response
      return {
        conversationId,
        response: 'I apologize, but I encountered an error processing your request. Could you please try again?',
        contextAnalysis: { intent: 'error', confidence: 0 },
        suggestions: ['Try rephrasing your question', 'Contact support if the issue persists'],
        metadata: {
          processingTime: Date.now() - startTime,
          error: error.message
        }
      };
    }
  }

  /**
   * Get conversation context for a user
   * @param {string} userId - User ID
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} Conversation context
   */
  async getConversationContext(userId, conversationId) {
    try {
      const { data, error } = await this.supabase
        .from('ai_conversation_context')
        .select('*')
        .eq('user_id', userId)
        .eq('conversation_id', conversationId)
        .order('created_at', false)
        .limit(10);

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error getting conversation context:', error);
      return [];
    }
  }

  /**
   * Update conversation context
   * @param {string} userId - User ID
   * @param {string} conversationId - Conversation ID
   * @param {Object} contextData - Context data to store
   * @returns {Promise<void>}
   */
  async updateConversationContext(userId, conversationId, contextData) {
    try {
      const { error } = await this.supabase
        .from('ai_conversation_context')
        .insert({
          user_id: userId,
          conversation_id: conversationId,
          context_type: 'conversation_memory',
          context_data: contextData,
          importance_score: 0.8
        });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error updating conversation context:', error);
    }
  }

  /**
   * Analyze message in the context of conversation history
   * @param {string} message - User's message
   * @param {Array} conversationContext - Previous conversation context
   * @param {Object} userProfile - User profile
   * @returns {Promise<Object>} Context analysis
   */
  async analyzeMessageContext(message, conversationContext, userProfile) {
    const analysis = {
      intent: this.detectIntent(message),
      urgency: this.detectUrgency(message),
      complexity: this.detectComplexity(message),
      requiresReasoning: false,
      contextReferences: [],
      personalRelevance: 0.5
    };

    // Check if message references previous context
    analysis.contextReferences = this.findContextReferences(message, conversationContext);

    // Determine if reasoning is needed
    analysis.requiresReasoning = this.determineReasoningNeed(analysis, message);

    // Calculate personal relevance based on user profile
    analysis.personalRelevance = this.calculatePersonalRelevance(message, userProfile);

    return analysis;
  }

  /**
   * Detect intent from message
   * @param {string} message - User's message
   * @returns {string} Detected intent
   */
  detectIntent(message) {
    const intentPatterns = {
      travel_planning: /\b(plan|trip|travel|visit|vacation|holiday|journey)\b/i,
      budget_inquiry: /\b(budget|cost|price|expensive|cheap|money|afford)\b/i,
      destination_info: /\b(information|details|about|tell me|what is|how is)\b/i,
      recommendations: /\b(recommend|suggest|best|top|ideas|options)\b/i,
      booking_help: /\b(book|reserve|ticket|hotel|flight|buy)\b/i,
      safety_concern: /\b(safe|dangerous|security|warning|risk|emergency)\b/i,
      cultural_question: /\b(culture|customs|tradition|people|local|etiquette)\b/i
    };

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(message)) {
        return intent;
      }
    }

    return 'general_inquiry';
  }

  /**
   * Detect urgency level from message
   * @param {string} message - User's message
   * @returns {string} Urgency level
   */
  detectUrgency(message) {
    const urgentKeywords = /\b(urgent|emergency|asap|quickly|immediately|help|problem)\b/i;

    if (urgentKeywords.test(message)) {
      return 'high';
    }

    const moderateKeywords = /\b(soon|today|tomorrow|deadline|schedule)\b/i;
    if (moderateKeywords.test(message)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Detect complexity level from message
   * @param {string} message - User's message
   * @returns {string} Complexity level
   */
  detectComplexity(message) {
    const words = message.split(/\s+/).length;
    const questions = (message.match(/\?/g) || []).length;
    const conditions = (message.match(/\b(if|but|however|although|unless)\b/gi) || []).length;

    if (words > 50 || questions > 2 || conditions > 2) {
      return 'high';
    }

    if (words > 20 || questions > 0 || conditions > 0) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Find references to previous context in message
   * @param {string} message - User's message
   * @param {Array} conversationContext - Previous context
   * @returns {Array} Context references
   */
  findContextReferences(message, conversationContext) {
    const references = [];
    const messageLower = message.toLowerCase();

    // Look for pronouns that might reference previous context
    const pronouns = /\b(this|that|it|they|them|those|these)\b/gi;
    if (pronouns.test(message)) {
      references.push('pronoun_reference');
    }

    // Look for follow-up words
    const followUpWords = /\b(also|too|as well|additionally|furthermore|moreover)\b/gi;
    if (followUpWords.test(message)) {
      references.push('follow_up');
    }

    // Look for clarification requests
    const clarificationWords = /\b(what|how|why|when|where|clarify|explain)\b/gi;
    if (clarificationWords.test(message)) {
      references.push('clarification');
    }

    return references;
  }

  /**
   * Determine if message requires structured reasoning
   * @param {Object} analysis - Message analysis
   * @param {string} message - Original message
   * @returns {boolean} Whether reasoning is needed
   */
  determineReasoningNeed(analysis, message) {
    // High complexity always needs reasoning
    if (analysis.complexity === 'high') {
      return true;
    }

    // Planning and booking requests need reasoning
    if (['travel_planning', 'booking_help'].includes(analysis.intent)) {
      return true;
    }

    // Budget inquiries need reasoning
    if (analysis.intent === 'budget_inquiry') {
      return true;
    }

    // Long messages might need reasoning
    if (message.length > 200) {
      return true;
    }

    return false;
  }

  /**
   * Calculate personal relevance based on user profile
   * @param {string} message - User's message
   * @param {Object} userProfile - User profile
   * @returns {number} Personal relevance score
   */
  calculatePersonalRelevance(message, userProfile) {
    let relevance = 0.5; // Base relevance
    const messageLower = message.toLowerCase();

    // Check if message relates to user's travel style
    if (userProfile.travel_style) {
      for (const style of userProfile.travel_style) {
        if (messageLower.includes(style.toLowerCase())) {
          relevance += 0.2;
        }
      }
    }

    // Check if message relates to user's preferred destinations
    if (userProfile.preferred_destinations) {
      for (const destination of userProfile.preferred_destinations) {
        if (messageLower.includes(destination.toLowerCase())) {
          relevance += 0.3;
        }
      }
    }

    // Check if message relates to user's budget range
    if (userProfile.budget_range && messageLower.includes('budget')) {
      relevance += 0.2;
    }

    return Math.min(relevance, 1.0);
  }

  /**
   * Generate personalized response based on context analysis
   * @param {string} message - User's message
   * @param {Object} contextAnalysis - Context analysis
   * @param {Object} userProfile - User profile
   * @param {Object} reasoningTrace - Reasoning trace (if available)
   * @param {Array} conversationContext - Conversation context
   * @returns {Promise<Object>} Personalized response
   */
  async generatePersonalizedResponse(message, contextAnalysis, userProfile, reasoningTrace, conversationContext) {
    // Build personalized system prompt
    const systemPrompt = await this.buildPersonalizedSystemPrompt(userProfile, contextAnalysis);

    // Get relevant knowledge for context
    const relevantKnowledge = reasoningTrace ?
      await this.getRelevantKnowledgeForResponse(contextAnalysis, reasoningTrace) : [];

    // Generate response content
    const responseContent = await this.generateResponseContent(
      message,
      systemPrompt,
      contextAnalysis,
      relevantKnowledge,
      conversationContext
    );

    // Generate contextual suggestions
    const suggestions = await this.generateContextualSuggestions(
      message,
      contextAnalysis,
      userProfile,
      responseContent
    );

    return {
      content: responseContent,
      suggestions,
      personalized: true,
      confidence: this.calculateResponseConfidence(contextAnalysis, reasoningTrace),
      basedOn: {
        userProfile: !!userProfile,
        conversationContext: conversationContext.length > 0,
        reasoningTrace: !!reasoningTrace,
        knowledgeBase: relevantKnowledge.length > 0
      }
    };
  }

  /**
   * Build personalized system prompt based on user profile
   * @param {Object} userProfile - User profile
   * @param {Object} contextAnalysis - Context analysis
   * @returns {Promise<string>} Personalized system prompt
   */
  async buildPersonalizedSystemPrompt(userProfile, contextAnalysis) {
    let prompt = `You are Maya, an intelligent travel assistant. `;

    // Add persona information
    if (userProfile.personas && userProfile.personas.length > 0) {
      const primaryPersona = userProfile.personas[0];
      prompt += `The user has a "${primaryPersona.user_personas.name}" travel persona. `;
      prompt += `Persona characteristics: ${JSON.stringify(primaryPersona.user_personas.characteristics)}. `;
    }

    // Add travel style preferences
    if (userProfile.travel_style && userProfile.travel_style.length > 0) {
      prompt += `User's preferred travel styles: ${userProfile.travel_style.join(', ')}. `;
    }

    // Add budget preference
    if (userProfile.budget_range) {
      prompt += `User's budget preference: ${userProfile.budget_range}. `;
    }

    // Add language preferences
    if (userProfile.language_preferences && userProfile.language_preferences.length > 0) {
      prompt += `Preferred languages: ${userProfile.language_preferences.join(', ')}. `;
    }

    // Add context-specific instructions
    if (contextAnalysis.urgency === 'high') {
      prompt += 'The user seems to need urgent assistance, so respond promptly and helpfully. ';
    }

    if (contextAnalysis.complexity === 'high') {
      prompt += 'This is a complex query that may require detailed explanation. ';
    }

    prompt += 'Provide helpful, accurate, and personalized travel assistance.';

    return prompt;
  }

  /**
   * Get relevant knowledge for response generation
   * @param {Object} contextAnalysis - Context analysis
   * @param {Object} reasoningTrace - Reasoning trace
   * @returns {Promise<Array>} Relevant knowledge
   */
  async getRelevantKnowledgeForResponse(contextAnalysis, reasoningTrace) {
    if (!reasoningTrace || !reasoningTrace.intentAnalysis) {
      return [];
    }

    const { intent, requirements } = reasoningTrace.intentAnalysis;

    // Use knowledge from reasoning trace if available
    if (reasoningTrace.executionResults) {
      // Extract knowledge from reasoning steps
      const knowledge = [];
      for (const step of reasoningTrace.reasoningSteps) {
        if (step.evidence && step.evidence.length > 0) {
          knowledge.push(...step.evidence);
        }
      }
      return knowledge;
    }

    return [];
  }

  /**
   * Generate response content using AI
   * @param {string} message - User's message
   * @param {string} systemPrompt - System prompt
   * @param {Object} contextAnalysis - Context analysis
   * @param {Array} knowledge - Relevant knowledge
   * @param {Array} conversationContext - Conversation context
   * @returns {Promise<string>} Response content
   */
  async generateResponseContent(message, systemPrompt, contextAnalysis, knowledge, conversationContext) {
    // This would integrate with the existing ZaiClient
    // For now, return a template response
    return `Thank you for your question about "${contextAnalysis.intent}". Based on your profile and our conversation context, I'll provide a personalized response. This is a placeholder for the actual AI-generated response that would use the ${systemPrompt.substring(0, 50)}... system prompt.`;
  }

  /**
   * Generate contextual suggestions based on response
   * @param {string} message - Original message
   * @param {Object} contextAnalysis - Context analysis
   * @param {Object} userProfile - User profile
   * @param {string} responseContent - Generated response
   * @returns {Promise<Array>} Contextual suggestions
   */
  async generateContextualSuggestions(message, contextAnalysis, userProfile, responseContent) {
    const suggestions = [];

    // Intent-based suggestions
    switch (contextAnalysis.intent) {
      case 'travel_planning':
        suggestions.push(
          'Would you like me to create a detailed itinerary?',
          'Shall I check current prices and availability?',
          'Do you need recommendations for accommodations?'
        );
        break;
      case 'budget_inquiry':
        suggestions.push(
          'Would you like a detailed budget breakdown?',
          'Shall I suggest ways to optimize your budget?',
          'Do you need cost comparisons for different options?'
        );
        break;
      case 'destination_info':
        suggestions.push(
          'Would you like more specific information about attractions?',
          'Shall I provide practical travel tips?',
          'Do you need information about local transportation?'
        );
        break;
      default:
        suggestions.push(
          'Is there anything specific you\'d like to know more about?',
          'Would you like recommendations based on your preferences?',
          'Do you have any other travel-related questions?'
        );
    }

    return suggestions;
  }

  /**
   * Calculate confidence score for response
   * @param {Object} contextAnalysis - Context analysis
   * @param {Object} reasoningTrace - Reasoning trace
   * @returns {number} Confidence score
   */
  calculateResponseConfidence(contextAnalysis, reasoningTrace) {
    let confidence = 0.5; // Base confidence

    // Higher confidence for clear intents
    if (contextAnalysis.intent !== 'general_inquiry') {
      confidence += 0.2;
    }

    // Higher confidence for low complexity
    if (contextAnalysis.complexity === 'low') {
      confidence += 0.2;
    }

    // Higher confidence with reasoning trace
    if (reasoningTrace) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Create new conversation context
   * @param {string} userId - User ID
   * @param {Object} initialData - Initial conversation data
   * @returns {Promise<string>} Conversation ID
   */
  async createConversation(userId, initialData = {}) {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      await this.supabase
        .from('ai_conversation_context')
        .insert({
          user_id: userId,
          conversation_id: conversationId,
          context_type: 'conversation_start',
          context_data: {
            started_at: new Date().toISOString(),
            initial_message: initialData.initialMessage || null,
            ...initialData
          },
          importance_score: 0.9
        });

      return conversationId;

    } catch (error) {
      console.error('Error creating conversation:', error);
      return conversationId; // Return ID even if storage fails
    }
  }

  /**
   * Get conversation history for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of conversations to retrieve
   * @returns {Promise<Array>} Conversation history
   */
  async getConversationHistory(userId, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('ai_conversation_context')
        .select('*')
        .eq('user_id', userId)
        .eq('context_type', 'conversation_memory')
        .order('created_at', false)
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }
}

module.exports = ContextService;