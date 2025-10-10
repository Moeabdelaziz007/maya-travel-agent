import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aiService, tripService, destinationService } from '../services'
import { api } from '../client'

// Mock the client module
vi.mock('../client')
const mockedApi = vi.mocked(api) as {
  post: ReturnType<typeof vi.fn>
  get: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('aiService', () => {
    it('should send message successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Hello! I can help you plan your trip to Tokyo.',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await aiService.sendMessage('Help me plan a trip to Tokyo')

      expect(mockedApi.post).toHaveBeenCalledWith('/ai/chat', {
        message: 'Help me plan a trip to Tokyo',
        useTools: false,
        conversationHistory: [],
      })
      expect(result).toEqual(mockResponse)
    })

    it('should analyze media successfully', async () => {
      const mockResponse = {
        data: {
          analysis: 'This is a beautiful destination for travel planning.',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await aiService.analyzeMedia({
        prompt: 'Analyze this destination',
        imageUrls: ['https://example.com/image.jpg'],
        options: { enableKvCacheOffload: true },
      })

      expect(mockedApi.post).toHaveBeenCalledWith('/ai/multimodal/analyze', {
        prompt: 'Analyze this destination',
        imageUrls: ['https://example.com/image.jpg'],
        options: { enableKvCacheOffload: true },
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const mockError = new Error('API request failed')
      mockedApi.post.mockRejectedValue(mockError)

      await expect(
        aiService.sendMessage('Help me plan a trip')
      ).rejects.toThrow('API request failed')
    })
  })

  describe('tripService', () => {
    it('should get trips successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            destination: 'Tokyo, Japan',
            startDate: '2024-03-15',
            endDate: '2024-03-22',
            budget: 2500,
            status: 'planned',
          },
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }

      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await tripService.getTrips()

      expect(mockedApi.get).toHaveBeenCalledWith('/trips')
      expect(result).toEqual(mockResponse)
    })

    it('should create trip successfully', async () => {
      const tripData = {
        destination: 'Tokyo, Japan',
        startDate: '2024-03-15',
        endDate: '2024-03-22',
        budget: 2500,
      }

      const mockResponse = {
        data: {
          id: '1',
          ...tripData,
          status: 'planned',
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {},
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await tripService.createTrip(tripData)

      expect(mockedApi.post).toHaveBeenCalledWith('/trips', tripData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('destinationService', () => {
    it('should search destinations successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            name: 'Tokyo',
            country: 'Japan',
            description: 'A bustling metropolis',
          },
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }

      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await destinationService.searchDestinations('Tokyo')

      expect(mockedApi.get).toHaveBeenCalledWith('/destinations/search?q=Tokyo')
      expect(result).toEqual(mockResponse)
    })
  })
})