/**
 * Personalized Friendship Skill
 * Builds personalized relationships with users over time
 */

const AbstractSkill = require('./abstract-skill');

class PersonalizedFriendshipSkill extends AbstractSkill {
  constructor(storage) {
    super({
      name: 'PersonalizedFriendship',
      description: 'Builds personalized relationship with each user over time',
      category: 'relationship',
      version: '1.0.0',
      cacheRelevantKeys: ['userId', 'userName']
    });

    // User relationship tracking
    this.storage = storage; // Supabase instance
    this.friendshipLevels = new Map();

    // Friendship progression configuration
    this.friendshipConfig = {
      levels: {
        stranger: { minScore: 0, maxScore: 4, name: { ar: 'غريب', en: 'Stranger' } },
        acquaintance: { minScore: 5, maxScore: 14, name: { ar: 'معارف', en: 'Acquaintance' } },
        friend: { minScore: 15, maxScore: 29, name: { ar: 'صديق', en: 'Friend' } },
        good_friend: { minScore: 30, maxScore: 49, name: { ar: 'صديق مقرب', en: 'Good Friend' } },
        close_friend: { minScore: 50, maxScore: Infinity, name: { ar: 'صديق حميم', en: 'Close Friend' } }
      },
      scoring: {
        interaction_weights: {
          simple_interaction: 1,
          question_asked: 2,
          positive_feedback: 3,
          booking_completed: 5,
          return_visit: 2,
          long_conversation: 3,
          problem_solved: 4
        },
        decay: {
          enabled: true,
          rate: 0.95, // 5% decay per week of inactivity
          max_inactive_days: 30
        }
      }
    };
  }

  getDescription() {
    return 'Tracks user interactions and personalizes responses based on relationship strength and history';
  }

  async execute(context) {
    const { userId, userName, message, conversationHistory = [], interactionType = 'chat' } = context;

    if (!userId) {
      return {
        success: false,
        error: 'User ID is required for friendship tracking'
      };
    }

    try {
      // Get or create friendship level
      const friendshipData = await this.getFriendshipLevel(userId);

      // Analyze current interaction
      const interactionAnalysis = this.analyzeInteraction({
        message,
        conversationHistory,
        interactionType,
        userName
      });

      // Update friendship score
      friendshipData.score += interactionAnalysis.score;
      friendshipData.interactionCount++;
      friendshipData.lastInteraction = new Date().toISOString();

      // Apply decay for inactive users
      if (this.friendshipConfig.scoring.decay.enabled) {
        friendshipData.score = this.applyDecay(friendshipData);
      }

      // Update friendship level
      friendshipData.level = this.calculateLevel(friendshipData.score);

      // Update preferences based on interaction
      friendshipData.preferences = this.updatePreferences(
        friendshipData.preferences,
        interactionAnalysis
      );

      // Save updated data
      await this.saveFriendshipData(userId, friendshipData);

      // Generate personalized response style
      const responseStyle = this.generateResponseStyle(friendshipData, userName);

      // Get personalized greeting
      const personalizedGreeting = this.getPersonalizedGreeting(friendshipData, userName);

      const result = {
        success: true,
        data: {
          friendship_level: friendshipData.level,
          relationship_score: friendshipData.score,
          interaction_count: friendshipData.interactionCount,
          response_style: responseStyle,
          personalized_greeting: personalizedGreeting,
          preferences: friendshipData.preferences,
          insights: this.generateFriendshipInsights(friendshipData, interactionAnalysis)
        },
        metadata: {
          interaction_score: interactionAnalysis.score,
          level_changed: friendshipData.level !== friendshipData.previousLevel,
          new_level: friendshipData.level !== friendshipData.previousLevel ? friendshipData.level : null
        }
      };

      return result;

    } catch (error) {
      return this.handleError(error, context);
    }
  }

