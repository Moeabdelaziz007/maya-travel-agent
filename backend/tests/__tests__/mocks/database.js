/**
 * Database mocks for testing
 */

const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com'
      },
      error: null
    }),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({
      data: [
        { id: 1, title: 'Test Trip 1', price: 100 },
        { id: 2, title: 'Test Trip 2', price: 200 }
      ],
      error: null
    })
  })),
  auth: {
    signUp: jest.fn().mockResolvedValue({
      data: { user: { id: 'new-user-id' } },
      error: null
    }),
    signIn: jest.fn().mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    })
  }
};

const mockSupabaseDB = jest.fn().mockImplementation(() => ({
  getTravelOffers: jest.fn().mockResolvedValue([
    {
      id: 1,
      title: 'Istanbul Adventure',
      destination: 'Istanbul, Turkey',
      price: 599,
      currency: 'USD',
      duration: 7,
      description: 'Explore the historic city of Istanbul'
    },
    {
      id: 2,
      title: 'Dubai Luxury',
      destination: 'Dubai, UAE',
      price: 1299,
      currency: 'USD',
      duration: 5,
      description: 'Experience luxury in Dubai'
    }
  ]),

  createUser: jest.fn().mockResolvedValue({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    created_at: new Date().toISOString()
  }),

  getUserProfile: jest.fn().mockResolvedValue({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    preferences: {
      language: 'ar',
      currency: 'USD',
      travel_style: 'luxury'
    }
  }),

  updateUserProfile: jest.fn().mockResolvedValue({
    id: 'test-user-id',
    name: 'Updated User',
    email: 'test@example.com'
  }),

  saveConversation: jest.fn().mockResolvedValue({
    id: 'conv-id',
    user_id: 'test-user-id',
    messages: []
  }),

  getConversationHistory: jest.fn().mockResolvedValue([
    {
      id: 'msg-1',
      role: 'user',
      content: 'Hello',
      timestamp: new Date().toISOString()
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: 'Hi there!',
      timestamp: new Date().toISOString()
    }
  ])
}));

describe('Database Mocks', () => {
  test('should export mock functions', () => {
    expect(typeof mockSupabaseClient).toBe('object');
    expect(typeof mockSupabaseDB).toBe('function');
  });
});

module.exports = {
  mockSupabaseClient,
  mockSupabaseDB
};