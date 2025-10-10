/**
 * Supabase Database Client for Maya Travel Agent
 * Persistent storage for user profiles, conversations, and travel offers
 */

const { createClient } = require('@supabase/supabase-js');

class SupabaseDB {
  constructor() {
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || 
        process.env.SUPABASE_URL.includes('your_supabase') || 
        process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your_supabase')) {
      console.log('⚠️ Supabase not configured - using in-memory storage');
      this.supabase = null;
      this.memoryStorage = {
        profiles: new Map(),
        messages: new Map(),
        offers: this.getDefaultOffers()
      };
    } else {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      this.memoryStorage = null;
      console.log('✅ Supabase client initialized');
    }
  }

  getDefaultOffers() {
    return [
      {
        id: '1',
        title: 'عرض تركيا الخاص - إسطنبول وبورصة',
        destination: 'تركيا',
        description: 'رحلة شاملة لمدة 7 أيام تشمل إسطنبول وبورصة مع جولات سياحية يومية',
        price: 2499.00,
        original_price: 3500.00,
        discount_percentage: 29,
        category: 'family',
        duration_days: 7,
        includes: ['طيران ذهاب وعودة', 'إقامة 5 نجوم', 'وجبات الإفطار', 'جولات سياحية', 'مرشد عربي'],
        is_active: true,
        priority: 10
      },
      {
        id: '2',
        title: 'عرض ماليزيا الذهبي',
        destination: 'ماليزيا',
        description: 'استكشف كوالالمبور ولنكاوي مع أفضل الفنادق والجولات',
        price: 3299.00,
        original_price: 4200.00,
        discount_percentage: 21,
        category: 'luxury',
        duration_days: 10,
        includes: ['طيران درجة أولى', 'فنادق 5 نجوم', 'جميع الوجبات', 'جولات خاصة', 'تأمين شامل'],
        is_active: true,
        priority: 9
      },
      {
        id: '3',
        title: 'مغامرة دبي الاقتصادية',
        destination: 'الإمارات',
        description: 'عطلة نهاية أسبوع في دبي بأسعار لا تقاوم',
        price: 1299.00,
        original_price: 1800.00,
        discount_percentage: 28,
        category: 'budget',
        duration_days: 4,
        includes: ['طيران اقتصادي', 'فندق 4 نجوم', 'إفطار', 'تذاكر برج خليفة'],
        is_active: true,
        priority: 8
      }
    ];
  }

  /**
   * Get or create user profile (using profiles table)
   */
  async getUserProfile(telegramId) {
    if (!this.supabase) {
      return this.memoryStorage.profiles.get(telegramId) || null;
    }
    
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Create new user profile (using profiles table)
   */
  async createUserProfile(telegramId, userData) {
    if (!this.supabase) {
      const profile = {
        telegram_id: telegramId,
        username: userData.username || null,
        avatar_url: userData.avatar_url || null,
        preferences: userData.preferences || {},
        travel_history: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.memoryStorage.profiles.set(telegramId, profile);
      return profile;
    }
    
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .insert([{
          telegram_id: telegramId,
          username: userData.username || null,
          avatar_url: userData.avatar_url || null,
          preferences: userData.preferences || {},
          travel_history: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile (using profiles table)
   */
  async updateUserProfile(telegramId, updates) {
    if (!this.supabase) {
      const profile = this.memoryStorage.profiles.get(telegramId);
      if (!profile) return null;
      const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
      this.memoryStorage.profiles.set(telegramId, updated);
      return updated;
    }
    
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', telegramId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  /**
   * Save conversation message (using messages table)
   */
  async saveConversationMessage(telegramId, message, isUser = true) {
    if (!this.supabase) {
      if (!this.memoryStorage.messages.has(telegramId)) {
        this.memoryStorage.messages.set(telegramId, []);
      }
      const msg = {
        telegram_id: telegramId,
        content: message,
        role: isUser ? 'user' : 'assistant',
        is_telegram: true,
        created_at: new Date().toISOString()
      };
      this.memoryStorage.messages.get(telegramId).push(msg);
      return msg;
    }
    
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .insert([{
          telegram_id: telegramId,
          content: message,
          role: isUser ? 'user' : 'assistant',
          is_telegram: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    }
  }

  /**
   * Get conversation history (using messages table)
   */
  async getConversationHistory(telegramId, limit = 20) {
    if (!this.supabase) {
      const messages = this.memoryStorage.messages.get(telegramId) || [];
      return messages.slice(-limit).map(msg => ({
        message: msg.content,
        is_user: msg.role === 'user',
        timestamp: msg.created_at
      }));
    }
    
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('telegram_id', telegramId)
        .eq('is_telegram', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Convert to expected format
      const formatted = data ? data.reverse().map(msg => ({
        message: msg.content,
        is_user: msg.role === 'user',
        timestamp: msg.created_at
      })) : [];
      
      return formatted;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Clear old conversation history (keep last 30 days)
   */
  async clearOldConversations(telegramId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error } = await this.supabase
        .from('messages')
        .delete()
        .eq('telegram_id', telegramId)
        .eq('is_telegram', true)
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing old conversations:', error);
      return false;
    }
  }

  /**
   * Save user travel preference
   */
  async saveUserPreference(telegramId, preferenceKey, preferenceValue) {
    try {
      const profile = await this.getUserProfile(telegramId);
      if (!profile) return null;

      const preferences = profile.preferences || {};
      preferences[preferenceKey] = preferenceValue;

      return await this.updateUserProfile(telegramId, { preferences });
    } catch (error) {
      console.error('Error saving user preference:', error);
      return null;
    }
  }

  /**
   * Add to travel history
   */
  async addToTravelHistory(telegramId, tripData) {
    try {
      const profile = await this.getUserProfile(telegramId);
      if (!profile) return null;

      const travelHistory = profile.travel_history || [];
      travelHistory.push({
        ...tripData,
        timestamp: new Date().toISOString()
      });

      return await this.updateUserProfile(telegramId, { 
        travel_history: travelHistory 
      });
    } catch (error) {
      console.error('Error adding to travel history:', error);
      return null;
    }
  }

  /**
   * Get all travel offers
   */
  async getTravelOffers(filters = {}) {
    if (!this.supabase) {
      let offers = this.memoryStorage.offers.filter(o => o.is_active);
      
      if (filters.destination) {
        offers = offers.filter(o => 
          o.destination.toLowerCase().includes(filters.destination.toLowerCase())
        );
      }
      
      if (filters.maxPrice) {
        offers = offers.filter(o => o.price <= filters.maxPrice);
      }
      
      if (filters.category) {
        offers = offers.filter(o => o.category === filters.category);
      }
      
      return offers.sort((a, b) => b.priority - a.priority).slice(0, 10);
    }
    
    try {
      let query = this.supabase
        .from('travel_offers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (filters.destination) {
        query = query.ilike('destination', `%${filters.destination}%`);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting travel offers:', error);
      return [];
    }
  }

  /**
   * Get personalized offers based on user history
   */
  async getPersonalizedOffers(telegramId) {
    try {
      const profile = await this.getUserProfile(telegramId);
      if (!profile) return await this.getTravelOffers();

      const preferences = profile.preferences || {};
      const travelHistory = profile.travel_history || [];

      // Extract user preferences
      const filters = {
        maxPrice: preferences.budget_max || null,
        category: preferences.travel_style || null
      };

      // Get offers matching preferences
      let offers = await this.getTravelOffers(filters);

      // If user has travel history, prioritize similar destinations
      if (travelHistory.length > 0) {
        const visitedDestinations = travelHistory.map(t => t.destination);
        offers = offers.sort((a, b) => {
          const aMatch = visitedDestinations.some(d => 
            a.destination.toLowerCase().includes(d.toLowerCase())
          );
          const bMatch = visitedDestinations.some(d => 
            b.destination.toLowerCase().includes(d.toLowerCase())
          );
          return bMatch - aMatch;
        });
      }

      return offers;
    } catch (error) {
      console.error('Error getting personalized offers:', error);
      return [];
    }
  }

  /**
   * Create new travel offer
   */
  async createTravelOffer(offerData) {
    if (!this.supabase) {
      const offer = {
        id: String(Date.now()),
        title: offerData.title,
        destination: offerData.destination,
        description: offerData.description,
        price: offerData.price,
        original_price: offerData.originalPrice || offerData.original_price || offerData.price,
        discount_percentage: offerData.discountPercentage || offerData.discount_percentage || 0,
        category: offerData.category || 'general',
        duration_days: offerData.durationDays || offerData.duration_days || 7,
        includes: offerData.includes || [],
        image_url: offerData.imageUrl || offerData.image_url || null,
        is_active: offerData.is_active !== undefined ? offerData.is_active : true,
        priority: offerData.priority || 0,
        valid_until: offerData.validUntil || offerData.valid_until || null,
        created_at: new Date().toISOString()
      };
      this.memoryStorage.offers.push(offer);
      return offer;
    }
    
    try {
      const { data, error } = await this.supabase
        .from('travel_offers')
        .insert([{
          title: offerData.title,
          destination: offerData.destination,
          description: offerData.description,
          price: offerData.price,
          original_price: offerData.originalPrice || offerData.original_price || offerData.price,
          discount_percentage: offerData.discountPercentage || offerData.discount_percentage || 0,
          category: offerData.category || 'general',
          duration_days: offerData.durationDays || offerData.duration_days || 7,
          includes: offerData.includes || [],
          image_url: offerData.imageUrl || offerData.image_url || null,
          is_active: offerData.is_active !== undefined ? offerData.is_active : true,
          priority: offerData.priority || 0,
          valid_until: offerData.validUntil || offerData.valid_until || null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating travel offer:', error);
      return null;
    }
  }

  /**
   * Track user interaction with offer
   */
  async trackOfferInteraction(telegramId, offerId, interactionType) {
    if (!this.supabase) {
      const interaction = {
        id: String(Date.now()),
        telegram_id: telegramId,
        offer_id: offerId,
        interaction_type: interactionType, // 'view', 'click', 'book'
        timestamp: new Date().toISOString()
      };
      if (!this.memoryStorage.interactions) {
        this.memoryStorage.interactions = [];
      }
      this.memoryStorage.interactions.push(interaction);
      return interaction;
    }
    
    try {
      const { data, error } = await this.supabase
        .from('offer_interactions')
        .insert([{
          telegram_id: telegramId,
          offer_id: offerId,
          interaction_type: interactionType, // 'view', 'click', 'book'
          timestamp: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tracking offer interaction:', error);
      return null;
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(telegramId) {
    if (!this.supabase) {
      const profile = await this.getUserProfile(telegramId);
      const conversations = await this.getConversationHistory(telegramId, 100);
      const interactions = (this.memoryStorage.interactions || []).filter(
        i => i.telegram_id === telegramId
      );

      return {
        profile,
        totalConversations: conversations.length,
        totalInteractions: interactions.length,
        travelHistory: profile?.travel_history || [],
        preferences: profile?.preferences || {}
      };
    }
    
    try {
      const profile = await this.getUserProfile(telegramId);
      const conversations = await this.getConversationHistory(telegramId, 100);
      
      const { data: interactions, error } = await this.supabase
        .from('offer_interactions')
        .select('*')
        .eq('telegram_id', telegramId);

      if (error) throw error;

      return {
        profile,
        totalConversations: conversations.length,
        totalInteractions: interactions?.length || 0,
        travelHistory: profile?.travel_history || [],
        preferences: profile?.preferences || {}
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  }

  /**
   * Search offers by query
   */
  async searchOffers(query) {
    if (!this.supabase) {
      const searchTerm = query.toLowerCase();
      return this.memoryStorage.offers.filter(offer => 
        offer.is_active && (
          offer.title.toLowerCase().includes(searchTerm) ||
          offer.destination.toLowerCase().includes(searchTerm) ||
          offer.description.toLowerCase().includes(searchTerm)
        )
      ).sort((a, b) => b.priority - a.priority).slice(0, 10);
    }
    
    try {
      const { data, error } = await this.supabase
        .from('travel_offers')
        .select('*')
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,destination.ilike.%${query}%,description.ilike.%${query}%`)
        .order('priority', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching offers:', error);
      return [];
    }
  }
}

module.exports = SupabaseDB;
