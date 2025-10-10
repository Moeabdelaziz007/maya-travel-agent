/**
 * Dynamic Voice Adaptation Skill
 * Adapts communication style based on context and user state
 */

const AbstractSkill = require('./abstract-skill');

class DynamicVoiceAdaptationSkill extends AbstractSkill {
  constructor() {
    super({
      name: 'DynamicVoiceAdaptation',
      description: 'Adapts communication style based on context and user state',
      category: 'conversation',
      version: '1.0.0',
      cacheRelevantKeys: ['context', 'friendship_level', 'situation']
    });

    this.voiceStyles = {
      professional: {
        tone: 'formal',
        vocabulary: 'technical',
        emoji: 'minimal',
        sentence_structure: 'complex',
        personalization: 'moderate',
        examples: {
          ar: 'أهلاً وسهلاً بك. سأقوم بمساعدتك في ترتيبات السفر بكفاءة واحترافية عالية.',
          en: 'Greetings. I am ready to assist you with your travel arrangements professionally.'
        }
      },
      friendly: {
        tone: 'warm',
        vocabulary: 'casual',
        emoji: 'moderate',
        sentence_structure: 'simple',
        personalization: 'high',
        examples: {
          ar: 'مرحباً! 😊 جاهز لتخطيط رحلة رائعة مع بعض؟',
          en: 'Hey there! 😊 Ready to plan an amazing trip together?'
        }
      },
      empathetic: {
        tone: 'caring',
        vocabulary: 'supportive',
        emoji: 'supportive',
        sentence_structure: 'simple',
        personalization: 'very_high',
        examples: {
          ar: 'أفهم أن هذا قد يكون مرهقاً. دعني أساعدك لنجعله أسهل. 💙',
          en: 'I understand this might feel overwhelming. Let me help make it easier for you. 💙'
        }
      },
      excited: {
        tone: 'enthusiastic',
        vocabulary: 'energetic',
        emoji: 'frequent',
        sentence_structure: 'varied',
        personalization: 'high',
        examples: {
          ar: 'هذا رائع جداً! 🎉✈️ لنخطط لمغامرة مذهلة!',
          en: 'This is going to be AMAZING! 🎉✈️ Let\'s plan an incredible adventure!'
        }
      },
      calm: {
        tone: 'soothing',
        vocabulary: 'reassuring',
        emoji: 'gentle',
        sentence_structure: 'simple',
        personalization: 'high',
        examples: {
          ar: 'لا تقلق، سنأخذ هذا خطوة بخطوة. كل شيء سيكون بخير. 🌸',
          en: 'No worries, we\'ll take this step by step. Everything will work out. 🌸'
        }
      },
      urgent: {
        tone: 'direct',
        vocabulary: 'clear',
        emoji: 'minimal',
        sentence_structure: 'direct',
        personalization: 'moderate',
        examples: {
          ar: 'عاجل: يرجى اتخاذ قرار سريع. الأسعار تتغير بسرعة.',
          en: 'Urgent: Please make a decision quickly. Prices are changing rapidly.'
        }
      }
    };

    // Context mapping for automatic style selection
    this.contextMapping = {
      anxiety: 'empathetic',
      happiness: 'excited',
      sadness: 'empathetic',
      excitement: 'excited',
      frustration: 'calm',
      calm: 'friendly',
      urgency: 'urgent',
      confusion: 'calm',
      booking: 'professional',
      planning: 'friendly',
      support: 'empathetic',
      celebration: 'excited'
    };
  }

  getDescription() {
    return 'Dynamically adapts communication style based on emotional context, friendship level, and situation for optimal user experience';
  }

  async execute(context) {
    const {
      emotional_context,
      friendship_level = 'stranger',
      situation = 'general',
      user_culture = 'mixed',
      time_of_day = 'neutral'
    } = context;

    try {
      // Determine base voice style
      let baseStyle = this.determineBaseStyle(emotional_context, situation);

      // Adapt for friendship level
      baseStyle = this.adaptForFriendshipLevel(baseStyle, friendship_level);

      // Adapt for cultural context
      baseStyle = this.adaptForCulture(baseStyle, user_culture);

      // Adapt for time of day
      baseStyle = this.adaptForTimeOfDay(baseStyle, time_of_day);

      // Generate adapted response template
      const responseTemplate = this.generateResponseTemplate(baseStyle, context);

      // Create style guidelines
      const styleGuidelines = this.createStyleGuidelines(baseStyle);

      const result = {
        success: true,
        data: {
          selected_voice_style: baseStyle,
          response_template: responseTemplate,
          style_guidelines: styleGuidelines,
          adaptations_applied: this.getAdaptationsApplied(context),
          communication_strategy: this.getCommunicationStrategy(baseStyle, context)
        },
        metadata: {
          base_emotion: emotional_context?.primary_emotion || 'neutral',
          friendship_level,
          situation,
          processing_time: Date.now() - context.startTime
        }
      };

      return result;

    } catch (error) {
      return this.handleError(error, context);
    }
  }

