/**
 * Supabase Database Client for Maya Travel Agent
 * Persistent storage for user profiles, conversations, and travel offers
 */

const { createClient } = require('@supabase/supabase-js');

class SupabaseDB {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('✅ Supabase client initialized');
  }

  /**
   * Get or create user profile (using profiles table)
   */
  async getUserProfile(telegramId) {
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
    try {
      const { data, error } = await this.supabase
        .from('travel_offers')
        .insert([{
          title: offerData.title,
          destination: offerData.destination,
          description: offerData.description,
          price: offerData.price,
          original_price: offerData.originalPrice || offerData.price,
          discount_percentage: offerData.discountPercentage || 0,
          category: offerData.category || 'general',
          duration_days: offerData.durationDays || 7,
          includes: offerData.includes || [],
          image_url: offerData.imageUrl || null,
          is_active: true,
          priority: offerData.priority || 0,
          valid_until: offerData.validUntil || null,
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
