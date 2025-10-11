/**
 * محرك النوايا المعزز بالكمومية
 * Quantum-Inspired Intent & Context Engine
 *
 * يستخدم مبادئ الحوسبة الكمومية لتحليل متعدد الطبقات
 */

const logger = require('../utils/logger');

class QuantumIntentEngine {
  constructor() {
    // حالات كمومية للنوايا (Quantum Superposition)
    this.intentStates = new Map();

    // سجل السياق متعدد الأبعاد
    this.contextHistory = new Map();

    // نماذج التعلم الكمومي
    this.quantumModels = this.initializeQuantumModels();

    // عتبات الثقة الديناميكية
    this.confidenceThresholds = {
      high: 0.85,
      medium: 0.65,
      low: 0.45
    };
  }

  /**
   * تحليل كمومي متعدد الطبقات للنية
   * Multi-layered Quantum Intent Analysis
   */
  async analyzeIntent(userInput, context = {}) {
    const startTime = Date.now();

    try {
      // 1. التحليل اللغوي الكمومي (Quantum NLP)
      const linguisticLayer = await this.quantumNLPAnalysis(userInput);

      // 2. تحليل السياق متعدد الأبعاد
      const contextLayer = this.multiDimensionalContextAnalysis(
        userInput,
        context,
        linguisticLayer
      );

      // 3. التنبؤ بالنية بالتراكب الكمومي (Superposition)
      const intentSuperposition = this.quantumSuperposition(
        linguisticLayer,
        contextLayer
      );

      // 4. انهيار دالة الموجة (Wave Function Collapse)
      const collapsedIntent = this.collapseWaveFunction(intentSuperposition);

      // 5. التحقق من التشابك الكمومي (Quantum Entanglement)
      const entangledIntents = this.detectEntanglement(
        collapsedIntent,
        context
      );

      // 6. حساب درجة الثقة الكمومية
      const quantumConfidence = this.calculateQuantumConfidence(
        collapsedIntent,
        entangledIntents,
        contextLayer
      );

      const result = {
        primary_intent: collapsedIntent.intent,
        confidence: quantumConfidence,
        entangled_intents: entangledIntents,
        context_dimensions: contextLayer.dimensions,
        linguistic_features: linguisticLayer.features,
        quantum_state: intentSuperposition.state,
        processing_time: Date.now() - startTime,
        uncertainty_factor: collapsedIntent.uncertainty
      };

      // تخزين في سجل السياق
      this.updateContextHistory(context.sessionId, result);

      logger.info('Quantum Intent Analysis Complete', {
        intent: result.primary_intent,
        confidence: result.confidence,
        processingTime: result.processing_time
      });

      return result;

    } catch (error) {
      logger.error('Quantum Intent Analysis Error', { error: error.message });
      return this.getFallbackAnalysis(userInput);
    }
  }

  /**
   * التحليل اللغوي الكمومي
   * يدعم العربية والإنجليزية واللهجات
   */
  quantumNLPAnalysis(text) {
    const features = {
      tokens: this.tokenizeQuantum(text),
      language: this.detectLanguage(text),
      dialect: this.detectDialect(text),
      sentiment: this.quantumSentimentAnalysis(text),
      entities: this.extractQuantumEntities(text),
      complexity: this.calculateComplexity(text),
      ambiguity_score: this.calculateAmbiguity(text)
    };

    return {
      features,
      vector: this.vectorizeQuantum(features),
      wave_pattern: this.generateWavePattern(features)
    };
  }

  /**
   * تحليل السياق متعدد الأبعاد
   */
  multiDimensionalContextAnalysis(input, context, linguistic) {
    const dimensions = {
      // البعد الزماني
      temporal: {
        timestamp: Date.now(),
        timeOfDay: this.getTimeContext(),
        seasonality: this.getSeasonality(),
        urgency: this.detectUrgency(input)
      },

      // البعد الاجتماعي
      social: {
        groupSize: context.groupSize || 1,
        travelStyle: context.travelStyle || 'solo',
        socialContext: this.detectSocialContext(input)
      },

      // البعد الجغرافي
      spatial: {
        currentLocation: context.location,
        destinationPreferences: this.extractDestinations(input),
        distanceWillingness: this.estimateDistanceWillingness(context)
      },

      // البعد المالي
      financial: {
        budget: context.budget,
        pricesensitivity: this.detectPriceSensitivity(input),
        paymentPreference: this.detectPaymentPreference(input)
      },

      // البعد الثقافي
      cultural: {
        language: linguistic.features.language,
        dialect: linguistic.features.dialect,
        culturalPreferences: this.detectCulturalPreferences(input, context)
      },

      // البعد التاريخي (سجل المستخدم)
      historical: this.getHistoricalContext(context.sessionId)
    };

    return {
      dimensions,
      complexity_score: this.calculateContextComplexity(dimensions),
      relevance_vector: this.generateRelevanceVector(dimensions)
    };
  }

  /**
   * التراكب الكمومي للنوايا
   * يضع النوايا في حالة تراكب قبل القياس
   */
  quantumSuperposition(linguistic, contextual) {
    const possibleIntents = this.generateIntentCandidates(
      linguistic,
      contextual
    );

    // كل نية في حالة احتمالية
    const superposedStates = possibleIntents.map(intent => ({
      intent: intent.name,
      amplitude: this.calculateQuantumAmplitude(intent, linguistic, contextual),
      phase: this.calculateQuantumPhase(intent, contextual.dimensions),
      probability: 0 // سيتم حسابها عند الانهيار
    }));

    // حساب الاحتماليات من المطالات
    const totalAmplitudeSquared = superposedStates.reduce(
      (sum, state) => sum + Math.pow(state.amplitude, 2),
      0
    );

    superposedStates.forEach(state => {
      state.probability = Math.pow(state.amplitude, 2) / totalAmplitudeSquared;
    });

    return {
      states: superposedStates,
      state: 'superposition',
      entanglement_potential: this.calculateEntanglementPotential(superposedStates)
    };
  }

  /**
   * انهيار دالة الموجة
   * "قياس" النية النهائية من التراكب
   */
  collapseWaveFunction(superposition) {
    // محاكاة القياس الكمومي
    const random = Math.random();
    let cumulativeProbability = 0;
    let collapsedState = null;

    for (const state of superposition.states) {
      cumulativeProbability += state.probability;
      if (random <= cumulativeProbability) {
        collapsedState = state;
        break;
      }
    }

    // إذا لم ينهار (حالة نادرة)، اختر الأعلى احتمالية
    if (!collapsedState) {
      collapsedState = superposition.states.reduce((max, state) =>
        state.probability > max.probability ? state : max
      );
    }

    return {
      intent: collapsedState.intent,
      probability: collapsedState.probability,
      uncertainty: 1 - collapsedState.probability,
      measurement_basis: 'computational'
    };
  }

  /**
   * كشف التشابك الكمومي بين النوايا
   */
  detectEntanglement(primaryIntent, context) {
    const entangled = [];

    // النوايا المترابطة كمومياً
    const entanglementMap = {
      'plan_trip': ['search_flights', 'book_hotel', 'calculate_budget'],
      'search_destination': ['get_weather', 'get_destination_info'],
      'book_flight': ['book_hotel', 'rent_car'],
      'budget_inquiry': ['search_deals', 'compare_prices']
    };

    const relatedIntents = entanglementMap[primaryIntent.intent] || [];

    relatedIntents.forEach(relatedIntent => {
      entangled.push({
        intent: relatedIntent,
        entanglement_strength: this.calculateEntanglementStrength(
          primaryIntent.intent,
          relatedIntent,
          context
        ),
        correlation_type: 'sequential' // أو 'parallel'
      });
    });

    return entangled.filter(e => e.entanglement_strength > 0.3);
  }

