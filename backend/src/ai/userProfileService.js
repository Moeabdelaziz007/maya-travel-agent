/**
 * User Profile and Persona Management Service
 * Handles user preferences, behavior analysis, and persona assignment
 */

const { createClient } = require('@supabase/supabase-js');

class UserProfileService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  /**
   * Get or create user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(userId) {
    try {
      let { data: profile, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        return await this.createUserProfile(userId);
      }

      if (error) {
        throw error;
      }

      // Get user's persona assignments
      const personas = await this.getUserPersonas(userId);

      return {
        ...profile,
        personas
      };

    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Create new user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created profile
   */
  async createUserProfile(userId) {
    try {
      const { data: profile, error } = await this.supabase
        .from('user_profiles')
        .insert({ id: userId })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return profile;

    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated profile
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data: profile, error } = await this.supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return profile;

    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user personas with confidence scores
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User personas
   */
  async getUserPersonas(userId) {
    try {
      const { data: personas, error } = await this.supabase
        .from('user_persona_assignments')
        .select(`
          *,
          user_personas!inner(*)
        `)
        .eq('user_id', userId)
        .gte('confidence_score', 0.3)
        .order('confidence_score', { ascending: false });

      if (error) {
        throw error;
      }

      return personas || [];

    } catch (error) {
      console.error('Error getting user personas:', error);
      return [];
    }
  }

  /**
   * Analyze user behavior and assign/update personas
   * @param {string} userId - User ID
   * @param {Object} behaviorData - User behavior data
   * @returns {Promise<Array>} Updated personas
   */
  async analyzeAndAssignPersonas(userId, behaviorData) {
    try {
      // Get all available personas
      const { data: allPersonas, error } = await this.supabase
        .from('user_personas')
        .select('*')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      const updatedAssignments = [];

      for (const persona of allPersonas) {
        const confidenceScore = this.calculatePersonaFit(persona, behaviorData);

        // Check if assignment already exists
        const { data: existingAssignment } = await this.supabase
          .from('user_persona_assignments')
          .select('*')
          .eq('user_id', userId)
          .eq('persona_id', persona.id)
          .single();

        if (existingAssignment) {
          // Update existing assignment
          if (confidenceScore >= 0.3) {
            const { data: updated, error: updateError } = await this.supabase
              .from('user_persona_assignments')
              .update({
                confidence_score: confidenceScore,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingAssignment.id)
              .select()
              .single();

            if (!updateError) {
              updatedAssignments.push(updated);
            }
          } else {
            // Remove low-confidence assignment
            await this.supabase
              .from('user_persona_assignments')
              .delete()
              .eq('id', existingAssignment.id);
          }
        } else if (confidenceScore >= 0.5) {
          // Create new assignment
          const { data: newAssignment, error: insertError } = await this.supabase
            .from('user_persona_assignments')
            .insert({
              user_id: userId,
              persona_id: persona.id,
              confidence_score: confidenceScore
            })
            .select()
            .single();

          if (!insertError) {
            updatedAssignments.push(newAssignment);
          }
        }
      }

      return updatedAssignments;

    } catch (error) {
      console.error('Error analyzing and assigning personas:', error);
      throw error;
    }
  }

  /**
   * Calculate how well a persona fits user behavior
   * @param {Object} persona - Persona data
   * @param {Object} behaviorData - User behavior data
   * @returns {number} Confidence score (0-1)
   */
  calculatePersonaFit(persona, behaviorData) {
    let score = 0;
    let factors = 0;

    // Budget analysis
    if (persona.characteristics.budget_conscious && behaviorData.budget_focused) {
      score += 0.3;
    } else if (!persona.characteristics.budget_conscious && !behaviorData.budget_focused) {
      score += 0.2;
    }
    factors++;

    // Travel style analysis
    if (persona.characteristics.adventure_level) {
      const adventureMatch = this.compareTravelStyles(
        persona.characteristics.adventure_level,
        behaviorData.adventure_level
      );
      score += adventureMatch * 0.25;
      factors++;
    }

    // Group size analysis
    if (persona.travel_patterns.group_size && behaviorData.preferred_group_size) {
      const groupMatch = this.compareGroupSizes(
        persona.travel_patterns.group_size,
        behaviorData.preferred_group_size
      );
      score += groupMatch * 0.2;
      factors++;
    }

    // Frequency analysis
    if (persona.travel_patterns.frequency && behaviorData.travel_frequency) {
      const frequencyMatch = this.compareTravelFrequency(
        persona.travel_patterns.frequency,
        behaviorData.travel_frequency
      );
      score += frequencyMatch * 0.15;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Compare travel styles for compatibility
   * @param {string} personaStyle - Persona's adventure level
   * @param {string} userStyle - User's adventure level
   * @returns {number} Compatibility score (0-1)
   */
  compareTravelStyles(personaStyle, userStyle) {
    const styles = { low: 1, medium: 2, high: 3 };
    const personaLevel = styles[personaStyle] || 2;
    const userLevel = styles[userStyle] || 2;

    const diff = Math.abs(personaLevel - userLevel);
    return Math.max(0, 1 - (diff / 2));
  }

  /**
   * Compare group size preferences
   * @param {string} personaSize - Persona's preferred group size
   * @param {string} userSize - User's preferred group size
   * @returns {number} Compatibility score (0-1)
   */
  compareGroupSizes(personaSize, userSize) {
    if (personaSize === userSize) return 1;

    // Similar sizes get partial credit
    const similarSizes = {
      solo: ['solo'],
      couple: ['couple', 'small'],
      family: ['family', 'group'],
      small: ['couple', 'small'],
      group: ['family', 'group']
    };

    const personaSimilar = similarSizes[personaSize] || [];
    return personaSimilar.includes(userSize) ? 0.7 : 0;
  }

  /**
   * Compare travel frequency preferences
   * @param {string} personaFreq - Persona's travel frequency
   * @param {string} userFreq - User's travel frequency
   * @returns {number} Compatibility score (0-1)
   */
  compareTravelFrequency(personaFreq, userFreq) {
    if (personaFreq === userFreq) return 1;

    // Similar frequencies get partial credit
    const similarFreq = {
      rare: ['rare'],
      occasional: ['occasional', 'rare'],
      frequent: ['frequent', 'occasional'],
      constant: ['constant', 'frequent']
    };

    const personaSimilar = similarFreq[personaFreq] || [];
    return personaSimilar.includes(userFreq) ? 0.6 : 0;
  }

  /**
   * Record user behavior for analysis
   * @param {string} userId - User ID
   * @param {string} interactionType - Type of interaction
   * @param {Object} interactionData - Interaction details
   * @param {string} sessionId - Session identifier
   * @returns {Promise<void>}
   */
  async recordUserBehavior(userId, interactionType, interactionData, sessionId = null) {
    try {
      const { error } = await this.supabase
        .from('user_behavior_history')
        .insert({
          user_id: userId,
          interaction_type: interactionType,
          interaction_data: interactionData,
          session_id: sessionId
        });

      if (error) {
        throw error;
      }

      // Trigger persona analysis periodically
      if (Math.random() < 0.1) { // 10% chance to trigger analysis
        await this.analyzeAndAssignPersonas(userId, interactionData);
      }

    } catch (error) {
      console.error('Error recording user behavior:', error);
    }
  }

  /**
   * Get user behavior history
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Behavior history
   */
  async getUserBehaviorHistory(userId, options = {}) {
    try {
      const { limit = 100, interactionType = null } = options;

      let query = this.supabase
        .from('user_behavior_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (interactionType) {
        query = query.eq('interaction_type', interactionType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error getting user behavior history:', error);
      return [];
    }
  }

  /**
   * Record user feedback
   * @param {string} userId - User ID
   * @param {string} feedbackType - Type of feedback
   * @param {Object} feedbackData - Feedback details
   * @param {string} conversationId - Associated conversation
   * @param {string} aiResponseId - Associated AI response
   * @returns {Promise<void>}
   */
  async recordFeedback(userId, feedbackType, feedbackData, conversationId = null, aiResponseId = null) {
    try {
      const { error } = await this.supabase
        .from('user_feedback')
        .insert({
          user_id: userId,
          feedback_type: feedbackType,
          feedback_data: feedbackData,
          conversation_id: conversationId,
          ai_response_id: aiResponseId
        });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  }

  /**
   * Get all available personas
   * @returns {Promise<Array>} Available personas
   */
  async getAllPersonas() {
    try {
      const { data, error } = await this.supabase
        .from('user_personas')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error getting all personas:', error);
      return [];
    }
  }
}

module.exports = UserProfileService;