  async getFriendshipLevel(userId) {
    // Check in-memory cache first
    if (this.friendshipLevels.has(userId)) {
      return this.friendshipLevels.get(userId);
    }

    // Try to load from storage
    if (this.storage) {
      try {
        const { data, error } = await this.storage
          .from('user_friendships')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (data && !error) {
          this.friendshipLevels.set(userId, data);
          return data;
        }
      } catch (error) {
        console.log('No existing friendship data, creating new');
      }
    }

    // Create new friendship data
    const newData = {
      userId,
      score: 0,
      level: 'stranger',
      previousLevel: 'stranger',
      interactionCount: 0,
      firstInteraction: new Date().toISOString(),
      lastInteraction: new Date().toISOString(),
      preferences: {
        communication_style: 'balanced',
        formality_level: 'moderate',
        emoji_preference: 'moderate',
        response_length: 'medium',
        languages: ['ar', 'en']
      },
      milestones: [],
      createdAt: new Date().toISOString()
    };

    this.friendshipLevels.set(userId, newData);
    return newData;
  }

  async saveFriendshipData(userId, data) {
    // Update in-memory cache
    this.friendshipLevels.set(userId, data);

    // Save to storage if available
    if (this.storage) {
      try {
        const { error } = await this.storage
          .from('user_friendships')
          .upsert({
            user_id: userId,
            friendship_level: data.level,
            relationship_score: data.score,
            interaction_count: data.interactionCount,
            last_interaction: data.lastInteraction,
            preferences: data.preferences,
            first_interaction: data.firstInteraction,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Failed to save friendship data:', error);
        }
      } catch (error) {
        console.error('Storage error:', error);
      }
    }
  }

  analyzeInteraction({ message, conversationHistory, interactionType, userName }) {
    let score = 0;
    const analysis = {
      type: interactionType,
      length: message.length,
      hasQuestions: message.includes('?'),
      hasPositiveWords: this.hasPositiveWords(message),
      hasNegativeWords: this.hasNegativeWords(message),
      isLongConversation: conversationHistory.length > 5,
      mentionsName: userName ? message.toLowerCase().includes(userName.toLowerCase()) : false
    };

    // Base score from interaction type
    const typeWeights = {
      chat: 1,
      booking: 3,
      question: 2,
      feedback: 2,
      return_visit: 2
    };

    score += typeWeights[interactionType] || 1;

    // Length bonus (engagement indicator)
    if (analysis.length > 100) score += 2;
    else if (analysis.length > 50) score += 1;

    // Question bonus (shows interest)
    if (analysis.hasQuestions) score += 1;

    // Positive feedback bonus
    if (analysis.hasPositiveWords) score += 2;

    // Long conversation bonus
    if (analysis.isLongConversation) score += 2;

    // Name mention bonus (personal touch)
    if (analysis.mentionsName) score += 1;

    // Negative feedback penalty
    if (analysis.hasNegativeWords) score -= 1;

    analysis.score = Math.max(score, 0); // Never negative

    return analysis;
  }

  hasPositiveWords(message) {
    const positiveWords = {
      ar: ['شكراً', 'ممتاز', 'رائع', 'جميل', 'مفيد', 'ممتاز', 'حلو', 'عظيم'],
      en: ['thank', 'thanks', 'great', 'awesome', 'amazing', 'wonderful', 'excellent', 'perfect']
    };

    const lowerMessage = message.toLowerCase();

    for (const lang in positiveWords) {
      if (positiveWords[lang].some(word => lowerMessage.includes(word))) {
        return true;
      }
    }

    return false;
  }

  hasNegativeWords(message) {
    const negativeWords = {
      ar: ['سيء', 'غلط', 'مشكلة', 'وحش', 'فاشل', 'معقد'],
      en: ['bad', 'wrong', 'problem', 'terrible', 'awful', 'complicated']
    };

    const lowerMessage = message.toLowerCase();

    for (const lang in negativeWords) {
      if (negativeWords[lang].some(word => lowerMessage.includes(word))) {
        return true;
      }
    }

    return false;
  }

  applyDecay(friendshipData) {
    const now = new Date();
    const lastInteraction = new Date(friendshipData.lastInteraction);
    const daysSinceLastInteraction = (now - lastInteraction) / (1000 * 60 * 60 * 24);

    if (daysSinceLastInteraction > 7) { // Apply decay after 1 week of inactivity
      const weeksInactive = Math.floor(daysSinceLastInteraction / 7);
      const decayFactor = Math.pow(this.friendshipConfig.scoring.decay.rate, weeksInactive);

      return Math.floor(friendshipData.score * decayFactor);
    }

    return friendshipData.score;
  }

  calculateLevel(score) {
    for (const [level, config] of Object.entries(this.friendshipConfig.levels)) {
      if (score >= config.minScore && score <= config.maxScore) {
        return level;
      }
    }

    return 'stranger'; // Fallback
  }

  updatePreferences(currentPreferences, interactionAnalysis) {
    const preferences = { ...currentPreferences };

    // Update communication style based on interaction patterns
    if (interactionAnalysis.length > 150) {
      preferences.response_length = 'long';
    } else if (interactionAnalysis.length < 30) {
      preferences.response_length = 'short';
    }

    // Update formality based on message style
    if (interactionAnalysis.hasPositiveWords && interactionAnalysis.length > 50) {
      preferences.communication_style = 'friendly';
    }

    // Update emoji preference
    if (interactionAnalysis.message.match(/[\u{1F600}-\u{1F64F}]/u)) { // Emoji in message
      preferences.emoji_preference = 'frequent';
    }

    return preferences;
  }

  generateResponseStyle(friendshipData, userName) {
    const { level, preferences } = friendshipData;

    const styles = {
      stranger: {
        formality: 'formal',
        personalization: 'minimal',
        emoji_usage: 'rare',
        response_length: 'medium',
        greeting: {
          ar: 'مرحباً! كيف يمكنني مساعدتك في السفر؟',
          en: 'Hello! How can I help you with your travel plans?'
        }
      },
      acquaintance: {
        formality: 'semi_formal',
        personalization: 'moderate',
        emoji_usage: 'occasional',
        response_length: 'medium',
        greeting: {
          ar: `مرحباً${userName ? ' ' + userName : ''}! من الجيد رؤيتك مرة أخرى.`,
          en: `Hi${userName ? ' ' + userName : ''}! Good to see you again.`
        }
      },
      friend: {
        formality: 'casual',
        personalization: 'high',
        emoji_usage: 'frequent',
        response_length: 'medium',
        greeting: {
          ar: `مرحباً يا صديقي${userName ? ' ' + userName : ''}! 😊 كيف حالك؟`,
          en: `Hey friend${userName ? ' ' + userName : ''}! 😊 How are you?`
        }
      },
      good_friend: {
        formality: 'very_casual',
        personalization: 'very_high',
        emoji_usage: 'very_frequent',
        response_length: 'long',
        greeting: {
          ar: `${userName || 'يا صديقي المقرب'}! 🎉 سعيد جداً برؤيتك مرة أخرى!`,
          en: `${userName || 'My good friend'}! 🎉 So happy to see you again!`
        }
      },
      close_friend: {
        formality: 'intimate',
        personalization: 'maximum',
        emoji_usage: 'very_frequent',
        response_length: 'long',
        greeting: {
          ar: `${userName || 'يا أعز أصدقائي'}! 💖 اشتقت إليك! ما أخبارك؟`,
          en: `${userName || 'My dearest friend'}! 💖 I missed you! What's new?`
        }
      }
    };

    const baseStyle = styles[level] || styles.stranger;

    // Apply user preferences
    return {
      ...baseStyle,
      ...preferences,
      // Ensure minimum personalization for higher friendship levels
      personalization: this.getMinimumPersonalization(level, preferences.personalization)
    };
  }

  getMinimumPersonalization(level, currentPreference) {
    const minimums = {
      stranger: 'minimal',
      acquaintance: 'moderate',
      friend: 'high',
      good_friend: 'very_high',
      close_friend: 'maximum'
    };

    const minimum = minimums[level];

    const preferenceLevels = {
      minimal: 1,
      moderate: 2,
      high: 3,
      very_high: 4,
      maximum: 5
    };

    const currentLevel = preferenceLevels[currentPreference] || 2;
    const minimumLevel = preferenceLevels[minimum] || 1;

    if (currentLevel >= minimumLevel) {
      return currentPreference;
    }

    return minimum;
  }

  getPersonalizedGreeting(friendshipData, userName) {
    const style = this.generateResponseStyle(friendshipData, userName);
    return style.greeting;
  }

  generateFriendshipInsights(friendshipData, interactionAnalysis) {
    const insights = {
      relationship_status: friendshipData.level,
      next_milestone: this.getNextMilestone(friendshipData.score),
      strengths: this.identifyRelationshipStrengths(friendshipData, interactionAnalysis),
      recommendations: this.getRelationshipRecommendations(friendshipData)
    };

    // Check for level up
    if (friendshipData.level !== friendshipData.previousLevel) {
      insights.level_up = {
        from: friendshipData.previousLevel,
        to: friendshipData.level,
        celebration_message: this.getLevelUpMessage(friendshipData.level)
      };
    }

    return insights;
  }

  getNextMilestone(currentScore) {
    for (const [level, config] of Object.entries(this.friendshipConfig.levels)) {
      if (currentScore < config.maxScore) {
        return {
          level,
          score_needed: config.minScore - currentScore,
          name: config.name
        };
      }
    }

    return null; // Maximum level reached
  }

  identifyRelationshipStrengths(friendshipData, interactionAnalysis) {
    const strengths = [];

    if (friendshipData.interactionCount > 10) {
      strengths.push('frequent_communication');
    }

    if (interactionAnalysis.score > 3) {
      strengths.push('high_engagement');
    }

    if (interactionAnalysis.hasQuestions) {
      strengths.push('curious_learner');
    }

    if (interactionAnalysis.hasPositiveWords) {
      strengths.push('positive_attitude');
    }

    if (friendshipData.preferences.response_length === 'long') {
      strengths.push('detailed_conversation');
    }

    return strengths;
  }

  getRelationshipRecommendations(friendshipData) {
    const recommendations = [];

    if (friendshipData.level === 'stranger' && friendshipData.interactionCount < 3) {
      recommendations.push({
        type: 'engagement',
        message: 'Ask questions to learn more about their travel preferences',
        priority: 'high'
      });
    }

    if (friendshipData.level === 'acquaintance') {
      recommendations.push({
        type: 'personalization',
        message: 'Use their name and remember previous conversations',
        priority: 'medium'
      });
    }

    if (friendshipData.level === 'friend') {
      recommendations.push({
        type: 'proactivity',
        message: 'Offer personalized travel suggestions based on their history',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  getLevelUpMessage(newLevel) {
    const messages = {
      acquaintance: {
        ar: 'لقد أصبحنا أصدقاء! سأتذكر تفضيلاتك بشكل أفضل الآن.',
        en: 'We\'ve become acquaintances! I\'ll remember your preferences better now.'
      },
      friend: {
        ar: 'رائع! نحن أصدقاء الآن! سأقدم لك تجربة أكثر تخصيصاً.',
        en: 'Great! We\'re friends now! I\'ll provide you with a more personalized experience.'
      },
      good_friend: {
        ar: 'ممتاز! أنت صديق مقرب الآن! سأعاملك كصديق عزيز.',
        en: 'Excellent! You\'re a good friend now! I\'ll treat you like a dear friend.'
      },
      close_friend: {
        ar: '🎉 أنت صديقي الحميم الآن! سأقدم لك أفضل خدمة ممكنة!',
        en: '🎉 You\'re my close friend now! I\'ll provide you with the best possible service!'
      }
    };

    return messages[newLevel] || messages.acquaintance;
  }

  validateInputs(context) {
    const errors = [];

    if (!context.userId) {
      errors.push('User ID is required');
    }

    if (context.message && typeof context.message !== 'string') {
      errors.push('Message must be a string');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = PersonalizedFriendshipSkill;