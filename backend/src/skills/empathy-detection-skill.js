/**
 * Empathy Detection Skill
 * Analyzes text to detect emotional state and suggest appropriate response tone
 */

const AbstractSkill = require('./abstract-skill');

class EmpathyDetectionSkill extends AbstractSkill {
  constructor() {
    super({
      name: 'EmpathyDetection',
      description: 'Detects emotional state from Arabic and English text',
      category: 'conversation',
      version: '1.0.0',
      cacheRelevantKeys: ['message', 'language']
    });

    // Emotion patterns with confidence scoring
    this.emotionPatterns = {
      ar: {
        anxiety: {
          keywords: ['قلق', 'توتر', 'خائف', 'قلقان', 'متوتر', 'خوف', 'مضطرب', 'عصبي'],
          intensity: { low: 0.3, medium: 0.6, high: 0.9 }
        },
        happiness: {
          keywords: ['سعيد', 'فرحان', 'مبسوط', 'رائع', 'ممتاز', 'سعادة', 'مسرور', 'مبتهج'],
          intensity: { low: 0.4, medium: 0.7, high: 1.0 }
        },
        sadness: {
          keywords: ['حزين', 'زعلان', 'مكتئب', 'يائس', 'محبط', 'كئيب', 'تعس'],
          intensity: { low: 0.3, medium: 0.6, high: 0.9 }
        },
        excitement: {
          keywords: ['متحمس', 'متشوق', 'مستمتع', 'حماس', 'شغف', 'إثارة'],
          intensity: { low: 0.4, medium: 0.7, high: 1.0 }
        },
        frustration: {
          keywords: ['محبط', 'زعلان', 'غاضب', 'مستاء', 'عصبي', 'غضبان'],
          intensity: { low: 0.3, medium: 0.6, high: 0.9 }
        },
        calm: {
          keywords: ['هادئ', 'مرتاح', 'مطمئن', 'راضي', 'مستقر'],
          intensity: { low: 0.3, medium: 0.6, high: 0.8 }
        },
        confusion: {
          keywords: ['مشوش', 'مربك', 'مش فاهم', 'مش واضح', 'حائر'],
          intensity: { low: 0.3, medium: 0.6, high: 0.8 }
        },
        urgency: {
          keywords: ['عاجل', 'سريع', 'فوري', 'ضروري', 'مهم', 'مستعجل'],
          intensity: { low: 0.4, medium: 0.7, high: 1.0 }
        }
      },
      en: {
        anxiety: {
          keywords: ['anxious', 'worried', 'nervous', 'stressed', 'concerned', 'scared', 'fearful'],
          intensity: { low: 0.3, medium: 0.6, high: 0.9 }
        },
        happiness: {
          keywords: ['happy', 'excited', 'joyful', 'glad', 'pleased', 'great', 'wonderful', 'amazing'],
          intensity: { low: 0.4, medium: 0.7, high: 1.0 }
        },
        sadness: {
          keywords: ['sad', 'unhappy', 'depressed', 'down', 'disappointed', 'upset', 'miserable'],
          intensity: { low: 0.3, medium: 0.6, high: 0.9 }
        },
        excitement: {
          keywords: ['excited', 'thrilled', 'eager', 'enthusiastic', 'passionate', 'energetic'],
          intensity: { low: 0.4, medium: 0.7, high: 1.0 }
        },
        frustration: {
          keywords: ['frustrated', 'annoyed', 'angry', 'upset', 'irritated', 'mad'],
          intensity: { low: 0.3, medium: 0.6, high: 0.9 }
        },
        calm: {
          keywords: ['calm', 'peaceful', 'relaxed', 'comfortable', 'content', 'satisfied'],
          intensity: { low: 0.3, medium: 0.6, high: 0.8 }
        },
        confusion: {
          keywords: ['confused', 'lost', 'unclear', 'puzzled', 'bewildered', 'unsure'],
          intensity: { low: 0.3, medium: 0.6, high: 0.8 }
        },
        urgency: {
          keywords: ['urgent', 'quickly', 'asap', 'immediate', 'rush', 'emergency'],
          intensity: { low: 0.4, medium: 0.7, high: 1.0 }
        }
      }
    };

    // Context modifiers that affect emotion intensity
    this.intensifiers = {
      ar: ['جداً', 'كتير', 'وايد', 'خالص', 'أوي'],
      en: ['very', 'extremely', 'really', 'so', 'totally']
    };

    this.negators = {
      ar: ['مش', 'ما', 'ليس', 'غير'],
      en: ['not', 'never', 'don\'t', 'doesn\'t']
    };
  }

  getDescription() {
    return 'Analyzes text to detect emotional state and suggest appropriate response tone for personalized communication';
  }

