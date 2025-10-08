import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  tripService,
  destinationService,
  aiService,
  analyticsService,
  budgetService,
  healthCheck
} from '../services'
import { api } from '../client'

// Mock the API client
vi.mock('../client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('API Services Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Trip Service', () => {
    it('fetches all trips', async () => {
      const mockTrips = [{ id: '1', destination: 'Tokyo' }]
      vi.mocked(api.get).mockResolvedValue({ data: mockTrips })

      const result = await tripService.getTrips()

      expect(api.get).toHaveBeenCalledWith('/trips')
      expect(result.data).toEqual(mockTrips)
    })

    it('fetches trip by ID', async () => {
      const mockTrip = { id: '1', destination: 'Tokyo' }
      vi.mocked(api.get).mockResolvedValue({ data: mockTrip })

      const result = await tripService.getTrip('1')

      expect(api.get).toHaveBeenCalledWith('/trips/1')
      expect(result.data).toEqual(mockTrip)
    })

    it('creates a new trip', async () => {
      const newTrip = { destination: 'Paris', budget: 3000 }
      const mockResponse = { id: '2', ...newTrip }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await tripService.createTrip(newTrip)

      expect(api.post).toHaveBeenCalledWith('/trips', newTrip)
      expect(result.data).toEqual(mockResponse)
    })

    it('updates a trip', async () => {
      const updateData = { budget: 3500 }
      const mockResponse = { id: '1', destination: 'Tokyo', budget: 3500 }
      vi.mocked(api.put).mockResolvedValue({ data: mockResponse })

      const result = await tripService.updateTrip('1', updateData)

      expect(api.put).toHaveBeenCalledWith('/trips/1', updateData)
      expect(result.data).toEqual(mockResponse)
    })

    it('deletes a trip', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: { success: true } })

      const result = await tripService.deleteTrip('1')

      expect(api.delete).toHaveBeenCalledWith('/trips/1')
      expect(result.data.success).toBe(true)
    })
  })

  describe('Destination Service', () => {
    it('fetches all destinations', async () => {
      const mockDestinations = [{ id: '1', name: 'Tokyo' }]
      vi.mocked(api.get).mockResolvedValue({ data: mockDestinations })

      const result = await destinationService.getDestinations()

      expect(api.get).toHaveBeenCalledWith('/destinations')
      expect(result.data).toEqual(mockDestinations)
    })

    it('fetches destination by ID', async () => {
      const mockDestination = { id: '1', name: 'Tokyo' }
      vi.mocked(api.get).mockResolvedValue({ data: mockDestination })

      const result = await destinationService.getDestination('1')

      expect(api.get).toHaveBeenCalledWith('/destinations/1')
      expect(result.data).toEqual(mockDestination)
    })

    it('searches destinations', async () => {
      const mockResults = [{ id: '1', name: 'Tokyo' }]
      vi.mocked(api.get).mockResolvedValue({ data: mockResults })

      const result = await destinationService.searchDestinations('Tokyo')

      expect(api.get).toHaveBeenCalledWith('/destinations/search?q=Tokyo')
      expect(result.data).toEqual(mockResults)
    })
  })

  describe('AI Service', () => {
    it('sends message to AI', async () => {
      const mockResponse = { reply: 'Hello, how can I help?' }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await aiService.sendMessage('Hello')

      expect(api.post).toHaveBeenCalledWith('/ai/chat', {
        message: 'Hello',
        useTools: false,
        conversationHistory: []
      })
      expect(result.data).toEqual(mockResponse)
    })

    it('sends message with tools enabled', async () => {
      const mockResponse = { reply: 'Using tools to help...' }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await aiService.sendMessage('Plan my trip', { useTools: true })

      expect(api.post).toHaveBeenCalledWith('/ai/chat', {
        message: 'Plan my trip',
        useTools: true,
        conversationHistory: []
      })
      expect(result.data).toEqual(mockResponse)
    })

    it('sends message with conversation history', async () => {
      const mockResponse = { reply: 'Based on our conversation...' }
      const history = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' }
      ]
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await aiService.sendMessage('Continue', { conversationHistory: history })

      expect(api.post).toHaveBeenCalledWith('/ai/chat', {
        message: 'Continue',
        useTools: false,
        conversationHistory: history
      })
      expect(result.data).toEqual(mockResponse)
    })

    it('gets AI suggestions', async () => {
      const mockSuggestions = ['Visit Tokyo', 'Try local food']
      const context = { destination: 'Japan' }
      vi.mocked(api.post).mockResolvedValue({ data: mockSuggestions })

      const result = await aiService.getSuggestions(context)

      expect(api.post).toHaveBeenCalledWith('/ai/suggestions', context)
      expect(result.data).toEqual(mockSuggestions)
    })

    it('analyzes media', async () => {
      const mockAnalysis = { analysis: 'This is a beach destination' }
      const params = {
        prompt: 'Analyze this image',
        imageUrls: ['https://example.com/image.jpg']
      }
      vi.mocked(api.post).mockResolvedValue({ data: mockAnalysis })

      const result = await aiService.analyzeMedia(params)

      expect(api.post).toHaveBeenCalledWith('/ai/multimodal/analyze', params)
      expect(result.data).toEqual(mockAnalysis)
    })
  })

  describe('Analytics Service', () => {
    it('tracks an event', async () => {
      const event = { type: 'chat_message', payload: { length: 10 } }
      vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

      const result = await analyticsService.track(event)

      expect(api.post).toHaveBeenCalledWith('/analytics/events', event)
      expect(result.data.success).toBe(true)
    })

    it('gets analytics summary', async () => {
      const mockSummary = {
        total: 100,
        byType: { chat_message: 60, chat_reply: 40 },
        last10: []
      }
      vi.mocked(api.get).mockResolvedValue({ data: mockSummary })

      const result = await analyticsService.summary()

      expect(api.get).toHaveBeenCalledWith('/analytics/summary')
      expect(result.data).toEqual(mockSummary)
    })
  })

  describe('Budget Service', () => {
    it('gets budget summary without trip ID', async () => {
      const mockSummary = { totalBudget: 5000, totalSpent: 2000 }
      vi.mocked(api.get).mockResolvedValue({ data: mockSummary })

      const result = await budgetService.getBudgetSummary()

      expect(api.get).toHaveBeenCalledWith('/budget/summary')
      expect(result.data).toEqual(mockSummary)
    })

    it('gets budget summary with trip ID', async () => {
      const mockSummary = { totalBudget: 3000, totalSpent: 1500 }
      vi.mocked(api.get).mockResolvedValue({ data: mockSummary })

      const result = await budgetService.getBudgetSummary('trip1')

      expect(api.get).toHaveBeenCalledWith('/budget/summary?tripId=trip1')
      expect(result.data).toEqual(mockSummary)
    })

    it('adds an expense', async () => {
      const expense = {
        tripId: 'trip1',
        category: 'food',
        amount: 50,
        description: 'Lunch'
      }
      vi.mocked(api.post).mockResolvedValue({ data: { id: 'exp1', ...expense } })

      const result = await budgetService.addExpense(expense)

      expect(api.post).toHaveBeenCalledWith('/budget/expenses', expense)
      expect(result.data.id).toBe('exp1')
    })

    it('gets expenses without trip ID', async () => {
      const mockExpenses = [{ id: 'exp1', amount: 50 }]
      vi.mocked(api.get).mockResolvedValue({ data: mockExpenses })

      const result = await budgetService.getExpenses()

      expect(api.get).toHaveBeenCalledWith('/budget/expenses')
      expect(result.data).toEqual(mockExpenses)
    })

    it('gets expenses with trip ID', async () => {
      const mockExpenses = [{ id: 'exp1', tripId: 'trip1', amount: 50 }]
      vi.mocked(api.get).mockResolvedValue({ data: mockExpenses })

      const result = await budgetService.getExpenses('trip1')

      expect(api.get).toHaveBeenCalledWith('/budget/expenses?tripId=trip1')
      expect(result.data).toEqual(mockExpenses)
    })
  })

  describe('Health Check', () => {
    it('performs health check', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { status: 'ok' } })

      const result = await healthCheck()

      expect(api.get).toHaveBeenCalledWith('/health')
      expect(result.data.status).toBe('ok')
    })
  })

  describe('Error Handling', () => {
    it('handles API errors for trip service', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'))

      try {
        await tripService.getTrips()
      } catch (error: any) {
        expect(error.message).toBe('Network error')
      }
    })

    it('handles API errors for AI service', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('AI service unavailable'))

      try {
        await aiService.sendMessage('test')
      } catch (error: any) {
        expect(error.message).toBe('AI service unavailable')
      }
    })
  })
})