  determineBaseStyle(emotionalContext, situation) {
    // Primary style from emotional context
    if (emotionalContext?.primary_emotion) {
      const emotion = emotionalContext.primary_emotion;
      const intensity = emotionalContext.intensity || 'medium';

      // Check if emotion exists in mapping
      if (this.contextMapping[emotion]) {
        const styleName = this.contextMapping[emotion];

        // Adjust for intensity
        if (intensity === 'high' && styleName === 'empathetic') {
          return 'empathetic';
        }

        if (intensity === 'high' && styleName === 'excited') {
          return 'excited';
        }

        return styleName;
      }
    }

    // Fallback to situation-based style
    if (this.contextMapping[situation]) {
      return this.contextMapping[situation];
    }

    // Default style
    return 'friendly';
  }

  adaptForFriendshipLevel(baseStyle, friendshipLevel) {
    const friendshipAdaptations = {
      stranger: {
        professional: 'professional',
        friendly: 'professional',
        empathetic: 'empathetic',
        excited: 'friendly',
        calm: 'professional'
      },
      acquaintance: {
        professional: 'professional',
        friendly: 'friendly',
        empathetic: 'empathetic',
        excited: 'friendly',
        calm: 'friendly'
      },
      friend: {
        professional: 'friendly',
        friendly: 'friendly',
        empathetic: 'empathetic',
        excited: 'excited',
        calm: 'friendly'
      },
      good_friend: {
        professional: 'friendly',
        friendly: 'excited',
        empathetic: 'empathetic',
        excited: 'excited',
        calm: 'friendly'
      },
      close_friend: {
        professional: 'friendly',
        friendly: 'excited',
        empathetic: 'empathetic',
        excited: 'excited',
        calm: 'excited'
      }
    };

    return friendshipAdaptations[friendshipLevel]?.[baseStyle] || baseStyle;
  }

  adaptForCulture(baseStyle, userCulture) {
    if (userCulture === 'conservative' || userCulture === 'formal') {
      // More formal, less emoji
      if (baseStyle === 'excited') return 'friendly';
      if (baseStyle === 'friendly') return 'professional';
    }

    if (userCulture === 'expressive' || userCulture === 'casual') {
      // More casual, more emoji
      if (baseStyle === 'professional') return 'friendly';
      if (baseStyle === 'friendly') return 'excited';
    }

    return baseStyle;
  }

  adaptForTimeOfDay(baseStyle, timeOfDay) {
    const timeAdaptations = {
      morning: {
        // More energetic in the morning
        professional: 'friendly',
        calm: 'friendly'
      },
      evening: {
        // More relaxed in the evening
        excited: 'friendly',
        professional: 'calm'
      },
      night: {
        // Very calm at night
        excited: 'calm',
        friendly: 'calm'
      }
    };

    return timeAdaptations[timeOfDay]?.[baseStyle] || baseStyle;
  }

  generateResponseTemplate(style, context) {
    const styleConfig = this.voiceStyles[style];
    if (!styleConfig) {
      return this.voiceStyles.friendly.examples;
    }

    const template = {
      greeting: styleConfig.examples,
      transition: this.getTransitionPhrases(style),
      closing: this.getClosingPhrases(style),
      error_handling: this.getErrorHandlingPhrases(style),
      follow_up: this.getFollowUpPhrases(style)
    };

    return template;
  }

  getTransitionPhrases(style) {
    const phrases = {
      professional: {
        ar: ['بالنسبة لرحلتك،', 'فيما يتعلق بـ', 'أما بخصوص'],
        en: ['Regarding your trip,', 'In terms of', 'As for']
      },
      friendly: {
        ar: ['بالنسبة لرحلتك،', 'عشان رحلتك،', 'أما بالنسبة لـ'],
        en: ['For your trip,', 'About your trip,', 'As for your trip,']
      },
      empathetic: {
        ar: ['أفهم أنك قد تكون', 'أعلم أن هذا قد يكون', 'أتفهم إحساسك بـ'],
        en: ['I understand you might be', 'I know this might be', 'I can see you feel']
      },
      excited: {
        ar: ['رائع! بالنسبة لـ', 'ممتاز! عشان', 'جميل جداً! أما'],
        en: ['Awesome! For', 'Great! About', 'Amazing! As for']
      },
      calm: {
        ar: ['بالنسبة لرحلتك،', 'أما بخصوص', 'فيما يتعلق بـ'],
        en: ['For your trip,', 'Regarding', 'As for']
      }
    };

    return phrases[style] || phrases.friendly;
  }