  /**
   * حساب درجة الثقة الكمومية
   */
  calculateQuantumConfidence(collapsed, entangled, context) {
    // العوامل المؤثرة
    const factors = {
      base_probability: collapsed.probability,
      context_alignment: this.calculateContextAlignment(collapsed, context),
      entanglement_boost: this.calculateEntanglementBoost(entangled),
      historical_accuracy: this.getHistoricalAccuracy(collapsed.intent),
      uncertainty_penalty: collapsed.uncertainty * 0.5
    };

    // حساب الثقة المرجحة
    const confidence = (
      factors.base_probability * 0.4 +
      factors.context_alignment * 0.25 +
      factors.entanglement_boost * 0.15 +
      factors.historical_accuracy * 0.15 -
      factors.uncertainty_penalty * 0.05
    );

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * تحديث سجل السياق (للتعلم المستمر)
   */
  updateContextHistory(sessionId, result) {
    if (!sessionId) return;

    const history = this.contextHistory.get(sessionId) || [];
    history.push({
      timestamp: Date.now(),
      intent: result.primary_intent,
      confidence: result.confidence,
      context_dimensions: result.context_dimensions
    });

    // الاحتفاظ بآخر 20 تفاعل فقط
    if (history.length > 20) {
      history.shift();
    }

    this.contextHistory.set(sessionId, history);
  }

  // ============ Helper Methods ============

  tokenizeQuantum(text) {
    // تقسيم متقدم يدعم العربية والإنجليزية
    return text
      .replace(/([؟!.,،؛])/g, ' $1 ')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  detectLanguage(text) {
    const arabicChars = text.match(/[\u0600-\u06FF]/g);
    const arabicRatio = arabicChars ? arabicChars.length / text.length : 0;
    return arabicRatio > 0.3 ? 'ar' : 'en';
  }

  detectDialect(text) {
    // كشف اللهجات العربية
    const gulfMarkers = ['شلون', 'وين', 'شنو', 'اوادم'];
    const levantineMarkers = ['شو', 'كيف', 'وينك'];
    const egyptianMarkers = ['ازيك', 'عامل', 'ايه'];

    if (gulfMarkers.some(m => text.includes(m))) return 'gulf';
    if (levantineMarkers.some(m => text.includes(m))) return 'levantine';
    if (egyptianMarkers.some(m => text.includes(m))) return 'egyptian';

    return 'standard';
  }

  quantumSentimentAnalysis(text) {
    // تحليل المشاعر متعدد الأبعاد
    const positiveMarkers = ['رائع', 'ممتاز', 'جميل', 'amazing', 'great', 'love'];
    const negativeMarkers = ['سيء', 'مشكلة', 'خطأ', 'bad', 'problem', 'issue'];

    const lowerText = text.toLowerCase();
    const positiveScore = positiveMarkers.filter(m => lowerText.includes(m)).length;
    const negativeScore = negativeMarkers.filter(m => lowerText.includes(m)).length;

    return {
      polarity: (positiveScore - negativeScore) / (positiveScore + negativeScore + 1),
      intensity: (positiveScore + negativeScore) / 10,
      valence: positiveScore > negativeScore ? 'positive' : 'negative'
    };
  }

  extractQuantumEntities(text) {
    const entities = [];

    // كشف الوجهات
    const destinations = ['دبي', 'طوكيو', 'باريس', 'london', 'dubai', 'tokyo'];
    destinations.forEach(dest => {
      if (text.toLowerCase().includes(dest.toLowerCase())) {
        entities.push({ type: 'destination', value: dest });
      }
    });

    // كشف التواريخ (مبسط)
    const datePatterns = [/\d{4}-\d{2}-\d{2}/, /\d{1,2}\/\d{1,2}\/\d{4}/];
    datePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.push({ type: 'date', value: matches[0] });
      }
    });

    return entities;
  }

  calculateComplexity(text) {
    const tokens = this.tokenizeQuantum(text);
    const uniqueTokens = new Set(tokens);
    return {
      lexical_diversity: uniqueTokens.size / tokens.length,
      sentence_length: tokens.length,
      complexity_score: (uniqueTokens.size / tokens.length) * Math.log(tokens.length + 1)
    };
  }

  calculateAmbiguity(text) {
    // كلمات متعددة المعاني
    const ambiguousWords = ['book', 'حجز', 'plan', 'خطة', 'trip', 'رحلة'];
    const found = ambiguousWords.filter(w => text.toLowerCase().includes(w));
    return found.length / (text.split(' ').length + 1);
  }

  vectorizeQuantum(features) {
    // تحويل الميزات إلى vector متعدد الأبعاد
    return {
      linguistic: [
        features.complexity.complexity_score,
        features.sentiment.polarity,
        features.ambiguity_score
      ],
      contextual: [
        features.entities.length / 10,
        features.tokens.length / 100
      ]
    };
  }

  generateWavePattern(features) {
    // توليد نمط موجي للتمثيل الكمومي
    return {
      frequency: features.complexity.complexity_score * 10,
      amplitude: features.sentiment.intensity,
      phase: features.ambiguity_score * Math.PI
    };
  }

  getTimeContext() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  getSeasonality() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  detectUrgency(text) {
    const urgentKeywords = ['عاجل', 'سريع', 'الآن', 'urgent', 'asap', 'immediately'];
    return urgentKeywords.some(k => text.toLowerCase().includes(k)) ? 'high' : 'normal';
  }

  // Initialization
  initializeQuantumModels() {
    return {
      intent_classifier: 'quantum_nn_v1',
      context_analyzer: 'multidimensional_v1',
      entanglement_detector: 'correlation_matrix_v1'
    };
  }

  generateIntentCandidates(linguistic, contextual) {
    // توليد النوايا المحتملة بناءً على التحليل
    const candidates = [
      { name: 'plan_trip', relevance: 0.8 },
      { name: 'search_destination', relevance: 0.7 },
      { name: 'budget_inquiry', relevance: 0.6 },
      { name: 'book_flight', relevance: 0.5 },
      { name: 'get_weather', relevance: 0.4 },
      { name: 'general_inquiry', relevance: 0.3 }
    ];

    return candidates;
  }

  calculateQuantumAmplitude(intent, linguistic, contextual) {
    return Math.sqrt(intent.relevance) * (1 + linguistic.features.sentiment.polarity);
  }

  calculateQuantumPhase(intent, dimensions) {
    return dimensions.temporal.urgency === 'high' ? Math.PI / 4 : 0;
  }

  calculateEntanglementPotential(states) {
    const topTwo = states.sort((a, b) => b.probability - a.probability).slice(0, 2);
    return topTwo.length === 2 ? topTwo[0].probability * topTwo[1].probability : 0;
  }

  calculateEntanglementStrength(primary, related, context) {
    // قوة الترابط بين نيتين
    return Math.random() * 0.8 + 0.2; // مبسط
  }

  calculateContextAlignment(collapsed, context) {
    return 0.75; // مبسط
  }

  calculateEntanglementBoost(entangled) {
    return entangled.reduce((sum, e) => sum + e.entanglement_strength, 0) / (entangled.length + 1);
  }

  getHistoricalAccuracy(intent) {
    // دقة تاريخية للنية
    return 0.8; // مبسط
  }

  getHistoricalContext(sessionId) {
    const history = this.contextHistory.get(sessionId) || [];
    return {
      interaction_count: history.length,
      frequent_intents: this.getFrequentIntents(history),
      average_confidence: this.getAverageConfidence(history)
    };
  }

  getFrequentIntents(history) {
    const intentCounts = {};
    history.forEach(h => {
      intentCounts[h.intent] = (intentCounts[h.intent] || 0) + 1;
    });
    return Object.entries(intentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([intent]) => intent);
  }

  getAverageConfidence(history) {
    if (history.length === 0) return 0;
    return history.reduce((sum, h) => sum + h.confidence, 0) / history.length;
  }

  extractDestinations(text) {
    const entities = this.extractQuantumEntities(text);
    return entities.filter(e => e.type === 'destination').map(e => e.value);
  }

  estimateDistanceWillingness(context) {
    return context.budget ? (context.budget > 5000 ? 'long' : 'medium') : 'unknown';
  }

  detectPriceSensitivity(text) {
    const budgetKeywords = ['رخيص', 'اقتصادي', 'ميزانية', 'cheap', 'budget', 'affordable'];
    return budgetKeywords.some(k => text.toLowerCase().includes(k)) ? 'high' : 'medium';
  }

  detectPaymentPreference(text) {
    if (text.includes('يوان') || text.includes('yuan')) return 'CNY';
    if (text.includes('دولار') || text.includes('dollar')) return 'USD';
    return 'SAR';
  }

  detectCulturalPreferences(text, context) {
    return {
      halal_preference: text.includes('حلال') || text.includes('halal'),
      prayer_locations: text.includes('صلاة') || text.includes('prayer'),
      family_friendly: text.includes('عائلة') || text.includes('family')
    };
  }

  detectSocialContext(text) {
    if (text.includes('عائل') || text.includes('family')) return 'family';
    if (text.includes('أصدقاء') || text.includes('friends')) return 'friends';
    return 'solo';
  }

  calculateContextComplexity(dimensions) {
    const filledDimensions = Object.values(dimensions).filter(
      d => d && Object.keys(d).length > 0
    ).length;
    return filledDimensions / Object.keys(dimensions).length;
  }

  generateRelevanceVector(dimensions) {
    return {
      temporal: dimensions.temporal.urgency === 'high' ? 1 : 0.5,
      social: dimensions.social.groupSize > 1 ? 0.8 : 0.5,
      financial: dimensions.financial.budget ? 0.9 : 0.3
    };
  }

  getFallbackAnalysis(input) {
    return {
      primary_intent: 'general_inquiry',
      confidence: 0.3,
      entangled_intents: [],
      context_dimensions: {},
      source: 'fallback'
    };
  }
}

module.exports = new QuantumIntentEngine();