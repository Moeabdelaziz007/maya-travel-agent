/**
 * Advanced User Profiling System for Maya AI
 * Comprehensive user data collection and personalization
 */

class UserProfilingSystem {
  constructor() {
    this.profiles = new Map(); // In-memory storage (replace with database)
    this.analytics = {
      totalUsers: 0,
      activeUsers: 0,
      averageSessions: 0,
      topDestinations: [],
      popularPreferences: []
    };
  }

  /**
   * Create or update user profile
   */
  async createUserProfile(userId, userData = {}) {
    const profile = {
      id: userId,
      basicInfo: {
        name: userData.name || '',
        age: userData.age || null,
        gender: userData.gender || null,
        nationality: userData.nationality || 'SA',
        language: userData.language || 'ar',
        timezone: userData.timezone || 'Asia/Riyadh',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      },
      
      preferences: {
        travelStyle: userData.travelStyle || 'balanced', // budget, balanced, luxury
        accommodationType: userData.accommodationType || 'hotel', // hotel, apartment, hostel, luxury
        transportationPreference: userData.transportationPreference || 'mixed', // flight, train, car, mixed
        activityTypes: userData.activityTypes || [], // cultural, adventure, relaxation, business, family
        foodPreferences: userData.foodPreferences || 'halal', // halal, vegetarian, vegan, any
        budgetRange: userData.budgetRange || 'medium', // low, medium, high, luxury
        groupSize: userData.groupSize || 1,
        specialNeeds: userData.specialNeeds || [],
        culturalRequirements: userData.culturalRequirements || []
      },
      
      behavioralData: {
        conversationHistory: [],
        searchHistory: [],
        bookingHistory: [],
        clickPatterns: [],
        responseTimes: [],
        satisfactionScores: [],
        preferredCommunicationStyle: 'friendly', // formal, friendly, casual, professional
        decisionMakingStyle: 'collaborative', // independent, collaborative, advisory
        riskTolerance: 'medium' // low, medium, high
      },
      
      travelHistory: {
        pastDestinations: [],
        visitedCountries: [],
        favoritePlaces: [],
        avoidedDestinations: [],
        seasonalPreferences: {},
        accommodationRatings: {},
        activityRatings: {}
      },
      
      personalization: {
        interests: [],
        dislikes: [],
        goals: [],
        constraints: [],
        motivations: [],
        personalityTraits: {},
        culturalBackground: userData.culturalBackground || 'arabic',
        religiousRequirements: userData.religiousRequirements || ['halal_food', 'prayer_times']
      },
      
      analytics: {
        totalTrips: 0,
        totalSpent: 0,
        averageTripDuration: 0,
        preferredSeasons: [],
        loyaltyScore: 0,
        engagementLevel: 'medium', // low, medium, high, premium
        satisfactionTrend: 'positive', // positive, neutral, negative
        recommendationAccuracy: 0.8
      },
      
      aiInteraction: {
        preferredResponseLength: 'detailed', // short, medium, detailed
        preferredLanguage: 'ar',
        humorPreference: 'moderate', // none, moderate, high
        formalityLevel: 'friendly', // formal, friendly, casual
        informationDensity: 'high', // low, medium, high
        conversationFlow: 'guided', // free, guided, structured
        feedbackFrequency: 'occasional' // never, occasional, frequent
      }
    };

    this.profiles.set(userId, profile);
    this.updateAnalytics();
    
    return {
      success: true,
      profile: profile,
      message: 'تم إنشاء الملف الشخصي بنجاح'
    };
  }

  /**
   * Update user profile with new data
   */
  async updateUserProfile(userId, updates) {
    const profile = this.profiles.get(userId);
    if (!profile) {
      return await this.createUserProfile(userId, updates);
    }

    // Deep merge updates
    this.deepMerge(profile, updates);
    profile.basicInfo.lastActive = new Date().toISOString();
    
    this.profiles.set(userId, profile);
    
    return {
      success: true,
      profile: profile,
      message: 'تم تحديث الملف الشخصي بنجاح'
    };
  }

  /**
   * Analyze conversation for user insights
   */
  async analyzeConversation(userId, conversationData) {
    const profile = this.profiles.get(userId);
    if (!profile) {
      return { success: false, error: 'User profile not found' };
    }

    const analysis = {
      extractedPreferences: this.extractPreferencesFromConversation(conversationData),
      detectedInterests: this.detectInterests(conversationData),
      emotionalState: this.analyzeEmotionalState(conversationData),
      urgencyLevel: this.detectUrgency(conversationData),
      decisionStage: this.identifyDecisionStage(conversationData),
      budgetIndicators: this.extractBudgetIndicators(conversationData),
      culturalCues: this.detectCulturalCues(conversationData),
      communicationStyle: this.analyzeCommunicationStyle(conversationData)
    };

    // Update profile with new insights
    await this.updateProfileWithInsights(userId, analysis);
    
    return {
      success: true,
      analysis: analysis,
      updatedProfile: this.profiles.get(userId)
    };
  }

  /**
   * Generate personalized recommendations
   */
  async generatePersonalizedRecommendations(userId, requestType, parameters = {}) {
    const profile = this.profiles.get(userId);
    if (!profile) {
      return { success: false, error: 'User profile not found' };
    }

    const recommendations = {
      destinations: this.getDestinationRecommendations(profile, parameters),
      activities: this.getActivityRecommendations(profile, parameters),
      accommodations: this.getAccommodationRecommendations(profile, parameters),
      transportation: this.getTransportationRecommendations(profile, parameters),
      restaurants: this.getRestaurantRecommendations(profile, parameters),
      timing: this.getTimingRecommendations(profile, parameters),
      budget: this.getBudgetRecommendations(profile, parameters)
    };

    // Calculate personalization score
    const personalizationScore = this.calculatePersonalizationScore(recommendations, profile);

    return {
      success: true,
      recommendations: recommendations,
      personalizationScore: personalizationScore,
      reasoning: this.generateRecommendationReasoning(profile, recommendations),
      nextQuestions: this.generateFollowUpQuestions(profile, requestType)
    };
  }

  /**
   * Track user behavior and preferences
   */
  async trackUserBehavior(userId, behaviorData) {
    const profile = this.profiles.get(userId);
    if (!profile) {
      return { success: false, error: 'User profile not found' };
    }

    const trackingData = {
      timestamp: new Date().toISOString(),
      action: behaviorData.action,
      context: behaviorData.context,
      duration: behaviorData.duration,
      satisfaction: behaviorData.satisfaction,
      feedback: behaviorData.feedback
    };

    profile.behavioralData.conversationHistory.push(trackingData);
    
    // Analyze behavior patterns
    this.updateBehavioralPatterns(profile, trackingData);
    
    this.profiles.set(userId, profile);
    
    return {
      success: true,
      message: 'تم تسجيل السلوك بنجاح',
      insights: this.extractBehavioralInsights(profile)
    };
  }

  /**
   * Get user insights and analytics
   */
  async getUserInsights(userId) {
    const profile = this.profiles.get(userId);
    if (!profile) {
      return { success: false, error: 'User profile not found' };
    }

    const insights = {
      personalityProfile: this.generatePersonalityProfile(profile),
      travelPatterns: this.analyzeTravelPatterns(profile),
      preferenceEvolution: this.trackPreferenceEvolution(profile),
      satisfactionTrends: this.analyzeSatisfactionTrends(profile),
      engagementMetrics: this.calculateEngagementMetrics(profile),
      recommendationAccuracy: this.calculateRecommendationAccuracy(profile),
      culturalInsights: this.generateCulturalInsights(profile),
      behavioralPredictions: this.generateBehavioralPredictions(profile)
    };

    return {
      success: true,
      insights: insights,
      profile: profile
    };
  }

  /**
   * Extract preferences from conversation
   */
  extractPreferencesFromConversation(conversationData) {
    const preferences = {
      destinations: [],
      activities: [],
      budget: null,
      timing: null,
      accommodation: null,
      transportation: null
    };

    // Analyze conversation text for preferences
    const text = conversationData.messages.map(m => m.content).join(' ');
    
    // Destination preferences
    const destinationKeywords = ['أريد', 'أحب', 'مشوق', 'زيارة', 'السفر إلى'];
    // Activity preferences  
    const activityKeywords = ['مطعم', 'شاطئ', 'متاحف', 'تسوق', 'مغامرة'];
    // Budget indicators
    const budgetKeywords = ['رخيص', 'اقتصادي', 'فاخر', 'مكلف', 'ميزانية'];
    
    // This would contain actual NLP analysis
    return preferences;
  }

  /**
   * Detect user interests from conversation
   */
  detectInterests(conversationData) {
    const interests = [];
    const text = conversationData.messages.map(m => m.content).join(' ').toLowerCase();
    
    const interestMap = {
      'ثقافة': ['متحف', 'تاريخ', 'تراث', 'ثقافي'],
      'طبيعة': ['طبيعة', 'جبال', 'شاطئ', 'حدائق'],
      'طعام': ['طعام', 'مطعم', 'أكل', 'طبخ'],
      'تسوق': ['تسوق', 'مراكز', 'أسواق', 'شراء'],
      'مغامرة': ['مغامرة', 'رياضة', 'تسلق', 'غطس'],
      'استرخاء': ['استرخاء', 'سبا', 'راحة', 'هدوء']
    };

    Object.entries(interestMap).forEach(([interest, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        interests.push(interest);
      }
    });

    return interests;
  }

