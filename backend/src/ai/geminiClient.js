/**
 * Google Gemini API Client
 * Alternative AI provider for Maya Trips
 */

const fetch = require('node-fetch');

class GeminiClient {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'; // Updated to latest model
    this.maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS) || 2000;
    this.temperature = parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7;
  }

  /**
   * Send chat completion request to Gemini
   */
  async chatCompletion(messages, options = {}) {
    try {
      // Convert messages to Gemini format
      const contents = this.convertMessagesToGemini(messages);
      
      const requestBody = {
        contents: contents,
        generationConfig: {
          temperature: options.temperature || this.temperature,
          maxOutputTokens: options.maxTokens || this.maxTokens,
          topP: 0.8,
          topK: 40
        }
      };

      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Extract content from response
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
      
      return {
        success: true,
        data: data,
        content: content
      };

    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        success: false,
        error: error.message,
        content: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.'
      };
    }
  }

  /**
   * Convert OpenAI-style messages to Gemini format
   */
  convertMessagesToGemini(messages) {
    const contents = [];
    let systemInstruction = '';
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
        continue;
      }
      
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
    
    // Prepend system instruction to first user message if exists
    if (systemInstruction && contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemInstruction}\n\n${contents[0].parts[0].text}`;
    }
    
    return contents;
  }

  /**
   * Generate travel recommendations
   */
  async generateTravelRecommendations(destination, budget, duration, preferences = []) {
    const systemPrompt = `أنت Maya، مساعد سفر ذكي متخصص في التخطيط للرحلات. 
    قدم توصيات سفر مفصلة وعملية تتضمن:
    - 3-5 أماكن يجب زيارتها
    - توصيات الطعام المحلي
    - خيارات النقل
    - نصائح لتوفير المال
    - رؤى ثقافية
    - نصائح السلامة
    استجب بالعربية ما لم يُطلب منك الإنجليزية.`;

    const userPrompt = `خطط لرحلة مدتها ${duration} إلى ${destination} بميزانية ${budget}. 
    التفضيلات: ${preferences.join(', ')}. 
    قدم دليل سفر شامل مع نصائح عملية.`;

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
   * Generate budget analysis
   */
  async generateBudgetAnalysis(tripData, totalBudget) {
    const systemPrompt = `أنت Maya، مستشار مالي للسفر. قم بتحليل تكاليف الرحلة وقدم:
    - تفصيل مفصل للميزانية
    - توصيات لتوفير التكاليف
    - خيارات بديلة
    - اقتراحات صندوق الطوارئ
    - نصائح صرف العملات`;

    const userPrompt = `حلل ميزانية هذه الرحلة:
    الوجهة: ${tripData.destination}
    المدة: ${tripData.duration} أيام
    المسافرون: ${tripData.travelers} أشخاص
    الميزانية الإجمالية: $${totalBudget}
    
    قدم تحليلاً مالياً مفصلاً وتوصيات.`;

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
   * Generate chat response
   */
  async generateChatResponse(userMessage, conversationHistory = []) {
    const systemPrompt = `أنت Maya، مساعد سفر ذكي ودود. 
    تساعد المستخدمين في:
    - تخطيط السفر والتوصيات
    - تحليل الميزانية
    - معلومات الوجهات
    - رؤى ثقافية
    - نصائح ونصائح السفر
    
    كن محادثاً ومفيداً وقدم نصائح عملية.
    استجب بالعربية ما لم يُطلب منك الإنجليزية.`;

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
   */
  async generateDestinationInsights(destination, travelType = 'leisure') {
    const systemPrompt = `أنت Maya، خبير وجهات السفر. قدم رؤى شاملة حول الوجهات بما في ذلك:
    - أفضل وقت للزيارة
    - الظروف الجوية
    - المعالم الثقافية
    - العادات والآداب المحلية
    - خيارات النقل
    - توصيات الإقامة
    - اعتبارات السلامة
    - الجواهر المخفية والمعالم غير التقليدية`;

    const userPrompt = `قدم رؤى مفصلة حول ${destination} لسفر ${travelType}. 
    قم بتضمين معلومات عملية ونصائح ثقافية وتوصيات للزوار لأول مرة.`;

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
   * Generate payment recommendations
   */
  async generatePaymentRecommendations(tripDetails, paymentMethod = 'credit_card') {
    const systemPrompt = `أنت Maya، مستشار مالي للسفر. قدم نصائح الدفع والحجز بما في ذلك:
    - أفضل طرق الدفع للسفر
    - استراتيجيات صرف العملات
    - توصيات التأمين على السفر
    - نصائح توقيت الحجز
    - نصائح دفع لتوفير التكاليف
    - اعتبارات الأمان`;

    const userPrompt = `قدم توصيات الدفع والحجز لـ:
    الوجهة: ${tripDetails.destination}
    الميزانية: $${tripDetails.budget}
    المدة: ${tripDetails.duration} أيام
    الدفع المفضل: ${paymentMethod}
    
    قم بتضمين نصائح عملية للمدفوعات الآمنة والفعالة من حيث التكلفة.`;

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
   * Health check
   */
  async healthCheck() {
    try {
      const testMessages = [
        { role: 'user', content: 'مرحبا، هل تعمل؟' }
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

module.exports = GeminiClient;
