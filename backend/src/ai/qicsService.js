/**
 * خدمة تصنيف النوايا بالذكاء الاصطناعي الكمي
 * Quantum-Inspired Intent Classification Service
 */

const logger = require('../utils/logger');

class QICSService {
  constructor() {
    this.intents = {
      // نوايا التخطيط للرحلات
      'plan_trip': {
        keywords: ['رحلة', 'سفر', 'خطط', 'أخطط', 'أريد أن أسافر', 'plan', 'trip', 'travel'],
        confidence_boost: 0.9,
        actions: ['show_trip_planner', 'suggest_destinations']
      },

      // نوايا البحث عن الوجهات
      'search_destination': {
        keywords: ['وجهة', 'مكان', 'أين', 'destination', 'where', 'place', 'city', 'country'],
        confidence_boost: 0.85,
        actions: ['show_destinations', 'filter_by_location']
      },

      // نوايا الميزانية
      'budget_inquiry': {
        keywords: ['ميزانية', 'كم', 'سعر', 'تكلفة', 'budget', 'cost', 'price', 'how much'],
        confidence_boost: 0.8,
        actions: ['show_budget_tracker', 'calculate_costs']
      },

      // نوايا الحجز والدفع
      'booking_payment': {
        keywords: ['حجز', 'دفع', 'احجز', 'ادفع', 'book', 'pay', 'payment', 'reserve'],
        confidence_boost: 0.95,
        actions: ['show_payment_modal', 'process_booking']
      },

      // نوايا الاستفسار عن المعلومات
      'information_request': {
        keywords: ['معلومات', 'اخبرني', 'ما هو', 'كيف', 'info', 'tell me', 'what', 'how'],
        confidence_boost: 0.7,
        actions: ['provide_information', 'show_help']
      },

      // نوايا إلغاء أو تعديل
      'modify_cancel': {
        keywords: ['إلغاء', 'تعديل', 'غير', 'cancel', 'modify', 'change', 'update'],
        confidence_boost: 0.85,
        actions: ['show_trip_history', 'enable_modifications']
      }
    };
  }

  /**
   * تحليل النية من نص المستخدم
   * @param {string} userInput - نص المستخدم
   * @param {object} context - السياق الحالي (الصفحة، الرحلات السابقة، إلخ)
   * @returns {object} - النية المكتشفة مع درجة الثقة والإجراءات
   */
  async predictIntent(userInput, context = {}) {
    try {
      const normalizedInput = userInput.toLowerCase().trim();
      const scores = {};

      // حساب درجات الثقة لكل نية
      for (const [intentName, intentData] of Object.entries(this.intents)) {
        let score = 0;
        let matchedKeywords = [];

        // فحص الكلمات المفتاحية
        for (const keyword of intentData.keywords) {
          if (normalizedInput.includes(keyword.toLowerCase())) {
            score += intentData.confidence_boost;
            matchedKeywords.push(keyword);
          }
        }

        // تعزيز السياق - إذا كان المستخدم في صفحة معينة
        if (context.currentPage) {
          if (intentName.includes(context.currentPage)) {
            score += 0.2; // زيادة الثقة إذا كان السياق يتطابق
          }
        }

        // تعزيز بناءً على التاريخ
        if (context.previousIntent && context.previousIntent === intentName) {
          score += 0.15; // المحادثة مستمرة في نفس السياق
        }

        scores[intentName] = {
          score: Math.min(score, 1.0), // لا تتجاوز 1.0
          matchedKeywords,
          actions: intentData.actions
        };
      }

      // اختيار النية ذات أعلى درجة
      const sortedIntents = Object.entries(scores)
        .sort(([, a], [, b]) => b.score - a.score);

      const [topIntent, topIntentData] = sortedIntents[0];
      const [secondIntent, secondIntentData] = sortedIntents[1] || [null, { score: 0 }];

      // إذا كانت الدرجة منخفضة جداً، نية غير واضحة
      if (topIntentData.score < 0.3) {
        return {
          intent: 'unclear',
          confidence: topIntentData.score,
          message: 'عذراً، لم أفهم طلبك. هل يمكنك إعادة صياغته؟',
          suggestions: ['خطط رحلة جديدة', 'ابحث عن وجهة', 'تحقق من الميزانية'],
          actions: []
        };
      }

      // اقتراحات بديلة إذا كانت هناك نية ثانية قريبة
      const alternativeSuggestions = [];
      if (secondIntentData.score > 0.5) {
        alternativeSuggestions.push({
          intent: secondIntent,
          confidence: secondIntentData.score,
          message: `أو هل تقصد: ${this.getIntentMessage(secondIntent)}`
        });
      }

      logger.info('QICS Intent Prediction', {
        userInput: userInput.substring(0, 50),
        predictedIntent: topIntent,
        confidence: topIntentData.score,
        matchedKeywords: topIntentData.matchedKeywords
      });

      return {
        intent: topIntent,
        confidence: topIntentData.score,
        matchedKeywords: topIntentData.matchedKeywords,
        actions: topIntentData.actions,
        alternatives: alternativeSuggestions,
        context: this.buildEnrichedContext(context, topIntent)
      };

    } catch (error) {
      logger.error('QICS Error:', error);
      return {
        intent: 'error',
        confidence: 0,
        message: 'حدث خطأ في فهم طلبك. يرجى المحاولة مرة أخرى.',
        actions: []
      };
    }
  }

  /**
   * بناء سياق محسّن للاستخدام في الردود
   */
  buildEnrichedContext(originalContext, detectedIntent) {
    return {
      ...originalContext,
      lastIntent: detectedIntent,
      timestamp: new Date().toISOString(),
      conversationDepth: (originalContext.conversationDepth || 0) + 1
    };
  }

  /**
   * الحصول على رسالة توضيحية للنية
   */
  getIntentMessage(intent) {
    const messages = {
      'plan_trip': 'تخطيط رحلة جديدة',
      'search_destination': 'البحث عن وجهة',
      'budget_inquiry': 'الاستفسار عن الميزانية',
      'booking_payment': 'الحجز والدفع',
      'information_request': 'طلب معلومات',
      'modify_cancel': 'تعديل أو إلغاء'
    };
    return messages[intent] || intent;
  }

  /**
   * تحديث النموذج بناءً على التغذية الراجعة
   * (يمكن توسيعه لاحقاً مع Machine Learning)
   */
  async learnFromFeedback(userInput, correctIntent, predictedIntent) {
    if (correctIntent !== predictedIntent) {
      logger.info('QICS Learning', {
        userInput: userInput.substring(0, 50),
        correctIntent,
        predictedIntent,
        action: 'needs_improvement'
      });

      // TODO: تخزين في قاعدة بيانات للتدريب اللاحق
      // يمكن استخدام هذا لتحسين الكلمات المفتاحية ودرجات الثقة
    }
  }
}

module.exports = new QICSService();