  getClosingPhrases(style) {
    const phrases = {
      professional: {
        ar: ['هل هناك أي أسئلة أخرى؟', 'أتمنى أن أكون قد ساعدتك.'],
        en: ['Do you have any other questions?', 'I hope I have been helpful.']
      },
      friendly: {
        ar: ['في أي حاجة تانية؟ 😊', 'عايز مساعدة في حاجة أخرى؟'],
        en: ['Anything else? 😊', 'Need help with anything else?']
      },
      empathetic: {
        ar: ['خذ وقتك وفكر، أنا هنا لمساعدتك. 💙', 'لا تتردد في السؤال مرة أخرى.'],
        en: ['Take your time to think, I\'m here to help. 💙', 'Don\'t hesitate to ask again.']
      },
      excited: {
        ar: ['مش هقولك باي دلوقتي! 🎉', 'متشوق أشوف رحلتك!'],
        en: ['Not saying bye yet! 🎉', 'Can\'t wait to see your trip!']
      },
      calm: {
        ar: ['خذ راحتك وفكر في الأمر. 🌸', 'أنا هنا لما تحتاج مساعدة.'],
        en: ['Take your time to think about it. 🌸', 'I\'m here when you need help.']
      }
    };

    return phrases[style] || phrases.friendly;
  }

  getErrorHandlingPhrases(style) {
    const phrases = {
      professional: {
        ar: ['عذراً، حدث خطأ. دعني أحاول مرة أخرى.', 'أعتذر عن هذا الخطأ.'],
        en: ['Sorry, an error occurred. Let me try again.', 'I apologize for this error.']
      },
      friendly: {
        ar: ['أوبس، حصل غلط! 😅 هحاول تاني.', 'عذراً يا صديقي، حصل خطأ.'],
        en: ['Oops, something went wrong! 😅 Let me try again.', 'Sorry friend, there was an error.']
      },
      empathetic: {
        ar: ['أنا آسف إذا كان هذا مخيباً للآمال. دعني أصلح الأمر. 💙', 'أتفهم إحباطك، سأحل هذا فوراً.'],
        en: ['I\'m sorry if this is disappointing. Let me fix this. 💙', 'I understand your frustration, I\'ll resolve this immediately.']
      }
    };

    return phrases[style] || phrases.friendly;
  }

  getFollowUpPhrases(style) {
    const phrases = {
      professional: {
        ar: ['هل تريد مناقشة تفاصيل أخرى؟', 'ما رأيك في هذه الخيارات؟'],
        en: ['Would you like to discuss other details?', 'What do you think of these options?']
      },
      friendly: {
        ar: ['عايز تعرف أكتر عن إيه؟', 'إيه رأيك في الخيارات دي؟'],
        en: ['Want to know more about what?', 'What do you think of these options?']
      },
      excited: {
        ar: ['متشوق أسمع رأيك! 🎉', 'هي دي الرحلة اللي في بالك؟'],
        en: ['Can\'t wait to hear your thoughts! 🎉', 'Is this the trip you had in mind?']
      }
    };

    return phrases[style] || phrases.friendly;
  }

  createStyleGuidelines(style) {
    const styleConfig = this.voiceStyles[style];

    return {
      tone: styleConfig.tone,
      vocabulary_complexity: styleConfig.vocabulary,
      emoji_frequency: styleConfig.emoji,
      sentence_structure: styleConfig.sentence_structure,
      personalization_level: styleConfig.personalization,
      key_phrases: [
        'Use ' + styleConfig.tone + ' language',
        styleConfig.vocabulary + ' vocabulary',
        styleConfig.emoji + ' emoji usage',
        styleConfig.personalization + ' personalization'
      ]
    };
  }

  getAdaptationsApplied(context) {
    const adaptations = [];

    if (context.emotional_context) {
      adaptations.push('emotional_context');
    }

    if (context.friendship_level && context.friendship_level !== 'stranger') {
      adaptations.push('friendship_level');
    }

    if (context.user_culture && context.user_culture !== 'mixed') {
      adaptations.push('cultural_context');
    }

    if (context.time_of_day && context.time_of_day !== 'neutral') {
      adaptations.push('time_of_day');
    }

    return adaptations;
  }

  getCommunicationStrategy(style, context) {
    const strategies = {
      professional: {
        goal: 'Build trust and demonstrate expertise',
        approach: 'Clear, accurate, and reliable communication',
        focus: 'Accuracy and completeness over speed'
      },
      friendly: {
        goal: 'Create comfortable and enjoyable experience',
        approach: 'Warm, approachable, and engaging communication',
        focus: 'Building rapport and enjoyment'
      },
      empathetic: {
        goal: 'Provide emotional support and understanding',
        approach: 'Caring, supportive, and patient communication',
        focus: 'Emotional needs and reassurance'
      },
      excited: {
        goal: 'Share enthusiasm and create excitement',
        approach: 'Energetic, positive, and celebratory communication',
        focus: 'Energy and shared enthusiasm'
      },
      calm: {
        goal: 'Reduce stress and create peaceful experience',
        approach: 'Soothing, patient, and reassuring communication',
        focus: 'Peace of mind and clarity'
      }
    };

    return strategies[style] || strategies.friendly;
  }

  validateInputs(context) {
    const errors = [];

    if (context.emotional_context && typeof context.emotional_context !== 'object') {
      errors.push('Emotional context must be an object');
    }

    if (context.friendship_level && !['stranger', 'acquaintance', 'friend', 'good_friend', 'close_friend'].includes(context.friendship_level)) {
      errors.push('Invalid friendship level');
    }

    if (context.situation && typeof context.situation !== 'string') {
      errors.push('Situation must be a string');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = DynamicVoiceAdaptationSkill;