  /**
   * Analyze emotional state from conversation
   */
  analyzeEmotionalState(conversationData) {
    const text = conversationData.messages.map(m => m.content).join(' ').toLowerCase();
    
    const emotionIndicators = {
      excited: ['متحمس', 'رائع', 'مشوق', 'أحب', 'ممتاز'],
      concerned: ['قلق', 'مشكلة', 'صعب', 'مكلف', 'لا أعرف'],
      frustrated: ['ممل', 'مش عاجبني', 'مشكلة', 'لا يعمل'],
      satisfied: ['ممتاز', 'شكراً', 'رائع', 'أحب هذا']
    };

    const emotions = {};
    Object.entries(emotionIndicators).forEach(([emotion, indicators]) => {
      emotions[emotion] = indicators.filter(indicator => text.includes(indicator)).length;
    });

    return Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b, 'neutral');
  }

  /**
   * Get destination recommendations based on profile
   */
  getDestinationRecommendations(profile, parameters) {
    const recommendations = [];
    
    // Base recommendations on user preferences
    if (profile.preferences.travelStyle === 'luxury') {
      recommendations.push(
        { name: 'دبي', score: 0.95, reason: 'تناسب السفر الفاخر' },
        { name: 'باريس', score: 0.90, reason: 'مدينة راقية' },
        { name: 'طوكيو', score: 0.85, reason: 'تجربة فاخرة' }
      );
    } else if (profile.preferences.travelStyle === 'budget') {
      recommendations.push(
        { name: 'تركيا', score: 0.95, reason: 'أسعار معقولة' },
        { name: 'مصر', score: 0.90, reason: 'اقتصادي وثقافي' },
        { name: 'المغرب', score: 0.85, reason: 'ميزانية منخفضة' }
      );
    } else {
      recommendations.push(
        { name: 'ماليزيا', score: 0.95, reason: 'توازن جيد' },
        { name: 'إندونيسيا', score: 0.90, reason: 'متنوعة' },
        { name: 'تايلاند', score: 0.85, reason: 'خيارات متعددة' }
      );
    }

    // Filter by cultural requirements
    if (profile.personalization.religiousRequirements.includes('halal_food')) {
      recommendations.forEach(rec => {
        if (['ماليزيا', 'إندونيسيا', 'تركيا', 'ماليزيا'].includes(rec.name)) {
          rec.score += 0.1;
          rec.reason += ' - طعام حلال متوفر';
        }
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate personalization score
   */
  calculatePersonalizationScore(recommendations, profile) {
    let score = 0;
    let totalFactors = 0;

    // Check if recommendations match user preferences
    if (recommendations.destinations) {
      const userStyle = profile.preferences.travelStyle;
      recommendations.destinations.forEach(dest => {
        if (userStyle === 'luxury' && ['دبي', 'باريس', 'طوكيو'].includes(dest.name)) {
          score += 20;
        } else if (userStyle === 'budget' && ['تركيا', 'مصر', 'المغرب'].includes(dest.name)) {
          score += 20;
        }
        totalFactors += 20;
      });
    }

    // Check cultural alignment
    if (profile.personalization.religiousRequirements.includes('halal_food')) {
      const halalDestinations = recommendations.destinations?.filter(d => 
        d.reason?.includes('طعام حلال')
      ).length || 0;
      score += halalDestinations * 15;
      totalFactors += 15;
    }

    return totalFactors > 0 ? Math.round((score / totalFactors) * 100) : 80;
  }

  /**
   * Generate follow-up questions based on profile
   */
  generateFollowUpQuestions(profile, requestType) {
    const questions = [];

    if (requestType === 'trip_planning') {
      if (!profile.preferences.budgetRange || profile.preferences.budgetRange === 'medium') {
        questions.push('ما هو ميزانيتك التقريبي للرحلة؟');
      }
      
      if (profile.preferences.activityTypes.length === 0) {
        questions.push('ما نوع الأنشطة التي تفضلها؟ (ثقافية، طبيعة، تسوق، مغامرة)');
      }
      
      if (!profile.preferences.groupSize || profile.preferences.groupSize === 1) {
        questions.push('كم شخص سيسافر معك؟');
      }
    }

    return questions;
  }

  /**
   * Deep merge objects
   */
  deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  /**
   * Update analytics
   */
  updateAnalytics() {
    this.analytics.totalUsers = this.profiles.size;
    this.analytics.activeUsers = Array.from(this.profiles.values()).filter(
      profile => new Date(profile.basicInfo.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
  }

  /**
   * Get profile by ID
   */
  getProfile(userId) {
    return this.profiles.get(userId);
  }

  /**
   * Get all profiles (for analytics)
   */
  getAllProfiles() {
    return Array.from(this.profiles.values());
  }

  /**
   * Delete profile
   */
  deleteProfile(userId) {
    return this.profiles.delete(userId);
  }
}

module.exports = UserProfilingSystem;