  async execute(context) {
    const { message, language = 'auto' } = context;

    if (!message || typeof message !== 'string') {
      return {
        success: false,
        error: 'Valid message is required for empathy detection'
      };
    }

    // Detect language if auto
    const detectedLang = language === 'auto' ?
      this.detectLanguage(message) : language;

    // Detect emotions with intensity analysis
    const emotionAnalysis = this.detectEmotions(message, detectedLang);

    // Determine primary emotion
    const primaryEmotion = emotionAnalysis.length > 0 ? emotionAnalysis[0] : {
      emotion: 'neutral',
      confidence: 1.0,
      intensity: 'low'
    };

    // Suggest response tone based on emotion
    const suggestedTone = this.suggestTone(primaryEmotion.emotion, primaryEmotion.intensity);

    // Generate empathy insights
    const empathyInsights = this.generateEmpathyInsights(primaryEmotion, emotionAnalysis, detectedLang);

    const result = {
      success: true,
      data: {
        primary_emotion: primaryEmotion.emotion,
        confidence: primaryEmotion.confidence,
        intensity: primaryEmotion.intensity,
        all_emotions: emotionAnalysis,
        suggested_tone: suggestedTone,
        language: detectedLang,
        empathy_insights: empathyInsights,
        requires_special_handling: this.requiresSpecialHandling(primaryEmotion)
      },
      metadata: {
        processing_time: Date.now() - context.startTime,
        patterns_matched: emotionAnalysis.length
      }
    };

    return result;
  }

  detectLanguage(text) {
    // Enhanced Arabic detection
    const arabicChars = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g);
    const arabicCharCount = arabicChars ? arabicChars.length : 0;

    // Consider text as Arabic if > 30% Arabic characters
    if (arabicCharCount > text.length * 0.3) {
      return 'ar';
    }

    return 'en';
  }

  detectEmotions(text, language) {
    const lowerText = text.toLowerCase();
    const patterns = this.emotionPatterns[language] || this.emotionPatterns.en;
    const detected = [];

    for (const [emotion, config] of Object.entries(patterns)) {
      const matches = this.findMatches(lowerText, config.keywords, language);

      if (matches.length > 0) {
        const baseIntensity = this.calculateBaseIntensity(matches, config);
        const adjustedIntensity = this.adjustIntensityForContext(lowerText, baseIntensity, language);

        detected.push({
          emotion,
          confidence: Math.min(adjustedIntensity, 1.0),
          intensity: this.getIntensityLevel(adjustedIntensity),
          matches,
          keyword_count: matches.length
        });
      }
    }

    // Sort by confidence and return top emotions
    return detected
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Top 5 emotions
  }

  findMatches(text, keywords, language) {
    const matches = [];

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches.push(keyword);
      }
    }

    return matches;
  }

  calculateBaseIntensity(matches, config) {
    if (matches.length === 0) return 0;

    // Base intensity from keyword count
    let intensity = matches.length * 0.2;

    // Boost intensity for exact phrases vs single words
    const exactPhrases = matches.filter(match => match.split(' ').length > 1);
    intensity += exactPhrases.length * 0.1;

    return Math.min(intensity, 1.0);
  }

  adjustIntensityForContext(text, baseIntensity, language) {
    let adjustedIntensity = baseIntensity;

    // Check for intensifiers
    const intensifiers = this.intensifiers[language] || [];
    const intensifierMatches = intensifiers.filter(word => text.includes(word));

    if (intensifierMatches.length > 0) {
      adjustedIntensity += intensifierMatches.length * 0.2;
    }

    // Check for negators (reduce intensity)
    const negators = this.negators[language] || [];
    const negatorMatches = negators.filter(word => text.includes(word));

    if (negatorMatches.length > 0) {
      adjustedIntensity *= 0.5; // Reduce intensity by half
    }

    // Check for repeated punctuation (indicates strong emotion)
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;

    if (exclamationCount > 1) {
      adjustedIntensity += 0.2;
    }

    if (questionCount > 0) {
      adjustedIntensity += 0.1;
    }

    return Math.min(adjustedIntensity, 1.0);
  }

  getIntensityLevel(intensity) {
    if (intensity < 0.3) return 'low';
    if (intensity < 0.7) return 'medium';
    return 'high';
  }

  suggestTone(emotion, intensity) {
    const toneMap = {
      anxiety: {
        low: 'gentle_reassuring',
        medium: 'calm_supportive',
        high: 'immediate_reassurance'
      },
      happiness: {
        low: 'friendly_positive',
        medium: 'enthusiastic_celebratory',
        high: 'excited_congratulatory'
      },
      sadness: {
        low: 'empathetic_understanding',
        medium: 'supportive_compassionate',
        high: 'deeply_caring'
      },
      excitement: {
        low: 'positive_encouraging',
        medium: 'enthusiastic_sharing',
        high: 'excited_celebratory'
      },
      frustration: {
        low: 'patient_understanding',
        medium: 'calmly_helpful',
        high: 'de_escalating_patient'
      },
      calm: {
        low: 'friendly_professional',
        medium: 'warm_professional',
        high: 'relaxed_conversational'
      },
      confusion: {
        low: 'clarifying_helpful',
        medium: 'patiently_explanatory',
        high: 'step_by_step_guiding'
      },
      urgency: {
        low: 'responsive_helpful',
        medium: 'promptly_attentive',
        high: 'immediately_responsive'
      },
      neutral: 'friendly_professional'
    };

    return toneMap[emotion]?.[intensity] || 'friendly_professional';
  }

  generateEmpathyInsights(primaryEmotion, allEmotions, language) {
    const insights = {
      emotional_state: primaryEmotion.emotion,
      communication_style: this.getCommunicationStyle(primaryEmotion.emotion),
      response_urgency: this.getResponseUrgency(primaryEmotion),
      cultural_considerations: this.getCulturalConsiderations(primaryEmotion.emotion, language)
    };

    // Add mixed emotions insight if multiple strong emotions detected
    const strongEmotions = allEmotions.filter(e => e.confidence > 0.5);
    if (strongEmotions.length > 1) {
      insights.mixed_emotions = strongEmotions.map(e => e.emotion);
      insights.response_complexity = 'moderate';
    }

    return insights;
  }

  getCommunicationStyle(emotion) {
    const styles = {
      anxiety: 'Use reassuring language, avoid pressure, offer step-by-step guidance',
      happiness: 'Share enthusiasm, use positive reinforcement, celebrate together',
      sadness: 'Show genuine care, listen actively, offer gentle support',
      excitement: 'Match energy level, show shared enthusiasm, build on positive momentum',
      frustration: 'Stay calm and patient, acknowledge feelings, focus on solutions',
      calm: 'Be warm and professional, maintain steady pace, build trust',
      confusion: 'Be clear and patient, break down complex topics, confirm understanding'
    };

    return styles[emotion] || 'Be friendly and helpful';
  }

  getResponseUrgency(emotion) {
    const urgencyMap = {
      urgency: 'high',
      anxiety: 'medium',
      frustration: 'medium',
      confusion: 'medium',
      excitement: 'low',
      happiness: 'low',
      sadness: 'low',
      calm: 'low'
    };

    return urgencyMap[emotion] || 'low';
  }

  getCulturalConsiderations(emotion, language) {
    if (language === 'ar') {
      return {
        formality_level: this.getArabicFormalityLevel(emotion),
        greeting_style: this.getArabicGreetingStyle(emotion),
        emoji_usage: this.getArabicEmojiPreference(emotion)
      };
    }

    return {
      formality_level: 'moderate',
      greeting_style: 'friendly',
      emoji_usage: 'moderate'
    };
  }

  getArabicFormalityLevel(emotion) {
    const formalityMap = {
      anxiety: 'high',      // More formal to show respect
      sadness: 'high',      // More formal to show care
      frustration: 'moderate', // Balanced approach
      confusion: 'moderate',   // Patient and clear
      happiness: 'low',     // Casual and celebratory
      excitement: 'low',    // Energetic and casual
      calm: 'moderate'      // Professional warmth
    };

    return formalityMap[emotion] || 'moderate';
  }

  getArabicGreetingStyle(emotion) {
    const greetingMap = {
      anxiety: 'reassuring_compassionate',
      sadness: 'gentle_caring',
      frustration: 'patient_understanding',
      confusion: 'clear_helpful',
      happiness: 'warm_joyful',
      excitement: 'energetic_celebratory',
      calm: 'respectful_warm'
    };

    return greetingMap[emotion] || 'friendly_respectful';
  }

  getArabicEmojiPreference(emotion) {
    const emojiMap = {
      anxiety: 'minimal',      // Don't overwhelm
      sadness: 'gentle',       // Soft, caring emojis only
      frustration: 'minimal',  // Avoid celebratory emojis
      confusion: 'minimal',    // Keep it simple
      happiness: 'moderate',   // Share joy
      excitement: 'frequent',  // Celebrate together
      calm: 'minimal'          // Professional
    };

    return emojiMap[emotion] || 'minimal';
  }

  requiresSpecialHandling(emotion) {
    const specialHandlingEmotions = ['anxiety', 'frustration', 'confusion', 'urgency'];
    return specialHandlingEmotions.includes(emotion.emotion) ||
           emotion.intensity === 'high';
  }

  validateInputs(context) {
    const errors = [];

    if (!context.message) {
      errors.push('Message is required');
    }

    if (context.language && !['ar', 'en', 'auto'].includes(context.language)) {
      errors.push('Language must be ar, en, or auto');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = EmpathyDetectionSkill;