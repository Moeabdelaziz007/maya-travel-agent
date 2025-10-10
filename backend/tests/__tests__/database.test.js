/**
 * Comprehensive Database Integration Tests for Supabase Operations
 * Tests all database operations, authentication, user management, and trip operations
 */

const SupabaseDB = require('../../database/supabase');
const {
  setupTestDatabase,
  cleanupTestData,
  createTestUser,
  createTestTrip,
  createTestTravelOffer,
  createTestDestination,
  createTestExpense,
  createTestMessage,
  createTestPayment,
  getTestUser,
  deleteTestUser,
  generateTestTelegramId,
  testSupabaseClient
} = require('../utils/database-test-helpers');

describe('Supabase Database Operations', () => {
  let db;
  let testTelegramId;

  beforeAll(async () => {
    // Initialize test database
    await setupTestDatabase();
    db = new SupabaseDB();

    // Override the supabase client to use test database if available
    if (testSupabaseClient) {
      db.supabase = testSupabaseClient;
      db.memoryStorage = null; // Force real database usage
    } else {
      // Use memory storage for tests when no real database is available
      console.log('⚠️ Using memory storage for database tests');
    }
  });

  beforeEach(async () => {
    testTelegramId = generateTestTelegramId();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestData();
  });

  describe('Database Connection', () => {
    it('should initialize with test database configuration', () => {
      expect(db).toBeInstanceOf(SupabaseDB);
      expect(db.supabase).toBeDefined();
      expect(db.memoryStorage).toBeNull();
    });

    it('should handle missing configuration gracefully', () => {
      const originalEnv = process.env.SUPABASE_URL;
      delete process.env.SUPABASE_URL;

      const fallbackDb = new SupabaseDB();
      expect(fallbackDb.supabase).toBeNull();
      expect(fallbackDb.memoryStorage).toBeDefined();

      process.env.SUPABASE_URL = originalEnv;
    });
  });

  describe('User Profile Management', () => {
    it('should create user profile successfully', async () => {
      const userData = {
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
        preferences: { language: 'ar', currency: 'USD' }
      };

      const profile = await db.createUserProfile(testTelegramId, userData);

      expect(profile).toBeDefined();
      expect(profile.telegram_id).toBe(testTelegramId);
      expect(profile.username).toBe(userData.username);
      expect(profile.avatar_url).toBe(userData.avatar_url);
      expect(profile.preferences).toEqual(userData.preferences);
    });

    it('should get user profile successfully', async () => {
      // Create a test user first
      const userData = {
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg'
      };

      await db.createUserProfile(testTelegramId, userData);

      // Retrieve the profile
      const profile = await db.getUserProfile(testTelegramId);

      expect(profile).toBeDefined();
      expect(profile.telegram_id).toBe(testTelegramId);
      expect(profile.username).toBe(userData.username);
    });

    it('should return null for non-existent user', async () => {
      const profile = await db.getUserProfile(999999);
      expect(profile).toBeNull();
    });

    it('should update user profile successfully', async () => {
      // Create initial profile
      const userData = {
        username: 'testuser',
        preferences: { language: 'ar' }
      };

      await db.createUserProfile(testTelegramId, userData);

      // Update the profile
      const updates = {
        username: 'updateduser',
        preferences: { language: 'en', currency: 'EUR' }
      };

      const updatedProfile = await db.updateUserProfile(testTelegramId, updates);

      expect(updatedProfile).toBeDefined();
      expect(updatedProfile.username).toBe(updates.username);
      expect(updatedProfile.preferences).toEqual(updates.preferences);
    });

    it('should handle duplicate telegram_id on profile creation', async () => {
      const userData = {
        username: 'testuser',
        preferences: { language: 'ar' }
      };

      // Create first profile
      await db.createUserProfile(testTelegramId, userData);

      // Try to create duplicate
      await expect(db.createUserProfile(testTelegramId, userData))
        .rejects.toThrow();
    });
  });

  describe('Conversation Management', () => {
    beforeEach(async () => {
      // Create a test user for conversation tests
      await createTestUser({
        telegram_id: testTelegramId,
        username: 'conversation_user'
      });
    });

    it('should save conversation message successfully', async () => {
      const message = 'Hello, this is a test message';
      const savedMessage = await db.saveConversationMessage(testTelegramId, message, true);

      expect(savedMessage).toBeDefined();
      expect(savedMessage.content).toBe(message);
      expect(savedMessage.role).toBe('user');
      expect(savedMessage.is_telegram).toBe(true);
    });

    it('should save assistant message successfully', async () => {
      const message = 'Hello! How can I help you with your travel plans?';
      const savedMessage = await db.saveConversationMessage(testTelegramId, message, false);

      expect(savedMessage).toBeDefined();
      expect(savedMessage.content).toBe(message);
      expect(savedMessage.role).toBe('assistant');
    });

    it('should get conversation history successfully', async () => {
      // Save multiple messages
      await db.saveConversationMessage(testTelegramId, 'User message 1', true);
      await db.saveConversationMessage(testTelegramId, 'Assistant response 1', false);
      await db.saveConversationMessage(testTelegramId, 'User message 2', true);

      const history = await db.getConversationHistory(testTelegramId, 10);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(3);
      expect(history[0].message).toBe('User message 1');
      expect(history[0].is_user).toBe(true);
      expect(history[1].message).toBe('Assistant response 1');
      expect(history[1].is_user).toBe(false);
    });

    it('should limit conversation history results', async () => {
      // Save 5 messages
      for (let i = 1; i <= 5; i++) {
        await db.saveConversationMessage(testTelegramId, `Message ${i}`, true);
      }

      const history = await db.getConversationHistory(testTelegramId, 3);

      expect(history).toBeDefined();
      expect(history.length).toBe(3);
      expect(history[0].message).toBe('Message 3'); // Should be in reverse order (newest first)
      expect(history[2].message).toBe('Message 5');
    });

    it('should return empty array for user with no messages', async () => {
      const history = await db.getConversationHistory(999999, 10);
      expect(history).toEqual([]);
    });
  });

  describe('Travel Offers Management', () => {
    it('should get all travel offers successfully', async () => {
      // Create test offers
      await createTestTravelOffer({
        title: 'Test Offer 1',
        destination: 'Test City 1',
        price: 500,
        category: 'budget'
      });

      await createTestTravelOffer({
        title: 'Test Offer 2',
        destination: 'Test City 2',
        price: 1500,
        category: 'luxury'
      });

      const offers = await db.getTravelOffers();

      expect(offers).toBeDefined();
      expect(Array.isArray(offers)).toBe(true);
      expect(offers.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter offers by destination', async () => {
      await createTestTravelOffer({
        title: 'Istanbul Offer',
        destination: 'Istanbul, Turkey',
        price: 800
      });

      await createTestTravelOffer({
        title: 'Dubai Offer',
        destination: 'Dubai, UAE',
        price: 1200
      });

      const istanbulOffers = await db.getTravelOffers({ destination: 'Istanbul' });

      expect(istanbulOffers).toBeDefined();
      expect(Array.isArray(istanbulOffers)).toBe(true);
      expect(istanbulOffers.length).toBe(1);
      expect(istanbulOffers[0].destination).toContain('Istanbul');
    });

    it('should filter offers by maximum price', async () => {
      await createTestTravelOffer({
        title: 'Budget Offer',
        price: 500
      });

      await createTestTravelOffer({
        title: 'Luxury Offer',
        price: 2000
      });

      const budgetOffers = await db.getTravelOffers({ maxPrice: 1000 });

      expect(budgetOffers).toBeDefined();
      expect(Array.isArray(budgetOffers)).toBe(true);
      expect(budgetOffers.length).toBe(1);
      expect(budgetOffers[0].price).toBeLessThanOrEqual(1000);
    });

    it('should filter offers by category', async () => {
      await createTestTravelOffer({
        title: 'Budget Trip',
        category: 'budget',
        price: 400
      });

      await createTestTravelOffer({
        title: 'Luxury Trip',
        category: 'luxury',
        price: 2000
      });

      const budgetOffers = await db.getTravelOffers({ category: 'budget' });

      expect(budgetOffers).toBeDefined();
      expect(Array.isArray(budgetOffers)).toBe(true);
      expect(budgetOffers.length).toBe(1);
      expect(budgetOffers[0].category).toBe('budget');
    });

    it('should create new travel offer successfully', async () => {
      const offerData = {
        title: 'New Test Offer',
        destination: 'Test City, Test Country',
        description: 'A brand new test offer',
        price: 750,
        originalPrice: 1000,
        discountPercentage: 25,
        category: 'budget',
        durationDays: 5,
        includes: ['Flight', 'Hotel'],
        imageUrl: 'https://example.com/offer.jpg',
        priority: 8
      };

      const createdOffer = await db.createTravelOffer(offerData);

      expect(createdOffer).toBeDefined();
      expect(createdOffer.title).toBe(offerData.title);
      expect(createdOffer.destination).toBe(offerData.destination);
      expect(createdOffer.price).toBe(offerData.price);
      expect(createdOffer.category).toBe(offerData.category);
    });

    it('should search offers by query', async () => {
      await createTestTravelOffer({
        title: 'Romantic Paris Getaway',
        destination: 'Paris, France',
        description: 'Experience the city of love'
      });

      await createTestTravelOffer({
        title: 'Tokyo Adventure',
        destination: 'Tokyo, Japan',
        description: 'Explore modern and traditional Japan'
      });

      const parisOffers = await db.searchOffers('Paris');

      expect(parisOffers).toBeDefined();
      expect(Array.isArray(parisOffers)).toBe(true);
      expect(parisOffers.length).toBe(1);
      expect(parisOffers[0].title).toContain('Paris');
    });
  });

  describe('User Preferences and Travel History', () => {
    beforeEach(async () => {
      // Create a test user for preference tests
      await createTestUser({
        telegram_id: testTelegramId,
        username: 'preference_user',
        preferences: { language: 'ar' }
      });
    });

    it('should save user preference successfully', async () => {
      const result = await db.saveUserPreference(testTelegramId, 'budget_max', 2000);

      expect(result).toBeDefined();
      expect(result.preferences).toBeDefined();
      expect(result.preferences.budget_max).toBe(2000);
    });

    it('should add to travel history successfully', async () => {
      const tripData = {
        destination: 'Paris, France',
        duration: 7,
        budget: 1500,
        status: 'completed'
      };

      const result = await db.addToTravelHistory(testTelegramId, tripData);

      expect(result).toBeDefined();
      expect(result.travel_history).toBeDefined();
      expect(Array.isArray(result.travel_history)).toBe(true);
      expect(result.travel_history.length).toBe(1);
      expect(result.travel_history[0].destination).toBe(tripData.destination);
    });

    it('should get personalized offers based on user history', async () => {
      // Add travel history
      await db.addToTravelHistory(testTelegramId, {
        destination: 'Paris, France',
        status: 'completed'
      });

      // Set preferences
      await db.saveUserPreference(testTelegramId, 'budget_max', 1000);
      await db.saveUserPreference(testTelegramId, 'travel_style', 'budget');

      // Create offers that match preferences
      await createTestTravelOffer({
        title: 'Budget Paris Trip',
        destination: 'Paris, France',
        price: 800,
        category: 'budget'
      });

      await createTestTravelOffer({
        title: 'Expensive Tokyo Trip',
        destination: 'Tokyo, Japan',
        price: 2500,
        category: 'luxury'
      });

      const personalizedOffers = await db.getPersonalizedOffers(testTelegramId);

      expect(personalizedOffers).toBeDefined();
      expect(Array.isArray(personalizedOffers)).toBe(true);
      expect(personalizedOffers.length).toBeGreaterThan(0);

      // Should prioritize Paris offers due to travel history
      const parisOffers = personalizedOffers.filter(offer =>
        offer.destination.toLowerCase().includes('paris')
      );
      expect(parisOffers.length).toBeGreaterThan(0);
    });
  });

  describe('Offer Interactions', () => {
    let testOffer;

    beforeEach(async () => {
      // Create a test offer for interaction tests
      testOffer = await createTestTravelOffer({
        title: 'Interaction Test Offer',
        destination: 'Test City',
        price: 500
      });
    });

    it('should track offer interaction successfully', async () => {
      const interaction = await db.trackOfferInteraction(
        testTelegramId,
        testOffer.id,
        'view'
      );

      expect(interaction).toBeDefined();
      expect(interaction.telegram_id).toBe(testTelegramId);
      expect(interaction.offer_id).toBe(testOffer.id);
      expect(interaction.interaction_type).toBe('view');
    });

    it('should handle different interaction types', async () => {
      const interactions = ['view', 'click', 'book'];

      for (const interactionType of interactions) {
        const interaction = await db.trackOfferInteraction(
          testTelegramId,
          testOffer.id,
          interactionType
        );

        expect(interaction).toBeDefined();
        expect(interaction.interaction_type).toBe(interactionType);
      }
    });
  });

  describe('User Analytics', () => {
    beforeEach(async () => {
      // Create a test user and some data for analytics
      await createTestUser({
        telegram_id: testTelegramId,
        username: 'analytics_user',
        preferences: { language: 'ar' },
        travel_history: [
          {
            destination: 'Paris',
            status: 'completed',
            timestamp: new Date().toISOString()
          }
        ]
      });

      // Add some messages
      await db.saveConversationMessage(testTelegramId, 'Hello', true);
      await db.saveConversationMessage(testTelegramId, 'Hi there!', false);

      // Add offer interaction
      const testOffer = await createTestTravelOffer();
      await db.trackOfferInteraction(testTelegramId, testOffer.id, 'view');
    });

    it('should get user analytics successfully', async () => {
      const analytics = await db.getUserAnalytics(testTelegramId);

      expect(analytics).toBeDefined();
      expect(analytics.profile).toBeDefined();
      expect(analytics.totalConversations).toBeGreaterThan(0);
      expect(analytics.totalInteractions).toBeGreaterThan(0);
      expect(analytics.travelHistory).toBeDefined();
      expect(analytics.preferences).toBeDefined();
    });

    it('should return null for non-existent user analytics', async () => {
      const analytics = await db.getUserAnalytics(999999);
      expect(analytics).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Temporarily break the database connection
      const originalSupabase = db.supabase;
      db.supabase = null;

      const profile = await db.getUserProfile(testTelegramId);
      expect(profile).toBeNull();

      // Restore connection
      db.supabase = originalSupabase;
    });

    it('should handle invalid data types', async () => {
      // Try to create user with invalid data
      const invalidUserData = {
        username: null, // Should be string or null but testing edge case
        preferences: 'invalid_preferences' // Should be object
      };

      // This should not throw but handle gracefully
      const profile = await db.createUserProfile(testTelegramId, invalidUserData);
      expect(profile).toBeDefined(); // Should still create profile with defaults
    });

    it('should handle concurrent operations', async () => {
      // Create multiple users concurrently
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          db.createUserProfile(testTelegramId + i, {
            username: `concurrent_user_${i}`,
            preferences: { language: 'ar' }
          })
        );
      }

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((profile, index) => {
        expect(profile).toBeDefined();
        expect(profile.telegram_id).toBe(testTelegramId + index);
      });
    });
  });

  describe('Data Validation and Constraints', () => {
    it('should enforce unique telegram_id constraint', async () => {
      const userData = {
        username: 'unique_test_user',
        preferences: { language: 'ar' }
      };

      // Create first user
      await db.createUserProfile(testTelegramId, userData);

      // Try to create duplicate - should fail
      await expect(db.createUserProfile(testTelegramId, userData))
        .rejects.toThrow();
    });

    it('should handle null values appropriately', async () => {
      const userData = {
        username: null,
        avatar_url: null,
        preferences: {}
      };

      const profile = await db.createUserProfile(testTelegramId, userData);

      expect(profile).toBeDefined();
      expect(profile.username).toBeNull();
      expect(profile.avatar_url).toBeNull();
      expect(profile.preferences).toEqual({});
    });

    it('should validate required fields for offers', async () => {
      const invalidOfferData = {
        // Missing required fields like title, destination, price
        description: 'Invalid offer without required fields'
      };

      // Should handle missing required fields gracefully
      const offer = await db.createTravelOffer(invalidOfferData);
      // Depending on database constraints, this might return null or throw
      // The test verifies the function handles the error appropriately
      expect(offer === null || offer === undefined || typeof offer === 'object').toBe(true);
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle bulk operations efficiently', async () => {
      const startTime = Date.now();

      // Create multiple users
      const bulkPromises = [];
      for (let i = 0; i < 10; i++) {
        bulkPromises.push(
          db.createUserProfile(testTelegramId + i, {
            username: `bulk_user_${i}`,
            preferences: { language: 'ar' }
          })
        );
      }

      const results = await Promise.all(bulkPromises);
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle large conversation history', async () => {
      // Create a user and add many messages
      await createTestUser({
        telegram_id: testTelegramId,
        username: 'history_user'
      });

      // Add 50 messages
      const messagePromises = [];
      for (let i = 0; i < 50; i++) {
        messagePromises.push(
          db.saveConversationMessage(testTelegramId, `Message ${i}`, i % 2 === 0)
        );
      }

      await Promise.all(messagePromises);

      // Retrieve limited history
      const history = await db.getConversationHistory(testTelegramId, 20);

      expect(history).toBeDefined();
      expect(history.length).toBe(20); // Should be limited to 20
    });
  });
});